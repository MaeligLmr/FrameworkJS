import mongoose from "mongoose";


export async function connectDB() {
    try {
        const options = {};
        const conn = await mongoose.connect(process.env.MONGO_DB_URI, options);
        console.log("MongoDB connecté : ", conn.connection.host);
        console.log("Base de données : ", conn.connection.name);
        return conn;
    } catch (err) {
        console.error("Erreur de connexion à MongoDB:", err.message);
        process.exit(1);
    }
}

export async function disconnectDB() {
    try {
        await mongoose.connection.close();
        console.log("Connexion à MongoDB fermée.");
    } catch (err) {
        console.error("Erreur lors de la déconnexion de MongoDB:", err.message);
    }
}

process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
});