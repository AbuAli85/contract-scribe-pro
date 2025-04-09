
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
    <div className="id-photo-container w-full flex flex-col items-center my-5">
      <div className="id-photo-wrapper w-full max-w-md mx-auto border border-gray-200 rounded-md overflow-hidden shadow-sm bg-white">
        <div className="aspect-w-16 aspect-h-9 flex items-center justify-center">
          <img
            src={photoUrl}
            alt={type === 'passport' ? "Passport" : "Promoter ID"}
            className="max-w-full max-h-full object-contain"
            loading="eager"
            crossOrigin="anonymous"
          />
        </div>
      </div>
      <div className="text-center text-gray-600 mt-2 text-sm font-medium">{photoLabel}</div>
    </div>
  );
};

export default PromoterPhoto;
