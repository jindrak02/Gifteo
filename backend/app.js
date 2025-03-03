import express from 'express';
import auth from './auth.js';

const app = express();
const port = 3000;

// Použití middleware pro autentizaci
app.use('/auth', auth);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});