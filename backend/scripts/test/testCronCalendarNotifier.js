import { checkEvents } from "../../cron/calendarNotifier.js";

(async () => {
    await checkEvents();
})();