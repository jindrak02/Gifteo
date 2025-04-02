import React from 'react'

interface PersonThumbnailProps {
    personId?: string;
    name: string;
    imageUrl: string;
    wishlists: string[];
    onDelete?: () => void;
    onDetail?: () => void;
}

const PersonThumbnail = ({ personId, name, imageUrl, wishlists, onDelete, onDetail }: PersonThumbnailProps) => {
    return (
      <div className="person-thumbnail my-4">

        <div className="person-thumbnail-buttons">
          <div className='flex' onClick={onDetail}>
            
            <h3 className="person-thumbnail-name">{name}</h3>
          </div>
          {onDelete && (
            <button className='btn btn-light btn-sm' onClick={onDelete}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-trash-fill"
                viewBox="0 0 16 16"
              >
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
              </svg>
            </button>
          )}
        </div>

        <div className="person-thumbnail-content" onClick={onDetail}>
          <img
           src={imageUrl}
           alt={name}
           className="profile-picture-thumbnail-lg rounded-circle me-3 shadow"
          />
          <ul className="person-thumbnail-wishlists">
            {wishlists.length > 0 ? (wishlists.map((wishlist, index) => (
              <li key={index}>{wishlist}</li>
            ))) : (<p>This user has no wishlists yet 🥲</p>)}
          </ul>
        </div>

      </div>
    );
};

export default PersonThumbnail;