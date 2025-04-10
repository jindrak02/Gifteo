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
    onEdit: () => void;
    onDelete: () => void;
}

const EventThumbnail: React.FC<EventThumbnailProps> = ({
    countryCode,
    eventId,
    eventName,
    eventDate,
    eventFor,
    eventForPhoto,
    source,
    notifications,
    onEdit,
    onDelete
}) => {
    const formattedDate = countryCode ? formatDate(eventDate, countryCode) : eventDate;
    
    const imageUrl = (eventForPhoto || "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg") || "https://via.placeholder.com/50";
    
    const sourceLabel = source === "global" ? "Global Event" : "Personal Event";
    const sourceClass = source === "global" ? "bg-secondary" : "bg-purple text-white";

    return (
      <div className="card shadow-sm mb-3 hover-shadow">
        <div className="card-body">
          <div className="flex justify-content-between">
            <h3 className="card-title fw-semibold">{eventName}</h3>

            {source === "calendar" && (

                <div>
                    <button
                        className="btn btn-light btn-sm me-2"
                        onClick={() => onEdit()}
                    >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-pencil-fill"
                        viewBox="0 0 16 16"
                    >
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"></path>
                    </svg>
                    </button>

                    <button
                        className="btn btn-light btn-sm"
                        onClick={() => onDelete()}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-trash-fill"
                        viewBox="0 0 16 16"
                    >
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"></path>
                    </svg>
                    </button>
                </div>
            )}
          </div>

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
                  <span key={index} className="badge bg-light text-dark me-1">
                    {days} {days === 1 ? "day" : "days"} before
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