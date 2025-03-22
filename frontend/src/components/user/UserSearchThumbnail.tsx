import React from 'react';

interface UserSearchThumbnailProps {
  name: string;
  profilePicture: string; // Add profile picture prop
  onInvite: () => void;
}

const UserSearchThumbnail: React.FC<UserSearchThumbnailProps> = ({ name, profilePicture, onInvite }) => {
  return (
    <div className="user-thumbnail">
      <div className="user-thumbnail-content">
        <img src={profilePicture} alt={`${name}'s profile`} className="user-thumbnail-image" /> {/* Add profile picture */}
        <span className="user-thumbnail-name">{name}</span>
      </div>
      <button className="btn-service rounded btn btn-primary" onClick={onInvite}>Invite</button>
    </div>
  );
};

export default UserSearchThumbnail;
