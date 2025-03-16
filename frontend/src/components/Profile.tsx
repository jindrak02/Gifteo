import { useEffect, useState } from "react";
import Select from "react-select";
import WishlistThumbnail from "./WishlistThumbnail";
import Swal from "sweetalert2";
import WishlistEditForm from "./WishlistEditForm";
import LoadingSpinner from "./LoadingSpinner";
import { fetchWithAuth } from "../../../utils/fetchWithAuth"; // Import the fetch wrapper

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
  const [showSpinner, setShowSpinner] = useState(false);
  const [profileInterests, setProfileInterests] = useState<Array<Interest> | null>(null);
  const [availableInterests, setAvailableInterests] = useState<Array<Interest>>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<Array<{ value: string; label: string; id: string }>>([]);
  const [isAddingWishlist, setIsAddingWishlist] = useState(false);
  const [wishlists, setWishlists] = useState<Array<any>>([]);
  const [isEditingWishlist, setIsEditingWishlist] = useState<string | null>(null);

  // Načtení dat o profilu a wishlistech z API
  useEffect(() => {
    const fetchData = async () => {
      setShowSpinner(true);
      try {
        // Zde načteme data o profilu z API
        const fetchProfileData = async () => {
          const res = await fetchWithAuth("http://localhost:3000/api/profileData/profile", {
            method: "GET",
            credentials: "include", // Posílání cookies
          });

          if (!res.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await res.json();
          data.birthdate = new Date(data.birthdate); // Převést birthdate na instanci Date
          setProfileData(data);
          //console.log(data);
        };

        // Zde načteme data o zájemch profilu z API
        const fetchProfileInterests = async () => {
          const res = await fetchWithAuth(
            "http://localhost:3000/api/profileData/profileInterest",
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
          //console.log(data);
        };

        // Zde načteme data o wishlistech z API
        const fetchProfileWishlists = async () => {
          const res = await fetchWithAuth(
            `http://localhost:3000/api/profileData/wishlistsData`,
            {
              method: "GET",
              credentials: "include", // Posílání cookies
            }
          );

          if (!res.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await res.json();
          setWishlists(data);
          //console.log(data);
        };

        await Promise.all([
          fetchProfileData(),
          fetchProfileInterests(),
          fetchProfileWishlists(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setShowSpinner(false);
      }
    };

    fetchData();
  }, [isEditing, isAddingWishlist, isEditingWishlist]);

  // Odhlášení uživatele
  const handleLogOut = async function () {
    const result = await Swal.fire({
      title: "Do you really want to Log Out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#8F84F2",
      confirmButtonText: "Yes, Log Out",
    });

    if (result.isConfirmed) {
      const res = await fetchWithAuth("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include", // Posílání cookies
      });

      const data = await res.json();
      if (data.success) {
        console.log("Logout Successful.");
        window.location.reload(); // Obnovit aplikaci pro načtení session
      }
    }
  };

  const handleSaveProfile = async function (
    updatedProfileData: ProfileData,
    updatedInterests: Array<{ value: string; label: string; id: string }>,
    file: File | null
  ) {
    setShowSpinner(true);
    console.log('Typ souboru: ' + file?.type);
    console.log('File size: ' + file?.size);
  
    // Checknu jestli byl opravdu zvolen soubor s reálnou velikostí a jménem
    if (file && file.size > 0 && file.name) {
      // Validace formátu souboru
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Only JPEG, JPG, and PNG files are allowed!',
        });
        setShowSpinner(false);
        return;
      }
      
      // Validace velikosti souboru
      if (file.size > 2097152) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'File size should be less than 2MB!',
        });
        setShowSpinner(false);
        return;
      }
    }
  
    const formData = new FormData();
    
    // Přidání JSON dat
    formData.append("profile", JSON.stringify(updatedProfileData));
    formData.append("interests", JSON.stringify(updatedInterests.map((interest) => interest.id)));
    
    // Přidání souboru, pouze pokud existuje a má velikost
    if (file && file.size > 0 && file.name) {
      formData.append("file", file);
    }
  
    try {
      const res = await fetchWithAuth("http://localhost:3000/api/profileData/updateProfile", {
        method: "PUT",
        credentials: "include", // Posílání cookies
        body: formData,
      });
  
      const data = await res.json();
  
      if (data.success) {
        console.log("Profile updated successfully.");
      } else {
        console.error("Error updating profile:", data);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setShowSpinner(false); // Hide spinner
    }
  
    setIsEditing(false);
  };
  
  const handleAddWishlist = async (wishlistName: string) => {
    const res = await fetchWithAuth("http://localhost:3000/api/profileData/addWishlist", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: wishlistName,
        profileId: profileData?.id,
      }),
    });

    const data = await res.json();
    if (data.success) {
      console.log("Wishlist added successfully.");
      setIsAddingWishlist(false);

      // TODO: reload or update the wishlists
    }
  };
  
  const handleDeleteWishlist = async (wishlistId: string) => {
    const result = await Swal.fire({
      title: "Do you really want to delete this wishlist?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#8F84F2",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const res = await fetchWithAuth(
        `http://localhost:3000/api/profileData/deleteWishlist/${wishlistId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        console.log("Wishlist deleted successfully.");
        setWishlists(
          wishlists.filter((wishlist) => wishlist.id !== wishlistId)
        );
      } else {
        console.log("Wishlist deletion failed:", data.message);
      }
    }
  };
  
  // Uložení změny itemů v wishlistu
  const handleSaveWishlist = async (wishlistId: string, items: any) => {
    console.log("wishlist id:", wishlistId);    
    console.log("Saving wishlist with items:", items);
    
    const res = await fetchWithAuth(
      `http://localhost:3000/api/profileData/updateWishlist/${wishlistId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      console.log("Wishlist updated successfully.");
      setIsEditingWishlist(null);
    } else {
      // Vypíšeme chybu
      console.error("Error updating wishlist:", data.message);
    }
  };
  
  // Načtení předefinovaných interest z db při editaci profilu
  useEffect(() => {
    if (isEditing) {
      const fetchAvailableInterests = async () => {
        try {
          const res = await fetchWithAuth("http://localhost:3000/api/profileData/interests", {
            method: "GET",
            credentials: "include", // Posílání cookies
          });

          if (!res.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await res.json();
          setAvailableInterests(data);
          //console.log(data);
        } catch (error) {
          console.error("Error fetching available interests:", error);
        }
      };

      fetchAvailableInterests();
    }
  }, [isEditing]);

  // Zobrazení formuláře pro editaci profilu
  if (isEditing) {

    let formattedBirthDate = "";

    if (profileData?.birthdate) {
      const year = profileData!.birthdate.getFullYear();
      const month = String(profileData!.birthdate.getMonth() + 1).padStart(2,"0");
      const day = String(profileData!.birthdate.getDate()).padStart(2, "0");

      formattedBirthDate = `${year}-${month}-${day}`;
    }
    
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
              photo_url: profileData!.photo_url, // Keep the existing photo_url
              bio: formData.get("bio") as string,
              birthdate: new Date(formData.get("birthdate") as string),
            };
            const file = formData.get("photo") as File;
            handleSaveProfile(updatedProfileData, selectedInterests, file);
            //console.log(updatedProfileData);
            //console.log(selectedInterests.map((interest) => interest.id));
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
            <label htmlFor="photo" className="form-label">
              Photo
            </label>
            <input
              type="file"
              className="form-control"
              id="photo"
              name="photo"
              accept="image/*"
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
              defaultValue={formattedBirthDate}
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
            className="btn btn-secondary mx-2"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </form>
        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
      </div>
    );
  }
  
  // Zobrazení formuláře pro přidání wishlistu
  if (isAddingWishlist) {
    return (
      <div className="container p-4 rounded add-wishlist-container">
        <h2>Add Wishlist</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const wishlistName = formData.get("wishlistName") as string;
            handleAddWishlist(wishlistName);
          }}
        >
          <div className="mb-3">
            <label htmlFor="wishlistName" className="form-label">
              Wishlist Name
            </label>
            <input
              type="text"
              className="form-control"
              id="wishlistName"
              name="wishlistName"
              required
              minLength={2}
              maxLength={35}
            />
          </div>
          <button type="submit" className="btn btn-service btn-primary">
            Save
          </button>
          <button
            type="button"
            className="btn btn-secondary mx-2"
            onClick={() => setIsAddingWishlist(false)}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }
  
  // Zobrazení formuláře pro editaci wishlistu
  if (isEditingWishlist) {
    const wishlist = wishlists.find((w) => w.id === isEditingWishlist);
    
    return (
      <div className="container p-4 rounded add-wishlist-container">
        <h2>Edit Wishlist</h2>
        <WishlistEditForm
          items={wishlist.items}
          onSubmit={(items) => handleSaveWishlist(wishlist.id, items)}
          onCancel={() => setIsEditingWishlist(null)}
        />
      </div>
    );
  }
  
  return (
    <>
      <div className="profile-container container p-4 rounded">
        <div className="profile-welcome">
          <h2 className="">Hi, {profileData?.name}</h2>
          <button
            className="btn btn-service logout-btn"
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
              className="btn btn-service btn-primary"
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
          {profileInterests && profileInterests.length > 0 ? (
            profileInterests.map((interest: any, index: number) => (
              <span key={index} className="badge bg-secondary me-2">
                {interest.name}
              </span>
            ))
          ) : (
            <span className="badge bg-secondary me-2">
              There are no interests yet 😢
            </span>
          )}

          {/* <span className="badge bg-secondary me-2">🐎 Horse riding</span> */}
        </div>

        <div className="bio my-4">
          <p>{profileData?.bio}</p>
          <p>
            <strong>Birthday: </strong>{" "}
            {profileData?.birthdate?.toLocaleDateString()}
          </p>
        </div>

        <div className="my-4 my-wishlists-wrapper">
          <div className="profile-wishlists my-4">
            <h4 className="mt-4">My wishlists</h4>
            <button
              className="btn btn-service btn-primary"
              onClick={() => setIsAddingWishlist(true)}
            >
              Add wishlist
            </button>
          </div>

          <div className="wishlists-container my-4">
            {wishlists.map((wishlist) => (
              <WishlistThumbnail
                showButtons={true}
                key={wishlist.id}
                title={wishlist.name}
                imageUrls={wishlist.items.map((item: any) => item.photo_url)}
                onDelete={() => handleDeleteWishlist(wishlist.id)}
                onEdit={() => setIsEditingWishlist(wishlist.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <LoadingSpinner className={showSpinner ? "" : "hidden"} />
    </>
  );
};

export default Profile;
