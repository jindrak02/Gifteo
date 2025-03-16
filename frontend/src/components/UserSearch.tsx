import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import LoadingSpinner from "./LoadingSpinner";

const UserSearch = () => {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<{ id: number; name: string; email: string; photo_url: string }[]>([]);
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

    return (
        <>
            <div className="user-search">
                <input
                    type="text"
                    placeholder="Search for user..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <ul>
                    {users.map(user => (
                        <li key={user.id}>
                            <img src={user.photo_url} alt={user.name} width="40" height="40" />
                            <span>{user.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <LoadingSpinner className={showSpinner ? "" : "hidden"} />
        </>
    );
};

export default UserSearch;