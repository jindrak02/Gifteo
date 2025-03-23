import React, { useState, useEffect} from "react";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

interface PersonThumbnailProps {
    user_id?: string;
    name: string;
    photo_url: string;
    profile_id: string;
}

const PersonThumbnail = ( {user_id, name, photo_url} : PersonThumbnailProps ) => {
    const [showSpinner, setShowSpinner] = useState(false);

    return (
        <>
            <div className="person-thumbnail my-4" id={user_id}>
                <div className="person-thumbnail-buttons">
                    <div className='flex' onClick={() => console.log('clicked')} >
                        <img
                        src={photo_url}
                        alt={name}
                        className="profile-picture-thumbnail rounded-circle me-3 shadow"
                        />
                        <h3 className="person-thumbnail-name">{name}</h3>
                    </div>
                </div>
            </div>

            <LoadingSpinner className={showSpinner ? "" : "hidden"} />
        </>
    );
};

export default PersonThumbnail;