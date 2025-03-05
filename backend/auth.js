import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import pool from "./db.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authenticateUser } from './authMiddleware.js';

dotenv.config();

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.use(cookieParser());

// Route pro přihlášení či registraci pomocí Google
router.post('/google', async (req, res) => {
  const { token } = req.body;

  // Tu probíhá ověření tokenu od Googlu
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload["sub"];
    const email = payload["email"];
    const name = payload["name"];
    const picture = payload["picture"];

    const userQuery = 'SELECT * FROM "user" WHERE email = $1';
    const userQueryResult = await pool.query(userQuery, [email]);

    // Tu probíhá vytvoření session tokenu (cookie)
    res.cookie("session_token", googleId, {
      httpOnly: true, // JavaScript nemůže cookie přečíst
      secure: process.env.NODE_ENV === "production", // Secure v produkci
      sameSite: "Lax", // Chrání před CSRF
      maxAge: 60 * 60 * 1000, // 1 hodina
      //maxAge: 20 * 1000, // 20 vteřin
    });
    console.log('cookie nastavena');

    if (userQueryResult.rows.length === 0) {
      const insertQuery =
        'INSERT INTO "user" (email, google_id) VALUES ($1, $2) RETURNING *';
      const insertQueryResult = await pool.query(insertQuery, [
        email,
        googleId,
      ]);
      console.log("User created");
      res.json({ success: true, user: insertQueryResult.rows[0] });
    } else {
      console.log("User already exists");
      res.json({ success: true, user: userQueryResult.rows[0] });
    }

  } catch (error) {
    res.status(401).send({success: false, message: 'Token je neplatný' });
  }
});

router.post('/logout', async (req, res) => {
  res.clearCookie("session_token");
  res.send({ success: true, message: 'Odhlášení proběhlo úspěšně' });
});

router.get('/checkCookie', authenticateUser, (req, res) => {
  res.send({ success: true, message: "Uživatel je přihlášen", user: req.user });
});

export default router;