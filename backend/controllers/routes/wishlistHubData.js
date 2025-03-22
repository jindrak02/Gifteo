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

// GET /api/wishlistHub/ownedWishlistCopies, vrátí všechny kopie wishlistů, které uživatel vlastní
router.get("/ownedWishlistCopies", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
  
    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
      const ownedWishlistCopiesQuery = `
        SELECT
            wcur.wishlist_copy_id,
            wc.original_wishlist_id,
            wc."name",
            wci."name" AS "itemName",
            wci.id,
            wci.url,
            wci.photo_url,
            wci.price,
            wci.price_currency,

            (SELECT pr."photo_url"
            FROM "profile" pr
            LEFT JOIN "wishlist" w ON w.profile_id = pr.id
            WHERE w.id = wc.original_wishlist_id) AS user_photo_url

        FROM "wishlistCopyUserRole" wcur
        LEFT JOIN "wishlistCopy" wc ON wcur.wishlist_copy_id = wc.id
        LEFT JOIN "wishlistCopyItem" wci ON wc.id = wci.wishlist_copy_id

        WHERE wcur.user_id = $1
        AND wcur."role" = 'owner'
        `;
        
        const ownedWishlistCopiesResult = await pool.query(ownedWishlistCopiesQuery, [userId]);
        
        // Process the data to create a nested structure
        const wishlistCopiesMap = {};
        
        ownedWishlistCopiesResult.rows.forEach(row => {
          const wishlistCopyId = row.wishlist_copy_id;
          
          // Initialize wishlist copy object if it doesn't exist
          if (!wishlistCopiesMap[wishlistCopyId]) {
            wishlistCopiesMap[wishlistCopyId] = {
              id: wishlistCopyId,
              original_wishlist_id: row.original_wishlist_id,
              name: row.name,
              user_photo_url: row.user_photo_url,
              items: []
            };
          }
          
          // Add item to wishlist copy if item exists
          if (row.id) {
            wishlistCopiesMap[wishlistCopyId].items.push({
              id: row.id,
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