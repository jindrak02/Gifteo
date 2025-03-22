import React, { useState, useEffect} from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import WishlistCopyThumbnail from "./components/WishlistCopyThumbnail";

type WishlistCopyItem = {
    id: string;
    name: string;
    price: number;
    price_currency: string;
    url: string;
    photo_url: string;
};

type WishlistCopy = {
    id: string;
    name: string;
    originalWishlistId: string;
    user_photo_url: string;
    items: WishlistCopyItem[];
};

const WishlistHub = () => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [ownedWishlistCopies, setOwnedWishlistCopies] = useState<WishlistCopy[]>([]);

    useEffect( () => {

        const fetchOwnedWishlsitCopies = async () => {
            setShowSpinner(true);

            try {
                const res = await fetchWithAuth(
                    `http://localhost:3000/api/wishlistHub/ownedWishlistCopies`,
                {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json();

                if (data.success) {
                    console.log('Fetched owned wishlist copies:');
                    console.log(data.wishlistCopies);
                    setOwnedWishlistCopies(data.wishlistCopies);
                } else {
                    console.log('Error fetching owned wishlist copies: ' + data.message);
                }

            } catch (error) {
                console.error("Error fetching wishlist data:", error);
            }

            setShowSpinner(false);
        };

        fetchOwnedWishlsitCopies();

    }, []);

    return (
        <>
            <div className="profile-container p-4">
                <div className="profile-welcome">
                    <h2 className="">Wishlist hub</h2>
                    <button className="btn-service btn btn-primary rounded" onClick={() => console.log('Invitations')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
                        </svg>
                        {/* {invitations.length != 0 ? <div className="new-invitation-icon"></div> : ''} */}
                    </button>
                </div>

                <hr className="my-4" />

                <div>
                    <div>
                        <p> <b>You own</b></p>
                        <div className="wishlist-copies-container">
                            {ownedWishlistCopies.map((wishlistCopy) => (
                                <WishlistCopyThumbnail
                                    key={wishlistCopy.id}
                                    title={wishlistCopy.name}
                                    user_photo_url={wishlistCopy.user_photo_url}
                                    imageUrls={wishlistCopy.items.map((item) => item.photo_url)}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <p>You participate in</p>
                    </div>
                </div>
            </div>
            <LoadingSpinner className={showSpinner ? "" : "hidden"}/>
        </>
    );
};

export default WishlistHub;