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

// GET /api/customWishlists, vrátí všechny custom wishlists vytvořené uživatelem nebo sdílené s ním
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
                w.profile_id,
                w.deleted,
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
	            p.photo_url AS "ownerPhotoUrl",

                wi.checked_off_by_user_id AS "checkedOffBy",
                cb_profile.name AS "checkedOffByName",
                cb_profile.photo_url AS "checkedOffByPhoto",

                wi.modified_by_owner AS "modifiedByOwner"

            FROM wishlist w
            LEFT JOIN "wishlistItem" wi ON w.id = wi.wishlist_id
            LEFT JOIN "wishlistSharedWith" ws ON w.id = ws.wishlist_id AND ws.shared_with_user_id = $1
            LEFT JOIN profile p ON p.user_id = w.created_by_user_id
            LEFT JOIN profile cb_profile ON cb_profile.user_id = wi.checked_off_by_user_id

            WHERE w.is_custom = true
            AND w.deleted = false
            AND (
                w.created_by_user_id = $1
                OR ws.shared_with_user_id IS NOT NULL
                OR (
                    w.shared_with_all_my_people = true
                    AND EXISTS (
                        SELECT 1
                        FROM "userPerson" up
                        JOIN "person" per ON up.person_id = per.id
                        WHERE up.user_id = $1 AND per.profile_id = p.id
                    )
                )
            )
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
                    forProfile: row.profile_id || null,
                    deleted: row.deleted,
                    items: [],
                    ownerName: row.ownerName,
                    ownerPhotoUrl: row.ownerPhotoUrl,
                    is_shared: row.is_shared,
                };
            }
            
            // Add item to the wishlist if item data exists
            if (row.item_id) {
                wishlistsMap[row.id].items.push({
                    id: row.item_id,
                    name: row.item_name,
                    description: row.description || "",
                    photo_url: row.imageUrl || "",
                    price: parseFloat(row.price) || 0,
                    currency: row.priceCurrency || "USD",
                    url: row.url || "",
                    checkedOffBy: row.checkedOffBy || null,
                    checkedOffByName: row.checkedOffByName || null,
                    checkedOffByPhoto: row.checkedOffByPhoto || null,
                    modifiedByOwner: row.modifiedByOwner || null,
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

// POST /api/customWishlists, vytvoří nový custom wishlist
router.post("/", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const name = sanitize(req.body.name);
    const forProfile = sanitize(req.body.forProfile);
    
    if (!userId) {
        return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
    if (!name) {
        return res.status(400).json({ success: false, message: "Name is required" });
    }

    try {

        const insertQuery = `
            INSERT INTO wishlist (
                profile_id,
                name,
                visibility,
                created_by_user_id,
                shared_with_all_my_people,
                is_custom
            ) VALUES (
                $1,               
                $2,               
                'private',        
                $3,               
                false,            
                true
            )
            RETURNING *;
        `;

        const result = await pool.query(insertQuery, [forProfile || null, name, userId]);
        const newWishlistId = result.rows[0].id;

        res.status(201).json({
            success: true,
            message: "Custom wishlist created successfully",
            wishlistId: newWishlistId
        });

    } catch (error) {
        console.error("Error creating custom wishlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;