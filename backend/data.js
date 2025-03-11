import express from "express";
import cookieParser from "cookie-parser";
import pool from "./db.js";
import { authenticateUser } from "./authMiddleware.js";

const router = express.Router();
router.use(cookieParser());

// GET /api/data/profile, vrátí profil uživatele
router.get("/profile", authenticateUser, async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  try {
    const profileQuery = 'SELECT * FROM "profile" profile WHERE profile.user_id = $1;';
    const profileQueryResult = await pool.query(profileQuery,[userId]);

    res.json(profileQueryResult.rows[0]);

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// GET /api/data/profileInterest, vrátí zájmy profilu uživatele
router.get("/profileInterest", authenticateUser, async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  try {
    const profileIdQuery = 'SELECT profile.id FROM "profile" profile WHERE profile.user_id = $1;';
    const profileIdQueryResult = await pool.query(profileIdQuery,[userId]);
    
    const profileInterestQuery = 'SELECT i."name", i."id" FROM "profileInterest" pi LEFT JOIN "interest" i on pi.interest_id = i.id WHERE pi.profile_id = $1;';
    const profileInterestQueryResult = await pool.query(profileInterestQuery,[profileIdQueryResult.rows[0].id]);

    res.json(profileInterestQueryResult.rows);

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// GET /api/data/interests, vrátí předdefinované zájmy k výběru
router.get("/interests", authenticateUser, async (req, res) => {

  try {
    const interestsQuery = 'SELECT * FROM "interest";';
    const interestsQueryResult = await pool.query(interestsQuery);

    res.json(interestsQueryResult.rows);

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// PUT /api/data/updateProfile, aktualizuje profil uživatele
router.put("/updateProfile", authenticateUser, async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  const { id, name, photo_url, bio, birthdate } = req.body.profileData;
  const interests = req.body.interests;

  try {
    const updateProfileQuery = 'UPDATE "profile" SET name = $1, photo_url = $2, bio = $3, birthdate = $4 WHERE user_id = $5;';
    await pool.query(updateProfileQuery,[name, photo_url, bio, birthdate, userId]);

    const deleteProfileInterestQuery = 'DELETE FROM "profileInterest" WHERE profile_id = $1;';
    await pool.query(deleteProfileInterestQuery,[id]);

    for (const interest of interests) {
      const insertProfileInterestQuery = 'INSERT INTO "profileInterest" (profile_id, interest_id) VALUES ($1, $2);';
      await pool.query(insertProfileInterestQuery,[id, interest]);
    }

    res.json({ success: true, message: "Profile updated" });
    
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
  
});

// POST /api/data/addWishlist, vytvoří nový wishlist
router.post("/addWishlist", authenticateUser, async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  const { name, profileId} = req.body;

  try {
    const insertWishlistQuery = `
      INSERT INTO "wishlist" ("profile_id", "name", "created_by_user_id")
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const insertWishlistQueryResult = await pool.query(insertWishlistQuery,[profileId, name, userId]);

    res.json({ success: true, wishlist: insertWishlistQueryResult.rows[0] });

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// GET /api/data/wishlistsData, vrátí všechny wishlits uživatele včetně položek
router.get("/wishlistsData", authenticateUser, async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  try {

    const profileIdQuery = 'SELECT profile.id FROM "profile" profile WHERE profile.user_id = $1;';
    const profileIdQueryResult = await pool.query(profileIdQuery,[userId]);
    const profileId = profileIdQueryResult.rows[0].id;

    const wishlistsQuery = `
      SELECT
        w."id" wishlistId,
        w."name" wishlistName,
        wi."id" itemId,
        wi."name" itemName,
        wi."price" itemPrice,
        wi."photo_url" itemPhotoUrl,
        wi."url" itemUrl
        
      FROM "wishlist" w
      LEFT JOIN "wishlistItem" wi on w.id = wi.wishlist_id
      WHERE w.profile_id = $1
      ORDER BY w.created_at desc;
    `;
    const wishlistsQueryResult = await pool.query(wishlistsQuery, [profileId]);

    const wishlistsMap = new Map();

    wishlistsQueryResult.rows.forEach(row => {
      if (!wishlistsMap.has(row.wishlistid)) {
        wishlistsMap.set(row.wishlistid, {
          id: row.wishlistid,
          name: row.wishlistname,
          items: []
        });
      }

      if (row.itemid) {
        wishlistsMap.get(row.wishlistid).items.push({
          id: row.itemid,
          name: row.itemname,
          price: row.itemprice,
          photo_url: row.itemphotourl,
          url: row.itemurl
        });
      }
    });

    const wishlists = Array.from(wishlistsMap.values());

    res.json(wishlists);

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// DELETE /api/data/deleteWishlist, smaže wishlist
router.delete("/deleteWishlist/:wishlistId", authenticateUser, async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  const { wishlistId } = req.params;

  try {
    const deleteWishlistQuery = 'DELETE FROM "wishlist" WHERE id = $1;';
    await pool.query(deleteWishlistQuery,[wishlistId]);

    res.json({ success: true, message: "Wishlist deleted" });

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

export default router;