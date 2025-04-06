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
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = 3000;

// Povolení CORS s credentials (pro frontend)
app.use(
  cors({
      origin: "http://localhost:5173", // Adresa frontendu
      credentials: true, // Povolit cookies v requestech
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/profileData', profileDataRouter);
app.use('/api/personsData', personsDataRouter);
app.use('/api/scraper', scraperRouter);
app.use('/api/wishlistHub', hubRouter);
app.use('/api/customWishlists', customWishlistRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
