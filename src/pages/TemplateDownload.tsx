import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTemplateById } from "@/lib/templates";
import { generateTemplatePdf } from "@/utils/pdf/generateTemplatePdf";

export default function TemplateDownload() {
  const { templateId } = useParams<{ templateId: string }>();
  const [status, setStatus] = useState<"downloading" | "done" | "error">("downloading");
  const triggered = useRef(false);

  const template = templateId ? getTemplateById(templateId) : undefined;

  useEffect(() => {
    if (!template || triggered.current) return;
    triggered.current = true;

    // Small delay lets the page paint before jsPDF blocks the thread
    const timer = setTimeout(() => {
      try {
        generateTemplatePdf(template, "en");
        setStatus("done");
      } catch {
        setStatus("error");
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [template]);

  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">Template not found</h1>
        <Button asChild variant="outline">
          <Link to="/templates">Browse templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      {status === "downloading" && (
        <>
          <Download className="h-12 w-12 animate-bounce text-primary" />
          <h1 className="text-xl font-semibold">Preparing your download…</h1>
          <p className="text-sm text-muted-foreground">
            Generating <strong>{template.titleEn}</strong>
          </p>
        </>
      )}

      {status === "done" && (
        <>
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <h1 className="text-xl font-semibold">Download started!</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your <strong>{template.titleEn}</strong> template is downloading.
            Want to customize it with your company details?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link to="/create-contract">Customize online — it's free</Link>
            </Button>
            <Button variant="outline" onClick={() => generateTemplatePdf(template, "en")}>
              <Download className="me-2 h-4 w-4" />
              Download again
            </Button>
          </div>
          <Link to="/templates" className="text-sm text-muted-foreground underline underline-offset-4">
            Browse all templates
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <Button onClick={() => { setStatus("downloading"); triggered.current = false; }}>
            Try again
          </Button>
        </>
      )}
    </div>
  );
}
