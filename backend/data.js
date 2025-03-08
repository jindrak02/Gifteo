import express from "express";
import cookieParser from "cookie-parser";
import pool from "./db.js";
import { authenticateUser } from "./authMiddleware.js";

const router = express.Router();
router.use(cookieParser());

// GET /api/data/profile, vrátí profil uživatele
router.get("/profile", authenticateUser, async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  try {
    const profileQuery = 'SELECT * FROM "profile" profile WHERE profile.user_id = $1;';
    const profileQueryResult = await pool.query(profileQuery,[userId]);

    res.json(profileQueryResult.rows[0]);

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// GET /api/data/profileInterest, vrátí zájmy profilu uživatele
router.get("/profileInterest", authenticateUser, async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  try {
    const profileIdQuery = 'SELECT profile.id FROM "profile" profile WHERE profile.user_id = $1;';
    const profileIdQueryResult = await pool.query(profileIdQuery,[userId]);
    
    const profileInterestQuery = 'SELECT i."name", i."id" FROM "profileInterest" pi LEFT JOIN "interest" i on pi.interest_id = i.id WHERE pi.profile_id = $1;';
    const profileInterestQueryResult = await pool.query(profileInterestQuery,[profileIdQueryResult.rows[0].id]);

    res.json(profileInterestQueryResult.rows);

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// GET /api/data/interests, vrátí předdefinované zájmy k výběru
router.get("/interests", authenticateUser, async (req, res) => {

  try {
    const interestsQuery = 'SELECT * FROM "interest";';
    const interestsQueryResult = await pool.query(interestsQuery);

    res.json(interestsQueryResult.rows);

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// PUT /api/data/updateProfile, aktualizuje profil uživatele
router.put("/updateProfile", authenticateUser, async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  const { id, name, photo_url, bio, birthdate } = req.body.profileData;
  const interests = req.body.interests;

  try {
    const updateProfileQuery = 'UPDATE "profile" SET name = $1, photo_url = $2, bio = $3, birthdate = $4 WHERE user_id = $5;';
    await pool.query(updateProfileQuery,[name, photo_url, bio, birthdate, userId]);

    const deleteProfileInterestQuery = 'DELETE FROM "profileInterest" WHERE profile_id = $1;';
    await pool.query(deleteProfileInterestQuery,[id]);

    for (const interest of interests) {
      const insertProfileInterestQuery = 'INSERT INTO "profileInterest" (profile_id, interest_id) VALUES ($1, $2);';
      await pool.query(insertProfileInterestQuery,[id, interest]);
    }

    res.json({ success: true, message: "Profile updated" });
    
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
  
});

export default router;