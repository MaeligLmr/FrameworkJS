import Input from '../common/Input';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { useState } from 'react';

export const LoginForm = ({ onSubmit, loading = false }) => {
    const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (typeof onSubmit === 'function') {
            onSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input name="email" type="email" required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Mot de passe</label>
                <div className="relative">
                    <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                    
                    />
                    <Button
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-3 text-sm text-gray-500"
                    >
                        {showPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}
                    </Button>
                </div>
            </div>
            <div>
                {loading ? (
                    <Loader />
                ) : (
                    <Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">
                        Se connecter
                    </Button>
                )}
            </div>
        </form>
    );
};

export default LoginForm;
