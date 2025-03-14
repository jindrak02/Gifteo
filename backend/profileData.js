import express from "express";
import cookieParser from "cookie-parser";
import pool from "./db.js";
import { authenticateUser } from "./authMiddleware.js";
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import multer from "multer";
import cloudinary from "./cloudinaryConfig.js";
import { fileTypeFromBuffer } from "file-type";

const window = new JSDOM('').window;
const purify = DOMPurify(window);

function sanitize(input){
  return purify.sanitize(input);
}

const router = express.Router();
router.use(cookieParser());

// Multer - ukládání do paměti (před odesláním do Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET /api/profileData/profile, vrátí profil uživatele
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

// GET /api/profileData/profileInterest, vrátí zájmy profilu uživatele
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

// GET /api/profileData/interests, vrátí předdefinované zájmy k výběru
router.get("/interests", authenticateUser, async (req, res) => {

  try {
    const interestsQuery = 'SELECT * FROM "interest";';
    const interestsQueryResult = await pool.query(interestsQuery);

    res.json(interestsQueryResult.rows);

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// PUT /api/profileData/updateProfile, aktualizuje profil uživatele
router.put("/updateProfile", authenticateUser, upload.single("file"), async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  try {
    // Zpracování JSON dat
    const { profile, interests } = req.body;
    const parsedProfile = JSON.parse(profile);
    const parsedInterests = JSON.parse(interests);
    const { id, name, photo_url, bio, birthdate } = parsedProfile;

    let imageUrl = parsedProfile.photo_url; // Pokud není nový soubor, použiju starý

    // console.log(parsedProfile);
    // console.log(parsedInterests);
    
    if (req.file) {
      const fileType = await fileTypeFromBuffer(req.file.buffer);
      if (!fileType || !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(fileType.mime)) {
        return res.status(400).json({ error: "Neplatný typ souboru" });
        console.log('Neplatný typ souboru');
      }

      // Převod bufferu na data URI (nutné pro Cloudinary API)
      const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      console.log('Nahrávám obrázek');
      
      // Nahrání na Cloudinary
      const result = await cloudinary.uploader.upload(base64String, {
        folder: "profile_pictures", // Volitelná složka na Cloudinary
        resource_type: "auto", // Podpora pro obrázky, videa, soubory
      });
      
      imageUrl = result.secure_url;
      //console.log(result);
    }

    const updateProfileQuery = 'UPDATE "profile" SET name = $1, photo_url = $2, bio = $3, birthdate = $4 WHERE user_id = $5;';
    await pool.query(updateProfileQuery,[name, imageUrl, bio, birthdate, userId]);

    const deleteProfileInterestQuery = 'DELETE FROM "profileInterest" WHERE profile_id = $1;';
    await pool.query(deleteProfileInterestQuery,[id]);

    for (const interest of parsedInterests) {
      const insertProfileInterestQuery = 'INSERT INTO "profileInterest" (profile_id, interest_id) VALUES ($1, $2);';
      await pool.query(insertProfileInterestQuery,[id, interest]);
    }

    res.json({ success: true });
    
  } catch (error) {
    res.status(500).send({ error: error });
    console.log(error);
  }
});

// POST /api/profileData/addWishlist, vytvoří nový wishlist
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
    const insertWishlistQueryResult = await pool.query(insertWishlistQuery,[
      sanitize(profileId), 
      sanitize(name), 
      userId
    ]);

    res.json({ success: true, wishlist: insertWishlistQueryResult.rows[0] });

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// GET /api/profileData/wishlistsData, vrátí všechny wishlits uživatele včetně položek
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

// DELETE /api/profileData/deleteWishlist, smaže wishlist
router.delete("/deleteWishlist/:wishlistId", authenticateUser, async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  const { wishlistId } = req.params;

  try {
    const deleteWishlistItemsQuery = 'DELETE FROM "wishlistItem" WHERE wishlist_id = $1;';
    await pool.query(deleteWishlistItemsQuery,[wishlistId]);

    const deleteWishlistQuery = 'DELETE FROM "wishlist" WHERE id = $1;';
    await pool.query(deleteWishlistQuery,[wishlistId]);

    res.json({ success: true, message: "Wishlist deleted" });

  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
    console.log(error);
  }
});

// PUT /api/profileData/updateWishlist, aktualizuje wishlist
router.put("/updateWishlist/:wishlistId", authenticateUser, async (req, res) => {
  const userId = req.cookies.session_token;

  if (!userId) {
    return res.status(401).send({ success: false, message: "User ID not found in cookies" });
  }

  const { items } = req.body;
  const wishlistId = req.params.wishlistId;

  // Pokud je items.price prázdné, undefined, null nebo "" nastavím ho na null
  // items.forEach(item => {
  //   if (item.price == undefined || item.price === "") {
  //     item.price = null;
  //   }
  // });

  console.log(items);

  try {

    const existingIds = items.filter(item => item.id).map(item => `'${item.id}'`).join(",");

    // 1. Smazání všech položek, které nejsou v novém seznamu
    if (existingIds) {
      const deleteItemsQuery = `
        DELETE FROM "wishlistItem"
        WHERE id NOT IN (${existingIds}) AND wishlist_id = $1;
      `;
      await pool.query(deleteItemsQuery,[wishlistId]);
    } else {
      const deleteItemsQuery = `
        DELETE FROM "wishlistItem"
        WHERE wishlist_id = $1;
      `;
      await pool.query(deleteItemsQuery,[wishlistId]);
    }

    // 2. Aktualizace existujícíh položek
    for (const item of items) {
      if (item.id) {
        const updateItemQuery = `
          UPDATE "wishlistItem"
          SET name = $1, price = $2, photo_url = $3, url = $4
          WHERE id = $5;
        `;
        await pool.query(updateItemQuery,[
          sanitize(item.name), 
          sanitize(item.price),
          sanitize(item.photo_url), 
          sanitize(item.url), 
          sanitize(item.id)
        ]);
      }
    }

    // 3. Vytvoření nových položek
    for (const item of items) {
      if (!item.id) {
        const insertItemQuery = `
          INSERT INTO "wishlistItem" (wishlist_id, name, price, photo_url, url)
          VALUES ($1, $2, NULLIF($3, '')::NUMERIC, $4, $5);
        `;
        await pool.query(insertItemQuery,[
          sanitize(wishlistId), 
          sanitize(item.name), 
          sanitize(item.price), 
          sanitize(item.photo_url), 
          sanitize(item.url)
        ]);
      }
    };

    res.json({ success: true, message: "Wishlist updated" });
    
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: error.message });
  }
});

export default router;