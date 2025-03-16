import express from "express";
import cookieParser from "cookie-parser";
import pool from "./db.js";
import { authenticateUser } from "./authMiddleware.js";
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

function sanitize(input){
  return purify.sanitize(input);
}

const router = express.Router();
router.use(cookieParser());

// GET /api/personsData/UserPersons, vrátí všechny osoby uživatele
router.get("/UserPersons", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
  
    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
      const peopleQuery = `
        SELECT up.user_id, up.person_id, p.profile_id, pr."name", pr.photo_url
            FROM "userPerson" up
            LEFT JOIN "person" p ON up.person_id = p.id
            LEFT JOIN "profile" pr ON p.profile_id = pr.id
            WHERE up.user_id = $1
            AND up.status = 'accepted';
        `;
        const personWishlistQuery = `SELECT w."name" FROM "wishlist" w WHERE w.profile_id = $1;`;
        
        const peopleQueryResult = await pool.query(peopleQuery, [userId]);
        
        // Get wishlist for each person
        const enrichedPeopleData = await Promise.all(
            peopleQueryResult.rows.map(async (person) => {
                const wishlistResult = await pool.query(personWishlistQuery, [person.profile_id]);
                return {
                    ...person,
                    wishlists: wishlistResult.rows
                };
            })
        );
        
        //console.log(enrichedPeopleData);
        res.json(enrichedPeopleData);

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

// DELETE /api/personsData/DeletePerson, smaže osobu uživatele
router.delete("/DeletePerson/:personId", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const personId = sanitize(req.params.personId);

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
      const deletePersonQuery = `
        DELETE FROM "userPerson"
            WHERE user_id = $1
            AND person_id = $2
            RETURNING *;
        `;
        const deletePersonResult = await pool.query(deletePersonQuery, [userId, personId]);
        res.send({success: true, message: "Person '"+ personId +"' deleted successfully"});

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

// GET /api/personsData/PersonDetails, vrátí detaily osoby a jejích wishlistů
router.get("/PersonDetails/:personId", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const personId = sanitize(req.params.personId);

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
        const personDetailsQuery = `
            SELECT
                pers.id as "person_id",
                p."name",
                p.photo_url,
                p.bio,
                p.birthdate
            
            FROM "profile" p
            LEFT JOIN "person" pers on p.id = pers.profile_id
            WHERE pers.id = $1;
        `;
    
        const personInterestsQuery = `
            SELECT
                i."name"
                
            FROM "profile" p
            LEFT JOIN "person" pers on p.id = pers.profile_id
            LEFT JOIN "profileInterest" pi on p.id = pi.profile_id
            LEFT JOIN "interest" i on pi.interest_id = i.id
            WHERE pers.id = $1;
        `;

        const personWishlistsQuery = `
            SELECT
                w.id as "wishlist_id",
                w."name"
                
            FROM "profile" p
            LEFT JOIN "person" pers on p.id = pers.profile_id
            LEFT JOIN "wishlist" w on p.id = w.profile_id
            WHERE pers.id = $1;
        `;

        const wishlistItems = `
            SELECT
                wi.photo_url

            FROM "wishlistItem" wi
            WHERE wi.wishlist_id = $1;
        `;

        const personDetailsQueryResult = await pool.query(personDetailsQuery, [personId]);
        const personInterestsQueryResult = await pool.query(personInterestsQuery, [personId]);
        const personWishlistsQueryResult = await pool.query(personWishlistsQuery, [personId]);

        // Vytvoření objektu s detaily osoby
        const personDetails = personDetailsQueryResult.rows[0];
        
        // Přidání zájmu do objektu s detaily osoby jako array
        personDetails.interests = personInterestsQueryResult.rows.map(row => row.name);

        // Přidání wishlistů do objektu s detaily osoby jako array
        personDetails.wishlists = await Promise.all(
            personWishlistsQueryResult.rows.map(async (wishlist) => {
                const wishlistItemsResult = await pool.query(wishlistItems, [wishlist.wishlist_id]);
                return {
                    ...wishlist,
                    items: wishlistItemsResult.rows.map(row => row.photo_url)
                };
            })
        );

        console.log(personDetails);

        res.json(personDetails);

    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
});

// GET /api/personsData/WishlistItems, vrátí všechny položky wishlistu dle id wishlistu
router.get("/WishlistItems/:wishlistId", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const wishlistId = sanitize(req.params.wishlistId);

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
        const wishlistItemsQuery = `
            SELECT
                w."name" as "wishlist_name",
                wi."name",
                wi.price,
                wi.url,
                wi.photo_url

            FROM "wishlistItem" wi
            LEFT JOIN "wishlist" w on wi.wishlist_id = w.id
            WHERE wi.wishlist_id = $1;
        `;

        const wishlistItemsQueryResult = await pool.query(wishlistItemsQuery, [wishlistId]);
        res.json(wishlistItemsQueryResult.rows);

    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
});

// GET /api/personsData/UserProfile, vrátí profil uživatele s emailem pro přidání, dle jména uživatele
router.get("/UserProfile/:userName", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const userName = sanitize(req.params.userName);

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
        const userProfileQuery = `
            SELECT
                u.id,
                u.email,
                p.name,
                p.photo_url
            FROM "user" u
            LEFT JOIN "profile" p ON u.id = p.user_id
            WHERE p.name ILIKE $1;
        `;

        const userProfileQueryResult = await pool.query(userProfileQuery, [`%${userName}%`]);
        res.json(userProfileQueryResult.rows);

    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
});

export default router;