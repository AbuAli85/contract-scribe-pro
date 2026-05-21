// =============================================================
// GoogleDrivePicker
//
// Opens Google's native file picker using the Google Identity
// Services implicit token flow. No server-side secret required —
// the Client ID alone is enough for read-only Drive access.
//
// Architecture:
//   1. GIS library  → requests an OAuth2 access token
//   2. GAPI library → initialises the Google Picker UI
//   3. On selection → fetches file content via Drive REST API
//      · Google Docs  → export as text/plain
//      · .docx / .doc → download binary, wrap in File object
//
// The parent receives either:
//   onFile(file) — a real File object (for .docx → mergeTemplate)
//   onText(text, name) — plain text (for Google Docs → AI scan)
// =============================================================

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// ── Constants ────────────────────────────────────────────────
const CLIENT_ID =
  "302171308086-ialnspqqqa8annp4l070ltcshqpqj1u6.apps.googleusercontent.com";
const APP_ID = "302171308086";
const SCOPE = "https://www.googleapis.com/auth/drive.readonly";

const GDOC_MIME = "application/vnd.google-apps.document";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DOC_MIME = "application/msword";

// MIME types accepted in the picker
const ACCEPTED_MIMES = [GDOC_MIME, DOCX_MIME, DOC_MIME].join(",");

// ── Types ────────────────────────────────────────────────────
interface GoogleDrivePickerProps {
  /** Called when the user picks a binary file (.docx / .doc) */
  onFile: (file: File) => void;
  /** Called when the user picks a Google Doc (text/plain export) */
  onText: (text: string, name: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  isAr?: boolean;
}

// Minimal type shims for Google API globals
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gapi: any;
  }
}

// ── Script loader ────────────────────────────────────────────
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

// ── Component ────────────────────────────────────────────────
export function GoogleDrivePicker({
  onFile,
  onText,
  onError,
  disabled = false,
  isAr = false,
}: GoogleDrivePickerProps) {
  const [loading, setLoading] = useState(false);
  const [scriptsReady, setScriptsReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokenClientRef = useRef<any>(null);
  const accessTokenRef = useRef<string | null>(null);

  // Load GIS + GAPI once on mount
  useEffect(() => {
    Promise.all([
      loadScript("https://accounts.google.com/gsi/client"),
      loadScript("https://apis.google.com/js/api.js"),
    ])
      .then(() => {
        // Initialise gapi picker client
        window.gapi.load("picker", () => {
          setScriptsReady(true);
        });
      })
      .catch((err) => {
        console.error("Google Drive scripts failed to load:", err);
        // Non-fatal — user can still upload a file directly
      });
  }, []);

  // Fetch file content after the user selects a file
  const fetchFileContent = useCallback(
    async (fileId: string, mimeType: string, fileName: string) => {
      const token = accessTokenRef.current;
      if (!token) return;

      setLoading(true);
      try {
        if (mimeType === GDOC_MIME) {
          // Google Docs → export as plain text
          const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text%2Fplain`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) throw new Error(`Drive export failed: ${res.status}`);
          const text = await res.text();
          onText(text, fileName || "google-doc");
        } else {
          // .docx / .doc → download binary
          const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
          const blob = await res.blob();
          // Normalise to .docx MIME so the engine accepts it
          const file = new File([blob], fileName || `${fileId}.docx`, {
            type: DOCX_MIME,
          });
          onFile(file);
        }
      } catch (err) {
        console.error("Drive fetch error:", err);
        onError(
          err instanceof Error
            ? err.message
            : "Failed to download file from Google Drive."
        );
      } finally {
        setLoading(false);
      }
    },
    [onFile, onText, onError]
  );

  // Open the Google Picker with the current access token
  const openPicker = useCallback(
    (token: string) => {
      if (!window.google?.picker) {
        onError("Google Picker failed to initialise. Please try again.");
        return;
      }

      const docsView = new window.google.picker.DocsView()
        .setIncludeFolders(false)
        .setMimeTypes(ACCEPTED_MIMES);

      const picker = new window.google.picker.PickerBuilder()
        .setAppId(APP_ID)
        .setOAuthToken(token)
        .addView(docsView)
        .setTitle(isAr ? "اختر مستنداً من Google Drive" : "Select a document from Google Drive")
        .setCallback((data: { action: string; docs?: Array<{ id: string; mimeType: string; name: string }> }) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const doc = data.docs?.[0];
            if (doc) fetchFileContent(doc.id, doc.mimeType, doc.name);
          }
        })
        .build();

      picker.setVisible(true);
    },
    [fetchFileContent, isAr, onError]
  );

  const handleClick = useCallback(() => {
    if (!scriptsReady) {
      onError(
        "Google Drive integration is loading. Please wait a moment and try again."
      );
      return;
    }

    // Re-use a valid token if we already have one
    if (accessTokenRef.current) {
      openPicker(accessTokenRef.current);
      return;
    }

    // First time — request a token via GIS
    if (!tokenClientRef.current) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: (response: { access_token?: string; error?: string }) => {
          if (response.error || !response.access_token) {
            onError(
              response.error === "access_denied"
                ? "Google Drive access was denied."
                : "Could not get Google Drive access. Please try again."
            );
            setLoading(false);
            return;
          }
          accessTokenRef.current = response.access_token;
          openPicker(response.access_token);
          // Tokens expire after ~1h — clear the cached token at expiry
          setTimeout(() => {
            accessTokenRef.current = null;
          }, 55 * 60 * 1000);
        },
      });
    }

    setLoading(true);
    tokenClientRef.current.requestAccessToken({ prompt: "" });
  }, [scriptsReady, openPicker, onError]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2 whitespace-nowrap"
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg viewBox="0 0 87.3 78" className="h-4 w-4" aria-hidden="true">
          {/* Google Drive icon — SVG simplified */}
          <path
            d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L28 48H0c0 1.55.4 3.1 1.2 4.5z"
            fill="#0066da"
          />
          <path
            d="M43.65 25L29.35 0c-1.35.8-2.5 1.9-3.3 3.3l-25.8 44.7A9.06 9.06 0 000 52.5h28l15.65-27.5z"
            fill="#00ac47"
          />
          <path
            d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.3l5.9 10.8z"
            fill="#ea4335"
          />
          <path
            d="M43.65 25L57.95 0H29.35L43.65 25z"
            fill="#00832d"
          />
          <path
            d="M73.55 76.8L59.3 52.5H28L13.75 76.8h59.8z"
            fill="#2684fc"
          />
          <path
            d="M59.3 52.5l14.25-24.3c-1.35-.8-2.9-1.2-4.5-1.2H18.3c-1.6 0-3.15.4-4.5 1.2L28 52.5h31.3z"
            fill="#ffba00"
          />
        </svg>
      )}
      {isAr ? "استيراد من Google Drive" : "Import from Google Drive"}
    </Button>
  );
}
