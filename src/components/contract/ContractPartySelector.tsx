
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { Building, Briefcase, User, UserCheck } from "lucide-react";

interface ContractPartySelectorProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  options: string[];
  required?: boolean;
  disabled?: boolean;
  icon?: "client" | "employer" | "promoter" | "company";
}

const ContractPartySelector = ({
  control,
  name,
  label,
  placeholder,
  options,
  required = false,
  disabled = false,
  icon
}: ContractPartySelectorProps) => {
  const renderIcon = () => {
    switch (icon) {
      case "client":
        return <Building className="h-4 w-4 mr-2 text-primary" />;
      case "employer":
        return <Briefcase className="h-4 w-4 mr-2 text-blue-500" />;
      case "promoter":
        return <UserCheck className="h-4 w-4 mr-2 text-green-500" />;
      case "company":
        return <Building className="h-4 w-4 mr-2 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel required={required}>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option: string) => (
                <SelectItem key={option} value={option} className="flex items-center">
                  {icon && renderIcon()}
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ContractPartySelector;
