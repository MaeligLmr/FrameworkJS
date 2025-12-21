import Input from '../common/Input';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { useState } from 'react';

const RegisterForm = ({ onSubmit, loading = false }) => {
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
				<label className="block text-sm font-medium mb-1">Nom d'utilisateur <span className="text-red-600">*</span></label>
				<Input name="username" required  />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Prénom <span className="text-red-600">*</span></label>
				<Input name="firstname" required  />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Nom <span className="text-red-600">*</span></label>
				<Input name="lastname" required  />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Email <span className="text-red-600">*</span></label>
				<Input name="email" type="email" required  />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Mot de passe <span className="text-red-600">*</span></label>
					<Input
						name="password"
						type={showPassword ? 'text' : 'password'}
						required
						button={
							<Button 
								onClick={() => setShowPassword((v) => !v)}
								discrete
							>
								{showPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}
							</Button>
						}
						
					/>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Confirmer le mot de passe <span className="text-red-600">*</span></label>
				<Input
					name="confirmPassword"
					type={showPassword ? 'text' : 'password'}
					required
					button={
						<Button 
							onClick={() => setShowPassword((v) => !v) }
							discrete
						>
							{showPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}
						</Button>
					}
				/>
				
			</div>
			<div>
				{loading ? (
					<Loader />
				) : (
					<Button type="submit" className="w-full">Créer un compte</Button>
				)}
			</div>
		</form>
	);
};

export default RegisterForm;
