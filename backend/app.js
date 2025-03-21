import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";
import cors from 'cors';
import authRouter from './auth.js';
import profileDataRouter from './profileData.js';
import personsDataRouter from './personsData.js';
import scraperRouter from './scraper.js';
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

// Použití autentizačního routeru
app.use('/api/auth', authRouter);

// Použití routeru s daty o profilech a wishlistech
app.use('/api/profileData', profileDataRouter);

// Použití routeru s daty o osobách a propojeních
app.use('/api/personsData', personsDataRouter);

// Použití routeru s scraperem
app.use('/api/scraper', scraperRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
