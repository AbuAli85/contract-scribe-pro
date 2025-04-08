
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  language: "ar" | "en";
}

const LoadingOverlay = ({ language }: LoadingOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium">
          {language === "ar" ? "جاري إنشاء العقد..." : "Generating contract..."}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
