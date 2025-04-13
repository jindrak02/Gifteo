import express from "express";
import cookieParser from "cookie-parser";
import pool from "../../config/db.js";
import { authenticateUser } from "../../middlewares/authMiddleware.js";
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import multer from "multer";
import cloudinary from "../../config/cloudinaryConfig.js";
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
    const profileQuery = `
      SELECT profile.*,
        (SELECT email FROM "user" WHERE id = profile.user_id) AS email,
        (SELECT created_at FROM "user" WHERE id = profile.user_id) AS created_at

      FROM "profile" profile

      WHERE profile.user_id = $1;
    `;
    
    const profileQueryResult = await pool.query(profileQuery,[userId]);

    console.log('Profil uživatele:', profileQueryResult.rows[0]);
    

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
    let { id, name, photo_url, bio, birthdate } = parsedProfile;

    let imageUrl = parsedProfile.photo_url; // Pokud není nový soubor, použiju starý

    // #region nahrání souboru na Cloudinary
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
    // #endregion

    const currentProfileQuery = 'SELECT * FROM "profile" WHERE user_id = $1;';
    const currentProfileResult = await pool.query(currentProfileQuery, [userId]);
    const currentProfile = currentProfileResult.rows[0];

    if (birthdate === null || birthdate === undefined || 
        (typeof birthdate === 'string' && birthdate.trim() === '') ||
        (birthdate && new Date(birthdate).toString() === 'Invalid Date')) {
      birthdate = null;
    }

    const updateProfileQuery = 'UPDATE "profile" SET name = $1, photo_url = $2, bio = $3, birthdate = $4 WHERE user_id = $5;';
    await pool.query(updateProfileQuery,[name, imageUrl, bio, birthdate, userId]);

    const deleteProfileInterestQuery = 'DELETE FROM "profileInterest" WHERE profile_id = $1;';
    await pool.query(deleteProfileInterestQuery,[id]);

    for (const interest of parsedInterests) {
      const insertProfileInterestQuery = 'INSERT INTO "profileInterest" (profile_id, interest_id) VALUES ($1, $2);';
      await pool.query(insertProfileInterestQuery,[id, interest]);
    }

    // Pokud si uživatel změní datum narození, aktualizují se příslušné události všem blízkým osobám
    if (currentProfile.birthdate !== birthdate && birthdate !== null) {

      const getBirthdayString = (birthdate) => {
        const birthdayDate = new Date(birthdate);
        const birthdayMonth = birthdayDate.getMonth() + 1;
        const birthdayDay = birthdayDate.getDate();
        const birthdayYear = new Date().getFullYear();
        const birthdayDateString = `${birthdayYear}-${birthdayMonth}-${birthdayDay}`;

        return birthdayDateString;
      }

      try{

        await pool.query('BEGIN');

        const { rows: connectedUsers } = await pool.query(`
          SELECT DISTINCT "user_id"
          FROM "userPerson"
          WHERE "person_id" = (
            SELECT "id" FROM "person" WHERE "profile_id" = $1
          )
        `, [currentProfile.id]);

        // Smázneme staré události narozenin
        await pool.query(`
          DELETE FROM "calendarEvent"
          WHERE "profile_id" = $1 AND "automatic_event" = 'birthday'
        `, [currentProfile.id]);

        // Pro každého uživatele, který je spojený s profilem, vytvoříme událost
        if (birthdate !== null) {
          for (const user of connectedUsers) {
            const birthdayDateString = getBirthdayString(birthdate);
            const insertEventQuery = `
              INSERT INTO "calendarEvent" ("profile_id", "created_by_user_id", "name", "date", "automatic_event")
              VALUES ($1, $2, $3, $4, 'birthday')
            `;
            await pool.query(insertEventQuery,
              [currentProfile.id,
                user.user_id,
                `${currentProfile.name.split(' ')[0]}´s birthday`,
                birthdayDateString]
            );
          }
        }

        await pool.query('COMMIT');

      } catch (error) {
        await pool.query('ROLLBACK');
        console.log('Chyba při aktualizaci události v kalendáři:', error);
      }
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
    console.log('Chyba při vytváření wishlistu:', error);
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
          wi."price_currency" AS currency,
          wi."description" itemDescription,
          wi."photo_url" itemPhotoUrl,
          wi."url" itemUrl

      FROM "wishlist" w
      LEFT JOIN "wishlistItem" wi
        ON w.id = wi.wishlist_id AND wi.deleted = false

      WHERE w.profile_id = $1
      AND w.deleted = false
      AND w.created_by_user_id = $2
      AND w.is_custom = false
      ORDER BY w.created_at DESC;
    `;
    const wishlistsQueryResult = await pool.query(wishlistsQuery, [profileId, userId]);

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
          currency: row.currency,
          description: row.itemdescription,
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
    const deleteWishlistItemsQuery = `
      UPDATE "wishlistItem"
      SET deleted = true
      WHERE wishlist_id = $1;
    `;
    await pool.query(deleteWishlistItemsQuery,[wishlistId]);

    const deleteWishlistQuery = `
      UPDATE "wishlist"
      SET deleted = true
      WHERE id = $1;
    `;
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

  console.log(items);

  try {
    
    // 1. Soft delete položek, které nejsou v seznamu
    const existingIds = items
    .filter(item => item.id)
    .map(item => item.id);

    if (existingIds.length > 0) {
      // Vygenerujeme seznam parametrů: $2, $3, $4, ...
      const idPlaceholders = existingIds.map((_, i) => `$${i + 2}`).join(", ");

      const softDeleteQuery = `
        UPDATE "wishlistItem"
        SET deleted = true
        WHERE wishlist_id = $1
          AND id NOT IN (${idPlaceholders});
      `;

      await pool.query(softDeleteQuery, [wishlistId, ...existingIds]);
    } else {
      const softDeleteAllQuery = `
        UPDATE "wishlistItem"
        SET deleted = true
        WHERE wishlist_id = $1;
      `;
      await pool.query(softDeleteAllQuery, [wishlistId]);
    }

    // 2. Aktualizace existujícíh položek
    const existingItemsQuery = `
      SELECT id, name, description, price, price_currency, photo_url, url
      FROM "wishlistItem"
      WHERE wishlist_id = $1 AND deleted = false;
    `;
    const { rows: existingItems } = await pool.query(existingItemsQuery, [wishlistId]);

    const existingItemsMap = new Map();
    for (const item of existingItems) {
      existingItemsMap.set(item.id, item);
    }

    for (const item of items) {
      if (item.id) {
          const existing = existingItemsMap.get(item.id);
          if (!existing) continue;

          const changed =
            sanitize(item.name) !== existing.name ||
            sanitize(item.description || "") !== existing.description ||
            parseFloat(item.price ?? null) !== parseFloat(existing.price ?? null) ||
            sanitize(item.currency) !== existing.price_currency ||
            sanitize(item.photo_url) !== existing.photo_url ||
            sanitize(item.url) !== existing.url;

          if (!changed) continue;

          const updateItemQuery = `
            UPDATE "wishlistItem"
            SET name = $1, description = $2, price = NULLIF($3, '')::NUMERIC, price_currency = $4, photo_url = $5, url = $6, modified_by_owner = NOW()
            WHERE id = $7;
          `;
          await pool.query(updateItemQuery,[
            sanitize(item.name), 
            sanitize(item.description || ""),
            sanitize(item.price),
            sanitize(item.currency),
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
          INSERT INTO "wishlistItem" (wishlist_id, name, description, price, price_currency, photo_url, url)
          VALUES ($1, $2, $3, NULLIF($4, '')::NUMERIC, $5, $6, $7);
        `;
        await pool.query(insertItemQuery,[
          sanitize(wishlistId), 
          sanitize(item.name),
          sanitize(item.description || ""),
          sanitize(item.price),
          sanitize(item.currency),
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