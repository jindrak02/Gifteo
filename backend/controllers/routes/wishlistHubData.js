import express from "express";
import cookieParser from "cookie-parser";
import pool from "../../config/db.js";
import { authenticateUser } from "../../middlewares/authMiddleware.js";
import { authorizeWishlistCopyAccess } from "../../middlewares/roleMiddleware.js";
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

function sanitize(input){
  return purify.sanitize(input);
}

const router = express.Router();
router.use(cookieParser());

// GET /api/wishlistHub/copiedWishlistsFor, vrátí všechny kopie wishlistů pro specifického
// uživatele, kde je aktuální uživatel účastníkem
router.get("/copiedWishlistsFor/:forUserId", authenticateUser, async (req, res) => {
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
              role: row.role,
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

// GET /api/wishlistHub/createWishlistCopy, vytvoření kopie wishlistu a přidání uživatele jako owner role
router.post("/createWishlistCopy/:wishlistId", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const originalWishlistId = req.params.wishlistId;
    const { forUserId } = req.body;
    
    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
    
    if (!originalWishlistId) {
      return res.status(400).send({ success: false, message: "Missing originalWishlistId parameter" });
    }
    
    if (!forUserId) {
      return res.status(400).send({ success: false, message: "Missing forUserId parameter" });
    }
    
    try {
      // 1. Kontrola, jestli wishlist již nebyl zkopírován uživatelem
      const existingCopyResult = await pool.query(`
        SELECT 1 FROM "wishlistCopy"
        WHERE original_wishlist_id = $1
        AND for_user_id = $2
        AND EXISTS (
            SELECT 1 FROM "wishlistCopyUserRole"
            WHERE wishlist_copy_id = "wishlistCopy".id
            AND user_id = $3
          );
      `, [originalWishlistId, forUserId, userId]);
      
      if (existingCopyResult.rowCount > 0) {
        return res.status(400).json({ success: false, message: "Wishlist already copied" });
      }

      // 2. Vytvoření kopie wishlistu
      const createWishlistCopyQuery = `
        INSERT INTO "wishlistCopy" (original_wishlist_id, for_user_id, "name", owner_id)
        SELECT id, $1, "name", $2
        FROM "wishlist"
        WHERE id = $3
        RETURNING id;
      `;
      
      const createWishlistCopyResult = await pool.query(createWishlistCopyQuery, [forUserId, userId, originalWishlistId]);
      const wishlistCopyId = createWishlistCopyResult.rows[0].id;
      
      // 3. Přidání uživatele jako owner role
      const addOwnerRoleQuery = `
        INSERT INTO "wishlistCopyUserRole" (wishlist_copy_id, user_id, "role", invitation_status)
        VALUES ($1, $2, 'owner', 'accepted');
      `;
      
      await pool.query(addOwnerRoleQuery, [wishlistCopyId, userId]);

      // 4. Zkopírovat položky z originálu
      const copyItemsQuery = `
        INSERT INTO "wishlistCopyItem" (wishlist_copy_id, name, url, price, price_currency, photo_url)
        SELECT $1, name, url, price, price_currency, photo_url
        FROM "wishlistItem"
        WHERE wishlist_id = $2
      `;

      await pool.query(copyItemsQuery, [wishlistCopyId, originalWishlistId]);
      
      res.json({ success: true, message: 'Wishlist úspěšně zkopírován, id kopie je: ' + wishlistCopyId });
      
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
});

// DELETE /api/wishlistHub/deleteWishlistCopy/:wishlistCopyId, smazání kopie wishlistu
router.delete("/deleteWishlistCopy/:wishlistCopyId", authenticateUser, authorizeWishlistCopyAccess(['owner', 'cooperator']), async (req, res) => {
    const userId = req.cookies.session_token;
    const wishlistCopyId = req.params.wishlistCopyId;
    const userRole = req.userRoleForWishlistCopy;
    
    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
    
    try {
      // Smazání kopie wishlistu, pokud je uživatel owner (cascade smazání všech rolí a položek)
      if (userRole === 'owner') {
        const deleteWishlistCopyQuery = `
          DELETE FROM "wishlistCopy"
          WHERE id = $1;
        `;
        
        await pool.query(deleteWishlistCopyQuery, [wishlistCopyId]);
        return res.json({ success: true, message: 'Wishlist úspěšně smazán' });
      } else {
        // Smazání role uživatele, pokud je uživatel cooperator
        const deleteRoleQuery = `
          DELETE FROM "wishlistCopyUserRole"
          WHERE user_id = $1
          AND wishlist_copy_id = $2;
        `;
        
        await pool.query(deleteRoleQuery, [userId, wishlistCopyId]);
        return res.json({ success: true, message: 'Role uživatele úspěšně smazána' });
      }
      
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
});

export default router;