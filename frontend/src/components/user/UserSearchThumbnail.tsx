import React from 'react';

interface UserSearchThumbnailProps {
  name: string;
  profilePicture: string; // Add profile picture prop
  onInvite: () => void;
  connectionStatus: 'pending' | 'accepted' | 'rejected' | null;
}

const UserSearchThumbnail: React.FC<UserSearchThumbnailProps> = ({ name, profilePicture, onInvite, connectionStatus }) => {
  return (
    <div className="user-thumbnail">
      <div className="user-thumbnail-content">
        <img src={profilePicture} alt={`${name}'s profile`} className="user-thumbnail-image" /> {/* Add profile picture */}
        <span className="user-thumbnail-name">{name}</span>
      </div>

      {connectionStatus === 'pending' && (
        <span className="badge text-bg-secondary">Pending</span>
      )}

      {connectionStatus === 'accepted' && (
        <span className="badge text-bg-secondary">Accepted</span>
      )}
      
      {connectionStatus === null && (
      <button className="btn-service rounded btn btn-primary" onClick={onInvite}>Invite</button>
      )}
    </div>
  );
};

export default UserSearchThumbnail;
