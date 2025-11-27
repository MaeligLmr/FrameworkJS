import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { router as articleRoutes } from './routes/article.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        message: 'Bonjour je suis un serveur!',
        version: '1.0.0',
        status: 'Le serveur marche à merveille'
    });
});


app.use('/api/articles', articleRoutes);

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });

    } catch (error) {
        console.error("Erreur lors du démarrage du serveur:", error.message);
        process.exit(1);
    }
}

startServer();