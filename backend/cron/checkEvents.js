import { sendEmail } from '../utils/sendEmail.js';
import pool from "../config/db.js";
import dotenv from 'dotenv';
import { format } from 'date-fns';

dotenv.config();

export const checkEvents = async () => {
    console.log('[CRON] Spouštím kontrolu upozornění na události...');

    const today = new Date();

    const result = await pool.query(`
        SELECT 
            n.id AS notification_id,
            n.days_before,
            e.name AS event_name,
            e.date AS event_date,
            u.email,
            p.name AS person_name
        FROM "calendarEventNotification" n
        JOIN "calendarEvent" e ON n.event_id = e.id
        LEFT JOIN "profile" p ON p.id = e.profile_id
        JOIN "user" u ON u.id = e.created_by_user_id
        WHERE 
            n.notified_at IS NULL
    `);

    console.log('[CRON] Získaná data z databáze:', result.rows);

    for (const event of result.rows) {
        const notifyDate = new Date(event.event_date);
        notifyDate.setDate(notifyDate.getDate() - event.days_before);
    
        const shouldNotifyToday =
          notifyDate.getFullYear() === today.getFullYear() &&
          notifyDate.getMonth() === today.getMonth() &&
          notifyDate.getDate() === today.getDate();
    
        if (shouldNotifyToday) {
            try {
                await sendEmail({
                    to: event.email,
                    subject: `Připomínka: ${event.event_name}${event.person_name ? ` pro ${event.person_name}` : ''} se blíží!`,
                    html: `
                      <p>Nezapomeň – <strong>${event.event_name}</strong>${event.person_name ? ` pro osobu <strong>${event.person_name}</strong>` : ''} se koná <strong>${format(new Date(event.event_date), 'd.M.yyyy')}</strong>.</p>
                      <p>Možná je čas připravit dárek! 🎁</p>
                      <a href="http://localhost:5173/">Otevřít Gifteo</a>
                    `
                  });
        
                  await pool.query(`
                        UPDATE "calendarEventNotification"
                        SET notified_at = CURRENT_DATE
                        WHERE id = $1
                    `, [event.notification_id]);
            } catch (error) {
                console.error('Chyba při odesílání e-mailu:', error);
            }
        
        }
    }
    
    console.log('[CRON] Hotovo.');
};