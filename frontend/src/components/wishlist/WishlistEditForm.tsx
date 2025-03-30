import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import LoadingSpinner from "../ui/LoadingSpinner";

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
  name?: string;
  onSubmit: (items: WishlistItem[]) => void;
}

const WishlistEditForm: React.FC<WishlistFormProps> = ({ items: initialItems, name:name, onSubmit,}) => {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [showButtons, setShowButtons] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

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
      title: "Remove item?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        setItems(items.filter((_, i) => i !== index));
      }
    });
  };
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(items); // Zavolání callbacku s daty
  };
  
  const toggleShowButtons = () => {
    setShowButtons(!showButtons);
  }
  
  const handleFetchItemData = async (index: number, url: string) => {
    setShowSpinner(true);
    try {
      const response = await fetchWithAuth(`http://localhost:3000/api/scraper/wishlistItemData`,
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

  return (
    <>
    <h2 className="text-center">{name}</h2>
    <form onSubmit={handleSubmit} className="edit-wishlist-form">
      <div className="my-1">
        <button
          type="button"
          onClick={addItem}
          className="btn-service rounded shadow my-4">
          Add item
        </button>
        <button type="submit" className="btn-service rounded mx-2 shadow my-4">
          Save wishlist
        </button>
        <button type="button" onClick={() => toggleShowButtons()} className="btn-service rounded shadow my-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
          </svg>
        </button>
      </div>

      {[...items].reverse().map((item, reversedIndex) => {
        const index = items.length - 1 - reversedIndex;

        return (
          <div key={index} className="wishlist-item-wrapper gap-2 my-4">
          <div>
            <img
              className="wishlist-thumbnail"
              src={item.photo_url}
              alt="item photo"
            />
          </div>
          <div className="flex-col gap-2">
            <input
              type="text"
              name="url"
              value={item.url}
              onChange={(e) => handleChange(index, e)}
              placeholder="Paste link, press button to magicaly fill the form"
              className="border p-2"
            />
            
            <button
              type="button"
              onClick={() => handleFetchItemData(index, item.url)}
              className="btn-service rounded shadow">
              Fetch item data
            </button>

            <div className="flex-col">
              <label className="p-1" htmlFor="name">Name</label>
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
              <label className="p-1" htmlFor="description">Description</label>
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
              <label className="p-1" htmlFor="description">Price</label>
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
              className="border p-2">

                <option value="">Select currency</option>
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
              <label className="p-1" htmlFor="description">Image URL</label>
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
          <div className={showButtons ? "" : "hidden"}>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-500"
            >
              ❌
            </button>
          </div>
          
        </div>
        );

      }
        
      )}
      
      <LoadingSpinner message="This may take a few seconds, we are fetching the item data from eshop..." className={showSpinner ? "" : "hidden"} />
    </form>
    </>
  );
};

export default WishlistEditForm;
