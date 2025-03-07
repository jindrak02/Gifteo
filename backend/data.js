import express from "express";
import pool from "./db.js";
import { authenticateUser } from "./authMiddleware.js";

const router = express.Router();

router.get("/profile/:userId", authenticateUser, async (req, res) => {
  const userId = req.params.userId;

  try {
    const profileQuery = 'SELECT * FROM "profile" profile WHERE profile.user_id = $1;';
    const profileQueryResult = await pool.query(profileQuery,[userId]);

    res.json(profileQueryResult.rows[0]);

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

export default router;