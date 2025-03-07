import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    // Načteme data uživatelského profilu po přihlášení
    // TODO
  }, []);

  /*
  if (!profileData) {
    return <p>Loading...</p>;
  }
  */

  const handleLogOut = async function () {

    const res = await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include", // Posílání cookies
    });

    const data = await res.json();
    if (data.success) {
      console.log('Logout Successful.');
      window.location.reload(); // Obnovit aplikaci pro načtení session
    }

  };

  return (
    <>
      <div className="profile-container container p-4 border rounded shadow-sm bg-white">
        <div className="profile-welcome">
          <h2 className="">Hi, Kate</h2>
          <button className="btn logout-btn" onClick={handleLogOut}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-box-arrow-right"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
              />
              <path
                fillRule="evenodd"
                d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
              />
            </svg>
          </button>
        </div>

        <hr className="my-4" />

        <div className="profile-header my-4">
          <div className="profile-header-first d-flex">
            <img
              src=""
              alt="Profile"
              className="profile-picture rounded-circle me-3"
            />
            <button className="btn btn-primary">Edit profile</button>
          </div>

          <div className="flex-grow-1">
            <h3 className="mb-0">Kate Fikarova</h3>
          </div>
        </div>

        <div className="tags my-4">
          <span className="badge bg-secondary me-2">🎨 Painting</span>
          <span className="badge bg-secondary me-2">🐎 Horse riding</span>
          <span className="badge bg-secondary me-2">🎨 Painting</span>
          <span className="badge bg-secondary me-2">🐎 Horse riding</span>
        </div>

        <div className="bio my-4">
          <p>Happy to gift and to be gifted. Based in Prague</p>
          <p>
            <strong>Birthday:</strong> 11.05.2005
          </p>
        </div>

        <div className="profile-wishlists my-4">
          <h4 className="mt-4">My wishlists</h4>
          <button className="btn btn-primary">Add wishlist</button>
        </div>
      </div>
    </>
  );
};

export default Profile;
