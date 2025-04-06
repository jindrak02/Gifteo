import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import WishlistThumbnail from "../wishlist/WishlistThumbnail";
import LoadingSpinner from "../ui/LoadingSpinner";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import WishlistDetail from "../wishlist/WishlistDetail";

type PersonDetailProps = {
    personId: string;
    person: Person;
    onClickBack: () => void;
};

interface Person {
  user_id: string;
  person_id: string;
  profile_id: string;
  name: string;
  photo_url: string;
  wishlists: { name: string }[];
}

type PersonData = {
    person_id: string;
    name: string;
    photo_url: string;
    bio: string;
    birthdate: Date;
    interests: string[];
    wishlists: {
        wishlist_id: string;
        name: string;
        items: string[];
    }[];
};

const PersonDetail = function (props: PersonDetailProps) {
    const [showSpinner, setShowSpinner] = useState(false);
    const [personData, setPersonData] = useState<PersonData | null>(null);
    const [showWishlistDetail, setShowWishlistDetail] = useState<string | null>(null);

    // Načtení dat osoby
    useEffect(() => {
        const fetchPersonData = async () => {
            setShowSpinner(true);

            try {
                const res = await fetchWithAuth(
                    `personsData/PersonDetails/${props.personId}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (data) {
                    console.log("Fetched person data:", data);
                    setPersonData(data);
                } else {
                    console.error("Error fetching person data");
                }
            } catch (error) {
                console.error("Error fetching person data:", error);
            }

            setShowSpinner(false);
        };

        fetchPersonData();
    }, [props.personId]);

    const handleDelete = async (personId: string, userId: string) => {
          
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
                `personsData/DeletePerson/${personId}`,
                {
                  method: "DELETE",
                  credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ secondUserId: userId }),
                }
              );
    
              const data = await res.json();
    
              if (data.success) {
                console.log(personId + " Deleted");
                props.onClickBack();
              } else {
                console.error("Error deleting person");
                Swal.fire("Error", "Error removing person.", "success");
              }
    
              Swal.fire("Removed", "Your person has been removed.", "success");
            } else {
              console.log(personId + " Delete canceled");
              return;
            }
          });
        };

    if (showWishlistDetail !== null) {
        // console.log("Show wishlist detail", showWishlistDetail);
        return (
            <>
              <div className="profile-container p-4">
                <div className="profile-welcome">
                  <button
                    className="btn-service"
                    onClick={() => setShowWishlistDetail(null)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-arrow-left"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                      />
                    </svg>
                  </button>
                  <h2 className="my-2">My people - {personData?.name.split(' ')[0]}</h2>
                </div>

                <hr className="my-4" />

                <div>
                  <WishlistDetail wishlistId={showWishlistDetail} />
                </div>
              </div>
            </>
        );
    }

    return (
      <>
        <div className="profile-container p-4">
          <div className="profile-welcome">
            <button className="btn-service" onClick={props.onClickBack}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-arrow-left"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                />
              </svg>
            </button>
            <h2 className="my-2">
              My people - {personData?.name.split(" ")[0]}
            </h2>
          </div>

          <hr className="my-4" />

          <div className="profile-container container rounded">
            <div className="profile-header my-4">
              <div className="profile-header-first d-flex">
                <img
                  src={personData?.photo_url}
                  alt="Profile"
                  className="profile-picture rounded-circle me-3 shadow "
                />
              </div>

              <div className="flex-grow-1 flex justify-between">
                <h3 className="mb-0">{personData?.name}</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(props.person.person_id, props.person.user_id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-x-fill" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m6.146-2.854a.5.5 0 0 1 .708 0L14 6.293l1.146-1.147a.5.5 0 0 1 .708.708L14.707 7l1.147 1.146a.5.5 0 0 1-.708.708L14 7.707l-1.146 1.147a.5.5 0 0 1-.708-.708L13.293 7l-1.147-1.146a.5.5 0 0 1 0-.708"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="tags my-4">
              {personData?.interests.map((interest) => (
                <span className="badge bg-secondary me-2" key={interest}>
                  {interest}
                </span>
              ))}

              {/* <span className="badge bg-secondary me-2">🐎 Horse riding</span> */}
            </div>

            <div className="bio my-4 alert alert-secondary">
              <p>{personData?.bio}</p>
              <p>
                <strong>Birthday: </strong>
                {personData?.birthdate
                  ? new Date(personData.birthdate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            <div className="my-4 my-wishlists-wrapper">

              {personData?.wishlists && personData.wishlists.length > 0 ? (
                <div>
                  {personData.wishlists.map((wishlist) => (
                    <div
                      className="wishlists-container my-4"
                      key={wishlist.wishlist_id}
                      onClick={() => setShowWishlistDetail(wishlist.wishlist_id)}
                    >
                      <WishlistThumbnail
                        showButtons={false}
                        key={wishlist.wishlist_id}
                        title={wishlist.name}
                        imageUrls={wishlist.items}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="alert alert-light">
                  This person doesn't have any wishlists yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
      </>
    );
};

export default PersonDetail;