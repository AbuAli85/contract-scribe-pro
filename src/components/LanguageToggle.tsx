
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageToggleProps {
  language: "ar" | "en";
  onChange: (language: "ar" | "en") => void;
}

const LanguageToggle = ({ language, onChange }: LanguageToggleProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex gap-2 items-center">
          <Globe className="h-4 w-4" />
          <span>{language === "ar" ? "العربية" : "English"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChange("ar")}>
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("en")}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
