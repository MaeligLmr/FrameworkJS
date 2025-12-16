const Loader = () => {
    const content = (
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <span className="relative inline-flex w-6 h-6">
                <span className="absolute inset-0 rounded-full border-2 border-blue-500 opacity-30"></span>
                <span className="absolute inset-0 rounded-full border-2 border-t-transparent border-blue-600 animate-spin"></span>
            </span>
        </div>
    );

    
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/40">
                {content}
            </div>
        );
    }

export default Loader;