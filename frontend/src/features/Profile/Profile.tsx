import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import WishlistThumbnail from "../../components/wishlist/WishlistThumbnail";
import Swal from "sweetalert2";
import WishlistEditForm from "../../components/wishlist/WishlistEditForm";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { useMediaQuery } from "react-responsive";
import UpperPanel from "../../components/ui/UpperPanel";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";
import UserAvatar from "../../components/user/UserAvatar";
import { useAuth } from "../../store/AuthContext";

type ProfileData = {
  id: string;
  name: string;
  photo_url: string;
  bio: string;
  birthdate: Date;
  email: string;
  created_at: Date;
};

type Interest = {
  id: string;
  name: string;
};

const Profile = () => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [profileInterests, setProfileInterests] =
    useState<Array<Interest> | null>(null);
  const [availableInterests, setAvailableInterests] = useState<Array<Interest>>(
    []
  );
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<
    Array<{ value: string; label: string; id: string }>
  >([]);
  const [isAddingWishlist, setIsAddingWishlist] = useState(false);
  const [wishlists, setWishlists] = useState<Array<any>>([]);
  const [isEditingWishlist, setIsEditingWishlist] = useState<string | null>(
    null
  );
  const location = useLocation();
  const isDesktop = useMediaQuery({ minWidth: 1200 });
  const { logout } = useAuth();

  useEffect(() => {
    setIsEditingWishlist(null);
    setIsAddingWishlist(false);
    setIsEditing(false);
  }, [location.key]);

  // Načtení dat o profilu a wishlistech z API
  useEffect(() => {
    const fetchData = async () => {
      setShowSpinner(true);
      try {
        // Zde načteme data o profilu z API
        const fetchProfileData = async () => {
          const res = await fetchWithAuth("profileData/profile", {
            method: "GET",
            credentials: "include", // Posílání cookies
          });

          if (!res.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await res.json();

          data.birthdate != null
            ? (data.birthdate = new Date(data.birthdate))
            : null;
          data.created_at = new Date(data.created_at);
          setProfileData(data);
        };

        // Zde načteme data o zájemch profilu z API
        const fetchProfileInterests = async () => {
          const res = await fetchWithAuth("profileData/profileInterest", {
            method: "GET",
            credentials: "include", // Posílání cookies
          });

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
          const res = await fetchWithAuth(`profileData/wishlistsData`, {
            method: "GET",
            credentials: "include", // Posílání cookies
          });

          if (!res.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await res.json();
          setWishlists(data);
          //console.log('Fetched wishlists: ');
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
      title: t("app.swal.logOut.title"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#8F84F2",
      confirmButtonText: t("app.swal.logOut.confirmButtonText"),
      cancelButtonText: t("app.swal.logOut.cancelButtonText"),
    });

    if (result.isConfirmed) {
      try {
        await logout(); // Use the AuthContext logout function
        Swal.fire({
          title: t("app.swal.success.title"),
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: t("app.swal.error.title"),
          icon: "error",
        });
      }
    }
  };

  const handleSaveProfile = async function (
    updatedProfileData: ProfileData,
    updatedInterests: Array<{ value: string; label: string; id: string }>,
    file: File | null
  ) {
    setShowSpinner(true);
    console.log("Typ souboru: " + file?.type);
    console.log("File size: " + file?.size);

    // Checknu jestli byl opravdu zvolen soubor s reálnou velikostí a jménem
    if (file && file.size > 0 && file.name) {
      // Validace formátu souboru
      if (
        ![
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ].includes(file.type)
      ) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Only JPEG, JPG, and PNG files are allowed!",
        });
        setShowSpinner(false);
        return;
      }

      // Validace velikosti souboru
      if (file.size > 2097152) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "File size should be less than 2MB!",
        });
        setShowSpinner(false);
        return;
      }
    }

    const formData = new FormData();

    // Přidání JSON dat
    formData.append("profile", JSON.stringify(updatedProfileData));
    formData.append(
      "interests",
      JSON.stringify(updatedInterests.map((interest) => interest.id))
    );

    // Přidání souboru, pouze pokud existuje a má velikost
    if (file && file.size > 0 && file.name) {
      formData.append("file", file);
    }

    try {
      console.log("Sending data to server...");
      console.log(JSON.stringify(updatedProfileData));

      const res = await fetchWithAuth("profileData/updateProfile", {
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
    try {
      const res = await fetchWithAuth("profileData/addWishlist", {
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

      console.log("Sending data to server...");
      console.log(
        JSON.stringify({
          name: wishlistName,
          profileId: profileData?.id,
        })
      );

      const data = await res.json();
      if (data.success) {
        console.log("Wishlist added successfully.");
        setIsAddingWishlist(false);

        // TODO: reload or update the wishlists
      } else {
        console.error("Error adding wishlist:", data.message);
      }
    } catch (error) {
      console.error("Error adding wishlist:", error);
    }
  };

  const handleDeleteWishlist = async (wishlistId: string) => {
    const result = await Swal.fire({
      title: t("app.swal.deleteWishlist.title"),
      text: t("app.swal.deleteWishlist.text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#8F84F2",
      confirmButtonText: t("app.swal.deleteWishlist.confirmButtonText"),
      cancelButtonText: t("app.swal.deleteWishlist.cancelButtonText"),
    });

    if (result.isConfirmed) {
      const res = await fetchWithAuth(
        `profileData/deleteWishlist/${wishlistId}`,
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

    setShowSpinner(true);
    try {
      const res = await fetchWithAuth(
        `profileData/updateWishlist/${wishlistId}`,
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

      console.log("Sending data to server...");
      console.log(
        JSON.stringify({
          items: items,
        })
      );

      const data = await res.json();

      if (data.success) {
        console.log("Wishlist updated successfully.");
        setIsEditingWishlist(null);
      } else {
        // Vypíšeme chybu
        console.error("Error updating wishlist:", data.message);
      }
    } catch (error) {
      console.error("Error saving wishlist:", error);
    } finally {
      setShowSpinner(false);
    }
  };

  // Načtení předefinovaných interest z db při editaci profilu
  useEffect(() => {
    if (isEditing) {
      const fetchAvailableInterests = async () => {
        try {
          const res = await fetchWithAuth("profileData/interests", {
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

    if (profileData?.birthdate && !isNaN(profileData.birthdate.getTime())) {
      const year = profileData!.birthdate.getFullYear();
      const month = String(profileData!.birthdate.getMonth() + 1).padStart(
        2,
        "0"
      );
      const day = String(profileData!.birthdate.getDate()).padStart(2, "0");

      formattedBirthDate = `${year}-${month}-${day}`;
    }

    return (
      <div className="profile-container container p-4 rounded">
        <div className="profile-edit-form">
          <h2>{t("profile.editProfile.title")}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const birthDateValue = formData.get("birthdate") as string;

              const updatedProfileData: any = {
                id: profileData!.id,
                name: formData.get("name") as string,
                photo_url: profileData!.photo_url, // Keep the existing photo_url
                bio: formData.get("bio") as string,
                birthdate:
                  birthDateValue && birthDateValue.trim() !== ""
                    ? new Date(birthDateValue)
                    : null,
              };
              const file = formData.get("photo") as File;
              handleSaveProfile(updatedProfileData, selectedInterests, file);
              //console.log(updatedProfileData);
              //console.log(selectedInterests.map((interest) => interest.id));
            }}
          >
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                {t("profile.editProfile.name")}
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
                {t("profile.editProfile.photo")}
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
                {t("profile.editProfile.bio")}
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
                {t("profile.editProfile.birthdate")}
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
                {t("profile.editProfile.interests")}
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
                placeholder={t("profile.editProfile.interests")}
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

            <div className="my-3 flex">
              <p className="m-0 me-3">
                {t("profile.editProfile.prefferedLanguage")}:
              </p>
              <LanguageSwitcher />
            </div>

            <div className="flex">
              <button type="submit" className="btn btn-service btn-primary">
                {t("app.buttons.save")}
              </button>
              <button
                type="button"
                className="btn btn-secondary mx-2"
                onClick={() => setIsEditing(false)}
              >
                {t("app.buttons.cancel")}
              </button>
            </div>
          </form>
        </div>
        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
      </div>
    );
  }

  // Zobrazení formuláře pro přidání wishlistu
  if (isAddingWishlist) {
    return (
      <div className="profile-container p-4 rounded add-wishlist-container">
        <h2>{t("profile.addWishlist")}</h2>
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
              {t("profile.wishlistName")}
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

          <div className="flex">
            <button type="submit" className="btn btn-service btn-primary">
              {t("app.buttons.save")}
            </button>
            <button
              type="button"
              className="btn btn-secondary mx-2"
              onClick={() => setIsAddingWishlist(false)}
            >
              {t("app.buttons.cancel")}
            </button>
          </div>

        </form>
      </div>
    );
  }

  // Zobrazení formuláře pro editaci wishlistu
  if (isEditingWishlist) {
    const wishlist = wishlists.find((w) => w.id === isEditingWishlist);

    //console.log("Wishlist for edit: ", wishlist);

    if (!wishlist) return null;

    const sortedItems = [...wishlist.items].sort((a, b) => {
      const dateA = a.last_modified ? new Date(a.last_modified).getTime() : 0;
      const dateB = b.last_modified ? new Date(b.last_modified).getTime() : 0;

      if (dateA !== dateB) {
        return dateB - dateA;
      }

      // Fallback podle názvu
      const nameA = a.name?.toLowerCase() ?? "";
      const nameB = b.name?.toLowerCase() ?? "";
      return nameA.localeCompare(nameB);
    });

    return (
      <WishlistEditForm
        items={sortedItems}
        name={wishlist.name}
        id={isEditingWishlist}
        onSubmit={(items) => handleSaveWishlist(wishlist.id, items)}
        onClickBack={() => setIsEditingWishlist(null)}
      />
    );
  }

  return (
    <>
      <div className="profile-container container p-4 rounded">
        {!isDesktop ? (
          <>
            <div className="profile-welcome">
              <button
                className="btn btn-service logout-btn"
                onClick={handleLogOut}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
              <h2 className="my-2">
                {t("profile.hi", { name: profileData?.name.split(" ")[0] })}
              </h2>
            </div>

            <hr className="my-4" />
          </>
        ) : (
          <UpperPanel
            name={t("profile.hi", { name: profileData?.name.split(" ")[0] })}
          />
        )}

        <div className="desktop-split-view">
          <div className="desktop-split-view-left">
            <div className="profile-header my-4">
              <div className="profile-header-first d-flex">
                {/* <img
                  src={
                    profileData?.photo_url ||
                    "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg"
                  }
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg";
                  }}
                  alt="Profile"
                  className="profile-picture rounded-circle me-3 shadow "
                /> */}
                <UserAvatar
                  imgSrc={profileData?.photo_url}
                  altText="Profile"
                  className="profile-picture rounded-circle me-3 shadow"
                />
                <button
                  className="btn btn-service btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  {t("profile.edit")}
                </button>
              </div>

              <div className="flex-grow-1">
                <h3 className="mb-0">{profileData?.name}</h3>
              </div>
            </div>

            {isDesktop ? (
              <div className="profile-tags-and-info">
                <div className="tags my-4">
                  {profileInterests && profileInterests.length > 0 ? (
                    profileInterests.map((interest: any, index: number) => (
                      <span key={index} className="badge bg-secondary me-2">
                        {interest.name}
                      </span>
                    ))
                  ) : (
                    <span className="badge bg-secondary me-2">
                      {t("profile.noInterests")}
                    </span>
                  )}
                </div>
                <div className="profile-info">
                  <div className="profile-info-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-gift"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 4v2h6V4H1zm8 0v2h6V4H9zm5 3H9v8h4.5a.5.5 0 0 0 .5-.5V7zm-7 8V7H2v7.5a.5.5 0 0 0 .5.5H7z" />
                    </svg>
                    <p>
                      {t("profile.wishlistsCount", { count: wishlists.length })}
                    </p>
                  </div>
                  <div className="profile-info-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-envelope"
                      viewBox="0 0 16 16"
                    >
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
                    </svg>
                    <p>
                      {t("profile.email")}: {profileData?.email}
                    </p>
                  </div>
                  <div className="profile-info-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-calendar-check"
                      viewBox="0 0 16 16"
                    >
                      <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                    </svg>
                    <p>
                      {t("profile.joinedDate", {
                        date: profileData?.created_at?.toLocaleDateString(),
                      })}
                    </p>
                  </div>
                  <div className="profile-info-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-cake2"
                      viewBox="0 0 16 16"
                    >
                      <path d="m3.494.013-.595.79A.747.747 0 0 0 3 1.814v2.683c-.149.034-.293.077-.427.129A4.03 4.03 0 0 0 1.348 5.5H.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5h-.651a4.03 4.03 0 0 0-1.225-.871c-.134-.052-.278-.095-.427-.129V1.814A.747.747 0 0 0 13.1.803l-.595-.79A.751.751 0 0 0 11.9 0h-1.3a.751.751 0 0 0-.6.013A.752.752 0 0 0 9.4 0h-1.3a.751.751 0 0 0-.6.013A.752.752 0 0 0 6.9 0H5.6a.751.751 0 0 0-.6.013zM4.5 5.5c.128 0 .256.016.384.033.13.017.259.053.384.1.125.047.24.112.34.184.102.073.186.167.247.273l.922 1.198.922-1.198a.75.75 0 0 1 .247-.273c.1-.072.215-.137.34-.184.125-.047.255-.083.384-.1.128-.017.256-.033.384-.033a2.53 2.53 0 0 1 1.25.328c.383.193.692.474.886.83.194.356.308.762.308 1.342v5.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V8c0-.58.114-.986.308-1.342.194-.356.503-.637.886-.83.383-.193.802-.328 1.25-.328zm8.5 0c.128 0 .256.016.384.033.13.017.259.053.384.1.125.047.24.112.34.184.102.073.186.167.247.273l.922 1.198.922-1.198a.75.75 0 0 1 .247-.273c.1-.072.215-.137.34-.184.125-.047.255-.083.384-.1.128-.017.256-.033.384-.033.447 0 .867.135 1.25.328.383.193.692.474.886.83.194.356.308.762.308 1.342v5.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V8c0-.58.114-.986.308-1.342.194-.356.503-.637.886-.83.383-.193.802-.328 1.25-.328zM1 14V6.5h.551a.5.5 0 0 1-.109.343l-.892 1.159a.5.5 0 0 0-.05.545.5.5 0 0 0 .445.255h7.11a.5.5 0 0 0 .445-.255.5.5 0 0 0-.05-.545l-.892-1.159a.5.5 0 0 1-.109-.343h1.3a.5.5 0 0 1-.108.343l-.893 1.159a.5.5 0 0 0-.05.546.5.5 0 0 0 .445.254h7.11a.5.5 0 0 0 .445-.254.5.5 0 0 0-.05-.546l-.893-1.159a.5.5 0 0 1-.107-.343h.55V14H1z" />
                    </svg>
                    <p>
                      {t("profile.birthday")}:{" "}
                      {profileData?.birthdate?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="tags my-4">
                {profileInterests && profileInterests.length > 0 ? (
                  profileInterests.map((interest: any, index: number) => (
                    <span key={index} className="badge bg-secondary me-2">
                      {interest.name}
                    </span>
                  ))
                ) : (
                  <span className="badge bg-secondary me-2">
                    {t("profile.noInterests")}
                  </span>
                )}
              </div>
            )}

            <div className="bio my-4 alert alert-secondary">
              <p>
                {" "}
                <strong>{t("profile.aboutMe")}: </strong>
                {profileData?.bio}
              </p>
              <p>
                <strong>{t("profile.birthday")}: </strong>{" "}
                {profileData?.birthdate?.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="desktop-split-view-right">
            <div className="my-4 my-wishlists-wrapper">
              <div className="profile-wishlists my-4">
                <h4 className="mt-4 no-mb-desktop">{t("profile.wishlists")}</h4>
                <button
                  className="btn btn-service btn-primary"
                  onClick={() => setIsAddingWishlist(true)}
                >
                  {t("profile.addWishlist")}
                </button>
              </div>

              <div className="wishlists-container my-4">
                {wishlists.length === 0 && (
                  <div className="alert alert-secondary">
                    {t("profile.noWishlists")}
                  </div>
                )}
                {wishlists.map((wishlist) => (
                  <WishlistThumbnail
                    showButtons={true}
                    key={wishlist.id}
                    title={wishlist.name}
                    imageUrls={wishlist.items.map(
                      (item: any) => item.photo_url
                    )}
                    onDelete={() => handleDeleteWishlist(wishlist.id)}
                    onEdit={() => setIsEditingWishlist(wishlist.id)}
                    onClick={() => {
                      setIsEditingWishlist(wishlist.id);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoadingSpinner className={showSpinner ? "" : "hidden"} />
    </>
  );
};

export default Profile;
