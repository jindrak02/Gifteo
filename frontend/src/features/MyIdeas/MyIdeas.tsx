import React, { useState, useEffect, use } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import UpperPanel from "../../components/ui/UpperPanel";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

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
    imageUrl: string;
    price: number;
    priceCurrency: string;
    url: string;
}

const MyIdeas = () => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [customWishlists, setCustomWishlists] = useState<CustomWishlist[]>([]);

    // Načtení dat o custom wishlistech
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

        fetchCustomWishlists();
    }, []);

    return (
        <>

        <div className="profile-container p-4">
            <UpperPanel name="My Ideas"/>
            
            <div className="container">
                <p>My custom wishlists: </p>

                {customWishlists.length > 0 ? (
                    <div>
                        {customWishlists.map((wishlist) => (
                            <div key={wishlist.id} className="wishlist-card mb-4 p-4 border rounded shadow-sm">
                                <h3 className="text-lg font-semibold">{wishlist.name}</h3>
                                <p>{wishlist.items.length} items</p>
                                <button
                                    className="btn btn-primary mt-2"
                                    onClick={() => {
                                        // Handle wishlist click (e.g., navigate to wishlist details)
                                        console.log(`Clicked on wishlist: ${wishlist.name}`);
                                    }}
                                >
                                    View Wishlist
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="alert alert-secondary">You dont have any custom wishlists for your close ones yet.</p>
                )}
            </div>
        </div>

        <LoadingSpinner className={showSpinner? "" : "hidden"}/>
        </>
    );
};

export default MyIdeas;