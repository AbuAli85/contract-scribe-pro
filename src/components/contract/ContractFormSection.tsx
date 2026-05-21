
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContractFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  optional?: boolean;
  badge?: string;
  className?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
}

const ContractFormSection = ({
  title,
  description,
  children,
  optional = false,
  badge,
  className,
  badgeVariant = "outline"
}: ContractFormSectionProps) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {title}
            {optional && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (Optional)
              </span>
            )}
          </CardTitle>
          {badge && (
            <Badge variant={badgeVariant} className="font-normal">
              {badge}
            </Badge>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-3 space-y-4">{children}</CardContent>
    </Card>
  );
};

export default ContractFormSection;
