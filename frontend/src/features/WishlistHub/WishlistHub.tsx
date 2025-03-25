import React, { useState, useEffect} from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PersonThumbnail from "./components/PersonThumbnail";
import PersonDetail from "./components/PersonDetail";

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
            person_id={isViewingPerson.person_id}
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-raised-hand" viewBox="0 0 16 16">
                        <path d="M6 6.207v9.043a.75.75 0 0 0 1.5 0V10.5a.5.5 0 0 1 1 0v4.75a.75.75 0 0 0 1.5 0v-8.5a.25.25 0 1 1 .5 0v2.5a.75.75 0 0 0 1.5 0V6.5a3 3 0 0 0-3-3H6.236a1 1 0 0 1-.447-.106l-.33-.165A.83.83 0 0 1 5 2.488V.75a.75.75 0 0 0-1.5 0v2.083c0 .715.404 1.37 1.044 1.689L5.5 5c.32.32.5.754.5 1.207"/>
                        <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
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