import PersonThumbnail from "../../components/person/PersonThumbnail";
import PersonDetail from "../../components/person/PersonDetail";
import AddPerson from "./components/AddPerson";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Invitations from "./components/Invitations";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useInvitations } from "../../store/InvitationContext";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { useTranslation } from "react-i18next";

interface Person {
  user_id: string;
  person_id: string;
  profile_id: string;
  name: string;
  photo_url: string;
  wishlists: { name: string }[];
  country_code: string;
}

interface Invitation {
    id: string;
    senderName: string;
    senderProfilePicture?: string;
    createdAt: string;
}

const MyPeople = () => {
    const { t } = useTranslation();
    const [persons, setPersons] = useState<Person[]>([]);
    const [showPersonDetail, setShowPersonDetail] = useState<string | null>(null);
    const [isAddingPerson, setIsAddingPerson] = useState<boolean>(false);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [isViewingInvitations, setIsViewingInvitations] = useState<boolean>(false);
    const { invitations, fetchInvitations } = useInvitations();
    const location = useLocation();

    useEffect(() => {
        setShowPersonDetail(null);
        setIsAddingPerson(false);
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
    }, [isViewingInvitations, showPersonDetail]);
    
    const handleDetail = (personId: string) => {
        setShowPersonDetail(personId);
    };
    
    const handleDelete = async (personId: string, userId: string) => {
      Swal.fire({
        title: t("app.swal.removePerson.title"),
        text: t("app.swal.removePerson.text"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#8F84F2",
        confirmButtonText: t("app.swal.removePerson.confirmButtonText"),
        cancelButtonText: t("app.swal.removePerson.cancelButtonText"),
      }).then(async (result) => {

        if (result.isConfirmed) {
          // Remove the user person from database
          const res = await fetchWithAuth(
            `personsData/DeletePerson/${personId}`,
            {
              method: "DELETE",
              credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ secondUserId: userId }),
            }
          );

          const data = await res.json();

          if (data.success) {
            console.log(personId + " Deleted");
            setPersons(
              persons.filter((person) => person.person_id !== personId)
            );
            Swal.fire(
                t("app.swal.removePersonSuccess.title"),
                t("app.swal.removePersonSuccess.text"),
                "success"
            );
          } else {
            console.error("Error deleting person");
          }

        } else {
          console.log(personId + " Delete canceled");
          return;
        }
      });
    };

    // Pokud je kliknuto na detail osoby, zobrazí se detail osoby
    if (showPersonDetail !== null) {
        const person = persons.find((person) => person.person_id === showPersonDetail);
        if (!person) {
            return <div>Person not found</div>;
        }

        return (
            <>
                <PersonDetail
                    personId={showPersonDetail}
                    person={person}
                    onClickBack={() => setShowPersonDetail(null)}
                />
            </>
        );
    }

    // Pokud je kliknuto na přidání osoby, zobrazí se formulář pro přidání osoby
    if (isAddingPerson) {
        return (
            <div className="profile-container p-4">
                <div className="profile-welcome">
                    <button className="btn-service" onClick={() => setIsAddingPerson(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg>
                    </button>
                    <h2 className="my-2">{t("myPeople.addPerson.addPersonHeader")}</h2>
                </div>
                
                <hr className="my-4" />

                <AddPerson />
            </div>
        );
    }

    // Pokud je kliknuto na zobrazení pozvánek, zobrazí se seznam pozvánek
    if (isViewingInvitations) {

        return (
            <div className="profile-container p-4">
                <div className="profile-welcome">
                    <button className="btn-service" onClick={() => setIsViewingInvitations(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                        </svg>
                    </button>
                    <h2 className="my-2">{t("myPeople.invitations.yourInvitations")}</h2>
                </div>
                
                <hr className="my-4" />

                <Invitations invitationProps = {invitations} />
            </div>
        );
    }
    
    return (
      <>
        <div className="profile-container p-4">
          <div className="profile-welcome">
            <div className="notification-container">
                <button
                className="btn-service btn btn-primary rounded"
                onClick={() => setIsViewingInvitations(true)}
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-person-plus" viewBox="0 0 16 16">
                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                    <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                </svg>
                </button>
                {invitations.length != 0 ? (
                    <div className="new-invitation-icon"></div>
                ) : (
                    ""
                )}
            </div>
            <h2 className="my-2">{t("myPeople.title")}</h2>
          </div>

          <hr className="my-4" />

          {invitations.length != 0 && (
            <div className="text-center my-4">
              <p className="text-muted">
                {t("myPeople.invitations.newInvitation", { count: invitations.length })}
              </p>
            </div>
          )}

          {persons.length === 0 && (
            <div className="text-center my-4">
              <h3 className="text-muted my-4">{t("myPeople.noPeopleHeader")}</h3>
              <p className="text-muted">{t("myPeople.noPeopleText")}</p>
            </div>
          )}

          <div className="persons-container">
            {persons.map((person) => (
              <PersonThumbnail
                key={person.person_id}
                imageUrl={person.photo_url}
                name={person.name}
                wishlists={person.wishlists.map((wishlist) => wishlist.name)}
                onDetail={() => handleDetail(person.person_id)}
              />
            ))}
          </div>

          <div>
            <button
              className="add-person-btn btn-primary btn btn-service"
              onClick={() => setIsAddingPerson(true)}
            >
              {t("myPeople.addPerson.addPersonButton")}
            </button>
          </div>
        </div>
        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
      </>
    );
};

export default MyPeople;
