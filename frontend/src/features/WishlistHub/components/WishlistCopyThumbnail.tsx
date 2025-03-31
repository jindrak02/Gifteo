interface WishlistThumbnailProps {
  title: string;
  imageUrls: string[];
  user_photo_url: string;
}

const WishlistCopyThumbnail = ({ title, imageUrls, }: WishlistThumbnailProps) => {

  return (
    <div className="wishlist-card p-3 rounded shadow-sm my-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">{title}</h5>
      </div>

      <div className="wishlist-images-scroll-container">
        <div className="wishlist-images-wrapper">
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Item ${index + 1}`}
              className="wishlist-thumbnail-large me-2"
            />
          ))}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <p className="my-0">Participants: TODO </p>
      </div>
    </div>
  );
};

export default WishlistCopyThumbnail;
