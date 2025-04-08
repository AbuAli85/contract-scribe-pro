
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  language: "ar" | "en";
  onChange: (language: "ar" | "en") => void;
}

const LanguageToggle = ({ language, onChange }: LanguageToggleProps) => {
  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse bg-muted p-1 rounded-md">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "text-muted-foreground",
          language === "ar" && "bg-background text-foreground font-medium"
        )}
        onClick={() => onChange("ar")}
      >
        العربية
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "text-muted-foreground",
          language === "en" && "bg-background text-foreground font-medium"
        )}
        onClick={() => onChange("en")}
      >
        English
      </Button>
    </div>
  );
};

export default LanguageToggle;
