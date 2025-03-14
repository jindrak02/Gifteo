import PersonThumbnail from "./PersonThumbnail";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../../utils/fetchWithAuth"; // Custom fetch wrapper

// Define an interface for the person object
interface Person {
  user_id: string;
  person_id: string;
  profile_id: string;
  name: string;
  photo_url: string;
}

const MyPeople = () => {
    const [persons, setPersons] = useState<Person[]>([]);
    
    // Načtení osob uživatele
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

    const handleDetail = () => {
        console.log("Detail clicked");
    };

    const handleDelete = (personId: string) => {
        Swal.fire({
        title: "Are you sure?",
        text: "Do you realy want to remove this person from your persons?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#8F84F2",
        confirmButtonText: "Yes, remove",
        }).then((result) => {
        if (result.isConfirmed) {
            console.log(personId + " Delete confirmed");
            Swal.fire("Deleted!", "Your person has been deleted.", "success");
        } else {
            console.log(personId + " Delete canceled");
            return;
        }
        });
    };

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
          wishlists={[]} // Placeholder for wishlists as they're not in the API response
          onDetail={() => handleDetail()}
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
