import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import UpperPanel from "../../components/ui/UpperPanel";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EventThumbnail from "./components/EventThumbnail";
import CreateEventForm from "./components/CreateEventForm";
import EditEventForm from "./components/EditEventForm";
import "../../assets/Calendar.css";
import { useTranslation } from "react-i18next";

interface Event {
    eventId: string;
    eventName: string;
    eventDate: string;
    eventForId: string;
    eventFor: string;
    eventForPhoto: string | null;
    source: string;
    notifications: number[];
}

interface Person {
    name: string;
    photoUrl: string;
    profileId: string;
}

const Calendar = () => {
    const { t } = useTranslation();
    const [showSpinner, setShowSpinner] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [countryCode, setCountryCode] = useState<string | null>(null);
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [isEditingEvent, setIsEditingEvent] = useState<string | null>(null);
    const [connectedPersons, setConnectedPersons] = useState<Person[]>([]);
    const [newEventId, setNewEventId] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        setIsAddingEvent(false);
        setIsEditingEvent(null);
    },[location.key]);

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
                    console.log('Fetched upcoming events:', data.events);
                    
                    setEvents(data.events);
                    setCountryCode(data.countryCode);
                } else {
                    console.error("Error fetching upcoming events:", data.message);
                    Swal.fire({
                        icon: "error",
                        title: t("app.swal.eventError.title"),
                        text: t("app.swal.eventError.text"),
                    });
                }
            } catch (error) {
                console.error("Error fetching upcoming events:", error);
                    Swal.fire({
                    icon: "error",
                    title: t("app.swal.eventError.title"),
                    text: t("app.swal.eventError.text"),
                });
            } finally {
                setShowSpinner(false);
            }
        };

        const fetchPersons = async () => {
          setShowSpinner(true);
          try {
            const res = await fetchWithAuth("personsData/UserPersons", {
              method: "GET",
              credentials: "include",
            });
            const data = await res.json();

            if (data) {
              const newData = data.map((person: any) => ({
                name: person.name,
                photoUrl: person.photo_url,
                profileId: person.profile_id,
              }));

              setConnectedPersons(newData);
              
            } else {
              console.error("Failed to fetch persons data:", data);
            }
          } catch (error) {
            console.error("Error fetching persons:", error);
          } finally {
            setShowSpinner(false);
          }
        };
        
        fetchUpcomingEvents();
        fetchPersons();
    }, [isAddingEvent, isEditingEvent]);

    const handleDeleteEvent = async (eventId: string) => {

        const deleteEvent = async (eventId: string) => {setShowSpinner(true);
            try {
                const res = await fetchWithAuth(`calendar/events/${eventId}`, {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await res.json();
    
                if (data.success) {
                    setEvents(events.filter(event => event.eventId !== eventId));
                    Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: data.message,
                    });
                }
                else {
                    console.error("Error deleting event:", data.message);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: data.message,
                    });
                }
                
            } catch (error) {
                console.error("Error deleting event:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to delete event.",
                });
            } finally {
                setShowSpinner(false);
            }
        }

        Swal.fire({
            title: t("app.swal.deleteEvent.title"),
            text: t("app.swal.deleteEvent.text"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD3333",
            cancelButtonColor: "#8F84F2",
            confirmButtonText: t("app.swal.deleteEvent.confirmButtonText"),
            cancelButtonText: t("app.swal.deleteEvent.cancelButtonText"),
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteEvent(eventId);
            }
        });
    };

    // #region scrollnutí uživatele na referenci nové události
    // Tato část kódu slouží k scrollnutí uživatele na referenci nové události kterou vytvořil pomocí CreateEventForm
    const eventRefs = React.useRef<{[key: string]: React.RefObject<HTMLDivElement | null>}>({});

    useEffect(() => {
        if (newEventId && eventRefs.current[newEventId]?.current) {
            eventRefs.current[newEventId]?.current?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
            
            setTimeout(() => setNewEventId(null), 5000);
        }
    }, [events, newEventId]);

    events.forEach(event => {
        if (!eventRefs.current[event.eventId]) {
            eventRefs.current[event.eventId] = React.createRef<HTMLDivElement>();
        }
    });
    // #endregion

    if(isAddingEvent) {
        return (
            <div className="profile-container p-4">
                <CreateEventForm
                    onClose={() => setIsAddingEvent(false)}
                    connectedPersons={connectedPersons}
                    onEventCreated={(eventId: string) => {
                        setIsAddingEvent(false);
                        setShowSpinner(false);
                        setNewEventId(eventId);
                    }}
                />
            </div>
        );
    }

    if(isEditingEvent !== null) {
        return (
            <div className="profile-container p-4">
                <EditEventForm
                    connectedPersons={connectedPersons}
                    event={events.find(event => event.eventId === isEditingEvent)!}
                    onClose={() => setIsEditingEvent(null)}
                    onEventEdited={(eventId: string) => {
                        setIsEditingEvent(null);
                        setShowSpinner(false);
                        setNewEventId(eventId);
                    }}
                />
            </div>
        );
    }

    return (
        <>
            <div className="profile-container p-4">
                <UpperPanel name={t("myCalendar.title")} />

                <div className="flex justify-between mb-4">
                    <h3 className="text-2xl font-bold">{t("myCalendar.upcomingEvents")}</h3>
                    <button className="btn btn-service btn-primary" onClick={() => setIsAddingEvent(true)}>
                        {t("myCalendar.addEvent")}
                    </button>
                </div>

                <LoadingSpinner className={showSpinner ? "" : "hidden"} />

                {events.length > 0 ? (
                    <div className="mt-4 calendar-events-container">
                        {events.map((event) => (
                            <div
                                key={event.eventId}
                                ref={eventRefs.current[event.eventId]}
                                className={newEventId === event.eventId ? "highlight-new-event calendar-event" : "calendar-event"}
                            >
                                    <EventThumbnail
                                        countryCode={countryCode}
                                        eventId={event.eventId}
                                        eventName={event.eventName}
                                        eventDate={event.eventDate}
                                        eventFor={event.eventFor}
                                        eventForPhoto={event.eventForPhoto}
                                        source={event.source}
                                        notifications={event.notifications}
                                        onEdit={() => {
                                            setIsEditingEvent(event.eventId);
                                        }}
                                        onDelete={() => {
                                            handleDeleteEvent(event.eventId);
                                        }}
                                    />
                            </div>
                        ))}
                    </div>
                ) : (
                    !showSpinner && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">{t("myCalendar.noEvents")}</p>
                        </div>
                    )
                )}
            </div>
        </>
    );
};

export default Calendar;