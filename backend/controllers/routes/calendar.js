import express from "express";
import cookieParser from "cookie-parser";
import pool from "../../config/db.js";
import { authenticateUser } from "../../middlewares/authMiddleware.js";
import { hasUserPerson } from "../../middlewares/personAccessMiddleware.js";
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

function sanitize(input){
  return purify.sanitize(input);
}

const router = express.Router();
router.use(cookieParser());
router.use(express.json());

// GET /api/calendar/events/upcoming, vrátí všechny nadcházející události v následujícíh 365 dnech pro uživatele
router.get("/events/upcoming", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    
    if (!userId) {
        return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }

    try {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 365);

        const countryCodeQuery = `
            SELECT country_code FROM "user" WHERE id = $1
        `;
        const countryCodeResult = await pool.query(countryCodeQuery, [userId]);
        const countryCode = countryCodeResult.rows[0]?.country_code || 'WW';

        const eventsQuery = `
            -- User-specific events
            SELECT 
                'calendar' AS source,
                ce.id AS "eventId",
                ce.name AS "eventName",
                ce.date AS "eventDate",
                p.name AS "eventFor",
                p.photo_url AS "eventForPhoto",
                cen.days_before AS "notification"
            
            FROM "calendarEvent" ce
            LEFT JOIN "profile" p ON ce.profile_id = p.id
            LEFT JOIN "calendarEventNotification" cen ON ce.id = cen.event_id

            WHERE created_by_user_id = $1
            AND date BETWEEN $2 AND $3

            UNION ALL

            -- Global events
            SELECT
                'global' AS source,
                id AS "eventId",
                name AS "eventName",
                make_date(EXTRACT(YEAR FROM $2::date)::int, month, day) AS "eventDate",
                '' AS "eventFor",
                'https://static-00.iconduck.com/assets.00/globe-icon-2048x2048-5ralwwgx.png' AS "eventForPhoto",
                notification_days_before AS "notification"
            
            FROM "globalEvent"

            WHERE country_code IN ($4)
            AND (
                (day IS NOT NULL AND make_date(EXTRACT(YEAR FROM $2::date)::int, month, day) BETWEEN $2 AND $3)
            )

            ORDER BY 4 ASC;
        `;

        const eventsResult = await pool.query(eventsQuery, [userId, today, endDate, countryCode]);
        const rawRows = eventsResult.rows;

        const eventsMap = rawRows.reduce((acc, row) => {
            const eventId = row.eventId;
            if (!acc[eventId]) {
                acc[eventId] = {
                    eventId: eventId,
                    eventName: sanitize(row.eventName),
                    eventDate: row.eventDate,
                    eventFor: sanitize(row.eventFor),
                    eventForPhoto: row.eventForPhoto,
                    source: row.source,
                    notifications: [],
                };
            }

            if (row.notification !== null) {
                acc[eventId].notifications.push(row.notification);
            }

            return acc;
        }
        , {});

        const events = Object.values(eventsMap);

        res.status(200).json({ success: true, events, countryCode });

    } catch (error) {
        console.log('Error fetching upcoming events:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// POST /api/calendar/events, vytvoří novou událost pro uživatele
router.post("/events", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const { name, date, profileId, notifications } = req.body;

    if (!userId) {
        return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }

    try {
        const sanitizedName = sanitize(name);
        const sanitizedDate = new Date(date);
        const sanitizedProfileId = sanitize(profileId);

        const insertEventQuery = `
            INSERT INTO "calendarEvent" (name, date, created_by_user_id, profile_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        const insertEventResult = await pool.query(insertEventQuery, [sanitizedName, sanitizedDate, userId, sanitizedProfileId]);
        const eventId = insertEventResult.rows[0].id;

        if (notifications && notifications.length > 0) {
            const limitedNotifications = notifications.slice(0, 3);

            for (const notification of limitedNotifications) {
                const insertNotificationQuery = `
                    INSERT INTO "calendarEventNotification" (event_id, days_before)
                    VALUES ($1, $2)
                `;
                await pool.query(insertNotificationQuery, [eventId, sanitize(notification)]);
            }
        }

        res.status(201).json({ success: true, message: "Event created successfully" });

    } catch (error) {
        console.log('Error creating event:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});



export default router;