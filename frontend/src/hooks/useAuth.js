import { useAuth as useAuthFromContext } from '../context/AuthContext';

// Simple wrapper so components can import from 'hooks/useAuth'
export default useAuthFromContext;
export { useAuthFromContext as useAuth };
