
import React from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ValidationStatusProps {
  status: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  className?: string;
}

const ValidationStatus = ({ 
  status, 
  title, 
  description, 
  className 
}: ValidationStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          variant: "default",
          bg: "bg-green-100 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
          text: "text-green-800 dark:text-green-300",
        };
      case "error":
        return {
          icon: <XCircle className="h-4 w-4" />,
          variant: "destructive",
          bg: "bg-destructive/10",
          border: "border-destructive/20",
          text: "text-destructive",
        };
      case "warning":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          variant: "warning",
          bg: "bg-yellow-100 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
          text: "text-yellow-800 dark:text-yellow-300",
        };
      case "info":
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          variant: "info",
          bg: "bg-blue-100 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
          text: "text-blue-800 dark:text-blue-300",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Alert 
      className={cn(
        "border",
        config.bg,
        config.border,
        className
      )}
      variant={config.variant as any}
    >
      <div className={cn("mr-2", config.text)}>{config.icon}</div>
      <AlertTitle className={cn("text-sm font-medium", config.text)}>
        {title}
      </AlertTitle>
      {description && (
        <AlertDescription className="text-sm mt-1">
          {description}
        </AlertDescription>
      )}
    </Alert>
  );
};

export default ValidationStatus;
