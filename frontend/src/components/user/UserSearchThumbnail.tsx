import React from 'react';
import { useTranslation } from "react-i18next";
import UserAvatar from './UserAvatar';

interface UserSearchThumbnailProps {
  name: string;
  profilePicture: string; // Add profile picture prop
  onInvite: () => void;
  connectionStatus: 'pending' | 'accepted' | 'rejected' | null;
}

const UserSearchThumbnail: React.FC<UserSearchThumbnailProps> = ({ name, profilePicture, onInvite, connectionStatus }) => {
  const { t } = useTranslation();

  return (
    <div className="user-thumbnail">
      <div className="user-thumbnail-content">
        {/* <img src={profilePicture} alt={`${name}'s profile`} className="user-thumbnail-image" /> */}
        <UserAvatar imgSrc={profilePicture} altText={`${name}'s profile`} className="user-thumbnail-image" />

        <span className="user-thumbnail-name">{name}</span>
      </div>

      {connectionStatus === 'pending' && (
        <span className="badge text-bg-secondary">{t('myPeople.addPerson.userSearchStatusPending')}</span>
      )}

      {connectionStatus === 'accepted' && (
        <span className="badge text-bg-secondary">{t('myPeople.addPerson.userSearchStatusAccepted')}</span>
      )}
      
      {connectionStatus === null && (
      <button className="btn-service rounded btn btn-primary" onClick={onInvite}>{t('myPeople.addPerson.userSearchInvite')}</button>
      )}
    </div>
  );
};

export default UserSearchThumbnail;
