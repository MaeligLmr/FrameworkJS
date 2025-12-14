import { useState } from "react";
import Loader from "../common/Loader";
import Input from "../common/Input";
import Button from "../common/Button";

export const ProfileForm = ({ user, onSubmit, loading = false }) => {
    const [formData, setFormData] = useState({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        username: user?.username || '',
        email: user?.email || ''
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err?.message || 'Erreur lors de la mise à jour');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Modifier mon profil</h3>
            
            {error && (
                <div className="p-3 bg-red-100 border border-red-600 text-red-700 rounded">
                    {error}
                </div>
            )}

            <Input
                type="text"
                name="firstname"
                label="Prénom"
                placeholder="Prénom"
                value={formData.firstname}
                onChange={handleChange}
                required
            />
            <Input
                type="text"
                name="name"
                label="Nom"
                placeholder="Nom"
                value={formData.lastname}
                onChange={handleChange}
                required
            />

            <Input
                type="text"
                name="username"
                label="Nom d'utilisateur"
                placeholder="Nom d'utilisateur"
                value={formData.username}
                onChange={handleChange}
                required
            />

            <Input
                type="email"
                name="email"
                label="Email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
            />

            <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader /> : 'Enregistrer les modifications'}
                </Button>
            </div>
        </form>
    );
};

export default ProfileForm;
