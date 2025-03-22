import React, {useState, useEffect} from "react";
import LoadingSpinner from "../ui/LoadingSpinner";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

type WishlistDetailProps = {
    wishlistId: string;
};

type WishlistItem = {
    wishlist_name: string;
    name: string;
    price: number;
    currency: string;
    url: string;
    photo_url: string;
};

const WishlistDetail = (props: WishlistDetailProps) => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[] | null>(null);

    // Načtení dat wishlistu
    useEffect(() => {
        const fetchWishlistData = async () => {
            setShowSpinner(true);

            try {
                const res = await fetchWithAuth(
                    `http://localhost:3000/api/personsData/WishlistItems/${props.wishlistId}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (data) {
                    console.log("Fetched wishlist data:", data);
                    setWishlistItems(data);
                } else {
                    console.error("Error fetching wishlist data");
                }
            } catch (error) {
                console.error("Error fetching wishlist data:", error);
            }

            setShowSpinner(false);
        };

        fetchWishlistData();
    }, [props.wishlistId]);

    return (
        <>
            <div>
                <h1 className="my-4">{wishlistItems != null ? wishlistItems[0].wishlist_name : ""}</h1>

                {wishlistItems?.map((item, index) => (
                    <div key={index} className="wishlist-item">
                        <img src={item.photo_url} alt={item.name} className="wishlist-thumbnail" />
                        <div className="wishlist-item-details">
                            <div className="wishlist-item-name">{item.name}</div>
                            <div className="wishlist-item-price">{item.price} {item.currency}</div>
                            <a href={item.url} className="wishlist-item-url" target="_blank" rel="noopener noreferrer">{item.url}</a>
                        </div>
                    </div>
                ))}
            </div>
            <LoadingSpinner className={showSpinner ? "" : "hidden"}/>
        </>
    );
}

export default WishlistDetail;