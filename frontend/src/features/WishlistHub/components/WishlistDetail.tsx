import React, {useState, useEffect} from "react";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import Swal from "sweetalert2";
import WishlistComments from "./WishlistComments";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  price_currency: string;
  description: string;
  url: string;
  photo_url: string;
  checkedOffBy: string | null;
  checkedOffByPhoto: string | null;
  checkedOffByName: string | null;
  deleted: boolean;
  modifiedByOwner: Date | null;
};

interface Wishlist {
  id: string;
  name: string;
  deleted: boolean;
  items: WishlistItem[];
};

type WishlistCopyProps = {
    wishlist: Wishlist;
    personName: string;
    onClickBack: () => void;
};

const WishlistCopyDetail = ( {wishlist, personName, onClickBack } : WishlistCopyProps) => {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[] | null>(wishlist.items);
    const [showSpinner, setShowSpinner] = useState(false);
    const [showItemDetails, setShowItemDetails] = useState<number | null>(null);
    const [isViewingComments, setIsViewingComments] = useState(false);

    const handleCheckboxChange = async (item: WishlistItem) => {

        // Uncheck logic implementation (only the user who checked off the item can uncheck it)
        if (item.checkedOffBy) {
            //console.log('Already chekced off by:', item.checkedOffBy);
            setShowSpinner(true);

            try {
                const res = await fetchWithAuth(`wishlistHub/uncheckItem/${item.id}`, {
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
                                    checkedOffByName: null,
                                    checkedOffByPhoto: null,
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
            const res = await fetchWithAuth(`wishlistHub/checkOffItem/${item.id}`, {
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
                                checkedOffByName: data.checkedByName,
                                checkedOffByPhoto: data.checkedByPhoto,
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

    if (isViewingComments) {
      return (
        <WishlistComments
          wishlistId={wishlist.id}
          wishlistName={wishlist.name}
          onClickBack={() => setIsViewingComments(false)}
        />
      );
    }


    return (
      <>
        <div className="profile-container p-4">
          <div className="profile-welcome">
            <button className="btn-service" onClick={onClickBack}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-arrow-left"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                />
              </svg>
            </button>
            <h2 className="my-2">Gift For {personName.split(" ")[0]}</h2>
          </div>

          <hr className="my-4" />

          <div className="wishlist-copy-detail">
            <div>
              <div className="flex justify-between">
                <h3 className="my-4">{wishlist.name}</h3>
                <button className="btn btn-service" onClick={() => setIsViewingComments(true)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="currentColor"
                    className="bi bi-chat mx-1"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105" />
                  </svg>
                  Comments
                </button>
              </div>

              {wishlistItems?.map((item, index) => (
                <div key={index} className="my-4">
                  {item.deleted ? (<p className="inactive-wishlist-alert m-0">This item is no longer active</p>) : null}
                  
                <div
                  className={[
                    "wishlist-item my-0",
                    item.checkedOffBy != null ? "wishlist-item-checked" : "",
                    item.deleted ? "wishlist-item-disabled" : ""
                  ].filter(Boolean).join(" ")}
                  >
                    <img
                      src={item.photo_url}
                      alt={item.name}
                      className="wishlist-thumbnail"
                    />
                    <div className="wishlist-item-details mx-3">
                      <div className="wishlist-item-name">{item.name}</div>
                      
                      <a
                        href={item.deleted ? undefined : item.url}
                        className="wishlist-item-url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Link to buy
                      </a>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={item.checkedOffBy != null}
                        onChange={item.deleted ? undefined : () => handleCheckboxChange(item)}
                        disabled={item.deleted}
                        id={`checkbox-${item.id}`}
                      />
                    </div>

                    <button
                      className="btn btn-light btn-sm"
                      onClick={() => setShowItemDetails(showItemDetails === index ? null : index)}
                      >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-chevron-down"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
                        />
                      </svg>
                    </button>

                    {item.checkedOffBy != null ? (
                        <img
                          className="check-off-img rounded"
                          src={item.checkedOffByPhoto || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg";
                          }}
                          alt="img"
                        />
                      ) : null
                    }
                </div>
                {item.modifiedByOwner != null ? (
                    <p className="modified-item-alert">
                      ❔ This item was modified at {new Date(item.modifiedByOwner).toLocaleDateString()}
                    </p>
                ) : null}


                <div className="wishlist-item-details-wrapper">
                    {showItemDetails === index && (
                        <div className="wishlist-item-details-expanded mb-4">
                            {item.checkedOffBy != null ? (
                                <>
                                  <b>Checked off by: </b>
                                  <p>{item.checkedOffByName}</p>
                                </>
                            ) : null}
                            <b>Description: </b>
                            <p>{item.description}</p>
                            <b>Price: </b>
                            <p>{item.price} {item.price_currency}</p>
                        </div>
                    )}
                </div>
                </ div>

              ))}
            </div>
          </div>
        </div>

        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
      </>
    );
}

export default WishlistCopyDetail;