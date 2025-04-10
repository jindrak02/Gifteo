import React from 'react';
import formatDate from '../../../utils/formatDateToCountryCode';

interface EventThumbnailProps {
    countryCode: string | null;
    eventId: string;
    eventName: string;
    eventDate: string;
    eventFor: string;
    eventForPhoto: string | null;
    source: string;
    notifications: number[];
}

const EventThumbnail: React.FC<EventThumbnailProps> = ({
    countryCode,
    eventId,
    eventName,
    eventDate,
    eventFor,
    eventForPhoto,
    source,
    notifications
}) => {
    const formattedDate = countryCode ? formatDate(eventDate, countryCode) : eventDate;
    
    const imageUrl = (eventForPhoto || "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg") || "https://via.placeholder.com/50";
    
    const sourceLabel = source === "global" ? "Global Event" : "Personal Event";
    const sourceClass = source === "global" ? "bg-secondary" : "bg-purple text-white";

    return (
        <div className="card shadow-sm mb-3 hover-shadow">
            <div className="card-body">
                <h3 className="card-title fw-semibold">{eventName}</h3>
                
                <div className="d-flex">
                    <div>
                        <img 
                            src={imageUrl} 
                            alt={eventFor || "Event"} 
                            className="profile-picture-thumbnail-sm rounded-circle"
                        />
                    </div>
                    <div className="ms-3">
                        <p className="text-secondary">{formattedDate}</p>
                        {eventFor && <p className="small text-muted">For: {eventFor}</p>}
                    </div>
                </div>

                {notifications && notifications.length > 0 && (
                    <div className="mt-2">
                        <p className="small text-muted">Notifications:</p>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                            {notifications.map((days, index) => (
                                <span 
                                    key={index} 
                                    className="badge bg-light text-dark me-1"
                                >
                                    {days} {days === 1 ? 'day' : 'days'} before
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="d-flex justify-content-end mt-2">
                    <span className={`badge ${sourceClass} rounded-pill px-3`}>
                        {sourceLabel}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EventThumbnail;