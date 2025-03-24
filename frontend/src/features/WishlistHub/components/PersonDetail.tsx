import React, { useState, useEffect} from "react";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import WishlistCopyThumbnail from "./WishlistCopyThumbnail";
import AddWishlistCopy from "./AddWishlistCopy.tsx";

interface PersonDetailProps {
    user_id?: string;
    person_id: string;
    name: string;
    photo_url: string;
    profile_id: string;
    onReturn: () => void;
}

type WishlistCopyItem = {
    itemId: string;
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
    items: WishlistCopyItem[];
};

const PersonDetail = ( {user_id, person_id, profile_id, name, photo_url, onReturn } : PersonDetailProps ) => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [wishlistCopies, setWishlistCopies] = useState<WishlistCopy[]>([]);
    const [isAddingWishlistCopy, setIsAddingWishlistCopy] = useState(false);

    // Načtení dat kopií wishlistů u daného uživatele
    useEffect(() => {
        const fetchWishlistCopies = async () => {
            setShowSpinner(true);

            try {
                const res = await fetchWithAuth(
                    `http://localhost:3000/api/wishlistHub/participatedWishlistCopiesForUser/${user_id}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (data.success) {
                    console.log("Fetched wishlist copies:", data.wishlistCopies);
                    setWishlistCopies(data.wishlistCopies);
                } else {
                    console.error("Error fetching wishlist copies");
                }
            } catch (error) {
                console.error("Error fetching wishlist copies:", error);
            }

            setShowSpinner(false);
        };

        fetchWishlistCopies();
    }, []);

    const handleAddWishlistCopy = () => {
        console.log('Add wishlist copy for person id: ' + person_id);
        setIsAddingWishlistCopy(true);
    }

    if (isAddingWishlistCopy) {
        return (
            <div className="profile-container p-4">
                <div className="profile-welcome">
                    <h2 className="">Add Wishlist Copy</h2>
                    <button className="btn-service" onClick={() => setIsAddingWishlistCopy(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg>
                    </button>
                </div>
                
                <hr className="my-4" />

                <div className="my-4">
                    <AddWishlistCopy person_id={person_id ? person_id : ""}  profile_id={profile_id}/>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="profile-container p-4">
                <div className="profile-welcome">
                    <h2 className="">Gift For {name.split(' ')[0]}</h2>
                    <button className="btn-service" onClick={() => onReturn()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg>
                    </button>
                </div>
                
                <hr className="my-4" />
                
                <div className="my-4 my-wishlists-wrapper">
                    <div className="profile-wishlists my-4">
                        <img className="profile-picture-thumbnail rounded-circle shadow" src={photo_url} alt={name + "profile"} />
                        <h4>{name.split(' ')[0]}'s Wishlists</h4>
                        <button
                        className="btn btn-service btn-primary"
                        onClick={() => handleAddWishlistCopy()}
                        >
                            Add wishlist
                        </button>
                    </div>

                    <div className="wishlists-container my-4">
                        {wishlistCopies.length === 0 ? (
                            <div className="text-center p-4 bg-gray-100 rounded-lg">
                                You don't have any wishlists for {name.split(' ')[0]} yet.
                            </div>
                        ) : (
                            wishlistCopies.map(wishlistCopy => (
                                <WishlistCopyThumbnail
                                key={wishlistCopy.id}
                                title={wishlistCopy.name}
                                imageUrls={wishlistCopy.items.map(item => item.photo_url)}
                                user_photo_url={photo_url}
                                onDelete={() => console.log('Delete wishlist copy')}
                                onEdit={() => console.log('Edit wishlist copy')}
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