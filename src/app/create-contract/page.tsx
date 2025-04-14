
'use client'

import { useEffect } from 'react'
import { useContractCreator } from '@/hooks/useContractCreator'
import '@/styles/contract-creator.css'

// Translations object
const translations = {
  headerTitle: {
    ar: 'نظام أتمتة عقد المروج (Promoter Assignment)',
    en: 'Promoter Assignment Contract Automation System'
  },
  uploadExcelTitle: {
    ar: 'رفع ملف إكسل أو CSV',
    en: 'Upload Excel or CSV File'
  },
  excelUploadLabel: {
    ar: 'ملف إكسل/CSV:',
    en: 'Excel/CSV File:'
  },
  contractDataTitle: {
    ar: 'بيانات العقد',
    en: 'Contract Data'
  },
  refNumberLabel: {
    ar: 'رقم المرجع (سيتم توليده تلقائيًا):',
    en: 'Reference Number (auto-generated):'
  },
  firstPartyLabel: {
    ar: 'الطرف الأول (العميل / Client):',
    en: 'First Party (Client):'
  },
  secondPartyLabel: {
    ar: 'الطرف الثاني (المشغل / Employer):',
    en: 'Second Party (Employer):'
  },
  promoterLabel: {
    ar: 'المروج (Promoter):',
    en: 'Promoter:'
  },
  productLabel: {
    ar: 'المنتج (Product):',
    en: 'Product:'
  },
  locationLabel: {
    ar: 'الموقع (Location):',
    en: 'Location:'
  },
  startDateLabel: {
    ar: 'تاريخ البداية (dd/mm/yyyy):',
    en: 'Start Date (dd/mm/yyyy):'
  },
  endDateLabel: {
    ar: 'تاريخ النهاية (dd/mm/yyyy):',
    en: 'End Date (dd/mm/yyyy):'
  },
  imagesTitle: {
    ar: 'صور (الخلفية وبطاقة الهوية)',
    en: 'Images (Letterhead & ID)'
  },
  letterheadUploadLabel: {
    ar: 'تحميل صور التر هيد:',
    en: 'Upload Letterhead Images:'
  },
  letterheadSelectLabel: {
    ar: 'اختر صورة الخلفية (Letterhead):',
    en: 'Select Letterhead Image:'
  },
  promoterPhotoUploadLabel: {
    ar: 'تحميل صور بطاقات المروج:',
    en: 'Upload Promoter ID Photos:'
  },
  promoterPhotoSelectLabel: {
    ar: 'اختر صورة بطاقة المروج (Promoter ID Photo):',
    en: 'Select Promoter ID Photo:'
  },
  generateBtn: {
    ar: 'توليد العقد',
    en: 'Generate Contract'
  },
  downloadPdfBtn: {
    ar: 'تنزيل PDF',
    en: 'Download PDF'
  },
  printBtn: {
    ar: 'طباعة',
    en: 'Print'
  },
  resetBtn: {
    ar: 'إعادة تعيين',
    en: 'Reset'
  },
  loadingText: {
    ar: 'جارٍ التحميل...',
    en: 'Loading...'
  },
  firstPartySelect: {
    ar: 'اختر الطرف الأول',
    en: 'Select First Party'
  },
  secondPartySelect: {
    ar: 'اختر الطرف الثاني',
    en: 'Select Second Party'
  },
  promoterSelect: {
    ar: 'اختر المروج',
    en: 'Select Promoter'
  },
  productSelect: {
    ar: 'اختر المنتج',
    en: 'Select Product'
  },
  locationSelect: {
    ar: 'اختر الموقع',
    en: 'Select Location'
  },
  letterheadSelect: {
    ar: 'اختر صورة الخلفية',
    en: 'Select Letterhead'
  },
  promoterPhotoSelect: {
    ar: 'اختر صورة البطاقة',
    en: 'Select Promoter Photo'
  }
}

export default function ContractCreator() {
  const {
    language,
    setLanguage,
    contractData,
    setContractData,
    options,
    showContract,
    isLoading,
    handleExcelUpload,
    handleLetterheadUpload,
    handlePromoterPhotoUpload,
    handleGenerateContract,
    handleDownloadPDF,
    handleReset,
    handlePrint
  } = useContractCreator()
  
  // Update page direction when language changes
  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', language)
  }, [language])
  
  // Handle language change
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value as 'ar' | 'en')
  }
  
  return (
    <div className="contract-creator">
      <div className="contract-creator-header">
        <h1>{translations.headerTitle[language]}</h1>
        <div className="language-toggle">
          <label htmlFor="languageSelect">Language / اللغة:</label>
          <select 
            id="languageSelect" 
            className="form-control"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Form Section */}
      <div className="form-section">
        <h2>{translations.uploadExcelTitle[language]}</h2>
        <div className="form-group">
          <label htmlFor="excelUpload" className="form-label">
            {translations.excelUploadLabel[language]}
          </label>
          <input 
            type="file" 
            id="excelUpload" 
            accept=".xlsx, .csv" 
            className="form-control"
            onChange={handleExcelUpload}
          />
          <div id="excelUploadMessage" className="message"></div>
        </div>

        <h2>{translations.contractDataTitle[language]}</h2>
        <div className="form-group">
          <label className="form-label">
            {translations.refNumberLabel[language]}
          </label>
          <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {contractData.referenceNumber}
          </span>
        </div>

        {/* First Party Selection */}
        <div className="form-group">
          <label className="form-label" htmlFor="firstPartySelect">
            {translations.firstPartyLabel[language]}
          </label>
          <select 
            id="firstPartySelect" 
            className="form-control"
            value={JSON.stringify(contractData.firstParty) !== '{"nameEn":"","nameAr":"","crnEn":"","crnAr":""}' ? 
              JSON.stringify(contractData.firstParty) : ''}
            onChange={(e) => {
              if (e.target.value) {
                setContractData({
                  ...contractData,
                  firstParty: JSON.parse(e.target.value)
                })
              }
            }}
          >
            <option value="">
              {translations.firstPartySelect[language]} / {translations.firstPartySelect[language === 'ar' ? 'en' : 'ar']}
            </option>
            {options.firstParties.map((party, index) => (
              <option key={index} value={JSON.stringify(party)}>
                {language === 'ar' ? party.nameAr : party.nameEn} ({party.crnEn})
              </option>
            ))}
          </select>
        </div>

        {/* Second Party Selection */}
        <div className="form-group">
          <label className="form-label" htmlFor="secondPartySelect">
            {translations.secondPartyLabel[language]}
          </label>
          <select 
            id="secondPartySelect" 
            className="form-control"
            value={JSON.stringify(contractData.secondParty) !== '{"nameEn":"","nameAr":"","crnEn":"","crnAr":""}' ? 
              JSON.stringify(contractData.secondParty) : ''}
            onChange={(e) => {
              if (e.target.value) {
                setContractData({
                  ...contractData,
                  secondParty: JSON.parse(e.target.value)
                })
              }
            }}
          >
            <option value="">
              {translations.secondPartySelect[language]} / {translations.secondPartySelect[language === 'ar' ? 'en' : 'ar']}
            </option>
            {options.secondParties.map((party, index) => (
              <option key={index} value={JSON.stringify(party)}>
                {language === 'ar' ? party.nameAr : party.nameEn} ({party.crnEn})
              </option>
            ))}
          </select>
        </div>

        {/* More form fields would be implemented similarly */}
        {/* This is a simplified version */}

        <h2>{translations.imagesTitle[language]}</h2>
        
        {/* Letterhead Upload */}
        <div className="form-group">
          <label className="form-label" htmlFor="letterheadUpload">
            {translations.letterheadUploadLabel[language]}
          </label>
          <input 
            type="file" 
            id="letterheadUpload" 
            accept="image/*" 
            multiple 
            className="form-control"
            onChange={handleLetterheadUpload}
          />
          <div className="message"></div>
        </div>
        
        {/* Promoter Photo Upload */}
        <div className="form-group">
          <label className="form-label" htmlFor="promoterPhotoUpload">
            {translations.promoterPhotoUploadLabel[language]}
          </label>
          <input 
            type="file" 
            id="promoterPhotoUpload" 
            accept="image/*" 
            multiple 
            className="form-control"
            onChange={handlePromoterPhotoUpload}
          />
          <div className="message"></div>
        </div>
      </div>

      {/* Button Group */}
      <div className="button-group">
        <button 
          className="btn btn--primary" 
          onClick={handleGenerateContract}
        >
          {translations.generateBtn[language]} / {translations.generateBtn[language === 'ar' ? 'en' : 'ar']}
        </button>
        
        <button 
          className="btn btn--primary" 
          onClick={handleDownloadPDF}
          disabled={!showContract}
        >
          {translations.downloadPdfBtn[language]} / {translations.downloadPdfBtn[language === 'ar' ? 'en' : 'ar']}
        </button>
        
        <button 
          className="btn btn--secondary" 
          onClick={handlePrint}
          disabled={!showContract}
        >
          {translations.printBtn[language]} / {translations.printBtn[language === 'ar' ? 'en' : 'ar']}
        </button>
        
        <button 
          className="btn btn--secondary"
          onClick={handleReset}
        >
          {translations.resetBtn[language]} / {translations.resetBtn[language === 'ar' ? 'en' : 'ar']}
        </button>
      </div>

      {/* A4 Page Preview (only shown when generated) */}
      {showContract && (
        <div className="agreement-container" id="agreementContainer">
          <div className="a4-page" id="a4Page">
            {/* Letterhead Background */}
            <div 
              className="letterhead-bg" 
              id="letterheadBg"
              style={{ backgroundImage: contractData.letterheadUrl ? 
                `url(${contractData.letterheadUrl})` : 'none' 
              }}
            ></div>

            {/* Reference Number */}
            <div className="ref-number" id="refNumber">
              {contractData.referenceNumber}
            </div>

            {/* Content Block with Promoter Photo and Table */}
            <div className="content-block">
              {/* Promoter Photo */}
              <img 
                src={contractData.promoterPhotoUrl || "https://via.placeholder.com/400x150.png?text=No+Promoter+ID+Selected"} 
                alt="Promoter Photo" 
                className="promoter-photo" 
                id="promoterPhotoA4" 
              />

              {/* Contract Table */}
              <div className="contract-table-wrapper">
                <table className="contract-table">
                  <tbody>
                    {/* Contract Title Row */}
                    <tr>
                      <td className="english title-cell">Promoter Assignment Contract</td>
                      <td className="arabic title-cell">عقد تعيين المروج</td>
                    </tr>
                    
                    {/* First Party Row */}
                    <tr>
                      <td className="english">
                        <p>
                          This contract is between <strong>{contractData.firstParty.nameEn || "Falcon EYE Management"} (First Party)</strong> having the C.R. No.: <strong>{contractData.firstParty.crnEn || "1410869"}</strong>
                        </p>
                      </td>
                      <td className="arabic">
                        <p>
                          هذا العقد بين <strong>{contractData.firstParty.nameAr || "عين الصقر للإدارة و الأعمال"} (الطرف الأول)</strong> التي لديها السجل التجاري: <strong>{contractData.firstParty.crnAr || "1410869"}</strong>
                        </p>
                      </td>
                    </tr>
                    
                    {/* Second Party Row */}
                    <tr>
                      <td className="english">
                        <p>
                          <strong>{contractData.secondParty.nameEn || "Second Party Company"} (Second Party)</strong> having the C.R. No.: <strong>{contractData.secondParty.crnEn || "0000000"}</strong>
                        </p>
                      </td>
                      <td className="arabic">
                        <p>
                          <strong>{contractData.secondParty.nameAr || "الشركة الثانية"} (الطرف الثاني)</strong> التي لديها السجل التجاري: <strong>{contractData.secondParty.crnAr || "0000000"}</strong>
                        </p>
                      </td>
                    </tr>
                    
                    {/* Agreement Row */}
                    <tr>
                      <td className="english">
                        <p>
                          The Second Party agrees to provide The First Party with a qualified promoter to sell ("<strong>{contractData.product.nameEn || "Products"}</strong>") products at <strong>{contractData.location.nameEn || "Specified Location"}</strong>.
                        </p>
                      </td>
                      <td className="arabic">
                        <p>
                          الطرف الثاني يوافق على تزويد الطرف الأول بمروج مؤهل لبيع منتجات "<strong>{contractData.product.nameAr || "المنتجات"}</strong>" في <strong>{contractData.location.nameAr || "الموقع المحدد"}</strong>.
                        </p>
                      </td>
                    </tr>
                    
                    {/* Promoter Details Row */}
                    <tr>
                      <td className="english">
                        <p>
                          <strong>Name:</strong> {contractData.promoter.nameEn || "Promoter Name"}<br/>
                          <strong>ID NO:</strong> {contractData.promoter.idEn || "ID Number"}<br/>
                          <strong>Nationality:</strong> {contractData.promoter.nationality?.en || "Indian"}<br/>
                          <strong>From:</strong> {contractData.dates.startEn || "Start Date"} <strong>to:</strong> {contractData.dates.endEn || "End Date"}
                        </p>
                      </td>
                      <td className="arabic">
                        <p>
                          <strong>الاسم:</strong> {contractData.promoter.nameAr || "اسم المروج"}<br/>
                          <strong>رقم الهوية:</strong> {contractData.promoter.idEn || "رقم الهوية"}<br/>
                          <strong>الجنسية:</strong> {contractData.promoter.nationality?.ar || "هندي"}<br/>
                          <strong>من:</strong> {contractData.dates.startAr || "تاريخ البداية"} <strong>إلى:</strong> {contractData.dates.endAr || "تاريخ النهاية"}
                        </p>
                      </td>
                    </tr>
                    
                    {/* Responsibilities Row */}
                    <tr>
                      <td className="english">
                        <h3>Financial and Administrative Responsibilities</h3>
                        <p>
                          The Second Party will bear the entire financial and administrative responsibilities towards this promoter.
                        </p>
                      </td>
                      <td className="arabic">
                        <h3>المسؤوليات والالتزامات المالية</h3>
                        <p>
                          الطرف الثاني سيتحمل كامل المسؤوليات المالية والإدارية تجاه هذا المروج.
                        </p>
                      </td>
                    </tr>
                    
                    {/* Regards Row */}
                    <tr>
                      <td className="english">
                        <p>
                          Best Regards,
                        </p>
                      </td>
                      <td className="arabic">
                        <p>
                          و تفضلوا بقبول وافر الشكر و التقدير،
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Area */}
            <div className="signature-area">
              <div className="signature-line">
                <hr />
                <p>{language === 'ar' ? 'الطرف الأول' : 'First Party'}</p>
              </div>
              <div className="signature-line">
                <hr />
                <p>{language === 'ar' ? 'الطرف الثاني' : 'Second Party'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay" style={{ display: 'flex' }}>
          <div className="spinner">🔄</div>
          <div>
            {translations.loadingText[language]} / {translations.loadingText[language === 'ar' ? 'en' : 'ar']}
          </div>
        </div>
      )}
    </div>
  )
}
