import { updateAutoBirthdays } from "../../cron/scheduler.js";

(async () => {
    await updateAutoBirthdays();
    console.log("Test completed successfully.");
})();