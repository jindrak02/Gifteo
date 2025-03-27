import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface Invitation {
    id: string;
    ownerName: string;
    ownerPhoto: string;
    wishlistCopyName: string;
    forPesonName: string;
    createdAt: Date;
}

interface InvitationsProps {
    invitationsProp: Invitation[];
}

const Invitations= ( { invitationsProp }: InvitationsProps) => {
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [invitations, setInvitations] = useState<Invitation[]>(invitationsProp);
    
    const handleAccept = async (invitationId: string) => {
        Swal.fire({
            title: 'Accept invitation',
            text: 'You are about to accept this invitation.',
            icon: 'warning',    
            showCancelButton: true,
            confirmButtonText: 'Yes, accept it!',   
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Accept invitation
                setShowSpinner(true);
                try {
                    const res = await fetchWithAuth(`http://localhost:3000/api/wishlistHub/acceptInvitation/${invitationId}`, {
                        method: 'PATCH',
                        credentials: 'include',
                    });

                    const data = await res.json();

                    if (data.success) {
                        console.log('Invitation accepted:', data);
                        setInvitations(invitations.filter(invitation => invitation.id !== invitationId));
                        Swal.fire({
                            title: 'Invitation accepted',
                            icon: 'success',
                        });
                    } else {
                        console.error('Error accepting invitation:', data);

                        if (data.message === 'Person not found in user persons') {
                            Swal.fire({
                                title: 'Person not found',
                                text: 'Person that wishlist is for is not in your persons list. You need to add them first.',
                                icon: 'error',
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error accepting invitation:', error);
                } finally {
                    setShowSpinner(false);
                }
            }
        });
    };

    const handleReject = async (invitationId: string) => {
        Swal.fire({
            title: 'Reject invitation',
            text: 'You are about to reject this invitation.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, reject it!',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Reject invitation
                setShowSpinner(true);
                try {
                    const res = await fetchWithAuth(`http://localhost:3000/api/wishlistHub/declineInvitation/${invitationId}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });

                    const data = await res.json();

                    if (data.success) {
                        console.log('Invitation rejected:', data);
                    } else {
                        console.error('Error rejecting invitation:', data);
                    }
                } catch (error) {
                    console.error('Error rejecting invitation:', error);
                } finally {
                    // Remove invitation from list
                    setInvitations(invitations.filter(invitation => invitation.id !== invitationId));
                    setShowSpinner(false);

                    Swal.fire({
                        title: 'Invitation rejected',
                        icon: 'success',
                    });
                }
            }
        });
    };
        

    return (
        <>
            <div className="invitations-container profile-container">
                
                {invitations.length === 0 ? (
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                    You don't have any pending invitations at the moment.
                    </div>
                    ) : (
                    <ul className="space-y-4 invitation-list">
                        <p className='text-center'>You are invited to the following wishlists:</p>
                        {invitations
                            .map(invitation => (
                            <li key={invitation.id} className="invitation-item">
                                <div className="user-thumbnail">
                                    <div className="user-thumbnail-content">
                                        {invitation.ownerPhoto ? (
                                        <img 
                                            src={invitation.ownerPhoto} 
                                            alt={`${invitation.ownerName}'s profile`} 
                                            className="user-thumbnail-image"
                                        />
                                        ) : (
                                        <div className="user-thumbnail-image flex items-center justify-center bg-gray-300">
                                            {invitation.ownerName.charAt(0)}
                                        </div>
                                        )}
                                        <div>
                                            <div className="user-thumbnail-name">{invitation.ownerName}</div>
                                            <div className="text-xs text-gray-500">
                                                Inviting you to {invitation.wishlistCopyName} wishlist for user <b>{invitation.forPesonName}</b> <br />
                                                Sent: {new Date(invitation.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                
                                    <div className="invitation-actions flex space-x-2">
                                        <button 
                                        onClick={() => handleAccept(invitation.id)}
                                        className="p-2 rounded-full hover:bg-green-600"
                                        title="Accept invitation"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check" viewBox="0 0 16 16">
                                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                                            </svg>
                                        </button>
                                        <button 
                                        onClick={() => handleReject(invitation.id)}
                                        className="p-2 rounded-full hover:bg-red-600"
                                        title="Reject invitation"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
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