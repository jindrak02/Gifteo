import express from "express";
import cookieParser from "cookie-parser";
import pool from "../../config/db.js";
import { authenticateUser } from "../../middlewares/authMiddleware.js";
import { hasUserPerson } from "../../middlewares/personAccessMiddleware.js";
import { hasWishlistAccess } from "../../middlewares/wishlistAccessMiddleware.js";
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

function sanitize(input){
  return purify.sanitize(input);
}

const router = express.Router();
router.use(cookieParser());
router.use(express.json());

// GET /api/customWishlists, vrátí všechny custom wishlists vytvořené uživatelem
router.get("/", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    
    if (!userId) {
        return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }

    try {
        const customWishlistsQuery = `
            SELECT
                w.id,
                w."name",
                wi.id AS item_id,
                wi."name" AS item_name,
                wi.description,
                wi.photo_url AS "imageUrl",
                wi.price,
                wi.price_currency AS "priceCurrency",
                wi.url,
                
                CASE
                    WHEN w.created_by_user_id = $1 THEN false
                    ELSE true
                END AS is_shared,

                p.name "ownerName",
	            p.photo_url AS "ownerPhotoUrl"

            FROM wishlist w
            LEFT JOIN "wishlistItem" wi ON w.id = wi.wishlist_id
            LEFT JOIN "wishlistSharedWith" ws ON w.id = ws.wishlist_id
            LEFT JOIN profile p ON p.user_id = w.created_by_user_id

            WHERE w.is_custom = true
            AND (w.created_by_user_id = $1 OR ws.shared_with_user_id = $1)
            AND w.deleted = false
            AND (wi.deleted = false OR wi.id IS NULL)

            ORDER BY w.created_at DESC;
        `;

        const customWishlistsQueryResult = await pool.query( customWishlistsQuery, [userId] );
        
        // Process the results to group items by wishlist
        const wishlistsMap = {};
        
        customWishlistsQueryResult.rows.forEach(row => {
            // If this wishlist is not yet in our map, add it
            if (!wishlistsMap[row.id]) {
                wishlistsMap[row.id] = {
                    id: row.id,
                    name: row.name,
                    items: [],
                    ownerName: row.ownerName,
                    ownerPhotoUrl: row.ownerPhotoUrl,
                };
            }
            
            // Add item to the wishlist if item data exists
            if (row.item_id) {
                wishlistsMap[row.id].items.push({
                    id: row.item_id,
                    name: row.item_name,
                    description: row.description || "",
                    imageUrl: row.imageUrl || "",
                    price: parseFloat(row.price) || 0,
                    priceCurrency: row.priceCurrency || "USD",
                    url: row.url || ""
                });
            }
        });
        
        // Convert map to array for response
        const customWishlists = Object.values(wishlistsMap);
        
        // Send response
        res.status(200).json({
            success: true,
            customWishlists
        });

    } catch (error) {
        console.error("Error fetching custom wishlists:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


export default router;