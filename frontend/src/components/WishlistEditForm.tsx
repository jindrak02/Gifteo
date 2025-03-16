import { useState, useEffect } from "react";

interface WishlistItem {
  id: string;
  name: string;
  price: number | string;
  url: string;
  photo_url: string;
}

interface WishlistFormProps {
  items: WishlistItem[];
  onSubmit: (items: WishlistItem[]) => void;
  onCancel: () => void;
}

const WishlistEditForm: React.FC<WishlistFormProps> = ({ items: initialItems, onSubmit, onCancel }) => {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [name]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: "", name: "", price: "", url: "", photo_url: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(items); // Zavolání callbacku s daty
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="wishlist-item-wrapper gap-2 my-4">
          <div>
            <img className="wishlist-thumbnail" src={item.photo_url} alt="wishlist item photo" />
          </div>
          <div>
            <input
                type="text"
                name="name"
                value={item.name}
                onChange={(e) => handleChange(index, e)}
                placeholder="Name"
                className="border p-2"
                required
                minLength={3}
                maxLength={30}
            />
            <input
                type="number"
                name="price"
                value={item.price}
                onChange={(e) => handleChange(index, e)}
                placeholder="Price"
                className="border p-2"
            />
            <input
                type="text"
                name="url"
                value={item.url}
                onChange={(e) => handleChange(index, e)}
                placeholder="Link"
                className="border p-2"
            />
            <input
                type="text"
                name="photo_url"
                value={item.photo_url}
                onChange={(e) => handleChange(index, e)}
                placeholder="Link to image"
                className="border p-2"
            />
          </div>
          <button type="button" onClick={() => removeItem(index)} className="text-red-500">❌</button>
        </div>
      ))}
      <div className="my-4">
        <button type="button" onClick={addItem} className="btn-service rounded shadow my-4">Add item</button>
        <button type="submit" className="btn-service rounded mx-2 shadow my-4">Save wishlist</button>
        <button type="button" className="btn rounded btn-secondary shadow" onClick={() => onCancel()}>Close wishlist</button>
      </div>
    </form>
  );
};

export default WishlistEditForm;
