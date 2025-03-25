import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';
import WishlistThumbnail from '../../../components/wishlist/WishlistThumbnail';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface AddWishlistCopyProps {
    person_id: string;
    profile_id: string;
    user_id: string;
    onCopy: () => void;
}

type PersonData = {
    person_id: string;
    name: string;
    photo_url: string;
    bio: string;
    birthdate: Date;
    interests: string[];
    wishlists: {
        wishlist_id: string;
        name: string;
        items: string[];
    }[];
};

const AddWishlistCopy: React.FC<AddWishlistCopyProps> = ({ person_id, profile_id, user_id, onCopy }) => {
    const [personId, setPersonId] = useState<string>(person_id);
    const [profileId, setProfileId] = useState<string>(profile_id);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [personData, setPersonData] = useState<PersonData | null>(null);

    // Načtení dat osoby (wishlistů)
    useEffect(() => {
        const fetchPersonData = async () => {
            setShowSpinner(true);
            
            try {
                const res = await fetchWithAuth(
                `http://localhost:3000/api/personsData/PersonDetails/${personId}`,
                {
                    method: "GET",
                    credentials: "include",
                }
                );
        
                const data = await res.json();
        
                if (data) {
                    console.log("Fetched person data:", data);
                    setPersonData(data);
                } else {
                    console.error("Error fetching person data");
                }
            
            } catch (error) {
                console.error("Error fetching person data:", error);
            }
            
            setShowSpinner(false);
        };
        
        fetchPersonData();
    }, []);

    // Vytvoření kopie wishlistu
    const handleCopyWishlist = async (wishlistId: string) => {
        setShowSpinner(true);

        try {
            const res = await fetchWithAuth(
                `http://localhost:3000/api/wishlistHub/createWishlistCopy/${wishlistId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        forUserId: user_id,
                    }),
                }
            );

            const data = await res.json();

            if (data.success) {
                console.log("Copied wishlist:", data);
                onCopy();
            } else {
                if (data.message = "Wishlist already copied") {
                    console.log("Wishlist already copied");
                    Swal.fire({
                        icon: "info",
                        title: "Wishlist already copied",
                        text: "You already have a copy of this wishlist for " + personData?.name,
                    });
                }
                console.error("Error copying wishlist");
            }

        } catch (error) {
            console.error("Error copying wishlist:", error);
        }

        setShowSpinner(false);
    };

    return (
        <>
        <div className="wishlist-copy-container">
            <div className="wishlist-upper-section">
                <h2 className='mb-4 text-center'>Select wishlist to copy</h2>
                
                {personData?.wishlists.map((wishlist, index) => (
                    <WishlistThumbnail
                        key={index}
                        showButtons={false}
                        title={wishlist.name}
                        imageUrls={wishlist.items}
                        onClick={() => handleCopyWishlist(wishlist.wishlist_id)}
                    />
                ))}

            </div>

            <div className="wishlist-lower-section">
                <h2 className='my-4'>Or add a custom wishlist</h2>
                <button className="add-custom-wishlist-btn my-4">Add custom wishlist</button>
            </div>
        </div>
        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
        </>
    );
};

export default AddWishlistCopy;
