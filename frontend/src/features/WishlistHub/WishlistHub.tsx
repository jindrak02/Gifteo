import React, { useState, useEffect, use} from "react";
import { useLocation } from "react-router-dom";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PersonThumbnail from "./components/PersonThumbnail";
import PersonDetail from "./components/PersonDetail";
import UpperPanel from "../../components/ui/UpperPanel";
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const [showSpinner, setShowSpinner] = useState(false);
    const [persons, setPersons] = useState<Person[]>([]);
    const [isViewingPerson, setIsViewingPerson] = useState<Person | null>(null);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isViewingInvitations, setIsViewingInvitations] = useState<boolean>(false);
    const location = useLocation();
    const isDesktop = useMediaQuery({ minWidth: 1200 });

    useEffect(() => {
        setIsViewingPerson(null);
        setIsViewingInvitations(false);
    }, [location.key]);

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
                <UpperPanel name={t("wishlistHub.title", {name: ''})} />

                <div>
                    <p className="text-center">{t("wishlistHub.choosePerson")}</p>
                    <div className="person-list-container">
                        {persons.length === 0 && (
                            <div className="alert alert-light" role="alert">
                                {t("wishlistHub.noPeopleAlert")}
                            </div>
                        )}

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