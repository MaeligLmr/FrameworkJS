import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import articleService from "../services/articleService";
import Loader from "../components/common/Loader";
import ProfileForm from "../components/profile/ProfileForm";
import PasswordForm from "../components/profile/PasswordForm";
import commentService from "../services/commentService";
import PopupForm from "../components/common/PopupForm";
import Avatar from "../components/profile/avatar";

export const Profile = () => {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(user);
    const [loading, setLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ articles: 0, comments: 0 });
    const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
    const [isPasswordPopupOpen, setIsPasswordPopupOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch profile
                const profileRes = await userService.getUserProfile();
                const profile = profileRes?.data || user;
                setUserProfile(profile);

                // Fetch all articles to count user's articles
                const countviews = await articleService.getViewsByAuthor(user._id);
                const countArticles = await articleService.getCountArticlesByAuthor(user._id);
                const countComments = await commentService.getCountCommentsByAuthor(user._id);
                setStats({
                    views: countviews.count,
                    articles: countArticles.count,
                    comments: countComments.count
                });
            } catch (err) {
                console.error('Erreur lors du chargement:', err);
                setError('Erreur lors du chargement du profil');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleProfileUpdate = async (formData) => {
        setUpdateLoading(true);
        try {
            const res = await userService.updateUserProfile(formData);
            const updatedUser = res?.data || formData;
            setUserProfile(updatedUser);
            setUser(updatedUser);
            setIsProfilePopupOpen(false);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handlePasswordChange = async (formData) => {
        setPasswordLoading(true);
        try {
            await userService.changePassword(formData);
            setIsPasswordPopupOpen(false);
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!user) {
        return (
            <main className="min-h-screen bg-white p-3">
                <div className="max-w-4xl mx-auto">
                    <p className="text-center text-gray-600">Redirection...</p>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-white p-3 flex items-center justify-center">
                <Loader />
            </main>
        );
    }

    return (
        <main className="min-h-screen max-w-3xl mx-auto bg-white p-3">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <section className="mb-8 pb-8 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Avatar dimensions={24} />
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{userProfile?.username}</h1>
                            <h2 className="text-xl text-gray-700 mb-1">{userProfile?.firstname} {userProfile?.lastname}</h2>
                        </div>
                    </div>

                    <p className="text-gray-600 mb-4">{userProfile?.email}</p>
                    <p className="text-sm text-gray-500">
                        Inscrit le {new Date(userProfile?.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </section>

                {/* Statistics */}
                <section className="mb-8 border-b border-gray-200 pb-8">
                    <h2 className="text-2xl font-semibold mb-4">Statistiques</h2>
                    <div className="flex gap-4">
                        <div className="bg-pink-50 p-3 rounded-lg border border-pink-200 w-1/3">
                            <div className="text-xl font-bold text-pink-600">{stats.views}</div>
                            <p className="text-gray-600">Vue{stats.views > 1 ? 's' : ''}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 w-1/3">
                            <div className="text-xl font-bold text-blue-600">{stats.articles}</div>
                            <p className="text-gray-600">Article{stats.articles > 1 ? 's' : ''}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200 w-1/3">
                            <div className="text-xl font-bold text-green-600">{stats.comments}</div>
                            <p className="text-gray-600">Commentaire{stats.comments > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </section>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-600 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <section className="space-y-4 mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Actions</h2>
                    <Button
                        onClick={() => setIsProfilePopupOpen(true)}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                    >
                        <i className="fas fa-user-edit mr-2"></i> Modifier mon profil
                    </Button>
                    <Button
                        onClick={() => setIsPasswordPopupOpen(true)}
                        className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
                    >
                        <i className="fas fa-key mr-2"></i> Changer mon mot de passe
                    </Button>

                {/* Popups */}
                <PopupForm
                    title="Modifier mon profil"
                    isOpen={isProfilePopupOpen}
                    onClose={() => setIsProfilePopupOpen(false)}
                >
                    <ProfileForm
                        user={userProfile}
                        onSubmit={handleProfileUpdate}
                        loading={updateLoading}
                    />
                </PopupForm>

                <PopupForm
                    title="Changer mon mot de passe"
                    isOpen={isPasswordPopupOpen}
                    onClose={() => setIsPasswordPopupOpen(false)}
                >
                    <PasswordForm
                        onSubmit={handlePasswordChange}
                        loading={passwordLoading}
                    />
                </PopupForm>

                    <Button
                        onClick={handleLogout}
                        className="border border-red-600 rounded-lg text-red-600 hover:bg-red-100/50 w-full py-3 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-sign-out-alt"></i> Se déconnecter
                    </Button>
                </section>
            </div>
        </main>
    );
};

export default Profile;