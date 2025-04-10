import React, { useState } from "react";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import Swal from "sweetalert2";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import UpperPanel from "../../../components/ui/UpperPanel";

interface CreateEventFormProps {
    onClose: () => void;
    onEventCreated: () => void;
    connectedPersons: {
        name: string;
        photoUrl: string;
        profileId: string;
    }[];
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({
    onClose,
    onEventCreated,
    connectedPersons,
}) => {
    const [eventName, setEventName] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [selectedPerson, setSelectedPerson] = useState("");
    const [notifications, setNotifications] = useState<number[]>([14]); // Default 7 days notification
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newNotification, setNewNotification] = useState<number>(1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!eventName || !eventDate) {
        Swal.fire({
            icon: "error",
            title: "Missing information",
            text: "Please fill all required fields.",
        });
        return;
        }

        setIsSubmitting(true);
        
        try {
            
            const res = await fetchWithAuth("calendar/events", {
                method: "POST",
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
                title: "Success",
                text: "Event added successfully!",
                });
                onEventCreated();
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
                title: "Max notifications reached",
                text: "You can only add up to 3 notifications.",
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
                name="Create Event"
                onClickBack={onClose}
            />

            <div className="card shadow-lg max-w-lg mx-auto mt-5">

                <div className="card-header bg-primary text-white py-3">
                    <h5 className="mb-0">Add New Event</h5>
                </div>

                <div className="card-body p-4">

                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">
                            <label htmlFor="eventName" className="form-label">
                                Event Name*
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="eventName"
                                placeholder="Birthday, Anniversary, etc."
                                maxLength={50}
                                minLength={3}
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="eventDate" className="form-label">
                                Event Date*
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
                                Person
                            </label>
                            <select
                                className="form-select"
                                id="person"
                                value={selectedPerson}
                                onChange={(e) => setSelectedPerson(e.target.value)}
                            >
                                <option value="">Select a person</option>
                                {connectedPersons.map((person) => (
                                <option key={person.profileId} value={person.profileId}>
                                    {person.name}
                                </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Notifications</label>
                            <div className="d-flex mb-2">
                                <input
                                    type="number"
                                    className="form-control me-2"
                                    min="1"
                                    max="365"
                                    value={newNotification}
                                    onChange={(e) => setNewNotification(parseInt(e.target.value))}
                                />
                                    <span className="me-2 d-flex align-items-center">days before</span>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={addNotification}
                                >
                                    Add
                                </button>
                            </div>

                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {notifications.map((days) => (
                                    <div key={days} className="badge bg-light text-dark p-2">
                                        {days} {days === 1 ? "day" : "days"} before
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
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-service"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Creating...
                                </>
                                ) : (
                                "Create Event"
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

export default CreateEventForm;