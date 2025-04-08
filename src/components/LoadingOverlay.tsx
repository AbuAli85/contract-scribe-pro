
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  language: "ar" | "en";
}

const LoadingOverlay = ({ language }: LoadingOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-lg font-medium">
          {language === "ar" ? "جاري معالجة العقد..." : "Processing contract..."}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
