
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ContractForm from "@/components/ContractForm";
import ContractPreview from "@/components/ContractPreview";
import LanguageToggle from "@/components/LanguageToggle";
import LoadingOverlay from "@/components/LoadingOverlay";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [contractData, setContractData] = useState<any>(null);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check URL params for language
    const langParam = searchParams.get("lang");
    if (langParam === "en" || langParam === "ar") {
      setLanguage(langParam);
      document.documentElement.dir = langParam === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = langParam;
    }
  }, [searchParams]);

  const handleLanguageChange = (newLang: "ar" | "en") => {
    setLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
    navigate(`?lang=${newLang}`);
  };

  const handleGenerateContract = (data: any) => {
    setLoading(true);

    // Simulate processing delay
    setTimeout(() => {
      setContractData(data);
      setActiveTab("preview");
      setLoading(false);
      toast({
        title: language === "ar" ? "تم إنشاء العقد بنجاح" : "Contract generated successfully",
        description:
          language === "ar" ? "يمكنك الآن معاينة العقد وطباعته" : "You can now preview and print the contract",
      });
    }, 1000);
  };

  const handleReset = () => {
    setContractData(null);
    setActiveTab("form");
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
          <h1 className="text-2xl font-bold">
            {language === "ar" ? "نظام أتمتة عقد المروج (Promoter Assignment)" : "Promoter Assignment Contract System"}
          </h1>
          <LanguageToggle language={language} onChange={handleLanguageChange} />
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 print:hidden">
            <TabsTrigger value="form">{language === "ar" ? "نموذج العقد" : "Contract Form"}</TabsTrigger>
            <TabsTrigger value="preview" disabled={!contractData}>
              {language === "ar" ? "معاينة العقد" : "Contract Preview"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="print:hidden">
            <ContractForm language={language} onGenerateContract={handleGenerateContract} />
          </TabsContent>

          <TabsContent value="preview">
            {contractData && (
              <>
                <div className="flex justify-end gap-2 mb-4 print:hidden">
                  <Button variant="outline" onClick={handleReset}>
                    {language === "ar" ? "إعادة تعيين" : "Reset"}
                  </Button>
                </div>
                <ContractPreview language={language} contractData={contractData} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {loading && <LoadingOverlay language={language} />}
    </main>
  );
};

export default Index;
