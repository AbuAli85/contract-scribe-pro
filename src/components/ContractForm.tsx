
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ContractFormProps {
  language: "ar" | "en";
  onGenerateContract: (data: any) => void;
}

const ContractForm = ({ language, onGenerateContract }: ContractFormProps) => {
  const labels = {
    ar: {
      companyName: "اسم الشركة",
      companyNamePlaceholder: "أدخل اسم الشركة",
      companyAddress: "عنوان الشركة",
      companyAddressPlaceholder: "أدخل عنوان الشركة",
      promoterName: "اسم المروج",
      promoterNamePlaceholder: "أدخل اسم المروج",
      promoterID: "رقم هوية المروج",
      promoterIDPlaceholder: "أدخل رقم هوية المروج",
      contractDuration: "مدة العقد (بالشهور)",
      contractDurationPlaceholder: "أدخل مدة العقد",
      contractDate: "تاريخ العقد",
      pickDate: "اختر تاريخ",
      monthlyCompensation: "التعويض الشهري (ريال سعودي)",
      monthlyCompensationPlaceholder: "أدخل التعويض الشهري",
      duties: "واجبات ومسؤوليات المروج",
      dutiesPlaceholder: "أدخل واجبات ومسؤوليات المروج",
      generateContract: "إنشاء العقد",
      required: "هذا الحقل مطلوب",
      invalidNumber: "يرجى إدخال رقم صحيح",
      mustBePositive: "يجب أن يكون الرقم موجباً",
    },
    en: {
      companyName: "Company Name",
      companyNamePlaceholder: "Enter company name",
      companyAddress: "Company Address",
      companyAddressPlaceholder: "Enter company address",
      promoterName: "Promoter Name",
      promoterNamePlaceholder: "Enter promoter name",
      promoterID: "Promoter ID",
      promoterIDPlaceholder: "Enter promoter ID",
      contractDuration: "Contract Duration (months)",
      contractDurationPlaceholder: "Enter contract duration",
      contractDate: "Contract Date",
      pickDate: "Pick a date",
      monthlyCompensation: "Monthly Compensation (SAR)",
      monthlyCompensationPlaceholder: "Enter monthly compensation",
      duties: "Promoter Duties and Responsibilities",
      dutiesPlaceholder: "Enter promoter duties and responsibilities",
      generateContract: "Generate Contract",
      required: "This field is required",
      invalidNumber: "Please enter a valid number",
      mustBePositive: "Number must be positive",
    },
  };

  const l = labels[language];

  const formSchema = z.object({
    companyName: z.string().min(1, { message: l.required }),
    companyAddress: z.string().min(1, { message: l.required }),
    promoterName: z.string().min(1, { message: l.required }),
    promoterID: z.string().min(1, { message: l.required }),
    contractDuration: z.coerce
      .number()
      .positive({ message: l.mustBePositive })
      .int({ message: l.invalidNumber }),
    contractDate: z.date({
      required_error: l.required,
    }),
    monthlyCompensation: z.coerce
      .number()
      .positive({ message: l.mustBePositive }),
    duties: z.string().min(1, { message: l.required }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      promoterName: "",
      promoterID: "",
      duties: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onGenerateContract(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{l.companyName}</FormLabel>
                <FormControl>
                  <Input placeholder={l.companyNamePlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="companyAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{l.companyAddress}</FormLabel>
                <FormControl>
                  <Input placeholder={l.companyAddressPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="promoterName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{l.promoterName}</FormLabel>
                <FormControl>
                  <Input placeholder={l.promoterNamePlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="promoterID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{l.promoterID}</FormLabel>
                <FormControl>
                  <Input placeholder={l.promoterIDPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contractDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{l.contractDuration}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={l.contractDurationPlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contractDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{l.contractDate}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{l.pickDate}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyCompensation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{l.monthlyCompensation}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={l.monthlyCompensationPlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="duties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{l.duties}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={l.dutiesPlaceholder}
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {l.generateContract}
        </Button>
      </form>
    </Form>
  );
};

export default ContractForm;
