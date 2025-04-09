import cron from 'node-cron';
import { checkEvents } from './checkEvents.js';
import { checkGlobalEvents } from './checkGlobalEvents.js';

/**
 * Cron job to send calendar notifications
 * Runs every day at 0:15
 * 
 * Checks the database for any calendar events that are due today
 * and sends an email notification to the user email
 */

cron.schedule('15 0 * * *', checkEvents);

/**
 * Cron job to send global event notifications
 * Runs every day at 0:45
 * 
 * Checks the database for any global events that are due today
 * and sends an email notification to the users of the country
 */
cron.schedule('45 0 * * *', checkGlobalEvents);

export {checkEvents, checkGlobalEvents};