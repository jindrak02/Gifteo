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
        const userId = req.user.id;
        const wishlistId = req.params.wishlistId || req.body.wishlistId;
        
        if (!userId || !wishlistId) {
            return res.status(400).send({ success: false, message: "Missing user or wishlist ID" });
        }

        try {
            const result = await pool.query(`
                SELECT
                    w.id,
                    w.created_by_user_id,
                    w.profile_id,
                    w.is_custom,
                    w.shared_with_all_my_people,
                    p_creator.id AS creator_profile_id,
                    up.id AS user_person_link_id,
                    wsw.id AS direct_share_id

                FROM wishlist w

                -- Získáme profil vlastníka wishlistu (tvůrce)
                LEFT JOIN profile p_creator ON p_creator.user_id = w.created_by_user_id

                -- Získáme případné osoby, které mají propojený profil s daným uživatelem (userId)
                LEFT JOIN person per ON per.profile_id = p_creator.id
                LEFT JOIN "userPerson" up ON up.person_id = per.id
                    AND up.user_id = $1
                    AND up.status = 'accepted'

                -- Přímé sdílení wishlistu s uživatelem
                LEFT JOIN "wishlistSharedWith" wsw ON wsw.wishlist_id = w.id
                    AND wsw.shared_with_user_id = $1

                WHERE w.id = $2
                LIMIT 1;
            `, [userId, wishlistId]);

            const wishlist = result.rows[0];

            if (!wishlist) {
                return res.status(404).json({
                    success: false,
                    message: "Wishlist neexistuje"
                });
            }

            // 1) Je uživatel vlastníkem wishlistu
            if (wishlist.created_by_user_id == userId) {
                return next();
            }

            // 2) Je uživatel propojený s vlastníkem wishlistu (tvůrcem)?
            const isLinkedToCreator = wishlist.user_person_link_id != null;

            if (!isLinkedToCreator) {
                return res.status(403).json({
                    success: false,
                    message: "Uživatel není vlastníkem wishlistu ani s ním propojený"
                });
            }

            // 3) Je wishlist sdílený se všemi blízkými?
            if (wishlist.shared_with_all_my_people) {
                return next();
            }

            // 4) Je wishlist sdílený specificky s tímto uživatelem?
            if (wishlist.direct_share_id) {
                return next();
            }

            // 5) Pokud nic z toho neplatí tak přístup zamítnut
            return res.status(403).json({
                success: false,
                message: "Wishlist není sdílený pro tohoto uživatele"
            });

        } catch (error) {
            console.error("Chyba v middleware hasWishlistAccess:", error);
            return res.status(500).json({
                success: false,
                message: "Interní chyba serveru"
            });
        }
    };

};