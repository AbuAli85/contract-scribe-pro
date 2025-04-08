
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";

interface ContractPreviewProps {
  language: "ar" | "en";
  contractData: any;
}

const ContractPreview = ({ language, contractData }: ContractPreviewProps) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return format(new Date(year, month - 1, day), "PPP", {
      locale: language === "ar" ? ar : enUS,
    });
  };

  const translations = {
    ar: {
      title: "عقد توظيف مروج",
      refNumber: "رقم المرجع",
      date: "التاريخ",
      parties: "أطراف العقد",
      firstParty: "الطرف الأول",
      secondParty: "الطرف الثاني",
      promoter: "المروج",
      crn: "رقم السجل التجاري",
      id: "رقم الهوية",
      subject: "موضوع العقد",
      subjectText: "يتفق الطرفان على توظيف المروج لتسويق وترويج المنتجات المذكورة أدناه وفقًا للشروط المذكورة في هذا العقد.",
      product: "المنتج",
      location: "الموقع",
      duration: "مدة العقد",
      durationText: (start: string, end: string) => `تبدأ مدة هذا العقد من ${start} وتنتهي في ${end}.`,
      signatures: "التوقيعات",
      firstPartySignature: "توقيع الطرف الأول",
      secondPartySignature: "توقيع الطرف الثاني",
      promoterSignature: "توقيع المروج",
      print: "طباعة العقد",
      today: "تم إصدار هذا العقد في",
    },
    en: {
      title: "Promoter Assignment Contract",
      refNumber: "Reference Number",
      date: "Date",
      parties: "Contract Parties",
      firstParty: "First Party",
      secondParty: "Second Party",
      promoter: "Promoter",
      crn: "Commercial Registration Number",
      id: "ID Number",
      subject: "Contract Subject",
      subjectText: "The parties agree to employ the promoter to market and promote the products mentioned below according to the terms mentioned in this contract.",
      product: "Product",
      location: "Location",
      duration: "Contract Duration",
      durationText: (start: string, end: string) => `This contract starts on ${start} and ends on ${end}.`,
      signatures: "Signatures",
      firstPartySignature: "First Party Signature",
      secondPartySignature: "Second Party Signature",
      promoterSignature: "Promoter Signature",
      print: "Print Contract",
      today: "This contract was issued on",
    },
  };

  const t = translations[language];
  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <div className={`contract-preview ${dir === "rtl" ? "text-right" : "text-left"}`}>
      <Button
        variant="outline"
        onClick={handlePrint}
        className="mb-6 print:hidden flex gap-2 items-center"
      >
        <Printer className="h-4 w-4" />
        <span>{t.print}</span>
      </Button>

      <Card className="contract-document bg-white border p-8 rounded-lg shadow-sm">
        {contractData.letterhead && (
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <img
              src={contractData.letterhead}
              alt="Letterhead"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-center mb-8">{t.title}</h1>
          
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold">{t.refNumber}</h2>
              <p>{contractData.refNumber}</p>
            </div>
            <div>
              <h2 className="text-lg font-bold">{t.date}</h2>
              <p>{format(new Date(), "PPP", { locale: language === "ar" ? ar : enUS })}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">{t.parties}</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted/20 rounded-md">
                <h3 className="font-semibold">{t.firstParty}: {contractData.firstParty.name[language]}</h3>
                <p>{t.crn}: {contractData.firstParty.crn[language]}</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-md">
                <h3 className="font-semibold">{t.secondParty}: {contractData.secondParty.name[language]}</h3>
                <p>{t.crn}: {contractData.secondParty.crn[language]}</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-md">
                <h3 className="font-semibold">{t.promoter}: {contractData.promoter.name[language]}</h3>
                <p>{t.id}: {contractData.promoter.id[language]}</p>
                {contractData.promoterPhoto && (
                  <div className="mt-2 w-24 h-24 border">
                    <img
                      src={contractData.promoterPhoto}
                      alt="Promoter ID"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2">{t.subject}</h2>
            <p>{t.subjectText}</p>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/20 rounded-md">
                <h3 className="font-semibold">{t.product}</h3>
                <p>{contractData.product[language]}</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-md">
                <h3 className="font-semibold">{t.location}</h3>
                <p>{contractData.location[language]}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2">{t.duration}</h2>
            <p>{t.durationText(formatDate(contractData.startDate[language]), formatDate(contractData.endDate[language]))}</p>
          </div>

          <div className="mb-4 text-sm text-muted-foreground">
            <p>{t.today} {format(new Date(), "PPP", { locale: language === "ar" ? ar : enUS })}</p>
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-bold mb-4">{t.signatures}</h2>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="mb-8">{t.firstPartySignature}</p>
                <div className="border-t border-black pt-2">
                  {contractData.firstParty.name[language]}
                </div>
              </div>
              <div>
                <p className="mb-8">{t.secondPartySignature}</p>
                <div className="border-t border-black pt-2">
                  {contractData.secondParty.name[language]}
                </div>
              </div>
              <div>
                <p className="mb-8">{t.promoterSignature}</p>
                <div className="border-t border-black pt-2">
                  {contractData.promoter.name[language]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContractPreview;
