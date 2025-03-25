import pool from "../config/db.js";

// Ověří, zda má uživatel specifikované role na dané kopii wishlistu
export function authorizeWishlistCopyAccess(requiredRoles = []) {
    return async (req, res, next) => {
      const userId = req.cookies.session_token;
      const wishlistCopyId = req.params.wishlistCopyId || req.body.wishlistCopyId;
  
      if (!wishlistCopyId) {
        return res.status(400).send({ success: false, message: "Missing wishlistCopyId parameter" });
      }
  
      try {
        const result = await pool.query(`
          SELECT "role"
          FROM "wishlistCopyUserRole"
          WHERE user_id = $1
          AND wishlist_copy_id = $2;
        `, [userId, wishlistCopyId]);
  
        const role = result.rows[0]?.role;
        if (!role || (requiredRoles.length > 0 && !requiredRoles.includes(role))) {
          return res.status(403).send({ success: false, message: "Forbidden: insufficient permissions" });
        }
  
        req.userRoleForWishlistCopy = role; // Add user role to request for potential future use
        next(); // Continue to the protected route or next middleware
  
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    };
};