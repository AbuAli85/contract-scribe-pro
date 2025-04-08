
interface ContractTitleProps {
  language: "ar" | "en";
}

const ContractTitle = ({ language }: ContractTitleProps) => {
  return (
    <div className="contract-title-area">
      <h1 className="contract-main-title">
        {language === "ar" ? "عقد تعيين المروج" : "Promoter Assignment Contract"}
      </h1>
    </div>
  );
};

export default ContractTitle;
