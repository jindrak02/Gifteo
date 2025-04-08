import { sendEmail } from '../utils/sendEmail.js';
import pool from "../config/db.js";
import dotenv from 'dotenv';
import { format } from 'date-fns';

dotenv.config();

export const checkEvents = async () => {
    console.log('[CRON] Spouštím kontrolu upozornění na události...');

    const today = new Date();

    const result = await pool.query(`
        SELECT e.id, e.name, e.date, e.notification_days_before, u.email, p.name as person_name
        FROM "calendarEvent" e
        JOIN "profile" p ON p.id = e.profile_id
        JOIN "user" u ON u.id = e.created_by_user_id
        WHERE e.notification_days_before IS NOT NULL
        AND (e.notified_at IS NULL OR e.notified_at < CURRENT_DATE)
    `);

    console.log('[CRON] Získaná data z databáze:', result.rows);

    for (const event of result.rows) {
        const notifyDate = new Date(event.date);
        notifyDate.setDate(notifyDate.getDate() - event.notification_days_before);
    
        const shouldNotifyToday =
          notifyDate.getFullYear() === today.getFullYear() &&
          notifyDate.getMonth() === today.getMonth() &&
          notifyDate.getDate() === today.getDate();
    
        if (shouldNotifyToday) {
          await sendEmail({
            to: event.email,
            subject: `Připomínka: ${event.name} pro ${event.person_name} se blíží!`,
            html: `
              <p>Nezapomeň – <strong>${event.name}</strong> pro osobu <strong>${event.person_name}</strong> se koná <strong>${format(new Date(event.date), 'd.M.yyyy')}</strong>.</p>
              <p>Možná je čas připravit dárek! 🎁</p>
              <a href="http://localhost:5173/">Otevřít Gifteo</a>
            `
          });
        }
    }
    
    console.log('[CRON] Hotovo.');
};