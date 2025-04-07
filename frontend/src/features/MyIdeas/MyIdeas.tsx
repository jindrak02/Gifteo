import React, { useState, useEffect, use } from "react";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import UpperPanel from "../../components/ui/UpperPanel";
import WishlistThumbnail from "../../components/wishlist/WishlistThumbnail";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AddWishlistForm from "./AddWishlistForm";
import WishlistEditForm from "../../components/wishlist/WishlistEditForm";

interface CustomWishlist {
    id: string;
    name: string;
    items: Item[];
    ownerName: string;
    ownerPhotoUrl: string;
}

interface Item {
    id: string;
    name: string;
    description: string;
    photo_url: string;
    price: number;
    currency: string;
    url: string;
}

interface Person {
    name: string;
    photoUrl: string;
    profileId: string;
}

const MyIdeas = () => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [customWishlists, setCustomWishlists] = useState<CustomWishlist[]>([]);
    const [connectedPersons, setConnectedPersons] = useState<Person[]>([]);
    const [isAddingWishlist, setIsAddingWishlist] = useState(false);
    const [isEditingWishlist, setIsEditingWishlist] = useState<string | null> (null);
    const [isViewingWishlist, setIsViewingWishlist] = useState<string | null> (null);
    const location = useLocation();
    
    useEffect(() => {
        setIsAddingWishlist(false);
        setIsEditingWishlist(null);
        setIsViewingWishlist(null);
    }, [location.key]);

    // Načtení dat o custom wishlistech a blízkých osobách
    useEffect(() => {
        const fetchCustomWishlists = async () => {
            setShowSpinner(true);
            try {
                const res = await fetchWithAuth("customWishlists", {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json();

                if (data.success) {
                    console.log("Fetched custom wishlists:", data.customWishlists);
                    setCustomWishlists(data.customWishlists);
                } else {
                    console.error("Failed to fetch custom wishlists:", data.message);
                }
            } catch (error) {
                console.error("Error fetching custom wishlists:", error);
            } finally {
                setShowSpinner(false);
            }
        };

        const fetchPersons = async () => {
            setShowSpinner(true);
            try {
                const res = await fetchWithAuth("personsData/UserPersons", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();

                if (data) {
                    const newData = data.map((person: any) => ({
                        name: person.name,
                        photoUrl: person.photo_url,
                        profileId: person.profile_id,
                    }));

                    setConnectedPersons(newData);
                } else {
                    console.error("Failed to fetch persons data:", data);
                }
                
            } catch (error) {
                console.error("Error fetching persons:", error);
            } finally {
                setShowSpinner(false);
            }
        };

        fetchPersons();
        fetchCustomWishlists();
    }, [isAddingWishlist, isEditingWishlist, isViewingWishlist]);

    const handleSaveWishlist = async (wishlistId: string, items: any[]) => {
        console.log('Wishlist with id edited:', wishlistId);
        console.log('Items:', items);

        setShowSpinner(true);
        try {
            const res = await fetchWithAuth(
                `profileData/updateWishlist/${wishlistId}`,
                {
                  method: "PUT",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    items: items,
                  }),
                }
              );
          
              const data = await res.json();
          
              if (data.success) {
                console.log("Wishlist updated successfully.");
                setIsEditingWishlist(null);
              } else {
                console.error("Error updating wishlist:", data.message);
            }

        } catch (error) {
            console.error("Error saving wishlist:", error);
        } finally {
            setShowSpinner(false);
        }
    }

    if (isAddingWishlist) {
        return (
            <AddWishlistForm
                onClickBack={() => setIsAddingWishlist(false)}
                connectedPersons={connectedPersons}
            />
        );
    }

    if (isEditingWishlist) {
        return (
            <WishlistEditForm
                onClickBack={() => setIsEditingWishlist(null)}
                id={isEditingWishlist}
                items={customWishlists.find(wishlist => wishlist.id === isEditingWishlist)?.items || []}
                name={customWishlists.find(wishlist => wishlist.id === isEditingWishlist)?.name || ""}
                onSubmit={(items) => handleSaveWishlist(isEditingWishlist, items)}
            />
        )
    }

    return (
        <>

        <div className="profile-container p-4">
            <UpperPanel name="My Ideas"/>
            
            <div className="container">
                <div className="my-custom-wishlists">
                    <div className="flex justify-between mb-4">
                        <p className="p-0 m-0">My custom wishlists: </p>
                        <button className="btn btn-primary btn-service" onClick={() => setIsAddingWishlist(true)}>
                            Create new wishlist
                        </button>
                    </div>

                    {customWishlists.length > 0 ? (
                        <div>
                            {customWishlists.map((wishlist) => (
                                <WishlistThumbnail
                                    key={wishlist.id}
                                    title={wishlist.name}
                                    imageUrls={wishlist.items.map((item) => item.photo_url)}
                                    showButtons={true}
                                    onDelete={() => console.log('Delete wishlist')}
                                    onEdit={() => setIsEditingWishlist(wishlist.id)}
                                    onClick={() => console.log('Wishlist clicked - show wishlist details with checkoffing items')}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="alert alert-secondary">You dont have any custom wishlists for your close ones yet.</p>
                    )}
                </div>

                <div className="my-added-custom-wishlists my-4">
                    <p className="p-0 m-0">Custom wishlists shared with you: </p>
                </div>
            </div>
        </div>

        <LoadingSpinner className={showSpinner? "" : "hidden"}/>
        </>
    );
};

export default MyIdeas;