import express from "express";
import cookieParser from "cookie-parser";
import pool from "../../config/db.js";
import { authenticateUser } from "../../middlewares/authMiddleware.js";
import { hasUserPerson } from "../../middlewares/personAccessMiddleware.js";
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

// GET /api/wishlistHub/wishlistsFor/:personId, vrátí všechny wishlisty pro danou osobu na které má uživatel přístup
router.get("/wishlistsFor/:personId", authenticateUser, hasUserPerson(), async (req, res) => {
    const userId = req.cookies.session_token;;
    const personId = sanitize(req.params.personId);

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }

    try {
      const wishlistsQuery = `
        SELECT 
          w.id AS wishlist_id,
          w.name AS wishlist_name,
          w.deleted AS wishlist_deleted,
          w.created_at AS wishlist_created_at,
          w.visibility,
          w.shared_with_all_my_people,
          w.profile_id,
          w.created_by_user_id,

          wi.id AS item_id,
          wi.name AS item_name,
          wi.price,
          wi.price_currency,
          wi.photo_url,
          wi.url,
          wi.description,
          wi.checked_off_by_user_id,
          wi.deleted AS item_deleted,
          wi.created_at AS item_created_at

        FROM "wishlist" w
        LEFT JOIN "wishlistItem" wi
          ON wi.wishlist_id = w.id
          AND (
            wi.deleted = false
            OR (
              wi.deleted = true AND wi.checked_off_by_user_id IS NOT NULL
            )
          )

        WHERE w.profile_id = (
            SELECT profile_id FROM "person" WHERE id = $1
        )
        AND (
            w.deleted = false
            OR (
              w.deleted = true
              AND EXISTS (
                SELECT 1
                FROM "wishlistItem" wi2
                WHERE wi2.wishlist_id = w.id
                  AND wi2.checked_off_by_user_id = $2
              )
            )
        )
        AND (
          w.shared_with_all_my_people = true
          OR EXISTS (
            SELECT 1 FROM "wishlistSharedWith"
            WHERE wishlist_id = w.id
              AND shared_with_user_id = $2
          )
        )
        ORDER BY w.created_at DESC, wi.created_at ASC;
      `;

      const wishlistsQueryResult = await pool.query(wishlistsQuery, [personId, userId]);
      const rows = wishlistsQueryResult.rows;

      if (rows.length === 0) {
        return res.status(404).send({ success: false, message: "No wishlists found" });
      }

      const wishlistMap = new Map();

      rows.forEach(row => {
        if (!wishlistMap.has(row.wishlist_id)) {
          wishlistMap.set(row.wishlist_id, {
            id: row.wishlist_id,
            name: row.wishlist_name,
            deleted: row.wishlist_deleted,
            visibility: row.visibility,
            shared_with_all_my_people: row.shared_with_all_my_people,
            created_at: row.wishlist_created_at,
            profile_id: row.profile_id,
            created_by_user_id: row.created_by_user_id,
            items: []
          });
        }

        if (row.item_id) {
          wishlistMap.get(row.wishlist_id).items.push({
            id: row.item_id,
            name: row.item_name,
            price: row.price,
            price_currency: row.price_currency,
            photo_url: row.photo_url,
            url: row.url,
            description: row.description,
            checked_off_by_user_id: row.checked_off_by_user_id,
            deleted: row.item_deleted,
            created_at: row.item_created_at
          });
        }
      });

      const wishlists = Array.from(wishlistMap.values());

      res.json({ success: true, wishlists: wishlists });
      
    } catch (error) {
      console.error("Error fetching wishlists:", error);
      res.status(500).send({ success: false, message: "Internal server error" });
    }
  
});

export default router;