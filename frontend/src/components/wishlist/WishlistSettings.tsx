import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import UpperPanel from "../ui/UpperPanel";
import LoadingSpinner from "../ui/LoadingSpinner";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import Swal from "sweetalert2";

interface User {
    user_id: string;
    profile_id: string;
    name: string;
    photo_url: string;
}

const WishlistSettings = function (props: { onClickBack: () => void; wishlistId: string; wishlistName: string; wishlistForProfile?: string; isCustom?: boolean; }) {
    const { t } = useTranslation();
    const [isPublic, setIsPublic] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showSpinner, setShowSpinner] = useState(false);

    useEffect(() => {
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

    const handleVisibilityToggle = () => {
        if (!isPublic && props.isCustom) {
            Swal.fire({
                icon: 'warning',
                title: t("app.swal.makeWishlistPublic.title"),
                text: t("app.swal.makeWishlistPublic.text"),
                showCancelButton: true,
                confirmButtonText: t("app.swal.makeWishlistPublic.confirmButtonText"),
                cancelButtonText: t("app.swal.makeWishlistPublic.cancelButtonText"),
            }).then((result) => {
                if (result.isConfirmed) {
                    setIsPublic(true);
                }
            });
        } else {
            setIsPublic(!isPublic);
        }
    };

    const handleUserSelect = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            const wishlistForProfile = users.find(user => user.user_id === userId)?.profile_id;
            if (props.wishlistForProfile && props.wishlistForProfile === wishlistForProfile) {
                Swal.fire({
                    icon: 'warning',
                    title: t("app.swal.shareWithTarget.title"),
                    text: t("app.swal.shareWithTarget.text"),
                    showCancelButton: true,
                    confirmButtonText: t("app.swal.shareWithTarget.confirmButtonText"),
                    cancelButtonText: t("app.swal.shareWithTarget.cancelButtonText")
                }).then((result) => {
                    if (result.isConfirmed) {
                        setSelectedUsers([...selectedUsers, userId]);
                    }
                });
            } else {
                setSelectedUsers([...selectedUsers, userId]);
            }
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
                Swal.fire({
                    icon: 'success',
                    title: t("app.swal.success.title"),
                    text: t("app.swal.success.text"),
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: t("app.swal.error.title"),
                    text: t("app.swal.error.title"),
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
                name={t("profile.wishlistSettings.title")}
                onClickBack={() => props.onClickBack()}
            />

            <div className="wishlist-settings-form-wrapper">
                <h2 className="text-center">{props.wishlistName}</h2>

                <div className="mt-4 wishlist-settings-form">
                    <div className="card p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-1">{t("profile.wishlistSettings.shareWithAllMyPeople")}</h5>
                                <p className="text-muted">
                                    {t("profile.wishlistSettings.shareWithAllMyPeopleDescription")}
                                </p>
                            </div>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={handleVisibilityToggle}
                                    id="visibilityToggle"
                                />
                            </div>
                        </div>
                    </div>

                    {!isPublic && (
                        <div className="card p-3 mb-3">
                            <h5 className="mb-3">{t("profile.wishlistSettings.whoCanSee")}</h5>
                            <div className="mb-3">
                                <label className="form-label">{t("profile.wishlistSettings.whoCanSeeDescription")}</label>
                                <div className="list-group">
                                    {users?.map(user => (
                                        <button
                                            key={user.user_id}
                                            type="button"
                                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedUsers.includes(user.user_id) ? 'active' : ''}`}
                                            onClick={() => handleUserSelect(user.user_id)}
                                        >
                                            <img className="profile-picture-thumbnail-sm rounded" src={user.photo_url} alt={user.name} />
                                            <p className={props.wishlistForProfile && props.wishlistForProfile === user.profile_id ? "text-red" : ""}>{user.name}</p>
                                            {selectedUsers.includes(user.user_id) && (
                                                <span className="badge bg-primary rounded-pill">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {selectedUsers.length > 0 && (
                                <div className="alert">
                                    <small>{t("profile.wishlistSettings.selectedUsers", { count: selectedUsers.length })}</small>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        className="btn btn-service mt-2"
                        onClick={handleSave}
                    >
                        {t("app.buttons.save")}
                    </button>
                </div>
            </div>
            <LoadingSpinner className={showSpinner ? "" : "hidden"} />
        </div>
    );
};

export default WishlistSettings;