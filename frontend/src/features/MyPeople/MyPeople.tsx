import PersonThumbnail from "../../components/person/PersonThumbnail";
import PersonDetail from "../../components/person/PersonDetail";
import AddPerson from "./components/AddPerson";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Invitations from "./components/Invitations";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

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
    senderName: string;
    senderProfilePicture?: string;
    createdAt: string;
}

const MyPeople = () => {
    const [persons, setPersons] = useState<Person[]>([]);
    const [showPersonDetail, setShowPersonDetail] = useState<string | null>(null);
    const [personDetailName, setPersonDetailName] = useState<string | null>(null);
    const [isAddingPerson, setIsAddingPerson] = useState<boolean>(false);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isViewingInvitations, setIsViewingInvitations] = useState<boolean>(false);
    
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

        const fetchInvitationsData = async () => {
            setShowSpinner(true);
            try {
                const res = await fetchWithAuth(
                    "http://localhost:3000/api/personsData/invitations",
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (data) {
                    console.log("Fetched invitations data:", data);
                    setInvitations(data);
                } else {
                    console.error("Error fetching user invitations");
                }
                setShowSpinner(false);
                
            } catch (error) {
                console.error("Error fetching invitations data:", error);
            }
        }

        fetchPersonsData();
        fetchInvitationsData();
    }, [isViewingInvitations]);
    
    const handleDetail = (personId: string) => {
        console.log(personId + "Detail clicked");
        setShowPersonDetail(personId);
        const personName = persons.find((person) => person.person_id == personId)?.name;
        
        if (personName) {
            const firstName = personName.includes(' ') ? personName.split(' ')[0] : personName;
            setPersonDetailName(firstName);
        } else {
            setPersonDetailName(null);
        }
    };
    
    const handleDelete = async (personId: string, userId: string) => {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you realy want to remove this person from your persons?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#8F84F2",
        confirmButtonText: "Yes, remove",
      }).then(async (result) => {

        if (result.isConfirmed) {
          // Remove the user person from database
          const res = await fetchWithAuth(
            `http://localhost:3000/api/personsData/DeletePerson/${personId}`,
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
          } else {
            console.error("Error deleting person");
          }

          Swal.fire("Deleted!", "Your person has been deleted.", "success");
        } else {
          console.log(personId + " Delete canceled");
          return;
        }
      });
    };

    // Pokud je kliknuto na detail osoby, zobrazí se detail osoby
    if (showPersonDetail !== null) {
        return (
            <>
                <PersonDetail personId={showPersonDetail} onClickBack={() => setShowPersonDetail(null)} />
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
                    <h2 className="my-2">Add new person</h2>
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
                    <h2 className="my-2">Your invitations</h2>
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
                    <button className="btn-service btn btn-primary rounded" onClick={() => setIsViewingInvitations(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
                        </svg>
                        {invitations.length != 0 ? <div className="new-invitation-icon"></div> : ''}
                    </button>
                    <h2 className="my-2">My People</h2>
                </div>

                <hr className="my-4" />

                { persons.length === 0 && (
                    <div className="text-center my-4">
                        <h3 className="text-muted my-4">You have connected with no people yet.</h3>
                        <p className="text-muted">Click the button below to add a new person.</p>
                    </div>
                )}

                {persons.map((person) => (
                    <PersonThumbnail
                    key={person.person_id}
                    imageUrl={person.photo_url}
                    name={person.name}
                    wishlists={person.wishlists.map((wishlist) => wishlist.name)}
                    onDetail={() => handleDetail(person.person_id)}
                    onDelete={() => handleDelete(person.person_id, person.user_id)}
                    />
                ))}

                <div>
                    <button className="add-person-btn btn-primary btn btn-service" onClick={() => setIsAddingPerson(true)}>Add person</button>
                </div>
            </div>
            <LoadingSpinner className={showSpinner ? "" : "hidden"}/>
        </>
    );
};

export default MyPeople;
