

const Avatar = ({ dimensions, user, hoverDisabled=false, showName=true }) => {
    const size = `${dimensions * 4}px`; // Convert Tailwind units (1 = 4px)
    
    if (!user.avatar) {
        return (
            <div className={`flex items-center gap-2 ${hoverDisabled ? '' : 'group'}`}>
            <div 
                className={`rounded-full overflow-hidden flex items-center justify-center bg-gray-200 ${hoverDisabled ? '' : 'group-hover:outline-offset-2 group-hover:outline-2 group-hover:outline-[#4062BB]'}`}
                style={{ width: size, height: size }}
            >
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
            {showName && user.username && (
                <span className={`text-gray-600 font-semibold ${hoverDisabled ? '' : 'group-hover:font-bold'}`}>{user.username}</span>
            )}
            </div>
        )
    } else {
        return (
            <div className={`flex items-center gap-2 ${hoverDisabled ? '' : 'group'}`}>
            <div 
                className={`rounded-full overflow-hidden ${hoverDisabled ? '' : 'group-hover:outline-2 group-hover:outline-offset-2 group-hover:outline-[#4062BB]'}`}
                style={{ width: size, height: size }}
            >
                <img src={user.avatar} alt="Avatar" className="object-cover w-full h-full" />
            
            </div>
            {showName && user.username && (
                <span className={`text-gray-600 font-semibold ${hoverDisabled ? '' : 'group-hover:underline'}`}>{user.username}</span>
            )}
            </div>
        );
    }
};
export default Avatar;