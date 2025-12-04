import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { router as articleRoutes } from './routes/article.js';
import { router as authRoutes } from './routes/auth.js';
import { router as commentRoutes } from './routes/comment.js';
import cors from 'cors';

dotenv.config();
const app = express();
// parse JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        message: 'Bonjour je suis un serveur!',
        version: '1.0.0',
        status: 'Le serveur marche à merveille'
    });
});

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `L'origine CORS ${origin} n'est pas autorisée.`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use('/api/articles', articleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/articles/:articleId/comments', commentRoutes);


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