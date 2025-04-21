import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchWithAuth } from "../utils/fetchWithAuth";

interface Invitation {
    id: string;
    senderName: string;
    senderProfilePicture?: string;
    createdAt: string;
}

interface InvitationContextType {
    invitations: Invitation[];
    fetchInvitations: () => Promise<void>;
}

const InvitationContext = createContext<InvitationContextType | undefined>(undefined);

export const InvitationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);

    const fetchInvitations = async () => {
        try {
            const res = await fetchWithAuth(
                "personsData/invitations",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (data) {
                //console.log("Fetched invitations data:", data);
                setInvitations(data);
            } else {
                console.error("Error fetching user invitations");
            }
        } catch (error) {
            console.error("Error fetching invitations data:", error);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    return (
        <InvitationContext.Provider value={{ invitations, fetchInvitations }}>
            {children}
        </InvitationContext.Provider>
    );
};

export const useInvitations = () => {
    const context = useContext(InvitationContext);
    if (context === undefined) {
        throw new Error('useInvitations must be used within an InvitationProvider');
    }
    return context;
};