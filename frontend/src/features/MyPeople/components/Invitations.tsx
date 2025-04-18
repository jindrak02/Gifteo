import React, { useEffect, useState } from 'react';
import { useInvitations } from '../../../store/InvitationContext';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import Swal from 'sweetalert2';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';
import { useTranslation } from "react-i18next";
import UserAvatar from '../../../components/user/UserAvatar';

interface Invitation {
  id: string;
  senderName: string;
  senderProfilePicture?: string;
  createdAt: string;
}

interface InvitationProps {
  invitationProps: Invitation[];
  onAccept?: () => void;
}

const Invitations: React.FC<InvitationProps> = ({invitationProps, onAccept}) => {
    const { t } = useTranslation();
    const [invitations, setInvitations] = useState<Invitation[]>(invitationProps);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const { fetchInvitations } = useInvitations();

    const handleAccept = async (invitationId: string) => {
        Swal.fire({
            title: t("app.swal.acceptInvitation.title"),	
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: t("app.swal.acceptInvitation.confirmButtonText"),
            cancelButtonText: t("app.swal.acceptInvitation.cancelButtonText"),
        }).then(async (result) => {
            if (result.isConfirmed) {

                setShowSpinner(true);
                try {
                    const res = await fetchWithAuth(
                        `personsData/acceptInvitation/${invitationId}`,
                        {
                            method: 'PATCH',
                            credentials: 'include',
                        }
                    );
                    const data = await res.json();
                    
                    if (data.success) {
                        //console.log('Invitation accepted');
                        setInvitations(invitations.filter(invitation => invitation.id !== invitationId));
                        await fetchInvitations();
                        Swal.fire({
                            title: t("app.swal.invitationAccepted.title"),
                            text: t("app.swal.invitationAccepted.text"),
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                        onAccept && onAccept();
                    } else {
                        console.error('Error accepting invitation:', data);
                    }

                } catch (error) {
                    console.error('Error accepting invitation:', error);
                }
                setShowSpinner(false);
            }
        });
    };

    const handleReject = async (invitationId: string) => {
        Swal.fire({
            title: t("app.swal.declineInvitation.title"),
            text: t("app.swal.declineInvitation.text"),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: t("app.swal.declineInvitation.confirmButtonText"),
            confirmButtonColor: '#dc3545',
            cancelButtonText: t("app.swal.declineInvitation.cancelButtonText"),
        }).then(async (result) => {
            if (result.isConfirmed) {
                
                setShowSpinner(true);
                try {
                    const res = await fetchWithAuth(
                        `personsData/rejectInvitation/${invitationId}`,
                        {
                            method: 'DELETE',
                            credentials: 'include',
                        }
                    );
                    const data = await res.json();
                    
                    if (data.success) {
                        //console.log('Invitation rejected');
                        setInvitations(invitations.filter(invitation => invitation.id !== invitationId));
                        await fetchInvitations();
                        
                        Swal.fire({
                            title: t("app.swal.rejectedInvitation.title"),
                            text: t("app.swal.rejectedInvitation.text"),
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    } else {
                        console.error('Error rejecting invitation:', data);
                    }

                } catch (error) {
                    console.error('Error rejecting invitation:', error);
                }
                setShowSpinner(false);
            }
        });
    };

  return (
    <>
        <div className="invitations-container profile-container">
            
            {invitations.length === 0 ? (
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                    {t("myPeople.invitations.noInvitations")}
                </div>
                ) : (
                <ul className="space-y-4 invitation-list">
                    <p className="text-center">{t("myPeople.invitations.thoseUsersWantToConnect")}</p>
                    {invitations
                        .map(invitation => (
                        <li key={invitation.id} className="invitation-item">
                            <div className="user-thumbnail">
                                <div className="user-thumbnail-content">
                                    {invitation.senderProfilePicture ? (
                                    // <img 
                                    //     src={invitation.senderProfilePicture} 
                                    //     alt={`${invitation.senderName}'s profile`} 
                                    //     className="user-thumbnail-image"
                                    // />
                                    <UserAvatar
                                        imgSrc={invitation.senderProfilePicture}
                                        altText={`${invitation.senderName}'s profile`}
                                        className="user-thumbnail-image"
                                    />
                                    ) : (
                                    <div className="user-thumbnail-image flex items-center justify-center bg-gray-300">
                                        {invitation.senderName.charAt(0)}
                                    </div>
                                    )}
                                    <div>
                                        <div className="user-thumbnail-name">{invitation.senderName}</div>
                                        <div className="text-xs text-gray-500">
                                            {t("myPeople.invitations.invitationSend", {
                                                date: new Date(invitation.createdAt).toLocaleDateString(),
                                            })}
                                        </div>
                                    </div>
                                </div>
                            
                                <div className="invitation-actions flex space-x-2">
                                    <button 
                                    onClick={() => handleAccept(invitation.id)}
                                    className="p-2 rounded-full btn-black"
                                    title={t("app.swal.acceptInvitation.confirmButtonText")}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-check fs-4" viewBox="0 0 16 16">
                                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                                        </svg>
                                    </button>
                                    <button 
                                    onClick={() => handleReject(invitation.id)}
                                    className="p-2 rounded-full btn-black"
                                    title={t("app.swal.declineInvitation.confirmButtonText")}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-x fs-4" viewBox="0 0 16 16">
                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
    </>
  );
};

export default Invitations;
