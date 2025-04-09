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
}

const EventThumbnail: React.FC<EventThumbnailProps> = ({
    countryCode,
    eventId,
    eventName,
    eventDate,
    eventFor,
    eventForPhoto,
    source
}) => {
    const formattedDate = countryCode ? formatDate(eventDate, countryCode) : eventDate;
    

    // Determine the image to display
    const imageUrl = (eventForPhoto || "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg") || "https://via.placeholder.com/50";
    
    // Determine label based on event source
    const sourceLabel = source === "global" ? "Global Event" : "Personal Event";
    const sourceClass = source === "global" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex-column hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-semibold">{eventName}</h3>
            
            <div className="flex">
                <div className="">
                    <img 
                        src={imageUrl} 
                        alt={eventFor || "Event"} 
                        className="profile-picture-thumbnail-sm rounded-circle object-cover"
                    />
                </div>
                <div className="mx-4">
                    <p className="text-gray-600">{formattedDate}</p>
                    {eventFor && <p className="text-sm text-gray-500">For: {eventFor}</p>}
                </div>
                
            </div>

            <div className='flex-end'>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${sourceClass}`}>
                    {sourceLabel}
                </span>
            </div>
        </div>
    );
};

export default EventThumbnail;