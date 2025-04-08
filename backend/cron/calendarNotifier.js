import cron from 'node-cron';
import { checkEvents } from './checkEvents.js';

/**
 * Cron job to send calendar notifications
 * Runs every day at 0:00
 * 
 * Checks the database for any calendar events that are due today
 * and sends an email notification to the user email
 */

cron.schedule('0 0 * * *', checkEvents);

export {checkEvents}