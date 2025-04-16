import React, { useState, useEffect} from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import WishlistThumbnail from "./WishlistThumbnail.tsx";
import WishlistDetail from "./WishlistDetail.tsx";
import { useTranslation } from "react-i18next";
import UserAvatar from "../../../components/user/UserAvatar.tsx";

interface PersonDetailProps {
    user_id: string;
    person_id: string;
    name: string;
    photo_url: string;
    profile_id: string;
    onReturn: () => void;
}

interface WishlistItem {
    id: string;
    name: string;
    price: number;
    price_currency: string;
    description: string;
    url: string;
    photo_url: string;
    checkedOffBy: string | null;
    checkedOffByPhoto: string | null;
    checkedOffByName: string | null;
    deleted: boolean;
    modifiedByOwner: Date | null;
};

interface Wishlist {
    id: string;
    name: string;
    deleted: boolean;
    items: WishlistItem[];
};

const PersonDetail = ( {person_id, name, photo_url, onReturn } : PersonDetailProps ) => {
    const { t } = useTranslation();
    const [showSpinner, setShowSpinner] = useState(false);
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const [isViewingWishlist, setIsViewingWishlist] = useState<Wishlist | null>(null);

    // Načtení wishlistů u daného uživatele
    useEffect(() => {
        const fetchWishlists = async () => {
            setShowSpinner(true);

            try {
                const res = await fetchWithAuth(
                    `wishlistHub/wishlistsFor/${person_id}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (data.success) {
                    console.log("Fetched wishlists:", data.wishlists);
                    setWishlists(data.wishlists);
                    
                } else {
                    console.error("Error fetching wishlist copies: " + data.message);

                }
            } catch (error) {
                console.error("Error fetching wishlist copies:", error);
            }

            setShowSpinner(false);
        };

        fetchWishlists();
    }, [isViewingWishlist]);

    if (isViewingWishlist != null) {
        return (
          <>
            <WishlistDetail
              wishlist={isViewingWishlist}
              personName={name}
              onClickBack={() => setIsViewingWishlist(null)}
            />
          </>
        );
    }

    return (
      <>
        <div className="profile-container p-4">
          <div className="profile-welcome">
            <button className="btn-service" onClick={() => onReturn()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-arrow-left"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                />
              </svg>
            </button>
            <h2 className="my-2">{t("wishlistHub.title", {name: name.split(" ")[0]})}</h2>
          </div>

          <hr className="my-4" />

          <div className="my-4 my-wishlists-wrapper">
            <div className="profile-wishlists my-4">
              {/* <img
                className="profile-picture-thumbnail rounded-circle shadow"
                src={photo_url}
                alt={name + "profile"}
              /> */}
              <UserAvatar
                imgSrc={photo_url}
                altText={name + "profile"}
                className="profile-picture-thumbnail rounded-circle shadow"
              />
              <h4 className="mx-2">{t('wishlistHub.wishlists', {name: name.split(" ")[0]})}</h4>
            </div>

            <div className="wishlists-wishlist-hub-container my-4">
              {wishlists.length === 0 ? (
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  {t("wishlistHub.noWishlists", { name: name.split(" ")[0] })}
                </div>
              ) : (
                wishlists.map((wishlist) => (
                    <div
                      className="wishlist-card-wrapper"
                      onClick={wishlist.deleted ? undefined : () => setIsViewingWishlist(wishlist)}
                      key={wishlist.id}
                    >
                      {wishlist.deleted ? (
                      <p className="my-0 text-center inactive-wishlist-alert">
                        {t("wishlistHub.inactiveWishlistAlert")}
                      </p>
                      ) : ("")}

                      <WishlistThumbnail
                      key={wishlist.id}
                      title={wishlist.name}
                      imageUrls={wishlist.items.map((item) => item.photo_url)}
                      user_photo_url={""}
                      deleted={wishlist.deleted}
                      participantsPhotoUrls={[...new Set(wishlist.items.map((item) => item.checkedOffByPhoto).filter((url) => url !== null))] as string[]}
                      />
                    </div>
                ))
              )}
            </div>
          </div>
        </div>

        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
      </>
    );
};

export default PersonDetail;