import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import UserSearchThumbnail from "../../../components/user/UserSearchThumbnail";

interface Person {
    user_id: string;
    person_id: string;
    profile_id: string;
    name: string;
    photo_url: string;
    wishlists: { name: string }[];
}

interface AddPersonProps {
    wishlistCopyId: string;
    onClickBack: () => void;
    wishlistCopyName?: string;
}

const AddPerson = ({ wishlistCopyId, wishlistCopyName, onClickBack } : AddPersonProps) => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [persons, setPersons] = useState <Person [] | null>(null);
        
    // Načtení osob (a jejich dat) uživatele
    useEffect(() => {
        const fetchPersonsData = async () => {
            setShowSpinner(true);
            try {
                const res = await fetchWithAuth(
                "http://localhost:3000/api/personsData/UserPersons",
                {
                    method: "GET",
                    credentials: "include",
                }
                );

                const data = await res.json();

                if (data) {
                console.log("Fetched persons data:", data);
                setPersons(data);
                } else {
                console.error("Error fetching user persons");
                }
                setShowSpinner(false);
            } catch (error) {
                console.error("Error fetching persons data:", error);
            }
        };

        fetchPersonsData();
    }, []);

    // Přidání osoby do kopie wishlistu
    const handleAddUser = async (addUserId: string, wishlistCopyId: string) => {
        console.log('Adding user:', addUserId, 'to wishlist copy:', wishlistCopyId);

        setShowSpinner(true);
        try {
            const res = await fetchWithAuth(
            "http://localhost:3000/api/wishlistHub/addUserToWishlistCopy",
            {
                method: "POST",
                credentials: "include",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    addUserId,
                    wishlistCopyId,
                }),
            }
            );

            const data = await res.json();

            if (data.success) {
                console.log("Added user successfully: ", data);
                Swal.fire({
                icon: "success",
                title: "Success!",
                text: "User added to wishlist copy!",
                });
            
            } else {
                console.error("Error adding user to wishlist copy:", data.message);

                if (data.message === "User already invited") {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "User is already in wishlist copy!",
                    });
                }

                if (data.message === "Forbidden: insufficient permissions") {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Only owner of wishlist copy can add users!",
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching persons data:", error);
        } finally {
            setShowSpinner(false);
        }
    }

    return (

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
                    <h2 className="my-2 mx-2">Add Person to {wishlistCopyName}</h2>
                </div>

                <hr className="my-4" />

                <div>
                    <h3>Add Person</h3>

                    <div className="persons-list">
                        {persons?.map((person) => (
                        <UserSearchThumbnail
                            key={person.user_id}
                            name={person.name}
                            profilePicture={person.photo_url}
                            onInvite={() => handleAddUser(person.user_id, wishlistCopyId)}
                        />
                        ))}
                    </div>
                </div>
                <LoadingSpinner className={showSpinner ? "" : "hidden"} />
        </div>
    );
};

export default AddPerson;