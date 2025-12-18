import { useState } from "react";
import Loader from "../common/Loader";
import Input from "../common/Input";
import Button from "../common/Button";

export const ProfileForm = ({ user, onSubmit, loading = false }) => {
    const [formData, setFormData] = useState({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        username: user?.username || '',
        email: user?.email || '',
        avatar: null
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files?.[0] || null
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Build FormData from form inputs to properly handle file upload
            const form = e.target;
            const submitData = {
                firstname: form.firstname.value,
                lastname: form.lastname.value,
                username: form.username.value,
                email: form.email.value,
                avatar: form.avatar?.files?.[0] || null
            };
            await onSubmit(submitData);
        } catch (err) {
            setError(err?.message || 'Erreur lors de la mise à jour');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-lg w-full">            
            {error && (
                <div className="p-3 bg-red-100 border border-red-600 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <Input
                type="file"
                name="avatar"
                label="Photo de profil"
                accept="image/*"
                fileName={user?.avatarImageName}
                onChange={handleChange}
            />

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
                name="lastname"
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
                <Button type="submit" disabled={loading} className="w-full py-2 px-3 bg-blue-600 rounded-lg text-white">
                    {loading ? <Loader /> : 'Enregistrer les modifications'}
                </Button>
            </div>
        </form>
    );
};

export default ProfileForm;
