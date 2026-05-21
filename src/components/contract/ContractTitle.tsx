
interface ContractTitleProps {
  language: "ar" | "en";
}

const ContractTitle = ({ language }: ContractTitleProps) => {
  return (
    <div className="contract-title-area">
      <h1 className="contract-main-title text-xl font-bold text-center text-blue-700 mb-2">
        {language === "ar" ? "عقد تعيين مروّج" : "Promoter Assignment Contract"}
      </h1>
    </div>
  );
};

export default ContractTitle;
