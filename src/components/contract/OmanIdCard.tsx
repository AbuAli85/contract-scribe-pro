
import React from 'react';

interface OmanIdCardProps {
  promoterData: {
    name?: {
      en?: string;
      ar?: string;
    };
    id?: {
      en?: string;
      ar?: string;
    };
    nationality?: {
      en?: string;
      ar?: string;
    };
    photo?: string;
  };
  language?: 'en' | 'ar';
}

const OmanIdCard: React.FC<OmanIdCardProps> = ({ 
  promoterData,
  language = 'en'
}) => {
  // Format ID card data
  const name = language === 'en' ? 
    promoterData.name?.en || 'Farzan Riyaz Munde' : 
    promoterData.name?.ar || 'فرزان رياض موندي';
  
  const idNumber = language === 'en' ? 
    promoterData.id?.en || '126208869' : 
    promoterData.id?.ar || '126208869';
  
  const nationality = language === 'en' ? 
    promoterData.nationality?.en || 'Indian' : 
    promoterData.nationality?.ar || 'هندي';
  
  return (
    <div className={`oman-id-card ${language === 'ar' ? 'rtl' : ''}`}>
      <div className="oman-id-header">
        {language === 'en' ? 'Resident Identity Card' : 'بطاقة الإقامة'}
      </div>
      
      <div className="oman-id-content">
        {promoterData.photo ? (
          <img 
            src={promoterData.photo} 
            alt={`${name} ID`} 
            className="oman-id-photo"
          />
        ) : (
          <div className="oman-id-photo-placeholder">
            {language === 'en' ? 'No Photo Available' : 'الصورة غير متوفرة'}
          </div>
        )}
        
        <div className="oman-id-details">
          <div className="oman-id-field">
            <span className="oman-id-field-label">
              {language === 'en' ? 'Name:' : 'الاسم:'}
            </span>
            <span className="oman-id-field-value">{name}</span>
          </div>
          
          <div className="oman-id-field">
            <span className="oman-id-field-label">
              {language === 'en' ? 'ID No:' : 'رقم الهوية:'}
            </span>
            <span className="oman-id-field-value">{idNumber}</span>
          </div>
          
          <div className="oman-id-field">
            <span className="oman-id-field-label">
              {language === 'en' ? 'Nationality:' : 'الجنسية:'}
            </span>
            <span className="oman-id-field-value">{nationality}</span>
          </div>
        </div>
      </div>
      
      <div className="oman-id-footer">
        {language === 'en' ? 'Sultanate of Oman - Royal Oman Police' : 'سلطنة عمان - شرطة عمان السلطانية'}
      </div>
    </div>
  );
};

export default OmanIdCard;
