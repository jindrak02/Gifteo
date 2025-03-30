import pool from "../config/db.js";

// Ověří, zda může uživatel editovat daný wishlist
export function hasWishlistAccess(wishlistId) {
    const userId = req.cookies.session_token;
};