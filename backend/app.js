import dotenv from "dotenv";
import express from "express";
import pool from "./config/db.js";
import cors from 'cors';
import authRouter from './controllers/routes/auth.js';
import profileDataRouter from './controllers/routes/profileData.js';
import personsDataRouter from './controllers/routes/personsData.js';
import scraperRouter from './controllers/routes/scraper.js';
import hubRouter from './controllers/routes/wishlistHubData.js';
import customWishlistRouter from './controllers/routes/customWishlists.js';
import calendarRouter from './controllers/routes/calendar.js';
import cookieParser from 'cookie-parser';
import './cron/scheduler.js';

dotenv.config();

const app = express();
const port = 3000;

if (process.env.NODE_ENV === "production") {
  app.use(
    cors({
      origin: "https://gifteoapp.com", // Adresa frontendu
      credentials: true, // Povolit cookies v requestech
    })
  );
} else {
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
}

// // Povolení CORS s credentials (pro frontend)
// app.use(
//   cors({
//       origin: "https://gifteoapp.com", // Adresa frontendu
//       credentials: true, // Povolit cookies v requestech
//   })
// );

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/profileData', profileDataRouter);
app.use('/api/personsData', personsDataRouter);
app.use('/api/scraper', scraperRouter);
app.use('/api/wishlistHub', hubRouter);
app.use('/api/customWishlists', customWishlistRouter);
app.use('/api/calendar', calendarRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
