import React, { useState, useEffect} from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import WishlistCopyThumbnail from "./WishlistCopyThumbnail";
import AddWishlistCopy from "./AddWishlistCopy.tsx";
import WishlistCopyDetail from "./WishlistCopyDetail.tsx";

interface PersonDetailProps {
    user_id: string;
    person_id: string;
    name: string;
    photo_url: string;
    profile_id: string;
    onReturn: () => void;
}

type WishlistItem = {
    id: string;
    name: string;
    price: number;
    price_currency: string;
    url: string;
    photo_url: string;
    checkedOffBy: string;
    checkedOffByPhoto?: string | null;
};

type Wishlist = {
    id: string;
    name: string;
    originalWishlistId: string;
    role: string;
    items: WishlistItem[];
};

const PersonDetail = ( {user_id, person_id, profile_id, name, photo_url, onReturn } : PersonDetailProps ) => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const [isAddingWishlistCopy, setIsAddingWishlistCopy] = useState(false);
    const [isViewingWishlistCopy, setIsViewingWishlistCopy] = useState<Wishlist | null>(null);

    // Načtení wishlistů u daného uživatele
    useEffect(() => {
        const fetchWishlists = async () => {
            setShowSpinner(true);

            try {
                const res = await fetchWithAuth(
                    `http://localhost:3000/api/wishlistHub/wishlistsFor/${person_id}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (data.success) {
                    console.log("Fetched wishlists:", data.wishlists);
                    //setWishlists(data.wishlistCopies);
                } else {
                    console.error("Error fetching wishlist copies: " + data.message);

                }
            } catch (error) {
                console.error("Error fetching wishlist copies:", error);
            }

            setShowSpinner(false);
        };

        fetchWishlists();
    }, [isAddingWishlistCopy]);

    const handleAddWishlistCopy = () => {
        console.log('Add wishlist copy for person id: ' + person_id);
        setIsAddingWishlistCopy(true);
    }

    if (isAddingWishlistCopy) {
        return (
          <div className="profile-container p-4">
            <div className="profile-welcome">
              <button
                className="btn-service"
                onClick={() => setIsAddingWishlistCopy(false)}
              >
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
              <h2 className="my-2">Add Wishlist Copy</h2>
            </div>

            <hr className="my-4" />

            <div className="my-4">
              <AddWishlistCopy
                user_id={user_id}
                person_id={person_id ? person_id : ""}
                profile_id={profile_id}
                onCopy={() => setIsAddingWishlistCopy(false)}
              />
            </div>
          </div>
        );
    }

    if (isViewingWishlistCopy != null) {
        return (
          <>
            <WishlistCopyDetail
                    personName={name}
                    id={isViewingWishlistCopy.id}
                    name={isViewingWishlistCopy.name}
                    items={isViewingWishlistCopy.items}
                    originalWishlistId={isViewingWishlistCopy.originalWishlistId}
                    role={isViewingWishlistCopy.role}
                    onClickBack={() => setIsViewingWishlistCopy(null)}
                />
          </>
        );
    }

    return (
        <>
            <div className="profile-container p-4">
                <div className="profile-welcome">
                    <button className="btn-service" onClick={() => onReturn()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg>
                    </button>
                    <h2 className="my-2">Gift For {name.split(' ')[0]}</h2>
                </div>
                
                <hr className="my-4" />
                
                <div className="my-4 my-wishlists-wrapper">
                    <div className="profile-wishlists my-4">
                        <img className="profile-picture-thumbnail rounded-circle shadow" src={photo_url} alt={name + "profile"} />
                        <h4 className="mx-2">{name.split(' ')[0]}'s Wishlists</h4>
                    </div>

                    <div className="flex justify-center">
                        <button
                            className="btn btn-service btn-primary"
                            onClick={() => handleAddWishlistCopy()}
                        >
                            Add wishlist
                        </button>
                    </div>

                    <div className="wishlists-container my-4">
                        {wishlists.length === 0 ? (
                            <div className="text-center p-4 bg-gray-100 rounded-lg">
                                {name.split(' ')[0]} doesn't have any wishlists yet.
                            </div>
                        ) : (
                            wishlists.map(wishlist => (
                                <WishlistCopyThumbnail
                                key={wishlist.id}
                                title={wishlist.name}
                                imageUrls={wishlist.items.map(item => item.photo_url)}
                                user_photo_url={photo_url}
                                />
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