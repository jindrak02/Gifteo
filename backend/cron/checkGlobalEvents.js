/**
 * 
 * Tento cron job:
 * - Pro každý den spočítá, které globální svátky mají být dnes připomenuty (podle notification_days_before)
 * - Dopočítá datum pro pevné i pohyblivé svátky
 * - Vybere příslušné uživatele podle country_code
 * - Pošle každému notifikaci e-mailem
 * 
 */

import { format, subDays, isSameDay } from 'date-fns';
import pool from '../config/db.js';
import { sendEmail } from '../utils/sendEmail.js';
import getNthWeekdayOfMonth from "../utils/getNthWeekdayOfMonth.js";

export const checkGlobalEvents = async () => {
    console.log('[CRON] Spouštím kontrolu globálních událostí...');
  
    const today = new Date();
    const year = today.getFullYear();
  
    const result = await pool.query(`
      SELECT *
      FROM "globalEvent"
      WHERE "notification_days_before" IS NOT NULL
    `);
  
    const events = result.rows;
  
    for (const event of events) {
      let eventDate;
  
      // Konkrétní datum události
      if (event.day && event.month) {
        eventDate = new Date(year, event.month - 1, event.day); // pevné datum
      } else if (event.weekday != null && event.week != null && event.month) {
        eventDate = getNthWeekdayOfMonth(year, event.month, event.weekday, event.week); // pohyblivé datum
      } else {
        console.warn(`[CRON] Událost ${event.name} má neúplné datumové údaje, přeskočeno.`);
        continue;
      }
  
      const notifyDate = subDays(eventDate, event.notification_days_before);
  
      if (isSameDay(notifyDate, today)) {
        console.log(`[CRON] Připomínka události "${event.name}" (${format(eventDate, 'd.M.yyyy')}) pro zemi ${event.country_code}`);
  
        // Uživatelos podle země
        const userQuery = await pool.query(`
          SELECT email FROM "user"
          WHERE country_code = $1
        `, [event.country_code]);
  
        for (const user of userQuery.rows) {
          await sendEmail({
            to: user.email,
            subject: `Reminder: ${event.name} is coming soon!`,
            html: `
              <p>Don't forget – <strong>${event.name}</strong> is on <strong>${format(eventDate, 'd.M.yyyy')}</strong>.</p>
              <p>You might want to prepare something nice 🎁</p>
              <a href="https://app.gifteo.cz/">Open Gifteo</a>
            `
          });
        }
      }
    }
  
    console.log('[CRON] Kontrola globálních událostí dokončena.');
};