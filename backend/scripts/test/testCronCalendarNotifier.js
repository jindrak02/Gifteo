import { checkEvents } from "../../cron/calendarNotifier.js"
import { checkGlobalEvents } from "../../cron/calendarNotifier.js";

(async () => {
    await checkEvents();
    await checkGlobalEvents();
    console.log("Test completed successfully.");
})();