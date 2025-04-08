import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
      const msg = {
        to,
        from: 'gifteo.notify@gmail.com', // TODO: update with noreply domain email
        subject,
        text,
        html
      };
  
      await sgMail.send(msg);
      console.log(`Email odeslán na ${to}`);
    } catch (err) {
      console.error('Chyba při odesílání e-mailu:', err);
    }
};