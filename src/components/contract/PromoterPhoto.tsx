
interface PromoterPhotoProps {
  photoUrl?: string;
}

const PromoterPhoto = ({ photoUrl }: PromoterPhotoProps) => {
  if (!photoUrl) return null;
  
  return (
    <div className="id-photo-container w-full flex justify-center items-center my-8">
      <div className="id-photo-wrapper w-full max-w-lg mx-auto border border-gray-200 rounded-md overflow-hidden shadow-sm bg-white">
        <img
          src={photoUrl}
          alt="Promoter ID"
          className="id-photo w-full h-auto object-contain"
          loading="eager" // Force eager loading for better PDF generation
          crossOrigin="anonymous" // Help with CORS issues
        />
      </div>
    </div>
  );
};

export default PromoterPhoto;
