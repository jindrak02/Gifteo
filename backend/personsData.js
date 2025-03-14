import express from "express";
import cookieParser from "cookie-parser";
import pool from "./db.js";
import { authenticateUser } from "./authMiddleware.js";
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

function sanitize(input){
  return purify.sanitize(input);
}

const router = express.Router();
router.use(cookieParser());

// GET /api/personsData/UserPersons, vrátí všechny osoby uživatele
router.get("/UserPersons", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
  
    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
    const peopleQuery = `
      SELECT up.user_id, up.person_id, p.profile_id, pr."name", pr.photo_url
        FROM "userPerson" up
        LEFT JOIN "person" p ON up.person_id = p.id
        LEFT JOIN "profile" pr ON p.profile_id = pr.id
        WHERE up.user_id = $1
        AND up.status = 'accepted';
    `;
      const peopleQueryResult = await pool.query(peopleQuery,[userId]);
  
      res.json(peopleQueryResult.rows);
  
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
});

export default router;