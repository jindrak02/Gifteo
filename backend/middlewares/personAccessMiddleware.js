import pool from "../config/db.js";

// Middleware: ověří, že uživatel má danou osobu v "My People"
export function hasUserPerson() {
  return async (req, res, next) => {
    const userId = req.cookies.session_token;
    const personId = req.params.personId || req.body.personId;

    //console.log(personId);
    

    if (!userId || !personId) {
      return res.status(400).send({ success: false, message: "Missing user or person ID" });
    }

    try {
      const res = await pool.query(`
        SELECT 1
        FROM "userPerson"
        WHERE user_id = $1 AND person_id = $2 AND status = 'accepted'
      `, [userId, personId]);

      const rows = res.rows;
      //console.log('rows', rows);
      

      if (rows.length === 0) {
        return res.status(403).send({ success: false, message: "Access denied - not connected to this person" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(500).send({ success: false, message: "Database error" });
    }
  };
}
