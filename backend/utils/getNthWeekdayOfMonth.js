/**
 * Pro cron job checkGlobalEvents.js
 * 
 * Spočítá datum pohyblivého svátku (např. 2. neděle v květnu)
 * Podle zadání do parametru nth a weekday (specifikace kolikrátý den v týdnu v měsíci)
 */

const getNthWeekdayOfMonth = (year, month, weekday, nth) => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const dayOffset = (7 + weekday - firstDayOfMonth.getDay()) % 7;
    return new Date(year, month - 1, 1 + dayOffset + (nth - 1) * 7);
};

export default getNthWeekdayOfMonth;