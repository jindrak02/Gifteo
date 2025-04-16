import { useTranslation } from "react-i18next";
import UserAvatar from "../../../components/user/UserAvatar";

interface WishlistThumbnailProps {
  title: string;
  imageUrls: string[];
  user_photo_url: string;
  deleted: boolean;
  participantsPhotoUrls: string[];
}

const WishlistCopyThumbnail = ({ title, imageUrls, deleted, participantsPhotoUrls }: WishlistThumbnailProps) => {
  const { t } = useTranslation();

  return (
    <div className={deleted ? "wishlist-thumbnail-disabled wishlist-card p-3 rounded shadow-sm mb-4" : "wishlist-card p-3 rounded shadow-sm my-4"}>
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

      <div className="d-flex align-items-center mt-2">
        <p className="my-0 mx-2">{t("wishlistHub.participants")}</p>
        <div className="flex">
          {participantsPhotoUrls.slice(0,3).map((url, index) => (
            // <img
            //   key={index}
            //   src={url}
            //   alt={`Participant ${index + 1}`}
            //   className="profile-picture-thumbnail-sm rounded-circle me-1"
            // />
            <UserAvatar
              key={index}
              imgSrc={url}
              altText={`Participant ${index + 1}`}
              className="profile-picture-thumbnail-sm rounded-circle me-1"
            />
          ))}
          {participantsPhotoUrls.length > 3 && (
            <span className="extra-participants-count">{t("wishlistHub.extraParticipants", { count: participantsPhotoUrls.length - 3 })}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistCopyThumbnail;
