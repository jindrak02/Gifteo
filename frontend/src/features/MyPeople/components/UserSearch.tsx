import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import UserSearchThumbnail from "../../../components/user/UserSearchThumbnail";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

interface User{
    person_id: string;
    name: string;
    email: string;
    photo_url: string;
    connectionStatus: 'pending' | 'accepted' | 'rejected' | null;
}

const UserSearch = () => {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const { t } = useTranslation();

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
                        `personsData/UserProfile/${query}`,
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
                `personsData/AddPerson`,
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
                    title: t('app.swal.sendInvitation.title'),
                    text: t('app.swal.sendInvitation.text'),
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
                    placeholder={t("myPeople.addPerson.userSearchPlaceholder")}
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
                            connectionStatus={user.connectionStatus}
                        />
                    ))}
                </ul>
            </div>
            <LoadingSpinner className={showSpinner ? "" : "hidden"} />
        </>
    );
};

export default UserSearch;