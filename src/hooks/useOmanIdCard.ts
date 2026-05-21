
import { useState, useEffect } from 'react';

interface UseOmanIdCardOptions {
  promoterData?: {
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

export function useOmanIdCard({
  promoterData = {},
  language = 'en'
}: UseOmanIdCardOptions = {}) {
  const [photo, setPhoto] = useState<string | undefined>(promoterData.photo);
  const [displayData, setDisplayData] = useState({
    name: {
      en: promoterData.name?.en || 'Farzan Riyaz Munde',
      ar: promoterData.name?.ar || 'فرزان رياض موندي'
    },
    id: {
      en: promoterData.id?.en || '126208869',
      ar: promoterData.id?.ar || '126208869'
    },
    nationality: {
      en: promoterData.nationality?.en || 'Indian',
      ar: promoterData.nationality?.ar || 'هندي'
    }
  });

  // Update display data when promoter data changes
  useEffect(() => {
    if (promoterData) {
      setDisplayData({
        name: {
          en: promoterData.name?.en || displayData.name.en,
          ar: promoterData.name?.ar || displayData.name.ar
        },
        id: {
          en: promoterData.id?.en || displayData.id.en,
          ar: promoterData.id?.ar || displayData.id.ar
        },
        nationality: {
          en: promoterData.nationality?.en || displayData.nationality.en,
          ar: promoterData.nationality?.ar || displayData.nationality.ar
        }
      });
      
      setPhoto(promoterData.photo);
    }
  }, [promoterData]);

  // Function to update photo
  const updatePhoto = (photoUrl: string) => {
    setPhoto(photoUrl);
  };

  // Function to update a specific field
  const updateField = (
    field: 'name' | 'id' | 'nationality', 
    lang: 'en' | 'ar', 
    value: string
  ) => {
    setDisplayData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }));
  };

  // Generate complete promoter data object for use in other components
  const getCompletePromoterData = () => {
    return {
      name: displayData.name,
      id: displayData.id,
      nationality: displayData.nationality,
      photo
    };
  };

  return {
    displayData,
    photo,
    updatePhoto,
    updateField,
    getCompletePromoterData
  };
}
