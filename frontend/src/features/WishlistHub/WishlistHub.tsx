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

interface Invitation {
    id: string;
    ownerName: string;
    ownerPhoto: string;
    wishlistCopyName: string;
    forPesonName: string;
    createdAt: Date;
}

const WishlistHub = () => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [persons, setPersons] = useState<Person[]>([]);
    const [isViewingPerson, setIsViewingPerson] = useState<Person | null>(null);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isViewingInvitations, setIsViewingInvitations] = useState<boolean>(false);

    // Načtení osob (a jejich dat) uživatele
    useEffect(() => {
        const fetchPersonsData = async () => {
            setShowSpinner(true);
            try {
                const res = await fetchWithAuth(
                "personsData/UserPersons",
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

    if (isViewingInvitations) {
        return (
            <div className="profile-container p-4">
                <div className="profile-welcome">
                    <button className="btn-service" onClick={() => setIsViewingInvitations(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg>
                    </button>
                    <h2 className="my-2">Invitations to wishlists</h2>
                </div>
                
                <hr className="my-4" />

                <div>
                    TODO
                </div>
                
        </div>
        );
    }

    return (
        <>
            <div className="profile-container p-4">
                <div className="profile-welcome">
                    <button className="btn-service btn btn-primary rounded" onClick={() => setIsViewingInvitations(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-raised-hand" viewBox="0 0 16 16">
                            <path d="M6 6.207v9.043a.75.75 0 0 0 1.5 0V10.5a.5.5 0 0 1 1 0v4.75a.75.75 0 0 0 1.5 0v-8.5a.25.25 0 1 1 .5 0v2.5a.75.75 0 0 0 1.5 0V6.5a3 3 0 0 0-3-3H6.236a1 1 0 0 1-.447-.106l-.33-.165A.83.83 0 0 1 5 2.488V.75a.75.75 0 0 0-1.5 0v2.083c0 .715.404 1.37 1.044 1.689L5.5 5c.32.32.5.754.5 1.207"/>
                            <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                        </svg>
                        {invitations.length != 0 ? <div className="new-invitation-icon"></div> : ''}
                    </button>
                    <h2 className="my-2">Gift For</h2>
                </div>

                <hr className="my-4" />

                <div>
                    <div>
                        <p>Choose who do you want to gift</p>
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