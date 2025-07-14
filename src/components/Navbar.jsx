const Navbar = ({theme, toggleTheme}) => {
    return (
        <nav className="fixed top-0 left-0 right-0 pt-4 pb-4 px-8 flex justify-between items-center z-50 bg-gray-900 bg-opacity-95 backdrop-blur-md
        dark:bg-gray-800 dark:bg-opacity-40 shadow-bottom-blue-glow"> 
            <div className="text-2xl font-extrabold text-blue-400">CodeSphere</div>
            <div className="flex items-center space-x-6">
                <button 
                onClick={toggleTheme}
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition duration-300">
                    {/* conditional rendering  */}
                    {theme === 'dark' ? (
                        <i className="fas fa-sun"></i> 
                    ) : (
                        <i className="fas fa-moon"></i> 
                    )}
                </button>
                <a href="/problems" className="px-5 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition duration-300">Problems</a>
                <a href="/login" className="px-5 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition duration-300">Login</a>
            </div>
        </nav>
    )
}

export default Navbar