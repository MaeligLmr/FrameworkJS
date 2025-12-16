import { useState } from "react";
import Loader from "../common/Loader";
import Input from "../common/Input";
import Button from "../common/Button";

export const PasswordForm = ({ onSubmit, loading = false }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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
        setSuccess(false);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        try {
            await onSubmit(formData);
            setSuccess(true);
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err?.message || 'Erreur lors du changement de mot de passe');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Changer mon mot de passe</h3>

            {error && (
                <div className="p-3 bg-red-100 border border-red-600 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-100 border border-green-600 text-green-700 rounded-lg">
                    Mot de passe changé avec succès!
                </div>
            )}
            <Input
                type="password"
                name="currentPassword"
                label="Mot de passe actuel"
                placeholder="Mot de passe actuel"
                value={formData.currentPassword}
                onChange={handleChange}
                required
            />
            <Input
                type="password"
                name="newPassword"
                label="Nouveau mot de passe"
                placeholder="Nouveau mot de passe"
                value={formData.newPassword}
                onChange={handleChange}
                required
            />
            <Input
                type="password"
                name="confirmPassword"
                label="Confirmer le nouveau mot de passe"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
            />


            <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader /> : 'Changer le mot de passe'}
                </Button>
            </div>
        </form>
    );
};

export default PasswordForm;
