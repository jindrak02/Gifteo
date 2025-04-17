import dotenv from 'dotenv';
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import pool from "../../config/db.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authenticateUser } from '../../middlewares/authMiddleware.js';
import { getCountry } from '../../utils/getCountry.js';

dotenv.config();

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.use(cookieParser());

router.use(cors({
  origin: "https://gifteoapp.com",
  credentials: true,
}));

// Route pro přihlášení či registraci pomocí Google a případné založení usera v db
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

    if (userQueryResult.rows.length === 0) {
      // Založení nového uživatelose v db
      const countryCode = getCountry(req);

      const insertUserQuery = 'INSERT INTO "user" (email, google_id, country_code) VALUES ($1, $2, $3) RETURNING *';

      const insertUserQueryResult = await pool.query(insertUserQuery, [
        email,
        googleId,
        countryCode,
      ]);

      const insertProfileQuery = 'INSERT INTO "profile" ("user_id", "name", "photo_url", "bio") VALUES ($1, $2, $3, $4) RETURNING *;';

      const insertProfileQueryResult = await pool.query(insertProfileQuery, [
        insertUserQueryResult.rows[0].id,
        name,
        picture,
        'Happy to gift and to be gifted!',
      ]);

      const insertPersonQuery = 'INSERT INTO "person" ("profile_id", "is_gifteo_user") VALUES ($1, $2) RETURNING *;';
      const insertPersonQueryResult = await pool.query(insertPersonQuery, [insertProfileQueryResult.rows[0].id, true]);

      console.log("User created");

      
      res.cookie("session_token", insertUserQueryResult.rows[0].id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        domain: ".gifteoapp.com",
        maxAge: 60 * 60 * 1000, // 1 hodina
      });
      console.log('Autentizační cookie nastavena');

      res.json({ success: true, user: insertUserQueryResult.rows[0] });
    } else {
      console.log("User already exists");

      
      res.cookie("session_token", userQueryResult.rows[0].id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        domain: ".gifteoapp.com",
        maxAge: 60 * 60 * 1000, // 1 hodina
      });
      console.log('Autentizační cookie nastavena');

      res.json({ success: true, user: userQueryResult.rows[0] });
    }

  } catch (error) {
    res.status(401).send({success: false, message: 'Token je neplatný' });
  }
});

router.post('/logout', async (req, res) => {
  res.clearCookie("session_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    domain: ".gifteoapp.com",
    sameSite: "None",
  });
  res.send({ success: true, message: 'Odhlášení proběhlo úspěšně' });
  console.log('Logout Successful.');
});

router.get('/checkCookie', authenticateUser, (req, res) => {
  res.send({ success: true, message: "Uživatel je přihlášen", user: req.user });
  console.log('Cookie je platná a uživatel je přihlášen: ');
  console.log(req.user)
  
  
});

export default router;