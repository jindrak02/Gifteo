import React, {useState, useEffect} from "react";
import LoadingSpinner from "../ui/LoadingSpinner";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const [showSpinner, setShowSpinner] = useState(false);
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[] | null>(null);
    const [showItemDetails, setShowItemDetails] = useState <number | null>(null);
    const isDesktop = useMediaQuery({ minWidth: 1200 });

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
            <h3 className="my-4">{wishlistItems != null ? wishlistItems[0].wishlist_name : ""}</h3>
            <div className="wishlist-items-desktop">

                {wishlistItems?.map((item, index) => (
                    <div className="wishlist-item-container" key={index}>
                        <div className="wishlist-item">
                            <img src={item.photo_url} alt={item.name} className="wishlist-thumbnail" />
                            <div className="wishlist-item-details">
                                <div className="wishlist-item-name">{item.name}</div>
                                <a href={item.url} className="wishlist-item-url" target="_blank" rel="noopener noreferrer">
                                    {t("myPeople.personWishlistDetail.linkToBuy")}
                                </a>
                                
                                {isDesktop && (
                                    <div className="mt-2">
                                        <b>{t("myPeople.personWishlistDetail.description")}: </b>
                                        <p>{item.description}</p>
                                        <b>{t("myPeople.personWishlistDetail.price")}: </b>
                                        <p>{item.price} {item.currency}</p>
                                    </div>
                                )}
                            </div>
                            
                            {!isDesktop && (
                                <button className="btn btn-light btn-sm" onClick={() => setShowItemDetails(showItemDetails === index ? null : index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                    </svg>
                                </button>
                            )}

                        </div>
                        <div>
                            {showItemDetails === index && (
                                <div className="wishlist-item-details-expanded">
                                    <b>{t("myPeople.personWishlistDetail.description")}: </b>
                                    <p>{item.description}</p>
                                    <b>{t("myPeople.personWishlistDetail.price")}: </b>
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