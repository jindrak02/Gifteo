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
          --w.created_at AS wishlist_created_at,
          --w.visibility,
          --w.shared_with_all_my_people,
          --w.profile_id,
          --w.created_by_user_id,

          wi.id AS item_id,
          wi.name AS item_name,
          wi.price,
          wi.price_currency,
          wi.photo_url,
          wi.url,
          wi.description,
          wi.checked_off_by_user_id,
          wi.deleted AS item_deleted,
          wi.modified_by_owner,
          --wi.created_at AS item_created_at,

          p.photo_url AS "checkedOffByPhoto",
          p.name AS "checkedOffByName"

        FROM "wishlist" w
        LEFT JOIN "wishlistItem" wi
          ON wi.wishlist_id = w.id
          AND (
            wi.deleted = false
            OR (
              wi.deleted = true AND wi.checked_off_by_user_id IS NOT NULL
            )
          )
        LEFT JOIN "user" u ON u.id = wi.checked_off_by_user_id
        LEFT JOIN "profile" p ON p.user_id = u.id

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
            //visibility: row.visibility,
            //shared_with_all_my_people: row.shared_with_all_my_people,
            //created_at: row.wishlist_created_at,
            //profile_id: row.profile_id,
            //created_by_user_id: row.created_by_user_id,
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
            checkedOffBy: row.checked_off_by_user_id,
            checkedOffByPhoto: row.checkedOffByPhoto || null,
            checkedOffByName: row.checkedOffByName || null,
            deleted: row.item_deleted,
            modifiedByOwner: row.modified_by_owner,
            //created_at: row.item_created_at
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

// PATCH /api/wishlistHub/checkOffItem/${item.id}, zaškrtne položku jako splněnou
router.patch("/checkOffItem/:itemId", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const itemId = sanitize(req.params.itemId);

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }

    try {
      const checkOffQuery = `
        UPDATE "wishlistItem"
        SET checked_off_by_user_id = $1
        WHERE id = $2 AND deleted = false
        RETURNING *;
      `;

      const result = await pool.query(checkOffQuery, [userId, itemId]);
      const updatedItem = result.rows[0];

      if (!updatedItem) {
        return res.status(404).send({ success: false, message: "Item not found or already deleted" });
      }

      const checkedOffByQuery = `
        SELECT p.photo_url AS "checkedOffByPhoto", p.name AS "checkedOffByName"
        FROM "user" u
        LEFT JOIN "profile" p ON p.user_id = u.id
        WHERE u.id = $1;
      `;
      const checkedOffByResult = await pool.query(checkedOffByQuery, [userId]);
      const checkedOffByRow = checkedOffByResult.rows[0];

      res.json({
        success: true,
        item: updatedItem,
        checkedBy: updatedItem.checked_off_by_user_id,
        checkedByName: checkedOffByRow.checkedOffByName,
        checkedByPhoto: checkedOffByRow.checkedOffByPhoto,
      });
      
    } catch (error) {
      console.error("Error checking off item:", error);
      res.status(500).send({ success: false, message: "Internal server error" });
    }
});

// PATCH /api/wishlistHub/uncheckItem/${item.id} , odškrtně položku jako nesplněnou
router.patch("/uncheckItem/:itemId", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const itemId = sanitize(req.params.itemId);

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }

    try {
      // Check if the item was checked by the same user
      const checkQuery = `
        SELECT checked_off_by_user_id FROM "wishlistItem"
        WHERE id = $1 AND deleted = false;
      `;
      const checkResult = await pool.query(checkQuery, [itemId]);
      const id = checkResult.rows[0]?.checked_off_by_user_id;

      if (!id) {
        return res.status(404).send({ success: false, message: "Item not checked or deleted" });
      }

      if (id != userId) {
        return res.status(403).send({ success: false, message: "Item was not checked off by current user" });
      }

      const uncheckQuery = `
        UPDATE "wishlistItem"
        SET checked_off_by_user_id = NULL
        WHERE id = $1 AND deleted = false
        RETURNING *;
      `;

      const result = await pool.query(uncheckQuery, [itemId]);
      const updatedItem = result.rows[0];

      if (!updatedItem) {
        return res.status(404).send({ success: false, message: "Item not found or already deleted" });
      }

      res.json({ success: true, item: updatedItem });
      
    } catch (error) {
      console.error("Error unchecking item:", error);
      res.status(500).send({ success: false, message: "Internal server error" });
    }
});

export default router;