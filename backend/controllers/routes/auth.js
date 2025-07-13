import dotenv from 'dotenv';
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import pool from "../../config/db.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authenticateUser } from '../../middlewares/authMiddleware.js';
import { getCountry } from '../../utils/getCountry.js';
import { addHours } from 'date-fns';
import { randomUUID } from 'crypto';

dotenv.config();

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.use(cookieParser());

if (process.env.NODE_ENV === "production") {
  router.use(
    cors({
      origin: "https://gifteoapp.com", // Adresa frontendu
      credentials: true, // Povolit cookies v requestech
    })
  );
} else {
  router.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
}

// Route pro přihlášení či registraci pomocí Google a případné založení usera v db
router.post('/google', async (req, res) => {
  const { token } = req.body;
  const sessionToken = randomUUID();
  const expiresAt = addHours(new Date(), 1);

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

    try {
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

        try {
          await pool.query(
            `INSERT INTO session (token, user_id, expires_at) VALUES ($1, $2, $3)`,
            [sessionToken, insertUserQueryResult.rows[0].id, expiresAt]
          );
        } catch (error) {
          console.log('Error setting session: ' + error)
        }
        
        res.cookie("session_token", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
          maxAge: 60 * 60 * 1000, // 1 hodina
        });
        console.log('Autentizační cookie nastavena');

        res.json({ success: true, user: insertUserQueryResult.rows[0] });
      } else {
        console.log("User already exists");

        try {
          await pool.query(
            `INSERT INTO session (token, user_id, expires_at) VALUES ($1, $2, $3)`,
            [sessionToken, userQueryResult.rows[0].id, expiresAt]
          );
        } catch (error) {
          console.log('Error setting session: ' + error)
        }
        
        res.cookie("session_token", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
          maxAge: 60 * 60 * 1000, // 1 hodina
        });
        console.log('Autentizační cookie nastavena');

        res.json({ success: true, user: userQueryResult.rows[0] });
      }
    } catch (dbError) {
      res.status(500).json({ success: false, message: 'Chyba při práci s databází', error: dbError.message });
    }

  } catch (error) {
    res.status(401).send({success: false, message: 'Chyba při ověřování tokenu', error: error.message });
  }
});

router.post('/logout', authenticateUser, async (req, res) => {

  const token = req.cookies.session_token;
  await pool.query(`DELETE FROM session WHERE token = $1`, [token]);

  res.clearCookie("session_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
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