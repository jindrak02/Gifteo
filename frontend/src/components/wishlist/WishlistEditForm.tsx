import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import LoadingSpinner from "../ui/LoadingSpinner";
import WishlistSettings from "./WishlistSettings";
import UpperPanel from "../ui/UpperPanel";

interface WishlistItem {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  currency: string;
  url: string;
  photo_url: string;
}

interface WishlistFormProps {
  items: WishlistItem[];
  name: string;
  id: string;
  forProfile?: string;
  isCustom?: boolean;
  onSubmit: (items: WishlistItem[]) => void;
  onClickBack: () => void;
}

const WishlistEditForm: React.FC<WishlistFormProps> = ({ items: initialItems, name:name, id:id, forProfile, isCustom, onSubmit, onClickBack }) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [showButtons, setShowButtons] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showWishlistSettings, setShowWishlistSettings] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  
  const handleChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [name]: value };
    setItems(newItems);
  };
  
  const addItem = () => {
    setItems([
      ...items,
      { id: "", name: "", description: "", price: "", currency: "", url: "", photo_url: "" },
    ]);
  };
  
  const removeItem = (index: number) => {
    Swal.fire({
      title: t("app.swal.removeItem.title"),
      text: t("app.swal.removeItem.text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("app.swal.removeItem.confirmButtonText"),
      cancelButtonText: t("app.swal.removeItem.cancelButtonText"),
    }).then((result) => {
      if (result.isConfirmed) {
        setItems(items.filter((_, i) => i !== index));
      }
    });
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setShowSpinner(true);
    try {
      await onSubmit(items); // Wait for the callback to complete
    } finally {
      setShowSpinner(false);
    }
  };
  
  const handleFetchItemData = async (index: number, url: string) => {
    setShowSpinner(true);
    try {
      const response = await fetchWithAuth(`scraper/wishlistItemData`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch item data");
      }

      const data = await response.json();
      const newItems = [...items];

      newItems[index] = {
        ...newItems[index],
        name: data.title,
        price: data.price,
        currency: data.currency,
        photo_url: data.image,
      };

      setItems(newItems);
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Failed to fetch item data",
        icon: "error",
      });
    }
    setShowSpinner(false);
  }
  
  if (showWishlistSettings) {
    return (
      <WishlistSettings
        onClickBack={() => setShowWishlistSettings(false)}
        wishlistId={id}
        wishlistName={name}
        wishlistForProfile={forProfile}
        isCustom={isCustom}
      />
    );
  }
  
  return (
    <>
      <div className="container p-4 rounded profile-container">
        <UpperPanel name={t("profile.editWishlist.title")} onClickBack={() => onClickBack()} />

        <div>
          <h2 className="text-center">{name}</h2>
          <form onSubmit={handleSubmit} className="edit-wishlist-form">
            <div className="my-1 flex">
              <button
                type="button"
                onClick={addItem}
                className="btn-service rounded shadow my-4"
              >
                {t("app.buttons.newItem")}
              </button>

              <button
                type="submit"
                className="btn-service rounded mx-2 shadow my-4"
              >
                {t("app.buttons.saveWishlist")}
              </button>

              <button
                type="button"
                onClick={() => setShowWishlistSettings(true)}
                className="btn btn-secondary my-4 mx-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-gear"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"></path>
                  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"></path>
                </svg>
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="wishlist-item-wrapper gap-2 my-4">
                <div>
                  <img
                    className="wishlist-thumbnail"
                    src={item.photo_url === "" ? undefined : item.photo_url}
                    alt="item photo"
                  />
                </div>
                <div className="flex-col gap-2">
                  <input
                    type="text"
                    name="url"
                    value={item.url}
                    onChange={(e) => handleChange(index, e)}
                    placeholder={t("profile.editWishlist.fetchItemDataPlaceholder")}
                    className="border p-2"
                  />

                  <button
                    type="button"
                    onClick={() => handleFetchItemData(index, item.url)}
                    className="btn-service rounded shadow"
                  >
                    {t("app.buttons.fetchItemData")}
                  </button>

                  <div className="flex-col">
                    <label className="p-1" htmlFor="name">
                      {t("profile.editWishlist.name")}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={item.name}
                      onChange={(e) => handleChange(index, e)}
                      placeholder=""
                      className="border p-2"
                      required
                      minLength={3}
                      maxLength={30}
                    />
                  </div>

                  <div className="flex-col">
                    <label className="p-1" htmlFor="description">
                      {t("profile.editWishlist.description")}
                    </label>
                    <textarea
                      name="description"
                      value={item.description || ""}
                      onChange={(e) => handleChange(index, e)}
                      placeholder=""
                      className="border p-2"
                      maxLength={200}
                    />
                  </div>

                  <div className="flex-col">
                    <label className="p-1" htmlFor="description">
                      {t("profile.editWishlist.price")}
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={item.price}
                      onChange={(e) => handleChange(index, e)}
                      placeholder=""
                      className="border p-2"
                      min={0}
                      step={0.01}
                    />
                    <select
                      name="currency"
                      value={item.currency}
                      onChange={(e) => handleChange(index, e)}
                      className="border p-2"
                    >
                      <option value="">{t("profile.editWishlist.selectCurrency")}</option>
                      <option value="CZK">CZK - Czech Koruna</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="PLN">PLN - Polish Zloty</option>
                      <option value="CHF">CHF - Swiss Franc</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>

                  <div className="flex-col">
                    <label className="p-1" htmlFor="description">
                      {t("profile.editWishlist.imageUrl")}
                    </label>
                    <input
                      type="text"
                      name="photo_url"
                      value={item.photo_url}
                      onChange={(e) => handleChange(index, e)}
                      placeholder=""
                      className="border p-2"
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}

            <LoadingSpinner
              message={t("profile.editWishlist.fetchItemDataLoadingText")}
              className={showSpinner ? "" : "hidden"}
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default WishlistEditForm;
