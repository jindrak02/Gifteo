import pool from "../config/db.js";

// Autentizační middleware pro ověření uživatelské session a existenci uživatele v db.
export async function authenticateUser(req, res, next) {
  const sessionToken = req.cookies.session_token;

  if (!sessionToken) {
    return res
      .status(401)
      .json({ success: false, message: "Neautorizovaný přístup" });
  }

  const result = await pool.query(
    `SELECT s.user_id, u.email FROM session s
     JOIN "user" u ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [sessionToken]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Session expirovala nebo neexistuje" });
  }

  req.user = {
    id: result.rows[0].user_id,
    email: result.rows[0].email,
  };

  next();
}
