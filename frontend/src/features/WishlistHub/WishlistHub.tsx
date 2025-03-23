import React, { useState, useEffect} from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PersonThumbnail from "./components/PersonThumbnail";
import PersonDetail from "./components/PersonDetail";

// type WishlistCopyItem = {
//     id: string;
//     name: string;
//     price: number;
//     price_currency: string;
//     url: string;
//     photo_url: string;
// };

// type WishlistCopy = {
//     id: string;
//     name: string;
//     originalWishlistId: string;
//     user_photo_url: string;
//     items: WishlistCopyItem[];
// };

interface Person {
    user_id: string;
    person_id: string;
    profile_id: string;
    name: string;
    photo_url: string;
    wishlists: { name: string }[];
  }

const WishlistHub = () => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [persons, setPersons] = useState<Person[]>([]);
    const [isViewingPerson, setIsViewingPerson] = useState<Person | null>(null);

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

    if (isViewingPerson !== null) {
        return (
          <PersonDetail
            user_id = {isViewingPerson.user_id}
            name = {isViewingPerson.name}
            photo_url = {isViewingPerson.photo_url}
            profile_id = {isViewingPerson.profile_id}
            onReturn = {() => setIsViewingPerson(null)}
          />
        );
    }

    return (
        <>
            <div className="profile-container p-4">
                <div className="profile-welcome">
                    <h2 className="">Gift For</h2>
                    <button className="btn-service btn btn-primary rounded" onClick={() => console.log('Invitations')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
                        </svg>
                        {/* {invitations.length != 0 ? <div className="new-invitation-icon"></div> : ''} */}
                    </button>
                </div>

                <hr className="my-4" />

                <div>
                    <div>
                        <p>Choose who you want to gift</p>
                        {persons.map((person) => (
                            <PersonThumbnail
                                key={person.user_id}
                                photo_url={person.photo_url}
                                name={person.name}
                                user_id={person.user_id}
                                profile_id={person.profile_id}
                                onClick={() => setIsViewingPerson(person)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <LoadingSpinner className={showSpinner ? "" : "hidden"}/>
        </>
    );
};

export default WishlistHub;