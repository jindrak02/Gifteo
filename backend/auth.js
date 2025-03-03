import express from 'express';
import pool from './db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM "user"');
        console.log('Query result:', users.rows); // Přidáno logování
        res.json(users.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

export default router;