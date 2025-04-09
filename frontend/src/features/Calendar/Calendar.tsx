import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import UpperPanel from "../../components/ui/UpperPanel";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EventThumbnail from "./components/EventThumbnail";

interface Event {
    eventId: string;
    eventName: string;
    eventDate: string;
    eventFor: string;
    eventForPhoto: string | null;
    source: string;
}

const Calendar = () => {
    const [showSpinner, setShowSpinner] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [countryCode, setCountryCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            setShowSpinner(true);
            try {
                const res = await fetchWithAuth("calendar/events/upcoming", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.json();

                if (data.success) {
                    console.log("Upcoming events:", data.events);
                    console.log('Country code: ', data.countryCode);
                    
                    setEvents(data.events);
                    setCountryCode(data.countryCode);
                } else {
                    console.error("Error fetching upcoming events:", data.message);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: data.message,
                    });
                }
            } catch (error) {
                console.error("Error fetching upcoming events:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to fetch upcoming events.",
                });
            } finally {
                setShowSpinner(false);
            }
        };

        fetchUpcomingEvents();
    }, []);

    return (
        <>
            <div className="profile-container p-4">
                <UpperPanel name="My calendar" />

                <h3 className="text-2xl font-bold mb-4">Upcoming Events</h3>

                <LoadingSpinner className={showSpinner ? "" : "hidden"} />

                {events.length > 0 ? (
                    <div className="mt-4">
                        {events.map((event) => (
                            <EventThumbnail
                                countryCode={countryCode}
                                key={event.eventId}
                                eventId={event.eventId}
                                eventName={event.eventName}
                                eventDate={event.eventDate}
                                eventFor={event.eventFor}
                                eventForPhoto={event.eventForPhoto}
                                source={event.source}
                            />
                        ))}
                    </div>
                ) : (
                    !showSpinner && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No upcoming events found.</p>
                        </div>
                    )
                )}
            </div>
        </>
    );
};

export default Calendar;