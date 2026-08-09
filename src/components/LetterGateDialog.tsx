// =============================================================
// LetterGateDialog — free-tier gate for /letters
//
// Three steps, Arabic-first, sized for a 380px phone:
//   1. email   → letter-otp-send
//   2. code    → letter-otp-verify   (token cached in localStorage)
//   3. check   → letter-generate-check
// then onGranted() hands control back to the page, which does the
// actual .docx download.
//
// A visitor who already holds a gate token skips straight to step 3,
// so the second free letter never re-prompts.
//
// Nothing here is a security boundary — the limit, the burner-domain
// rule and code validity are all enforced in the Edge Functions.
// =============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react";
import {
  checkLetterGeneration, clearStoredGate, readStoredGate,
  sendLetterOtp, storeGate, verifyLetterOtp,
} from "@/lib/letterGate";

const RESEND_COOLDOWN_SECONDS = 60;

/** Bilingual, Arabic-first. `en` renders as the muted second line. */
const ERROR_COPY: Record<string, { ar: string; en: string }> = {
  disposable_email: {
    ar: "يرجى استخدام بريد إلكتروني حقيقي — البريد المؤقت غير مقبول",
    en: "Please use a real email address — temporary emails are not accepted.",
  },
  invalid_email: {
    ar: "البريد الإلكتروني غير صحيح",
    en: "Please enter a valid email address.",
  },
  too_many_requests: {
    ar: "طلبت الرمز عدة مرات. يرجى المحاولة بعد ساعة",
    en: "Too many code requests. Please try again in an hour.",
  },
  invalid_code: {
    ar: "الرمز غير صحيح. تحقق منه وحاول مرة أخرى",
    en: "That code isn't correct. Check it and try again.",
  },
  too_many_attempts: {
    ar: "تم تجاوز عدد المحاولات. اطلب رمزًا جديدًا",
    en: "Too many attempts. Please request a new code.",
  },
  invalid_token: {
    ar: "انتهت صلاحية التحقق. يرجى إدخال بريدك مرة أخرى",
    en: "Your verification expired. Please enter your email again.",
  },
  email_send_failed: {
    ar: "تعذر إرسال البريد. حاول مرة أخرى",
    en: "We couldn't send the email. Please try again.",
  },
  network_error: {
    ar: "تعذر الاتصال بالخادم. حاول مرة أخرى",
    en: "Couldn't reach the server. Please try again.",
  },
};

const errorCopy = (code?: string) =>
  (code && ERROR_COPY[code]) || ERROR_COPY.network_error;

type Step = "email" | "code" | "checking" | "limit";

export interface LetterGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authority: string;
  letterType: string;
  language?: string;
  /** Gate passed — the page downloads. `remaining` is null for pro. */
  onGranted: (remaining: number | null) => void;
}

export default function LetterGateDialog({
  open, onOpenChange, authority, letterType, language = "ar", onGranted,
}: LetterGateDialogProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [cooldown, setCooldown] = useState(0);

  // Guards the auto-run in the effect below: without it, a re-render
  // while the check is in flight would fire a second generation.
  const checkStarted = useRef(false);
  // The effect below must run ONCE per open, not once per render. The page
  // passes an inline onGranted, so runCheck gets a new identity on every
  // render — without this latch, typing an OTP digit would re-run the
  // effect and throw the visitor back to step 1.
  const initialized = useRef(false);

  const runCheck = useCallback(
    async (token: string) => {
      setStep("checking");
      setBusy(true);
      setError(undefined);

      const res = await checkLetterGeneration({ token, authority, letterType, language });
      setBusy(false);

      if (res.ok) {
        onGranted(res.remaining ?? null);
        onOpenChange(false);
        return;
      }
      if (res.error === "limit_reached") {
        setStep("limit");
        return;
      }
      if (res.error === "invalid_token") {
        // Stale/forged token — start the visitor over rather than looping.
        clearStoredGate();
        setStep("email");
        setError("invalid_token");
        return;
      }
      setStep("email");
      setError(res.error);
    },
    [authority, letterType, language, onGranted, onOpenChange],
  );

  // Fresh open: reset, then skip ahead if this browser is already verified.
  useEffect(() => {
    if (!open) {
      checkStarted.current = false;
      initialized.current = false;
      return;
    }
    if (initialized.current) return;
    initialized.current = true;

    setError(undefined);
    setCode("");

    const stored = readStoredGate();
    if (stored) {
      checkStarted.current = true;
      setEmail(stored.email);
      void runCheck(stored.token);
    } else {
      setStep("email");
    }
  }, [open, runCheck]);

  // Resend cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const handleSendCode = async () => {
    setBusy(true);
    setError(undefined);
    const res = await sendLetterOtp(email.trim());
    setBusy(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCode("");
    setStep("code");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleVerify = async (value: string) => {
    setBusy(true);
    setError(undefined);
    const res = await verifyLetterOtp(email.trim(), value);
    setBusy(false);

    if (!res.ok || !res.token) {
      setCode("");
      setError(res.error);
      if (res.error === "too_many_attempts") setCooldown(0);
      return;
    }

    storeGate({ token: res.token, email: email.trim().toLowerCase() });
    checkStarted.current = true;
    await runCheck(res.token);
  };

  const err = error ? errorCopy(error) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-[min(26rem,calc(100vw-2rem))] text-right">
        {step === "limit" ? (
          <>
            <DialogHeader className="text-right sm:text-right">
              <div className="mb-1 flex justify-start">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-lg leading-relaxed">
                لقد استخدمت خطاباتك المجانية. اشترك للحصول على خطابات غير محدودة
              </DialogTitle>
              <DialogDescription dir="ltr" className="text-left text-xs">
                You've used your free letters. Subscribe for unlimited letters.
              </DialogDescription>
            </DialogHeader>
            <Button asChild size="lg" className="w-full">
              <Link to="/pricing">عرض الباقات — View plans</Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
              لاحقًا
            </Button>
          </>
        ) : step === "checking" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm">جارٍ تجهيز خطابك…</p>
            <p className="text-xs text-muted-foreground" dir="ltr">Preparing your letter…</p>
          </div>
        ) : step === "email" ? (
          <>
            <DialogHeader className="text-right sm:text-right">
              <div className="mb-1 flex justify-start">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-lg">تحقّق من بريدك الإلكتروني</DialogTitle>
              <DialogDescription className="leading-relaxed">
                أدخل بريدك الإلكتروني لإرسال رمز التحقق. لديك خطابان مجانيان.
                <span dir="ltr" className="mt-1 block text-left text-xs">
                  Enter your email to receive a verification code — 2 free letters.
                </span>
              </DialogDescription>
            </DialogHeader>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!busy && email.trim()) void handleSendCode();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="letter-gate-email">البريد الإلكتروني</Label>
                <Input
                  id="letter-gate-email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                />
              </div>

              {err && (
                <p className="text-sm text-destructive">
                  {err.ar}
                  <span dir="ltr" className="mt-0.5 block text-left text-xs opacity-80">{err.en}</span>
                </p>
              )}

              <Button type="submit" size="lg" className="w-full gap-2" disabled={busy || !email.trim()}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                إرسال رمز التحقق
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader className="text-right sm:text-right">
              <div className="mb-1 flex justify-start">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-lg">أدخل رمز التحقق</DialogTitle>
              <DialogDescription className="leading-relaxed">
                أرسلنا رمزًا من ٦ أرقام إلى <span dir="ltr">{email}</span>
                <span dir="ltr" className="mt-1 block text-left text-xs">
                  We sent a 6-digit code — it expires in 10 minutes.
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div dir="ltr" className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  disabled={busy}
                  onChange={(value) => {
                    setCode(value);
                    if (value.length === 6 && !busy) void handleVerify(value);
                  }}
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} className="h-11 w-9 text-lg sm:w-10" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {err && (
                <p className="text-sm text-destructive">
                  {err.ar}
                  <span dir="ltr" className="mt-0.5 block text-left text-xs opacity-80">{err.en}</span>
                </p>
              )}

              <Button
                size="lg"
                className="w-full gap-2"
                disabled={busy || code.length !== 6}
                onClick={() => void handleVerify(code)}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                تأكيد الرمز
              </Button>

              <div className="flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                  disabled={busy || cooldown > 0}
                  onClick={() => void handleSendCode()}
                >
                  {cooldown > 0 ? `إعادة الإرسال بعد ${cooldown} ثانية` : "إعادة إرسال الرمز"}
                </button>
                <button
                  type="button"
                  className="text-muted-foreground underline-offset-4 hover:underline"
                  disabled={busy}
                  onClick={() => {
                    setStep("email");
                    setError(undefined);
                  }}
                >
                  تغيير البريد
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
