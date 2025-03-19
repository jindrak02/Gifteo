import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import LoadingSpinner from "./LoadingSpinner";
import UserSearchThumbnail from "./UserSearchThumbnail";
import Swal from "sweetalert2";

const UserSearch = () => {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<{ person_id: string; name: string; email: string; photo_url: string }[]>([]);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

    useEffect(() => {
        if (!query) {
            setUsers([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            const fetchUsers = async () => {
                setShowSpinner(true);

                try {
                    const res = await fetchWithAuth(
                        `http://localhost:3000/api/personsData/UserProfile/${query}`,
                        {
                            method: "GET",
                            credentials: "include",
                        }
                    );

                    const data = await res.json();

                    if (data && Array.isArray(data)) {
                        console.log("Fetched user data:", data);
                        setUsers(data);
                    } else {
                        console.error("Error fetching user data");
                        setUsers([]);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUsers([]);
                }

                setShowSpinner(false);
            };

            fetchUsers();
      }, 500); // Debounce 500ms

      return () => clearTimeout(delayDebounce);
    }, [query]);

    const handleInvite = async function (personId: string) {
        console.log('Inviting user with person id: ' + personId);
        setShowSpinner(true);

        try {
            const res = await fetchWithAuth(
                `http://localhost:3000/api/personsData/AddPerson`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ personId })
                }
            );

            const data = await res.json();
            
            if (data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Person added",
                    text: "Invitation sent successfully",
                });

                setQuery("");

            } else {

                if (data.message === "Person already added") {
                    Swal.fire({
                        icon: "info",
                        title: "Person already added",
                        text: "You already send request or this person is already in your list",
                    });
                }

                console.error("Error adding user: " + data.message);
            }

        } catch (error) {
            console.error("Error adding user: ", error);
        }
        
        setShowSpinner(false);
    };

    return (
        <>
            <div className="user-search">
                <input className="user-search-input"
                    type="text"
                    placeholder="Search for user..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <ul className="user-search-list">
                    {users.map(user => (
                        <UserSearchThumbnail
                            key={users.indexOf(user)}
                            name={user.name}
                            profilePicture={user.photo_url}
                            onInvite={() => handleInvite(user.person_id)}
                        />
                    ))}
                </ul>
            </div>
            <LoadingSpinner className={showSpinner ? "" : "hidden"} />
        </>
    );
};

export default UserSearch;