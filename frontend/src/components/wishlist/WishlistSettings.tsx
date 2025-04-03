import React, {useState, useEffect} from "react";
import UpperPanel from "../ui/UpperPanel";
import LoadingSpinner from "../ui/LoadingSpinner";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

interface User {
    id: number;
    name: string;
}

const WishlistSettings = function (props: { onClickBack: () => void; wishlistId: string; wishlistName: string; }) {
    const [isPublic, setIsPublic] = useState(true);
    const [users, setUsers] = useState<User[]>();
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [showSpinner, setShowSpinner] = useState(false);

    // Načtení uživatelů z API a stav viditelnosti wishlistu
    useEffect(() => {
        // Načtení stavu viditelnosti wishlistu uživatelů se kterými je wishlist sdílen
        

        // Načtení blízkých osob uživatele pro případný výběr
        const fetchUsers = async () => {
            setShowSpinner(true);
            try {
                const res = await fetchWithAuth(`personsData/UserPersons`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        credentials: "include",
                    },
                });

                const data = await res.json();

                if (data) {
                    console.log('Fetched users:', data);
                }
                
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setShowSpinner(false);
            }
        }

        setUsers([
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Smith" },
            { id: 3, name: "Michael Johnson" },
            { id: 4, name: "Sarah Williams" }
        ]);


    }, []);

    const handleUserSelect = (userId: number) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSave = async () => {
        console.log('Saving settings...');
        console.log('Is Public:', isPublic);
        console.log('Selected Users:', selectedUsers);
        // Todo: implement API call
    };

    return (
      <div className="container p-4 rounded profile-container">
        <UpperPanel
          name={"Wishlist settings"}
          onClickBack={() => props.onClickBack()}
        />

        <div>
          <h2 className="text-center">{props.wishlistName}</h2>

          <div className="mt-4">
                <div className="card p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                        <h5 className="mb-1">Public Wishlist</h5>
                        <p className="text-muted">
                           Is this wishlist visible to all your people? If not, set who can see it.
                        </p>
                        </div>
                        <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isPublic}
                            onChange={() => setIsPublic(!isPublic)}
                            id="visibilityToggle"
                        />
                        </div>
                    </div>
                </div>

                {!isPublic && (
                    <div className="card p-3 mb-3">
                        <h5 className="mb-3">Who can see this wishlist?</h5>
                        <div className="mb-3">
                            <label className="form-label">Select Users:</label>
                            <div className="list-group">
                                {users?.map(user => (
                                    <button 
                                        key={user.id}
                                        type="button" 
                                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedUsers.includes(user.id) ? 'active' : ''}`}
                                        onClick={() => handleUserSelect(user.id)}
                                    >
                                        {user.name}
                                        {selectedUsers.includes(user.id) && (
                                            <span className="badge bg-primary rounded-pill">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {selectedUsers.length > 0 && (
                            <div className="alert">
                                <small>Selected {selectedUsers.length} user(s)</small>
                            </div>
                        )}
                    </div>
                )}

                <button
                className="btn btn-service w-100 mt-2"
                onClick={handleSave}
                >
                    Save Settings
                </button>
          </div>
        </div>
        <LoadingSpinner className={showSpinner ? "" : "hidden"}/>
      </div>
    );
};

export default WishlistSettings;