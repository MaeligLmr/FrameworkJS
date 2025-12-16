import { useAuth } from "../../context/AuthContext";

const Avatar = ({ dimensions }) => {
    const { user } = useAuth();
    if (!user.avatar) {
        return (
            <div className={`rounded-full overflow-hidden w-${dimensions} h-${dimensions} flex items-center justify-center bg-gray-200`}>
                <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="60" cy="40" r="20" fill="#9CA3AF" />
                    <path
                        d="M10 120c0-28 22-48 50-48s50 20 50 48"
                        fill="#9CA3AF"
                    />
                </svg>

            </div>

        )
    } else {
        return (
            <div className={`rounded-full overflow-hidden w-${dimensions} h-${dimensions}`}>
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
        );
    }
};
export default Avatar;