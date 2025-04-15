import React, { useState } from "react";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import Swal from "sweetalert2";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import UpperPanel from "../../../components/ui/UpperPanel";
import { useTranslation } from "react-i18next";

interface EditEventFormProps {
    event: Event
    onClose: () => void;
    onEventEdited: (eventId: string) => void;
    connectedPersons: {
        name: string;
        photoUrl: string;
        profileId: string;
    }[];
}

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

const EditEventForm: React.FC<EditEventFormProps> = ({
    event,
    onClose,
    onEventEdited,
    connectedPersons,
}) => {
    const { t } = useTranslation();

    const formatDateForInput = (date: string) => {
        const localDate = new Date(date);

        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Měsíce jsou 0-indexované
        const day = String(localDate.getDate()).padStart(2, '0');

        // console.log('Vstup:', date);
        // console.log('Výstup:', localDate);
        // console.log('Formát:', `${year}-${month}-${day}`);
        return `${year}-${month}-${day}`;
    }

    const [eventName, setEventName] = useState(event.eventName);
    const [eventDate, setEventDate] = useState(formatDateForInput(event.eventDate));
    const [selectedPerson, setSelectedPerson] = useState<string | undefined>(event.eventForId || undefined);
    const [notifications, setNotifications] = useState<number[]>(event.notifications || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newNotification, setNewNotification] = useState<number>(1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!eventName || !eventDate) {
            Swal.fire({
                icon: "error",
                title: t("app.swal.missingInformation.title"),
                text: t("app.swal.missingInformation.text"),
            });
            return;
        }

        setIsSubmitting(true);
        
        try {

            console.log('Submitting event:', {
                name: eventName,
                date: eventDate,
                profileId: selectedPerson || null,
                notifications: notifications
            });
            
            
            const res = await fetchWithAuth(`calendar/events/${event.eventId}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: eventName,
                    date: eventDate,
                    profileId: selectedPerson || null,
                    notifications: notifications
                }),
            });

            const data = await res.json();

            if (data.success) {
                Swal.fire({
                icon: "success",
                title: t("app.swal.eventUpdatedSuccess.title"),
                text: t("app.swal.eventUpdatedSuccess.text"),
                });
                onEventEdited(data.eventId);
            } else {
                console.error("Error creating event:", data.message);
                Swal.fire({
                icon: "error",
                title: "Error",
                text: data.message || "Failed to create event.",
                });
            }
            

        } catch (error) {
            console.error("Error creating event:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to create event.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const addNotification = () => {
        if (notifications.length >= 3) {
            setNewNotification(1);
            Swal.fire({
                icon: "warning",
                title: t("app.swal.maxNotificationsReached.title"),
                text: t("app.swal.maxNotificationsReached.text"),
            });
            return;
        }
        if (newNotification > 0 && !notifications.includes(newNotification)) {
        setNotifications([...notifications, newNotification]);
        setNewNotification(1);
        }
    };

    const removeNotification = (days: number) => {
        setNotifications(notifications.filter((n) => n !== days));
    };

    return (
        <>
            <UpperPanel
                name={t("myCalendar.editEvent", { eventName: event.eventName })}
                onClickBack={onClose}
            />

            <div className="card shadow-lg max-w-lg mx-auto mt-5">

                <div className="card-header bg-primary text-white py-3">
                    <h5 className="mb-0">{t("myCalendar.editEvent", { eventName: event.eventName })}</h5>
                </div>

                <div className="card-body p-4">

                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">
                            <label htmlFor="eventName" className="form-label">
                                {t("myCalendar.eventNameLabel")}
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="eventName"
                                placeholder={t('myCalendar.eventNamePlaceholder')}
                                maxLength={50}
                                minLength={3}
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="eventDate" className="form-label">
                                {t("myCalendar.eventDateLabel")}
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                id="eventDate"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="person" className="form-label">
                                {t("myCalendar.personLabel")}
                            </label>
                            <select
                                className="form-select"
                                id="person"
                                value={selectedPerson}
                                onChange={(e) => setSelectedPerson(e.target.value !== "undefined" ? e.target.value : undefined)}
                            >
                                <option value="undefined">{t("myCalendar.selectPerson")}</option>

                                {connectedPersons.map((person) => (
                                <option key={person.profileId} value={person.profileId}>
                                    {person.name}
                                </option>
                                ))}

                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">{t("myCalendar.notificationsLabel")}</label>
                            <div className="d-flex mb-2">
                                <input
                                    type="number"
                                    className="form-control me-2"
                                    min="1"
                                    max="365"
                                    value={newNotification}
                                    onChange={(e) => setNewNotification(parseInt(e.target.value))}
                                />
                                    <span className="me-2 d-flex align-items-center">{t("myCalendar.daysBefore")}</span>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={addNotification}
                                >
                                    {t("myCalendar.addNotification")}
                                </button>
                            </div>

                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {notifications.map((days) => (
                                    <div key={days} className="badge bg-light text-dark p-2">
                                        {days} {t("myCalendar.daysBefore")}
                                        <button
                                            type="button"
                                            className="btn-close ms-2"
                                            style={{ fontSize: "0.5rem" }}
                                            onClick={() => removeNotification(days)}
                                        ></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-4">
                            <button
                                type="button"
                                className="btn btn-outline-secondary me-2"
                                onClick={onClose}
                            >
                                {t("myCalendar.cancel")}
                            </button>

                            <button
                                type="submit"
                                className="btn btn-service"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {t("myCalendar.updating")}
                                </>
                                ) : (
                                t("myCalendar.updateEvent")
                                )}
                            </button>
                        </div>

                    </form>

                </div>

            </div>

            <LoadingSpinner className={isSubmitting ? "" : "hidden"} />
        </>
    );
};

export default EditEventForm;