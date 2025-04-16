import React, { useState, useEffect, use } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import Select from 'react-select';
import UpperPanel from "../../../components/ui/UpperPanel";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useTranslation } from "react-i18next";
import UserAvatar from "../../../components/user/UserAvatar";

type AddWishlistFormProps = {
    onClickBack: () => void;
    connectedPersons: Person[];
};

interface Person {
    name: string;
    photoUrl: string;
    profileId: string;
}

const AddWishlistForm = (props : AddWishlistFormProps) => {
    const { t } = useTranslation();
    const [showSpinner, setShowSpinner] = useState(false);

    const handleAddWishlist = async (wishlistName: string, connectedPerson: string) => {
        setShowSpinner(true);
        try {
            console.log('Adding wishlist with name:', wishlistName + ' for person:', connectedPerson);

            const res = await fetchWithAuth("customWishlists", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: wishlistName,
                    forProfile: connectedPerson,
                }),
            });
            const data = await res.json();

            if (data.success) {
                console.log("Wishlist added successfully");
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Wishlist added successfully.",
                }).then(() => {
                    props.onClickBack();
                });
            } else {
                console.error("Failed to add wishlist:", data.message);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.message,
                });
            }
            
        } catch (error) {
            console.error("Error adding wishlist:", error);
        } finally {
            setShowSpinner(false);
        }
    }

    return (
        <div className="profile-container p-4">
            <UpperPanel name={t("myIdeas.addWishlist")} onClickBack={props.onClickBack} />

            <div className="container p-4 rounded add-wishlist-container">
                <form
                    onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const wishlistName = formData.get("wishlistName") as string;
                    const connectedPerson = formData.get("connectedPerson") as string;
                    handleAddWishlist(wishlistName, connectedPerson);
                    }}
                >

                    <div className="mb-3">
                        <label htmlFor="wishlistName" className="form-label">
                            {t("myIdeas.wishlistName")}
                        </label>
                        <input
                        type="text"
                        className="form-control"
                        id="wishlistName"
                        name="wishlistName"
                        required
                        minLength={2}
                        maxLength={35}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="connectedPerson" className="form-label">
                            {t("myIdeas.wishlistFor")}
                        </label>

                        <Select
                            id="connectedPerson"
                            name="connectedPerson"
                            options={props.connectedPersons.map(person => ({
                                value: person.profileId,
                                label: person.name,
                                person: person
                            }))}
                            formatOptionLabel={option => (
                                <div className="d-flex align-items-center">
                                    {/* <img 
                                        src={option.person.photoUrl} 
                                        alt={option.person.name} 
                                        className="profile-picture-thumbnail-sm me-2" 
                                        style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                                    /> */}
                                    <UserAvatar
                                        imgSrc={option.person.photoUrl} 
                                        altText={option.person.name} 
                                        className="profile-picture-thumbnail-sm me-2 participant-thumbnail" 
                                    />
                                    <span>{option.person.name}</span>
                                </div>
                            )}
                        />

                    </div>

                    <div className="flex">
                    <button type="submit" className="btn btn-service btn-primary">
                        {t("myIdeas.save")}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary mx-2"
                        onClick={() => props.onClickBack()}
                    >
                        {t("myIdeas.cancel")}
                    </button>
                    </div>

                </form>
                </div>
            <LoadingSpinner className={showSpinner? "" : "hidden"} />
        </div>
      );
};

export default AddWishlistForm;