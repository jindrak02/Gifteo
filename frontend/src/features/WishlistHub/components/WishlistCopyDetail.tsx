import React, {useState, useEffect} from "react";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import Swal from "sweetalert2";

type WishlistCopyItem = {
    id: string;
    name: string;
    price: number;
    price_currency: string;
    url: string;
    photo_url: string;
    checkedOffBy: string | null;
};

type WishlistCopyProps = {
    id: string;
    name: string;
    originalWishlistId: string;
    role: string;
    items: WishlistCopyItem[];
};

const WishlistCopyDetail = ( {id, name, items } : WishlistCopyProps) => {
    const [wishlistItems, setWishlistItems] = useState<WishlistCopyItem[] | null>(items);
    const [showSpinner, setShowSpinner] = useState(false);

    const handleCheckboxChange = async (item: WishlistCopyItem) => {

        // Uncheck logic implementation (only the user who checked off the item can uncheck it)
        if (item.checkedOffBy) {
            console.log('Already chekced off by:', item.checkedOffBy);
            setShowSpinner(true);

            try {
                const res = await fetchWithAuth(`http://localhost:3000/api/wishlistHub/uncheckItem/${id}/${item.id}`, {
                    method: 'PATCH',
                    credentials: 'include',
                });

                const data = await res.json();

                if (data.success) {
                    console.log('Item unchecked:', data);

                    setWishlistItems((prevItems) => {
                        if (!prevItems) return null;
                        return prevItems.map((prevItem) => {
                            if (prevItem.id === item.id) {
                                return {
                                    ...prevItem,
                                    checkedOffBy: null,
                                };
                            }
                            return prevItem;
                        });
                    });

                } else {
                    console.error('Failed to uncheck item:', data.message);
                    if (data.message === 'Item was not checked off by current user') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'You can only uncheck items that you have checked off!',
                        });    
                    }
                }
                
            } catch (error) {
                console.error('Error unchecking item:', error);
            } finally {
                setShowSpinner(false);
            }

            return;
        };
        
        // Check off logic implementation
        setShowSpinner(true);
        try {
            const res = await fetchWithAuth(`http://localhost:3000/api/wishlistHub/checkOffItem/${id}/${item.id}`, {
                method: 'PATCH',
                credentials: 'include',
            });

            const data = await res.json();
            
            if (data.success) {
                console.log('Item checked off:', data);

                setWishlistItems((prevItems) => {
                    if (!prevItems) return null;
                    return prevItems.map((prevItem) => {
                        if (prevItem.id === item.id) {
                            return {
                                ...prevItem,
                                checkedOffBy: data.checkedBy,
                            };
                        }
                        return prevItem;
                    });
                });
            } else {
                console.error('Failed to check off item:', data.message);
            }
        } catch (error) {
            console.error('Error checking off item:', error);
        } finally {
            setShowSpinner(false);
        }
    };

    return (
        <>
            <div>
                <h3 className="my-4">{name}</h3>

                {wishlistItems?.map((item, index) => (
                    <div key={index} className= {item.checkedOffBy != null ? "wishlist-item wishlist-item-checked" : "wishlist-item"}>
                        <img src={item.photo_url} alt={item.name} className="wishlist-thumbnail" />
                        <div className="wishlist-item-details">
                            <div className="wishlist-item-name">{item.name}</div>
                            <div className="wishlist-item-price">{item.price} {item.price_currency}</div>
                            <a href={item.url} className="wishlist-item-url" target="_blank" rel="noopener noreferrer">Link to buy</a>
                        </div>
                        <div className="form-check">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                checked={item.checkedOffBy != null} 
                                onChange={() => handleCheckboxChange(item)} 
                                id={`checkbox-${item.id}`} 
                            />
                            {item.checkedOffBy != null ? <img className="check-off-img" src="https://res.cloudinary.com/db82w52p8/image/upload/v1742640290/profile_pictures/czqyt4ydg3ygzwzzpkw7.gif" alt="img" /> : null}
                        </div>
                    </div>
                ))}
            </div>
            <LoadingSpinner className={showSpinner ? "" : "hidden"}/>
            <div className="fixed-buttons">
                <button className="icon-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat" viewBox="0 0 16 16">
                        <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
                    </svg>
                </button>
                <button className="icon-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-add" viewBox="0 0 16 16">
                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                        <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                    </svg>
                </button>
            </div>
        </>
    );
}

export default WishlistCopyDetail;