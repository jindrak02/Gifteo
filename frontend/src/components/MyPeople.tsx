import PersonThumbnail from "./PersonThumbnail";
import PersonDetail from "./PersonDetail";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";

// Define an interface for the person object
interface Person {
  user_id: string;
  person_id: string;
  profile_id: string;
  name: string;
  photo_url: string;
  wishlists: { name: string }[];
}

const MyPeople = () => {
    const [persons, setPersons] = useState<Person[]>([]);
    const [showPersonDetail, setShowPersonDetail] = useState<string | null>(null);
    const [personDetailName, setPersonDetailName] = useState<string | null>(null);
    
    // Načtení osob (a jejich dat) uživatele
    useEffect(() => {
        const fetchPersonsData = async () => {
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
                
            } catch (error) {
                console.error("Error fetching persons data:", error);
            }
        };

        fetchPersonsData();
    }, []);
    
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
    
    const handleDelete = async (personId: string) => {
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
                <div className="profile-container p-4">

                    <div className="profile-welcome">
                        <h2 className="">My people - {personDetailName}</h2>
                        <button className="btn-service" onClick={() => setShowPersonDetail(null)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                            </svg>
                        </button>
                    </div>

                    <hr className="my-4" />

                    <PersonDetail personId={showPersonDetail} />
                </div>
            </>
        );
    }
    
    return (
        <div className="profile-container p-4">
            <div className="profile-welcome">
                <h2 className="">My people</h2>
            </div>

            <hr className="my-4" />

            {persons.map((person) => (
                <PersonThumbnail
                key={person.person_id}
                imageUrl={person.photo_url}
                name={person.name}
                wishlists={person.wishlists.map((wishlist) => wishlist.name)}
                onDetail={() => handleDetail(person.person_id)}
                onDelete={() => handleDelete(person.person_id)}
                />
            ))}

            <div>
                <button className="add-person-btn btn-service">Add person</button>
            </div>
        </div>
    );
};

export default MyPeople;
