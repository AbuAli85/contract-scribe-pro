
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
        />
      </div>
    </div>
  );
};

export default PromoterPhoto;
