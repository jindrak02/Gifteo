import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Načteme data uživatele po přihlášení
    fetch('http://localhost:3000/profile', {
      method: 'GET',
      credentials: 'include',  // Důležité pro posílání cookies (session)
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);  // Uložení dat do stavu
      })
      .catch((error) => console.error('Error:', error));
  }, []);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome, {user.displayName}</h1>
      <img src={user.photos[0].value} alt="Profile" />
    </div>
  );
};

export default Profile;
