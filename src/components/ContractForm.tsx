
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Upload, CheckCircle, Loader2 } from "lucide-react";
import { read, utils } from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { sampleExcelData } from "./sample-data";

// Define form schema
const formSchema = z.object({
  firstParty: z.string().min(1, {
    message: "Please select the first party",
  }),
  secondParty: z.string().min(1, {
    message: "Please select the second party",
  }),
  promoter: z.string().min(1, {
    message: "Please select the promoter",
  }),
  product: z.string().min(1, {
    message: "Please select the product",
  }),
  location: z.string().min(1, {
    message: "Please select the location",
  }),
  startDate: z.date({
    required_error: "Please select a start date",
  }),
  endDate: z.date({
    required_error: "Please select an end date",
  }),
  letterhead: z.string().optional(),
  promoterPhoto: z.string().optional(),
});

interface ContractFormProps {
  language: "ar" | "en";
  onGenerateContract: (data: any) => void;
}

const ContractForm = ({ language, onGenerateContract }: ContractFormProps) => {
  const { toast } = useToast();
  const [excelData, setExcelData] = useState<any>({
    firstParties: [],
    secondParties: [],
    promoters: [],
    products: [],
    locations: [],
    rawData: [],
  });
  const [letterheads, setLetterheads] = useState<string[]>([]);
  const [promoterPhotos, setPromoterPhotos] = useState<string[]>([]);
  const [letterheadPreview, setLetterheadPreview] = useState<string>("");
  const [promoterPhotoPreview, setPromoterPhotoPreview] = useState<string>("");
  const [refNumber, setRefNumber] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);

  const excelFileRef = useRef<HTMLInputElement>(null);
  const letterheadFileRef = useRef<HTMLInputElement>(null);
  const promoterPhotoFileRef = useRef<HTMLInputElement>(null);

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstParty: "",
      secondParty: "",
      promoter: "",
      product: "",
      location: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    },
  });

  // Watch form values to determine validity
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Check if all required fields are filled
      const requiredFields = ["firstParty", "secondParty", "promoter", "product", "location", "startDate", "endDate"];

      const allFieldsFilled = requiredFields.every(
        (field) => value[field as keyof typeof value] !== undefined && value[field as keyof typeof value] !== "",
      );

      setFormIsValid(allFieldsFilled && excelData.firstParties.length > 0);
    });

    return () => subscription.unsubscribe();
  }, [form, excelData.firstParties.length]);

  // Generate reference number on component mount
  useEffect(() => {
    generateRefNumber();
  }, []);

  // Generate a unique reference number
  const generateRefNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    setRefNumber(`PRO-${year}${month}${day}-${random}`);
  };

  // Handle Excel file upload
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true); // Add loading state while processing

      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      // Log the data to help with debugging
      console.log("Excel data:", jsonData);

      if (!jsonData || jsonData.length === 0) {
        throw new Error("No data found in the Excel file");
      }

      // Process the Excel data
      const processedData = {
        firstParties: Array.from(new Set(jsonData.map((row: any) => row.FirstParty).filter(Boolean))),
        secondParties: Array.from(new Set(jsonData.map((row: any) => row.SecondParty).filter(Boolean))),
        promoters: Array.from(new Set(jsonData.map((row: any) => row.Promoter).filter(Boolean))),
        products: Array.from(new Set(jsonData.map((row: any) => row.Product).filter(Boolean))),
        locations: Array.from(new Set(jsonData.map((row: any) => row.Location).filter(Boolean))),
        rawData: jsonData,
      };

      // If no data was extracted, use sample data for demonstration
      if (processedData.firstParties.length === 0) {
        processedData.firstParties = Array.from(new Set(sampleExcelData.map((row) => row.FirstParty)));
        processedData.secondParties = Array.from(new Set(sampleExcelData.map((row) => row.SecondParty)));
        processedData.promoters = Array.from(new Set(sampleExcelData.map((row) => row.Promoter)));
        processedData.products = Array.from(new Set(sampleExcelData.map((row) => row.Product)));
        processedData.locations = Array.from(new Set(sampleExcelData.map((row) => row.Location)));
        processedData.rawData = sampleExcelData;

        toast({
          title: language === "ar" ? "تم استخدام بيانات العينة" : "Using sample data",
          description:
            language === "ar"
              ? "لم يتم العثور على بيانات في الملف، تم استخدام بيانات العينة بدلاً من ذلك"
              : "No data found in file, using sample data instead",
        });
      } else {
        toast({
          title: language === "ar" ? "تم تحميل الملف بنجاح" : "File uploaded successfully",
          description:
            language === "ar"
              ? `تم استخراج ${processedData.firstParties.length} عميل و ${processedData.promoters.length} مروج`
              : `Extracted ${processedData.firstParties.length} clients and ${processedData.promoters.length} promoters`,
        });
      }

      setExcelData(processedData);

      // Add visual feedback about the uploaded file
      if (excelFileRef.current) {
        excelFileRef.current.nextElementSibling?.classList.add("border-primary");
      }
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast({
        title: language === "ar" ? "خطأ في معالجة الملف" : "Error processing file",
        description:
          language === "ar"
            ? "تأكد من أن الملف بتنسيق Excel أو CSV صحيح. سيتم استخدام بيانات العينة."
            : "Make sure the file is in correct Excel or CSV format. Using sample data instead.",
        variant: "destructive",
      });

      // Load sample data as fallback
      const sampleData = {
        firstParties: Array.from(new Set(sampleExcelData.map((row) => row.FirstParty))),
        secondParties: Array.from(new Set(sampleExcelData.map((row) => row.SecondParty))),
        promoters: Array.from(new Set(sampleExcelData.map((row) => row.Promoter))),
        products: Array.from(new Set(sampleExcelData.map((row) => row.Product))),
        locations: Array.from(new Set(sampleExcelData.map((row) => row.Location))),
        rawData: sampleExcelData,
      };

      setExcelData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  // Handle letterhead image upload
  const handleLetterheadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newLetterheads = [...letterheads];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newLetterheads.push(event.target.result as string);
          setLetterheads(newLetterheads);
        }
      };
      reader.readAsDataURL(file);
    });

    toast({
      title: language === "ar" ? "تم تحميل الصور بنجاح" : "Images uploaded successfully",
    });
  };

  // Handle promoter photo upload
  const handlePromoterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos = [...promoterPhotos];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPhotos.push(event.target.result as string);
          setPromoterPhotos(newPhotos);
        }
      };
      reader.readAsDataURL(file);
    });

    toast({
      title: language === "ar" ? "تم تحميل الصور بنجاح" : "Images uploaded successfully",
    });
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Find the full data for the selected entities
    const firstPartyData = excelData.rawData?.find((row: any) => row.FirstParty === values.firstParty) || {};

    const secondPartyData = excelData.rawData?.find((row: any) => row.SecondParty === values.secondParty) || {};

    const promoterData = excelData.rawData?.find((row: any) => row.Promoter === values.promoter) || {};

    // Prepare contract data
    const contractData = {
      refNumber,
      firstParty: {
        name: {
          en: firstPartyData.FirstPartyNameEn || values.firstParty,
          ar: firstPartyData.FirstPartyNameAr || values.firstParty,
        },
        crn: {
          en: firstPartyData.FirstPartyCRN || "N/A",
          ar: firstPartyData.FirstPartyCRN || "غير متوفر",
        },
      },
      secondParty: {
        name: {
          en: secondPartyData.SecondPartyNameEn || values.secondParty,
          ar: secondPartyData.SecondPartyNameAr || values.secondParty,
        },
        crn: {
          en: secondPartyData.SecondPartyCRN || "N/A",
          ar: secondPartyData.SecondPartyCRN || "غير متوفر",
        },
      },
      promoter: {
        name: {
          en: promoterData.PromoterNameEn || values.promoter,
          ar: promoterData.PromoterNameAr || values.promoter,
        },
        id: {
          en: promoterData.PromoterID || "N/A",
          ar: promoterData.PromoterID || "غير متوفر",
        },
      },
      product: {
        en: values.product,
        ar: values.product,
      },
      location: {
        en: values.location,
        ar: values.location,
      },
      startDate: {
        en: format(values.startDate, "dd/MM/yyyy"),
        ar: format(values.startDate, "dd/MM/yyyy"),
      },
      endDate: {
        en: format(values.endDate, "dd/MM/yyyy"),
        ar: format(values.endDate, "dd/MM/yyyy"),
      },
      letterhead: values.letterhead || letterheadPreview,
      promoterPhoto: values.promoterPhoto || promoterPhotoPreview,
    };

    onGenerateContract(contractData);
  };

  const translations = {
    uploadExcel: language === "ar" ? "رفع ملف إكسل أو CSV" : "Upload Excel or CSV File",
    excelFile: language === "ar" ? "ملف إكسل/CSV:" : "Excel/CSV File:",
    contractData: language === "ar" ? "بيانات العقد" : "Contract Data",
    refNumber: language === "ar" ? "رقم المرجع (تم توليده تلقائيًا):" : "Reference Number (auto-generated):",
    firstParty: language === "ar" ? "الطرف الأول (العميل / Client):" : "First Party (Client):",
    secondParty: language === "ar" ? "الطرف الثاني (المشغل / Employer):" : "Second Party (Employer):",
    promoter: language === "ar" ? "المروج (Promoter):" : "Promoter:",
    product: language === "ar" ? "المنتج (Product):" : "Product:",
    location: language === "ar" ? "الموقع (Location):" : "Location:",
    startDate: language === "ar" ? "تاريخ البداية:" : "Start Date:",
    endDate: language === "ar" ? "تاريخ النهاية:" : "End Date:",
    images: language === "ar" ? "صور (Background Letterhead & ID)" : "Images (Background Letterhead & ID)",
    uploadLetterhead: language === "ar" ? "تحميل صور التر هيد:" : "Upload Letterhead Images:",
    selectLetterhead: language === "ar" ? "اختر صورة الخلفية (Letterhead):" : "Select Letterhead Image:",
    uploadPromoterPhoto: language === "ar" ? "تحميل صور بطاقات المروج:" : "Upload Promoter ID Photos:",
    selectPromoterPhoto: language === "ar" ? "اختر صورة بطاقة المروج:" : "Select Promoter ID Photo:",
    generateContract: language === "ar" ? "توليد العقد" : "Generate Contract",
    selectOption: language === "ar" ? "اختر..." : "Select...",
    pickDate: language === "ar" ? "اختر تاريخ..." : "Pick a date...",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">{translations.uploadExcel}</h2>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="excel-upload">{translations.excelFile}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="excel-upload"
                  type="file"
                  ref={excelFileRef}
                  accept=".xlsx,.csv"
                  onChange={handleExcelUpload}
                />
                <Button variant="outline" size="icon" onClick={() => excelFileRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                </Button>
              </div>

              {/* Add this block to show file status */}
              {loading ? (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === "ar" ? "جارٍ معالجة الملف..." : "Processing file..."}
                </div>
              ) : excelData.firstParties.length > 0 ? (
                <div className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {language === "ar"
                    ? `تم تحميل البيانات: ${excelData.firstParties.length} عميل، ${excelData.promoters.length} مروج`
                    : `Data loaded: ${excelData.firstParties.length} clients, ${excelData.promoters.length} promoters`}
                </div>
              ) : null}
            </div>
          </div>
          {/* Add a fallback button to load sample data if the Excel upload fails */}
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  const sampleData = {
                    firstParties: Array.from(new Set(sampleExcelData.map((row) => row.FirstParty))),
                    secondParties: Array.from(new Set(sampleExcelData.map((row) => row.SecondParty))),
                    promoters: Array.from(new Set(sampleExcelData.map((row) => row.Promoter))),
                    products: Array.from(new Set(sampleExcelData.map((row) => row.Product))),
                    locations: Array.from(new Set(sampleExcelData.map((row) => row.Location))),
                    rawData: sampleExcelData,
                  };

                  setExcelData(sampleData);

                  toast({
                    title: language === "ar" ? "تم تحميل بيانات العينة" : "Sample data loaded",
                    description:
                      language === "ar"
                        ? "تم تحميل بيانات العينة للعرض التوضيحي"
                        : "Sample data loaded for demonstration",
                  });
                } catch (error) {
                  console.error("Error loading sample data:", error);
                  toast({
                    title: language === "ar" ? "خطأ في تحميل البيانات" : "Error loading data",
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              }}
            >
              {language === "ar" ? "تحميل بيانات العينة" : "Load Sample Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">{translations.contractData}</h2>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>{translations.refNumber}</Label>
                  <div className="p-2 border rounded-md bg-muted/50">{refNumber}</div>
                </div>

                <FormField
                  control={form.control}
                  name="firstParty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.firstParty}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={excelData.firstParties.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={translations.selectOption} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {excelData.firstParties.map((party: string) => (
                            <SelectItem key={party} value={party}>
                              {party}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondParty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.secondParty}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={excelData.secondParties.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={translations.selectOption} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {excelData.secondParties.map((party: string) => (
                            <SelectItem key={party} value={party}>
                              {party}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="promoter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.promoter}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={excelData.promoters.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={translations.selectOption} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {excelData.promoters.map((promoter: string) => (
                            <SelectItem key={promoter} value={promoter}>
                              {promoter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.product}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={excelData.products.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={translations.selectOption} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {excelData.products.map((product: string) => (
                            <SelectItem key={product} value={product}>
                              {product}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.location}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={excelData.locations.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={translations.selectOption} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {excelData.locations.map((location: string) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{translations.startDate}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                                type="button" // Add type="button" to prevent form submission
                              >
                                {field.value ? format(field.value, "PPP") : <span>{translations.pickDate}</span>}
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
                              disabled={(date) => date < new Date("1900-01-01")}
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
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{translations.endDate}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                                type="button" // Add type="button" to prevent form submission
                              >
                                {field.value ? format(field.value, "PPP") : <span>{translations.pickDate}</span>}
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
                              disabled={(date) => date < new Date("1900-01-01")}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">{translations.images}</h2>

              <div className="grid gap-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="letterhead-upload">{translations.uploadLetterhead}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="letterhead-upload"
                        type="file"
                        ref={letterheadFileRef}
                        accept="image/*"
                        multiple
                        onChange={handleLetterheadUpload}
                      />
                      <Button variant="outline" size="icon" onClick={() => letterheadFileRef.current?.click()}>
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {letterheads.length > 0 && (
                    <FormField
                      control={form.control}
                      name="letterhead"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translations.selectLetterhead}</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setLetterheadPreview(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={translations.selectOption} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {letterheads.map((src, index) => (
                                <SelectItem key={index} value={src}>
                                  Letterhead {index + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {letterheadPreview && (
                    <div className="mt-2">
                      <img
                        src={letterheadPreview || "/placeholder.svg"}
                        alt="Letterhead Preview"
                        className="max-w-full h-auto max-h-40 border rounded-md"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="promoter-photo-upload">{translations.uploadPromoterPhoto}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="promoter-photo-upload"
                        type="file"
                        ref={promoterPhotoFileRef}
                        accept="image/*"
                        multiple
                        onChange={handlePromoterPhotoUpload}
                      />
                      <Button variant="outline" size="icon" onClick={() => promoterPhotoFileRef.current?.click()}>
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {promoterPhotos.length > 0 && (
                    <FormField
                      control={form.control}
                      name="promoterPhoto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translations.selectPromoterPhoto}</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setPromoterPhotoPreview(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={translations.selectOption} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {promoterPhotos.map((src, index) => (
                                <SelectItem key={index} value={src}>
                                  Promoter Photo {index + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {promoterPhotoPreview && (
                    <div className="mt-2">
                      <img
                        src={promoterPhotoPreview || "/placeholder.svg"}
                        alt="Promoter Photo Preview"
                        className="max-w-full h-auto max-h-40 border rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {process.env.NODE_ENV === "development" && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
                <div className="text-xs overflow-auto max-h-40 bg-muted p-2 rounded">
                  <p>Excel Data Status: {excelData.firstParties.length > 0 ? "Loaded" : "Not Loaded"}</p>
                  <p>First Parties: {excelData.firstParties.join(", ") || "None"}</p>
                  <p>Second Parties: {excelData.secondParties.join(", ") || "None"}</p>
                  <p>Promoters: {excelData.promoters.join(", ") || "None"}</p>
                  <p>Form Valid: {formIsValid ? "Yes" : "No"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={
                loading ||
                !(
                  form.getValues("firstParty") &&
                  form.getValues("secondParty") &&
                  form.getValues("promoter") &&
                  form.getValues("product") &&
                  form.getValues("location") &&
                  form.getValues("startDate") &&
                  form.getValues("endDate") &&
                  excelData.firstParties.length > 0
                )
              }
            >
              {translations.generateContract}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContractForm;
