import Input from '../common/Input';
import Loader from '../common/Loader';
import { Button } from '../common/Button';

const RegisterForm = ({ onSubmit, loading = false }) => {
	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
				<Input name="username" required className="w-full border rounded px-3 py-2" />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Email</label>
				<Input name="email" type="email" required className="w-full border rounded px-3 py-2" />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Mot de passe</label>
				<Input name="password" type="password" required className="w-full border rounded px-3 py-2" />
			</div>
			<div>
				{loading ? (
					<Loader />
				) : (
					<Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Créer un compte</Button>
				)}
			</div>
		</form>
	);
};

export default RegisterForm;
