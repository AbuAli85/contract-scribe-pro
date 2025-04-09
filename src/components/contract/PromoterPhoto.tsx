
interface PromoterPhotoProps {
  photoUrl?: string;
}

const PromoterPhoto = ({ photoUrl }: PromoterPhotoProps) => {
  if (!photoUrl) return null;
  
  return (
    <div className="id-photo-container">
      <div className="id-photo-wrapper">
        <img
          src={photoUrl}
          alt="Promoter ID"
          className="id-photo"
          loading="eager" // Force eager loading for better PDF generation
          crossOrigin="anonymous" // Help with CORS issues
        />
      </div>
    </div>
  );
};

export default PromoterPhoto;
