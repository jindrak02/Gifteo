import React, {useState, useEffect} from "react";
import UpperPanel from "../ui/UpperPanel";
import LoadingSpinner from "../ui/LoadingSpinner";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import Swal from "sweetalert2";

interface User {
    user_id: string;
    name: string;
}

const WishlistSettings = function (props: { onClickBack: () => void; wishlistId: string; wishlistName: string; }) {
    const [isPublic, setIsPublic] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showSpinner, setShowSpinner] = useState(false);

    // Načtení uživatelů z API a stav viditelnosti wishlistu
    useEffect(() => {
        // Načtení stavu viditelnosti wishlistu uživatelů se kterými je wishlist sdílen
        const fetchWishlistVisibility = async (wishlistId: string) => {
            setShowSpinner(true);
            try {
                const res = await fetchWithAuth(`wishlistHub/wishlistVisibility/${wishlistId}`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json();
                const wishlistVisibility = data.wishlistVisibility;
                if (wishlistVisibility) {
                    console.log('Fetched wishlist visibility:', wishlistVisibility);
                    setIsPublic(wishlistVisibility.sharedWithAllMyPeople);
                    setSelectedUsers(wishlistVisibility.sharedUsers.map((user: User) => user.user_id));
                } else {
                    console.error('No data received for wishlist visibility');
                }

            } catch (error) {
                console.error('Error fetching wishlist visibility:', error);
            } finally {
                setShowSpinner(false);
            }
        }

        // Načtení blízkých osob uživatele pro případný výběr
        const fetchUsers = async () => {
            setShowSpinner(true);
            try {
                const res = await fetchWithAuth(`personsData/UserPersons`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.json();

                if (data) {
                    console.log('Fetched users:', data);
                    setUsers(data);
                }
                
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setShowSpinner(false);
            }
        }

        fetchWishlistVisibility(props.wishlistId);
        fetchUsers();

    }, [props.wishlistId]);

    const handleUserSelect = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSave = async () => {
        setShowSpinner(true);
        try {
            const res = await fetchWithAuth(`wishlistHub/updateWishlistVisibility/${props.wishlistId}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sharedWithAllMyPeople: isPublic,
                    sharedUsers: selectedUsers.map(userId => ({ user_id: userId })),
                }),
            });

            const data = await res.json();

            if (data.success) {
                console.log('Settings saved successfully:', data);
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: "Settings saved successfully.",
                });
            } else {
                console.error('Error saving settings:', data.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: "Failed to save settings.",
                });
            }


        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setShowSpinner(false);
        }
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
                        <h5 className="mb-1">Share with all my people</h5>
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
                                        key={user.user_id}
                                        type="button" 
                                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedUsers.includes(user.user_id) ? 'active' : ''}`}
                                        onClick={() => handleUserSelect(user.user_id)}
                                    >
                                        {user.name}
                                        {selectedUsers.includes(user.user_id) && (
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