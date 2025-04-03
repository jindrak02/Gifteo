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
    description: string;
    photo_url: string;
};

const WishlistDetail = (props: WishlistDetailProps) => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[] | null>(null);
    const [showItemDetails, setShowItemDetails] = useState <number | null>(null);

    // Načtení dat wishlistu
    useEffect(() => {
        const fetchWishlistData = async () => {
            setShowSpinner(true);

            try {
                const res = await fetchWithAuth(
                    `personsData/WishlistItems/${props.wishlistId}`,
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
                <h3 className="my-4">{wishlistItems != null ? wishlistItems[0].wishlist_name : ""}</h3>

                {wishlistItems?.map((item, index) => (
                    <div key={index}>
                        <div className="wishlist-item">
                            <img src={item.photo_url} alt={item.name} className="wishlist-thumbnail" />
                            <div className="wishlist-item-details">
                                <div className="wishlist-item-name">{item.name}</div>
                                {/* <div className="wishlist-item-price">{item.price} {item.currency}</div> */}
                                <a href={item.url} className="wishlist-item-url" target="_blank" rel="noopener noreferrer">Link to buy</a>
                            </div>
                            <button className="btn btn-light btn-sm" onClick={() => setShowItemDetails(showItemDetails === index ? null : index)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                </svg>
                            </button>
                        </div>
                        <div>
                            {showItemDetails === index && (
                                <div className="wishlist-item-details-expanded">
                                    <b>Description: </b>
                                    <p>{item.description}</p>
                                    <b>Price: </b>
                                    <p>{item.price} {item.currency}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <LoadingSpinner className={showSpinner ? "" : "hidden"}/>
        </>
    );
}

export default WishlistDetail;