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
                p.photo_url AS "eventForPhoto"
            
            FROM "calendarEvent" ce
            LEFT JOIN "profile" p ON ce.profile_id = p.id
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
                'https://static-00.iconduck.com/assets.00/globe-icon-2048x2048-5ralwwgx.png' AS "eventForPhoto"
            
            FROM "globalEvent"
            WHERE country_code IN ($4)
            AND (
                (day IS NOT NULL AND make_date(EXTRACT(YEAR FROM $2::date)::int, month, day) BETWEEN $2 AND $3)
            )

            ORDER BY 4 ASC;
        `;

        const eventsResult = await pool.query(eventsQuery, [userId, today, endDate, countryCode]);
        const events = eventsResult.rows.map(event => ({
            eventId: event.eventId,
            eventName: sanitize(event.eventName),
            eventDate: event.eventDate,
            eventFor: sanitize(event.eventFor),
            eventForPhoto: event.eventForPhoto,
            source: event.source
        }));

        res.status(200).json({ success: true, events, countryCode });

    } catch (error) {
        console.log('Error fetching upcoming events:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});






export default router;