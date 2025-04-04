/**
 * Middleware pro ověření přístupu k wishlistu
 * Uživatel má přístup k wishlistu, pokud:

    Je vlastník wishlistu,
    nebo
    Je ve vztahu userPerson (status 'accepted') s vlastníkem wishlistu, a zároveň:
        wishlist je shared_with_all_my_people = true,
        nebo
        je zapsán v wishlistSharedWith, tedy přímé sdílení s tímto uživatelem
 */
import pool from "../config/db.js";

// Ověří, zda může uživatel editovat daný wishlist
export function hasWishlistAccess() {
    return async (req, res, next) => {
        const userId = req.cookies.session_token;
        const wishlistId = req.params.wishlistId || req.body.wishlistId;
        
        if (!userId || !wishlistId) {
            return res.status(400).send({ success: false, message: "Missing user or wishlist ID" });
        }

        try {
            const queryResult  = await pool.query(`
                SELECT 1

                FROM wishlist w
                JOIN profile p ON w.profile_id = p.id
                LEFT JOIN person pers ON pers.profile_id = p.id
                LEFT JOIN "userPerson" up ON up.person_id = pers.id
                    AND up.user_id = $1
                    AND up.status = 'accepted'
                LEFT JOIN "wishlistSharedWith" wsw ON wsw.wishlist_id = w.id 
                    AND wsw.shared_with_user_id = $1
                    
                WHERE w.id = $2
                AND (
                    p.user_id = $1 -- uživatel je vlastníkem wishlistu
                    OR (
                        up.user_id IS NOT NULL -- propojen přes userPerson (accepted)
                        AND (
                            w.shared_with_all_my_people = true
                            OR wsw.shared_with_user_id IS NOT NULL
                        )
                    )
                )
                LIMIT 1;
            `, [userId, wishlistId]);

            const rows = queryResult .rows;
            
            if (rows.length === 0) {
                return res.status(403).send({ success: false, message: "Access denied – wishlist is private or not shared with you" });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(500).send({ success: false, message: "Database error" });
        }
    }

};