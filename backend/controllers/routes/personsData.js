import express from "express";
import cookieParser from "cookie-parser";
import pool from "../../config/db.js";
import { authenticateUser } from "../../middlewares/authMiddleware.js";
import { hasUserPerson } from "../../middlewares/personAccessMiddleware.js";
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import e from "express";

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
        SELECT pr.user_id, up.person_id, p.profile_id, pr."name", pr.photo_url, u.country_code
            FROM "userPerson" up
            LEFT JOIN "person" p ON up.person_id = p.id
            LEFT JOIN "profile" pr ON p.profile_id = pr.id
            LEFT JOIN "user" u ON pr.user_id = u.id
            WHERE up.user_id = $1
            AND up.status = 'accepted';
        `;
        const personWishlistQuery = `
            SELECT w."name"
            
            FROM "wishlist" w
            LEFT JOIN "wishlistSharedWith" ws ON w.id = ws.wishlist_id AND ws.shared_with_user_id = $2
            
            WHERE w.profile_id = $1
            AND w.deleted = false
            AND (
                w.shared_with_all_my_people = true
                OR ws.shared_with_user_id IS NOT NULL
            )
            AND w.is_custom = false;`;
        
        const peopleQueryResult = await pool.query(peopleQuery, [userId]);
        
        // Get wishlist for each person
        const enrichedPeopleData = await Promise.all(
            peopleQueryResult.rows.map(async (person) => {
                const wishlistResult = await pool.query(personWishlistQuery, [person.profile_id, userId]);
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

// DELETE /api/personsData/DeletePerson, smaže osobu uživatele a poté obráceně (zruší propojení)
router.delete("/DeletePerson/:personId", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const personId = sanitize(req.params.personId);
    const { secondUserId } = req.body;

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
        const usersPersonIdQuery = `SELECT pers.id FROM "profile" p LEFT JOIN "person" pers ON p.id = pers.profile_id WHERE p.user_id = $1;`
        const usersPersonIdResult = await pool.query(usersPersonIdQuery, [userId]);
        const secondPersonId = usersPersonIdResult.rows[0].id;

        // console.log('První dvojice ke smazání:');
        // console.log(userId);
        // console.log(personId);

        // console.log('Druhá dvojice ke smazání:');
        // console.log(secondUserId);
        // console.log(secondPersonId);

        // Smažu první dvojici
        const deletePersonQuery1 = `
            DELETE FROM "userPerson"
                WHERE user_id = $1
                AND person_id = $2
                RETURNING *;
            `;
        const deletePersonResult1 = await pool.query(deletePersonQuery1, [userId, personId]);

        // Smažu druhou dvojici
        const deletePersonQuery2 = `
            DELETE FROM "userPerson"
                WHERE user_id = $1
                AND person_id = $2
                RETURNING *;
            `;
        const deletePersonResult2 = await pool.query(deletePersonQuery2, [secondUserId, secondPersonId]);
        
        // Smažu eventy z kalendáře
        try {
            const senderProfileId = (await pool.query(`SELECT id FROM "profile" WHERE user_id = $1;`, [userId])).rows[0].id;
            const senderUserId = userId;
            const receiverProfileId = (await pool.query(`SELECT id FROM "profile" WHERE user_id = $1;`, [secondUserId])).rows[0].id;
            const receiverUserId = secondUserId;
    
            if (!senderProfileId || !receiverProfileId) {
                return res.status(400).send({ success: false, message: "Sender or receiver profile not found" });
            }
            
            const deleteCalendarEventsQuery = `
                DELETE FROM "calendarEvent"
                WHERE 
                    (profile_id = $1 AND created_by_user_id = $2)
                    OR
                    (profile_id = $3 AND created_by_user_id = $4);
            `;
    
            await pool.query(deleteCalendarEventsQuery, [
                senderProfileId, receiverUserId, receiverProfileId, senderUserId
            ]);
        } catch (error) {
            console.error("Error deleting calendar events:", error);
            return res.status(500).send({ success: false, message: error.message });
        }
        
        res.send({success: true, message: "Person '"+ personId +"' deleted successfully"});

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

// GET /api/personsData/PersonDetails, vrátí detaily osoby a jejích wishlistů
router.get("/PersonDetails/:personId", authenticateUser, hasUserPerson(), async (req, res) => {
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
            LEFT JOIN "wishlistSharedWith" ws ON w.id = ws.wishlist_id AND ws.shared_with_user_id = $2

            WHERE pers.id = $1
            AND w.is_custom = false
            AND w.deleted = false
            AND (
                w.shared_with_all_my_people = true
                OR ws.shared_with_user_id IS NOT NULL
            );
        `;

        const wishlistItems = `
            SELECT
                wi.photo_url

            FROM "wishlistItem" wi
            WHERE wi.wishlist_id = $1
            AND wi.deleted = false;
        `;

        const personDetailsQueryResult = await pool.query(personDetailsQuery, [personId]);
        const personInterestsQueryResult = await pool.query(personInterestsQuery, [personId]);
        const personWishlistsQueryResult = await pool.query(personWishlistsQuery, [personId, userId]);

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
                wi.price_currency AS currency,
                wi.url,
                wi.description,
                wi.photo_url

            FROM "wishlistItem" wi
            LEFT JOIN "wishlist" w on wi.wishlist_id = w.id
            WHERE wi.wishlist_id = $1
            AND wi.deleted = false;
        `;

        const wishlistItemsQueryResult = await pool.query(wishlistItemsQuery, [wishlistId]);
        res.json(wishlistItemsQueryResult.rows);

    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
});

// GET /api/personsData/UserProfile, vrátí profily uživatelů s emailem pro přidání, dle jména uživatele při vyhledávání
router.get("/UserProfile/:userName", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const userName = sanitize(req.params.userName);

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
        const userProfileQuery = `
            SELECT
                pers.id as person_id,
                u.email,
                p.name,
                p.photo_url,
                up.status as "connectionStatus"
                
            FROM "user" u
            LEFT JOIN "profile" p ON u.id = p.user_id
            LEFT JOIN "person" pers ON p.id = pers.profile_id
            LEFT JOIN "userPerson" up 
                ON up.user_id = $2
                AND up.person_id = pers.id
            WHERE (p.name ILIKE $1 OR u.email ILIKE $1)
            AND u.id != $2;
        `;

        const userProfileQueryResult = await pool.query(userProfileQuery, [`%${userName}%`, userId]);
        res.json(userProfileQueryResult.rows);

    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
});

// POST /api/personsData/AddPerson, přidá osobu uživatele
router.post("/AddPerson", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const { personId } = req.body;

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }

    if (!personId) {
        return res.status(500).send({ success: false, message: "Person ID not found in request body" });
    }
  
    try {
        const checkPersonQuery = `
            SELECT * FROM "userPerson"
            WHERE user_id = $1
            AND person_id = $2;
        `;
        const checkPersonResult = await pool.query(checkPersonQuery, [userId, personId]);

        if(checkPersonResult.rows.length != 0){
            return res.send({success: false, message: "Person already added"});
        }

        const addPersonQuery = `
            INSERT INTO "userPerson" ("user_id", "person_id")
            VALUES ($1, $2)
            RETURNING *;
        `;

        const addPersonResult = await pool.query(addPersonQuery, [userId, personId]);
        
        if(addPersonResult.rows.length != 0){
            return res.send({success: true, message: "Person added successfully"});
        } else {
            return res.send({success: false, message: "Person was not added"});
        }

    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
});

// GET /api/personsData/invitations, vrátí všechny pozvánky uživatele
router.get("/invitations", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
  
    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
      const invitationsQuery = `
        SELECT 
            up.id,
            p."name" as "senderName",
            
            (SELECT prof.user_id
            FROM "person" pers
            LEFT JOIN "profile" prof on pers.profile_id = prof.id
            WHERE pers.id = up.person_id) as "receiverUserId",
            
            p.photo_url "senderProfilePicture",
            up.created_at as "createdAt"
            
        FROM "userPerson" up
        LEFT JOIN "profile" p ON up.user_id = p.user_id
        WHERE up.status = 'pending'
        AND (SELECT prof.user_id
            FROM "person" pers
            LEFT JOIN "profile" prof on pers.profile_id = prof.id
            WHERE pers.id = up.person_id) = $1;
        `;
        const invitationsQueryResult = await pool.query(invitationsQuery, [userId]);
        res.json(invitationsQueryResult.rows);

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

// PATCH /api/personsData/acceptInvitation, přijme pozvánku a propojí uživatele
router.patch("/acceptInvitation/:invitationId", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const invitationId = sanitize(req.params.invitationId);

    console.log(invitationId);

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
        // Přijme pozvánku
        const acceptInvitationQuery = `
            UPDATE "userPerson"
            SET status = 'accepted'
            WHERE id = $1
            RETURNING *;
        `;
        const acceptInvitationResult = await pool.query(acceptInvitationQuery, [invitationId]);

        // #region Propojí osoby navzájem (sendera přidá receiverovi)
            // 1. Zjistíme id osoby, která poslala pozvánku
            const senderIdQuery = `
                SELECT pers.id
                FROM "userPerson" up
                LEFT JOIN "profile" prof ON up.user_id = prof.user_id
                LEFT JOIN "person" pers ON prof.id = pers.profile_id
                WHERE up.id = $1;
            `;
            const senderIdResult = await pool.query(senderIdQuery, [invitationId]);

            if (senderIdResult.rows.length === 0) {
                return res.status(400).send({ success: false, message: "Sender not found for the given invitation ID" });
            }

            // 2. Propojíme osoby
            const addPersonQuery = `
                INSERT INTO "userPerson" ("user_id", "person_id", "status")
                VALUES ($1, $2, $3)
                RETURNING *;
            `;
            const addPersonResult = await pool.query(addPersonQuery, [userId, senderIdResult.rows[0].id, 'accepted']);

            // 3. Přidáme narozeniny osobám navzájem do kalendáře
            const birthdayQuery = `
                SELECT 
                    sender_prof.id AS sender_profile_id,
                    sender_prof.user_id AS sender_user_id,
                    sender_prof.name AS sender_name,
                    sender_prof.birthdate AS sender_birthdate,

                    receiver_prof.id AS receiver_profile_id,
                    receiver_prof.user_id AS receiver_user_id,
                    receiver_prof.name AS receiver_name,
                    receiver_prof.birthdate AS receiver_birthdate

                FROM "userPerson" up
                JOIN "profile" sender_prof ON up.user_id = sender_prof.user_id
                JOIN "person" pers ON up.person_id = pers.id
                JOIN "profile" receiver_prof ON pers.profile_id = receiver_prof.id

                WHERE up.id = $1;
            `;
            const birthdayResult = await pool.query(birthdayQuery, [invitationId]);

            const senderProfileId = birthdayResult.rows[0].sender_profile_id;
            const senderUserId = birthdayResult.rows[0].sender_user_id;
            const senderName = birthdayResult.rows[0].sender_name;
            const senderBirthdate = birthdayResult.rows[0].sender_birthdate;

            const receiverProfileId = birthdayResult.rows[0].receiver_profile_id;
            const receiverUserId = birthdayResult.rows[0].receiver_user_id;
            const receiverName = birthdayResult.rows[0].receiver_name;
            const receiverBirthdate = birthdayResult.rows[0].receiver_birthdate;

            const getBirthdayString = (birthdate) => {
                const birthdayDate = new Date(birthdate);
                const birthdayMonth = birthdayDate.getMonth() + 1;
                const birthdayDay = birthdayDate.getDate();
                const birthdayYear = new Date().getFullYear();
                const birthdayDateString = `${birthdayYear}-${birthdayMonth}-${birthdayDay}`;

                return birthdayDateString;
            }

            if (senderBirthdate != null) {
                try {
                    const senderBirthdayDateString = getBirthdayString(senderBirthdate);
                    const addBirthdayQuerySender = `
                        INSERT INTO "calendarEvent" ("profile_id", "created_by_user_id", "name",  "date", "automatic_event")
                        VALUES ($1, $2, $3, $4, 'birthday')
                        RETURNING *;
                    `;
                    await pool.query(addBirthdayQuerySender, [senderProfileId, receiverUserId, `${senderName.split(' ')[0]}´s Birthday`, senderBirthdayDateString]);   
                } catch (error) {
                    console.error("Error parsing sender's birthday:", error);
                }
            }

            if (receiverBirthdate != null) {
                try {
                    const receiverBirthdayDateString = getBirthdayString(receiverBirthdate);
                    const addBirthdayQueryReceiver = `
                        INSERT INTO "calendarEvent" ("profile_id", "created_by_user_id", "name",  "date", "automatic_event")
                        VALUES ($1, $2, $3, $4, 'birthday')
                        RETURNING *;
                    `;
                    await pool.query(addBirthdayQueryReceiver, [receiverProfileId, senderUserId, `${receiverName.split(' ')[0]}´s Birthday`, receiverBirthdayDateString]);   
                } catch (error) {
                    console.error("Error parsing receiver's birthday:", error);
                }
            }



        // #endregion
        res.send({success: true, message: "Invitation accepted successfully"});

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

// DELETE /api/personsData/rejectInvitation, odmítne pozvánku
router.delete("/rejectInvitation/:invitationId", authenticateUser, async (req, res) => {
    const userId = req.cookies.session_token;
    const invitationId = sanitize(req.params.invitationId);

    if (!userId) {
      return res.status(401).send({ success: false, message: "User ID not found in cookies" });
    }
  
    try {
        const rejectInvitationQuery = `
            DELETE FROM "userPerson"
            WHERE id = $1
            RETURNING *;
        `;
        const rejectInvitationResult = await pool.query(rejectInvitationQuery, [invitationId]);
        res.send({success: true, message: "Invitation rejected successfully"});

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

export default router;