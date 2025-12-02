exports.getUserProfile = (req, res) => {
    const userId = req.user.id;
    // Logique pour récupérer le profil utilisateur depuis la base de données
    res.status(200).json({
        success: true,
        data: {
            userId
        }
    });
};