import React, { useState, useEffect, use } from "react";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import UpperPanel from "../../components/ui/UpperPanel";
import WishlistThumbnail from "../../components/wishlist/WishlistThumbnail";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AddWishlistForm from "./components/AddWishlistForm";
import WishlistEditForm from "../../components/wishlist/WishlistEditForm";
import WishlistCopyDetail from "../WishlistHub/components/WishlistDetail";

interface CustomWishlist {
    id: string;
    name: string;
    forProfile: string;
    forProfileName: string;
    forProfilePhotoUrl: string;
    items: Item[];
    ownerName: string;
    ownerPhotoUrl: string;
    is_shared: boolean;
    deleted: boolean;
}

interface Item {
    id: string;
    name: string;
    description: string;
    photo_url: string;
    price: number;
    currency: string;
    url: string;
    checkedOffBy: string | null;
    checkedOffByPhoto: string | null;
    checkedOffByName: string | null;
    deleted: boolean;
    modifiedByOwner: Date | null;
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
    const [expandSharedSection, setExpandSharedSection] = useState(true);
    const [expandMySection, setExpandMySection] = useState(true);
    const location = useLocation();

    const myWishlists = customWishlists.filter(wishlist => !wishlist.is_shared);
    const sharedWithMeWishlists = customWishlists.filter(wishlist => wishlist.is_shared);
    
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

    const handleDeleteWishlist = async (wishlistId: string) => {
        const result = await Swal.fire({
          title: "Delete wishlist",
          text: "Are you sure? It can still be seen to some users.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#8F84F2",
          confirmButtonText: "Yes, delete it!",
        });
    
        if (result.isConfirmed) {
          const res = await fetchWithAuth(
            `profileData/deleteWishlist/${wishlistId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );
    
          const data = await res.json();
    
          if (data.success) {
            console.log("Wishlist deleted successfully.");
            setCustomWishlists((prevWishlists) =>
              prevWishlists.filter((wishlist) => wishlist.id !== wishlistId)
            );
          } else {
            console.log("Wishlist deletion failed:", data.message);
            Swal.fire({
              icon: "error",
                title: "Oops...",
                text: "This should absolutely never happen! Yet, here we are.",
                confirmButtonColor: "#8F84F2",
                confirmButtonText: "OK",
            });
          }
        }
    };

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
                forProfile={customWishlists.find(wishlist => wishlist.id === isEditingWishlist)?.forProfile || ""}
                isCustom={true}
                onSubmit={(items) => handleSaveWishlist(isEditingWishlist, items)}
            />
        )
    }

    if (isViewingWishlist) {
        const wishlist = customWishlists.find(wishlist => wishlist.id === isViewingWishlist);
        const person = connectedPersons.find(person => person.profileId === wishlist?.forProfile);
        const personName = person ? person.name : "Unknown";

        if (!wishlist) {
            return <div className="alert alert-warning">Wishlist not found</div>;
        }

        const adaptedWishlist = {
            ...wishlist,
            items: wishlist.items.map(item => ({
                ...item,
                price_currency: item.currency, // currency to price_currency
            }))
        };

        return (
            <WishlistCopyDetail
                wishlist={adaptedWishlist}
                personName={personName}
                onClickBack={() => setIsViewingWishlist(null)}
            />
        ) 
    }

    return (
        <>

        <div className="profile-container p-4">
            <UpperPanel name="My Ideas"/>
            
            <div className="desktop-split-view">
                <div className="desktop-split-view-left">
                    <div className="my-custom-wishlists">

                            <div className="flex justify-between">
                                <p className="p-0 m-0">My custom wishlists</p>
                                <button className="btn" onClick={() => setExpandMySection(!expandMySection)}>
                                    {expandMySection? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>

                        <div className={expandMySection? "flex-end flex-column mb-4" : "hidden"}>
                            <button className="btn btn-primary btn-service my-4" onClick={() => setIsAddingWishlist(true)}>
                                Create new wishlist
                            </button>
                            {myWishlists.length > 0 ? (
                                <div>
                                    {myWishlists.map((wishlist) => (
                                        <WishlistThumbnail
                                            key={wishlist.id}
                                            title={wishlist.name}
                                            imageUrls={wishlist.items.map((item) => item.photo_url)}
                                            showButtons={true}
                                            forProfileName= {wishlist.forProfileName != null ? wishlist.forProfileName : "Not specified"}
                                            forProfilePhotoUrl={wishlist.forProfilePhotoUrl}
                                            onDelete={() => handleDeleteWishlist(wishlist.id)}
                                            onEdit={() => setIsEditingWishlist(wishlist.id)}
                                            onClick={() => setIsViewingWishlist(wishlist.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="">You dont have any custom wishlists for your close ones yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="desktop-split-view-right">
                    <div className="my-added-custom-wishlists">
                        <div className="flex justify-between">
                            <p className="p-0 m-0">Custom wishlists shared with me</p>
                            <button className="btn" onClick={() => setExpandSharedSection(!expandSharedSection)}>
                                    {expandSharedSection? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                                        </svg>
                                    )}
                            </button>
                        </div>

                        <div className={expandSharedSection? "mt-4" : "hidden"}>
                        {sharedWithMeWishlists.length > 0 ? (
                                sharedWithMeWishlists.map((wishlist) => (
                                    <div key={wishlist.id} className="mb-4">
                                        <div className="flex">
                                            <img className="profile-picture-thumbnail-sm rounded-circle" src={wishlist.ownerPhotoUrl} alt={wishlist.ownerName} />
                                            <p className="my-0 mx-2">{wishlist.ownerName.split(' ')[0]} shares with you</p>
                                        </div>

                                        <WishlistThumbnail
                                            key={wishlist.id}
                                            title={wishlist.name}
                                            imageUrls={wishlist.items.map((item) => item.photo_url)}
                                            showButtons={false}
                                            forProfileName= {wishlist.forProfileName != null ? wishlist.forProfileName : "Not specified"}
                                            forProfilePhotoUrl={wishlist.forProfilePhotoUrl}
                                            onClick={() => setIsViewingWishlist(wishlist.id)}
                                        />
                                    </div>
                                
                                ))
                        ) : (
                            <p className="">No wishlists have been shared with you yet.</p>
                        )}
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <LoadingSpinner className={showSpinner? "" : "hidden"}/>
        </>
    );
};

export default MyIdeas;