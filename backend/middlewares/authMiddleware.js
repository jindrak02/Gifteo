import pool from "../config/db.js";

// Autentizační middleware pro ověření uživatelské session a existenci uživatele v db.
export function authenticateUser(req, res, next) {
  const sessionToken = req.cookies.session_token;

  if (!sessionToken) {
    return res
      .status(401)
      .json({ success: false, message: "Neautorizovaný přístup" });
  }

  // Ověřit, zda uživatel existuje v databázi
  pool
    .query('SELECT * FROM "user" WHERE id = $1', [sessionToken])
    .then((result) => {
        
      if (result.rows.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Neplatná session" });
      }

      req.user = result.rows[0]; // Přidání uživatelských dat do requestu
      next(); // Pokračovat k chráněné routě
    })
    .catch((error) => {
      console.error("Chyba při ověřování session:", error);
      res
        .status(500)
        .json({ success: false, message: "Interní chyba serveru" });
    });
}
