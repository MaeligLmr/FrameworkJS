import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import ArticleList from "../components/articles/ArticleList";

export const Profile = () => {
    const { id } = useParams();
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [articles, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(false);
    const [articleFilter, setArticleFilter] = useState('all');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Determine if viewing own profile or another user's
                const viewingOwn = !id || id === user?._id;
                if (!user && viewingOwn) {
                    navigate('/login');
                    return;
                }

                // Fetch profile accordingly
                const profileRes = viewingOwn 
                  ? await userService.getUserProfile()
                  : await userService.getUserById(id);
                const profile = profileRes?.data || (viewingOwn ? user : null);
                setUserProfile(profile);

                // Fetch all articles to count user's articles
                const targetId = (viewingOwn ? user?._id : id);
                const countviews = await articleService.getViewsByAuthor(targetId);
                const countArticles = await articleService.getCountArticlesByAuthor(targetId);
                const countComments = await commentService.getCountCommentsByAuthor(targetId);

                // Fetch articles for viewing own profile
                if (viewingOwn) {
                    setLoadingArticles(true);
                    try {
                        const articlesRes = await articleService.fetchMyArticles();
                        const articlesList = articlesRes?.articles || [];
                        setArticles(articlesList);
                    } catch (err) {
                        console.error('Error loading articles:', err);
                    } finally {
                        setLoadingArticles(false);
                    }
                }
                setStats({
                    views: countviews.count,
                    articles: countArticles.count,
                    comments: countComments.count
                });
                if(user._id !== profile._id){
                    const data = await articleService.fetchArticles({ author: userProfile._id });
                    setArticles(data.articles);
                }
            } catch (err) {
                console.error('Erreur lors du chargement:', err);
                setError('Erreur lors du chargement du profil');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate, id, userProfile?._id]);

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

    const isOwnProfile = !id || id === user?._id;
    const filteredArticles = articleFilter === 'all' 
        ? articles 
        : articleFilter === 'published' 
        ? articles.filter(a => a.published)
        : articles.filter(a => !a.published);

    return (
        <main className="min-h-screen max-w-3xl mx-auto bg-white p-3 relative">
            <div className="max-w-4xl mx-auto">
                {/* Header with Back and Settings */}
                <div className="flex justify-between items-center mb-4">
                    <Button
                        onClick={() => navigate(-1)}
                        noBorders
                        icon='arrow-left'
                    >
                        Retour
                    </Button>
                    {isOwnProfile && (
                        <Button
                            onClick={() => setIsSidebarOpen(true)}
                            noBorders
                            icon='ellipsis-vertical'
                        >
                        </Button>
                    )}
                </div>

                {/* Profile Header */}
                <section className="mb-8 pb-8 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Avatar dimensions={18} user={userProfile} hoverDisabled showName={false} />
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold mb-2">{userProfile?.username}</span>
                            <span className="text-xl text-gray-700 mb-1">{userProfile?.firstname} {userProfile?.lastname}</span>
                        </div>
                    </div>

                    {isOwnProfile && (
                        <>
                    <p className="text-gray-600 mb-4">{userProfile?.email}</p>
                    <p className="text-sm text-gray-500">
                        Inscrit le {new Date(userProfile?.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p></>)}
                </section>

                {/* Statistics */}
                <section className="mb-8 border-b border-gray-200 pb-8">
                    <div className="flex gap-4">
                        <div className=" p-3 rounded-lg flex flex-col items-center w-1/3">
                            <div className="text-xl font-bold ">{stats.views}</div>
                            <p className="text-gray-600">Vue{stats.views > 1 ? 's' : ''}</p>
                        </div>
                        <div className=" p-3 rounded-lg flex flex-col items-center w-1/3">
                            <div className="text-xl font-bold ">{stats.articles}</div>
                            <p className="text-gray-600">Article{stats.articles > 1 ? 's' : ''}</p>
                        </div>
                        <div className="p-3 rounded-lg flex flex-col items-center w-1/3">
                            <div className="text-xl font-bold ">{stats.comments}</div>
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

                {/* My Articles Section (only for own profile) */}
                {isOwnProfile && (
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Mes articles</h2>
                        
                        {/* Filter Buttons */}
                        <div className="flex mb-4">
                            <Button
                                onClick={() => setArticleFilter('all')}
                                tab
                                active={articleFilter === 'all'}
                            >
                                Tous ({articles.length})
                            </Button>
                            <Button
                                onClick={() => setArticleFilter('published')}
                                tab
                                active={articleFilter === 'published'}
                            >
                                Publiés ({articles.filter(a => a.published).length})
                            </Button>
                            <Button
                                onClick={() => setArticleFilter('drafts')}
                                tab
                                active={articleFilter === 'drafts'}
                            >
                                Brouillons ({articles.filter(a => !a.published).length})
                            </Button>
                        </div>

                        {/* Articles List */}
                        {loadingArticles ? (
                            <div className="flex justify-center py-8">
                                <Loader />
                            </div>
                        ) : (
                            <ArticleList articles={filteredArticles} />
                        )}
                    </section>
                )}

                {/* Other User's Articles (when viewing someone else's profile) */}
                {!isOwnProfile && (
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Articles de {userProfile?.username}</h2>
                        <ArticleList articles={articles} />
                    </section>
                )}

                {/* Sidebar for Settings */}
                {isSidebarOpen && (
                    <>
                        {/* Overlay */}
                        <div 
                            className="fixed inset-0 bg-black/30 z-40"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        
                        {/* Sidebar Panel */}
                        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
                            {/* Header */}
                            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold">Paramètres</h2>
                                <Button
                                    onClick={() => setIsSidebarOpen(false)}
                                    noBorders
                                    icon="times"
                                >
                                </Button>
                            </div>

                            {/* Actions */}
                            <div className="flex-1 p-4 space-y-4">
                                <Button
                                    onClick={() => {
                                        setIsSidebarOpen(false);
                                        setIsProfilePopupOpen(true);
                                    }}
                                    light
                                    full
                                    icon='user-edit'
                                    >
                                    Modifier mon profil
                                </Button>
                                
                                <Button
                                    onClick={() => {
                                        setIsSidebarOpen(false);
                                        setIsPasswordPopupOpen(true);
                                    }}
                                    light
                                    full
                                    icon="key"
                                    >
                                    Changer mon mot de passe
                                </Button>

                                <Button
                                    onClick={() => { setIsSidebarOpen(false); setShowLogoutConfirm(true); }}
                                    light
                                    full
                                    danger
                                    icon="sign-out-alt"
                                >
                                    Se déconnecter
                                </Button>
                            </div>
                        </div>
                    </>
                )}

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

                {showLogoutConfirm && (
                    <PopupConfirm
                        message="Êtes-vous sûr de vouloir vous déconnecter ?"
                        onConfirm={handleLogout}
                        onCancel={() => setShowLogoutConfirm(false)}
                        confirmText="Se déconnecter"
                        danger
                    />
                )}

            </div>
        </main>
    );
};

export default Profile;