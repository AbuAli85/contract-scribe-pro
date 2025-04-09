
interface PromoterPhotoProps {
  photoUrl?: string;
  type?: 'id' | 'passport';
  label?: string;
}

const PromoterPhoto = ({ photoUrl, type = 'id', label }: PromoterPhotoProps) => {
  if (!photoUrl) return null;
  
  // Determine appropriate label based on document type
  const photoLabel = label || (type === 'passport' ? 'Passport / جواز السفر' : 'ID Card / بطاقة الهوية');
  
  return (
    <div className="id-photo-container w-full flex flex-col items-center my-6">
      <div className="id-photo-wrapper w-full max-w-md mx-auto border border-gray-200 rounded-md overflow-hidden shadow-md bg-white">
        <img
          src={photoUrl}
          alt={type === 'passport' ? "Passport" : "Promoter ID"}
          className="w-full h-auto object-contain"
          loading="eager" // Force eager loading for better PDF generation
          crossOrigin="anonymous" // Help with CORS issues
        />
      </div>
      <div className="text-center text-gray-600 mt-2 text-sm">{photoLabel}</div>
    </div>
  );
};

export default PromoterPhoto;
