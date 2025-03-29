import React, {useState, useEffect} from "react";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import Swal from "sweetalert2";
import AddPerson from "./AddPerson";

type WishlistCopyItem = {
    id: string;
    name: string;
    price: number;
    price_currency: string;
    url: string;
    photo_url: string;
    checkedOffBy: string | null;
    checkedOffByPhoto?: string | null;
};

type WishlistCopyProps = {
    personName: string;
    id: string;
    name: string;
    originalWishlistId: string;
    role: string;
    items: WishlistCopyItem[];
    onClickBack: () => void;
};

const WishlistCopyDetail = ( {personName, id, name, items, onClickBack } : WishlistCopyProps) => {
    const [wishlistItems, setWishlistItems] = useState<WishlistCopyItem[] | null>(items);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isAddingPerson, setIsAddingPerson] = useState(false);

    const handleCheckboxChange = async (item: WishlistCopyItem) => {

        // Uncheck logic implementation (only the user who checked off the item can uncheck it)
        if (item.checkedOffBy) {
            //console.log('Already chekced off by:', item.checkedOffBy);
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
                                checkedOffByPhoto: data.userPhoto,
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

    const handleAddPerson = async () => {
        // console.log('Add person to wishlist: ', id);
        setIsAddingPerson(true);
    }
    
    if (isAddingPerson) {
        return (
            <>
                <AddPerson wishlistCopyName={name} wishlistCopyId={id} onClickBack={() => setIsAddingPerson(false)}/>
            </>
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
                <h3 className="my-4">{name}</h3>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    console.log("TODO: show info about wishlist participants")
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-info-circle"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                  </svg>
                </button>
              </div>

              {wishlistItems?.map((item, index) => (
                <div
                  key={index}
                  className={
                    item.checkedOffBy != null
                      ? "wishlist-item wishlist-item-checked"
                      : "wishlist-item"
                  }
                >
                  <img
                    src={item.photo_url}
                    alt={item.name}
                    className="wishlist-thumbnail"
                  />
                  <div className="wishlist-item-details">
                    <div className="wishlist-item-name">{item.name}</div>
                    <div className="wishlist-item-price">
                      {item.price} {item.price_currency}
                    </div>
                    <a
                      href={item.url}
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
                      onChange={() => handleCheckboxChange(item)}
                      id={`checkbox-${item.id}`}
                    />
                    {item.checkedOffBy != null ? (
                      <img
                        className="check-off-img rounded"
                        src={item.checkedOffByPhoto || ""}
                        alt="img"
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fixed-buttons">
                <button className="icon-button">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-chat"
                    viewBox="0 0 16 16"
                    >
                    <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105" />
                    </svg>
                </button>
                <button className="icon-button" onClick={() => handleAddPerson()}>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-person-add"
                    viewBox="0 0 16 16"
                    >
                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
                    <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z" />
                    </svg>
                </button>
          </div>
        </div>

        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
      </>
    );
}

export default WishlistCopyDetail;