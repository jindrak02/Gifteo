import pool from "../config/db.js";

export const updateAutoBirthdays = async () => {
    console.log('[CRON] Spouštím aktualizaci automaticky vygenerovaných eventů narozeniny.');

    try {
        const updateBirthdaysQuery = `
            UPDATE "calendarEvent"
            SET "date" = "date" + INTERVAL '1 year'
            WHERE "automatic_event" = 'birthday'
            AND "date" < CURRENT_DATE;
        `;

        const result = await pool.query(updateBirthdaysQuery);
        console.log('[CRON] Aktualizace narozenin proběhla úspěšně:', result.rowCount, 'řádků aktualizováno.');    
    } catch (error) {
        console.error('[CRON] Chyba při aktualizaci narozenin:', error);
        return;
    }
    
};