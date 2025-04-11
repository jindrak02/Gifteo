import { checkEvents } from "../../cron/scheduler.js"
import { checkGlobalEvents } from "../../cron/scheduler.js";

(async () => {
    await checkEvents();
    await checkGlobalEvents();
    console.log("Test completed successfully.");
})();