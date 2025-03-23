import React from "react";

interface PersonThumbnailProps {
    user_id?: string;
    name: string;
    photo_url: string;
    profile_id: string;
    onClick: () => void;
}

const PersonThumbnail = ( {user_id, name, photo_url, onClick} : PersonThumbnailProps ) => {

    return (
        <>
            <div className="person-thumbnail my-4" id={user_id}>
                <div className="person-thumbnail-buttons">
                    <div className='flex' onClick={() => onClick()} >
                        <img
                        src={photo_url}
                        alt={name}
                        className="profile-picture-thumbnail rounded-circle me-3 shadow"
                        />
                        <h3 className="person-thumbnail-name">{name}</h3>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PersonThumbnail;