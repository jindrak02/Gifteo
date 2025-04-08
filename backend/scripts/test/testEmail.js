import { sendEmail } from "../../utils/sendEmail.js";

await sendEmail({
    to: 'katerina.fikarova@icloud.com',
    subject: 'Testovací zpráva z Gifteo',
    html: '<p>Tohle je test. Vše funguje skvěle! 🚀</p>',
    text: 'Tohle je test. Vše funguje skvěle! 🚀'
});