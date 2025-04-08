
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface ContractPreviewProps {
  language: "ar" | "en";
  contractData: {
    companyName: string;
    companyAddress: string;
    promoterName: string;
    promoterID: string;
    contractDuration: number;
    contractDate: Date;
    monthlyCompensation: number;
    duties: string;
  };
}

const ContractPreview = ({ language, contractData }: ContractPreviewProps) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date: Date) => {
    return format(date, "PPP", {
      locale: language === "ar" ? ar : enUS,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-US", {
      style: "currency",
      currency: "SAR",
    }).format(amount);
  };

  const texts = {
    ar: {
      title: "عقد توظيف مروج",
      date: "التاريخ",
      parties: "أطراف العقد",
      firstParty: "الطرف الأول",
      secondParty: "الطرف الثاني",
      address: "العنوان",
      idNumber: "رقم الهوية",
      subject: "موضوع العقد",
      subjectText: "يتفق الطرفان على توظيف الطرف الثاني كمروج لمنتجات الطرف الأول وفقًا للشروط المذكورة أدناه.",
      duration: "مدة العقد",
      durationText: (months: number) => `مدة هذا العقد ${months} أشهر تبدأ من تاريخ هذا العقد.`,
      compensation: "التعويض",
      compensationText: (amount: string) => `يتم دفع راتب شهري للطرف الثاني قدره ${amount} ريال سعودي.`,
      duties: "الواجبات والمسؤوليات",
      signatures: "التوقيعات",
      companySignature: "توقيع الشركة",
      promoterSignature: "توقيع المروج",
      print: "طباعة العقد",
    },
    en: {
      title: "Promoter Employment Contract",
      date: "Date",
      parties: "Contract Parties",
      firstParty: "First Party",
      secondParty: "Second Party",
      address: "Address",
      idNumber: "ID Number",
      subject: "Contract Subject",
      subjectText: "The two parties agree to employ the second party as a promoter for the first party's products according to the conditions mentioned below.",
      duration: "Contract Duration",
      durationText: (months: number) => `The duration of this contract is ${months} months starting from the date of this contract.`,
      compensation: "Compensation",
      compensationText: (amount: string) => `A monthly salary of ${amount} Saudi Riyals will be paid to the second party.`,
      duties: "Duties and Responsibilities",
      signatures: "Signatures",
      companySignature: "Company Signature",
      promoterSignature: "Promoter Signature",
      print: "Print Contract",
    },
  };

  const t = texts[language];
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

      <div className="contract-document bg-white border p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-8">{t.title}</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">{t.date}</h2>
          <p>{formatDate(contractData.contractDate)}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">{t.parties}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{t.firstParty}: {contractData.companyName}</h3>
              <p>{t.address}: {contractData.companyAddress}</p>
            </div>
            <div>
              <h3 className="font-semibold">{t.secondParty}: {contractData.promoterName}</h3>
              <p>{t.idNumber}: {contractData.promoterID}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">{t.subject}</h2>
          <p>{t.subjectText}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">{t.duration}</h2>
          <p>{t.durationText(contractData.contractDuration)}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">{t.compensation}</h2>
          <p>{t.compensationText(formatCurrency(contractData.monthlyCompensation))}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">{t.duties}</h2>
          <p className="whitespace-pre-line">{contractData.duties}</p>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-bold mb-4">{t.signatures}</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-8">{t.companySignature}</p>
              <div className="border-t border-black pt-2">
                {contractData.companyName}
              </div>
            </div>
            <div>
              <p className="mb-8">{t.promoterSignature}</p>
              <div className="border-t border-black pt-2">
                {contractData.promoterName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
