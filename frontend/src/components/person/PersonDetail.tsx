import React, { useState, useEffect } from "react";
import WishlistThumbnail from "../wishlist/WishlistThumbnail";
import LoadingSpinner from "../ui/LoadingSpinner";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import WishlistDetail from "../wishlist/WishlistDetail";

type PersonDetailProps = {
    personId: string;
};

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
                    `http://localhost:3000/api/personsData/PersonDetails/${props.personId}`,
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

    if (showWishlistDetail !== null) {
        // console.log("Show wishlist detail", showWishlistDetail);
        return (
            <>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-secondary" onClick={() => setShowWishlistDetail(null)}>
                        Close wishlist
                    </button>
                </div>
                <WishlistDetail wishlistId={showWishlistDetail} />
            </>
        );
    }

    return (
      <>
        <div className="profile-container container rounded">
          <div className="profile-header my-4">
            <div className="profile-header-first d-flex">
              <img
                src={personData?.photo_url}
                alt="Profile"
                className="profile-picture rounded-circle me-3 shadow "
              />
            </div>

            <div className="flex-grow-1">
              <h3 className="mb-0">{personData?.name}</h3>
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

          <div className="bio my-4">
            <p>{personData?.bio}</p>
            <p>
              <strong>Birthday: </strong>
              {personData?.birthdate
                ? new Date(personData.birthdate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

            <div className="my-4 my-wishlists-wrapper">

                {personData?.wishlists.map((wishlist) => (
                    <div className="wishlists-container my-4"  key={wishlist.wishlist_id} onClick={() => setShowWishlistDetail(wishlist.wishlist_id)}>
                        <WishlistThumbnail
                            showButtons={false}
                            key={wishlist.wishlist_id}
                            title={wishlist.name}
                            imageUrls={wishlist.items}
                        />
                    </div>
                ))}
            </div>
        </div>

        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
      </>
    );
};

export default PersonDetail;