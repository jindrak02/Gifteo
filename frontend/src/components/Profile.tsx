import { useEffect, useState } from "react";
import Select from "react-select";

type ProfileData = {
  id: string;
  name: string;
  photo_url: string;
  bio: string;
  birthdate: Date;
};

type Interest = {
  id: string;
  name: string;
};

const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileInterests, setProfileInterests] = useState<Array<Interest> | null>(null);
  const [availableInterests, setAvailableInterests] = useState<Array<Interest>>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<Array<{ value: string; label: string; id: string }>>([]);

  // Načtení dat o profilu z API
  useEffect(() => {
    // Zde načteme data o profilu z API
    const fetchProfileData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/data/profile", {
          method: "GET",
          credentials: "include", // Posílání cookies
        });

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await res.json();
        data.birthdate = new Date(data.birthdate); // Převést birthdate na instanci Date
        setProfileData(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    // Zde načteme data o zájemch profilu z API
    const fetchProfileInterests = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/data/profileInterest",
          {
            method: "GET",
            credentials: "include", // Posílání cookies
          }
        );

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await res.json();
        setProfileInterests(data);
        setSelectedInterests(
          data.map((i: Interest) => ({
            value: i.name,
            label: i.name,
            id: i.id,
          }))
        );
        console.log(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
    fetchProfileInterests();
  }, [isEditing]);

  // Odhlášení uživatele
  const handleLogOut = async function () {
    const res = await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include", // Posílání cookies
    });

    const data = await res.json();
    if (data.success) {
      console.log("Logout Successful.");
      window.location.reload(); // Obnovit aplikaci pro načtení session
    }
  };

  const handleSaveProfile = async function (
    updatedProfileData: ProfileData,
    updatedInterests: Array<{ value: string; label: string; id: string }>
  ) {
    const res = await fetch("http://localhost:3000/api/data/updateProfile", {
      method: "PUT",
      credentials: "include", // Posílání cookies
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profileData: updatedProfileData,
        interests: updatedInterests.map((i) => i.id),
      }),
    });

    const data = await res.json();
    
    if (data.success) {
      console.log("Profile updated successfully.");
      setIsEditing(false);
      //window.location.reload(); // Obnovit aplikaci pro načtení změn
    }
  };

  // Načtení předefinovaných interest z db při editaci profilu
  useEffect(() => {
    if (isEditing) {
      const fetchAvailableInterests = async () => {
        try {
          const res = await fetch("http://localhost:3000/api/data/interests", {
            method: "GET",
            credentials: "include", // Posílání cookies
          });

          if (!res.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await res.json();
          setAvailableInterests(data);
          console.log(data);
        } catch (error) {
          console.error("Error fetching available interests:", error);
        }
      };

      fetchAvailableInterests();
    }
  }, [isEditing]);

  // Zobrazení formuláře pro editaci profilu
  if (isEditing) {
    return (
      <div className="profile-container container p-4 rounded">
        <h2>Edit Profile</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const updatedProfileData: ProfileData = {
              id: profileData!.id,
              name: formData.get("name") as string,
              photo_url: formData.get("photo_url") as string,
              bio: formData.get("bio") as string,
              birthdate: new Date(formData.get("birthdate") as string),
            };
            handleSaveProfile(updatedProfileData, selectedInterests);
            console.log(updatedProfileData);
            console.log(selectedInterests.map((interest) => interest.id));
          }}
        >
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              defaultValue={profileData?.name}
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="photo_url" className="form-label">
              Photo URL
            </label>
            <input
              type="url"
              className="form-control"
              id="photo_url"
              name="photo_url"
              defaultValue={profileData?.photo_url}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="bio" className="form-label">
              Bio
            </label>
            <textarea
              className="form-control"
              id="bio"
              name="bio"
              defaultValue={profileData?.bio}
              required
              minLength={10}
              maxLength={500}
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="birthdate" className="form-label">
              Birthdate
            </label>
            <input
              type="date"
              className="form-control"
              id="birthdate"
              name="birthdate"
              defaultValue={profileData?.birthdate?.toLocaleDateString()}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="interests" className="form-label">
              Interests
            </label>
            <Select
              isMulti
              options={availableInterests.map((i) => ({
                value: i.name,
                label: i.name,
                id: i.id,
              }))}
              defaultValue={profileInterests?.map((i) => ({
                value: i.name,
                label: i.name,
                id: i.id,
              }))}
              placeholder="Select your interests..."
              onChange={(selectedOptions) =>
                setSelectedInterests(
                  selectedOptions as Array<{
                    value: string;
                    label: string;
                    id: string;
                  }>
                )
              }
            />
          </div>
          <button type="submit" className="btn btn-service btn-primary">
            Save
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="profile-container container p-4 rounded">
        <div className="profile-welcome">
          <h2 className="">Hi, {profileData?.name}</h2>
          <button
            className="btn btn-service logout-btn shadow-sm"
            onClick={handleLogOut}
          >
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
                d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
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
              src={profileData?.photo_url}
              alt="Profile"
              className="profile-picture rounded-circle me-3 shadow "
            />
            <button
              className="btn btn-service btn-primary shadow"
              onClick={() => setIsEditing(true)}
            >
              Edit profile
            </button>
          </div>

          <div className="flex-grow-1">
            <h3 className="mb-0">{profileData?.name}</h3>
          </div>
        </div>

        <div className="tags my-4">
          {profileInterests && profileInterests.length > 0
            ? profileInterests.map((interest: any, index: number) => (
                <span key={index} className="badge bg-secondary me-2">
                  {interest.name}
                </span>
              ))
            : "There are no interests yet 😢"}

          {/* <span className="badge bg-secondary me-2">🐎 Horse riding</span> */}
        </div>

        <div className="bio my-4">
          <p>{profileData?.bio}</p>
          <p>
            <strong>Birthday: </strong>{" "}
            {profileData?.birthdate?.toLocaleDateString()}
          </p>
        </div>

        <div className="profile-wishlists my-4">
          <h4 className="mt-4">My wishlists</h4>
          <button className="btn btn-service btn-primary shadow ">
            Add wishlist
          </button>
        </div>
      </div>

      <div id="loading-spinner" className={!profileData ? "" : "hidden"}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    </>
  );
};

export default Profile;
