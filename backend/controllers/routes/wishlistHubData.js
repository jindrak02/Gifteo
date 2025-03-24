import express from "express";
import cookieParser from "cookie-parser";
import pool from "../../config/db.js";
import { authenticateUser } from "../../middlewares/authMiddleware.js";
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

function sanitize(input){
  return purify.sanitize(input);
}

const router = express.Router();
router.use(cookieParser());

// GET /api/wishlistHub/participatedWishlistCopiesForUser, vrátí všechny kopie wishlistů pro specifického
// uživatele, kde je aktuální uživatel účastníkem
router.get("/participatedWishlistCopiesForUser/:forUserId", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const forUserId = req.params.forUserId;
    
    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }

    if (!forUserId) {
        return res.status(401).send({ success: false, message: "For User id parameter not found" });
      }
  
    try {
      const wishlistCopiesQuery = `
        SELECT
            wcur.wishlist_copy_id,
            wcur."role",
            wc.original_wishlist_id,
            wc."name",
            wci."name" AS "itemName",
            wci.id AS "itemId",
            wci.url,
            wci.photo_url,
            wci.price,
            wci.price_currency

        FROM "wishlistCopyUserRole" wcur
        LEFT JOIN "wishlistCopy" wc ON wcur.wishlist_copy_id = wc.id
        LEFT JOIN "wishlistCopyItem" wci ON wc.id = wci.wishlist_copy_id

        WHERE wcur.user_id = $1
        AND wcur."role" IN ('owner', 'cooperator')
        AND wc.for_user_id = $2
        ORDER BY wc.created_at DESC;
        `;
        
        const wishlistCopiesQueryResult = await pool.query(wishlistCopiesQuery, [userId, forUserId]);
        
        // Process the data to create a nested structure
        const wishlistCopiesMap = {};
        
        wishlistCopiesQueryResult.rows.forEach(row => {
          const wishlistCopyId = row.wishlist_copy_id;
          
          // Initialize wishlist copy object if it doesn't exist
          if (!wishlistCopiesMap[wishlistCopyId]) {
            wishlistCopiesMap[wishlistCopyId] = {
              id: wishlistCopyId,
              original_wishlist_id: row.original_wishlist_id,
              name: row.name,
              items: []
            };
          }
          
          // Add item to wishlist copy if item exists
          if (row.itemId) {
            wishlistCopiesMap[wishlistCopyId].items.push({
              id: row.itemId,
              name: row.itemName,
              url: row.url,
              photo_url: row.photo_url,
              price: row.price,
              price_currency: row.price_currency
            });
          }
        });
        
        // Convert map to array of wishlist copies
        const wishlistCopies = Object.values(wishlistCopiesMap);
        
        res.json({ success: true, wishlistCopies });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

export default router;