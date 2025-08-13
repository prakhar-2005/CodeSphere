import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ theme, toggleTheme }) => {
    const { isAuthenticated, currentUser, logout, loadingAuth } = useAuth();
    const [showNavbar, setShowNavbar] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const lastScrollY = useRef(0);
    const ticking = useRef(false); // to prevent multiple calls to requestAnimationFrame
    const navigate = useNavigate();
    const profileMenuRef = useRef(null); // outside click detection

    const handleScroll = () => {
        if (!ticking.current) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
                    setShowNavbar(false);
                }
                else if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
                    setShowNavbar(true);
                }

                lastScrollY.current = currentScrollY;
                ticking.current = false;
            });
            ticking.current = true;
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = async () => {
        logout();
        setShowProfileMenu(false);
    };

    const handleViewProfile = () => {
        navigate('/profile');
        setShowProfileMenu(false);
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    if (loadingAuth) return null;

    return (
        <nav className={`fixed top-0 left-0 right-0 pt-4 pb-4 px-8 flex justify-between items-center z-50 bg-gray-900 bg-opacity-95 backdrop-blur-md
        dark:bg-gray-800 dark:bg-opacity-40 shadow-bottom-blue-glow
        transition-transform duration-500 ease-in-out 
        ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
            <Link to="/" className="flex items-center cursor-pointer">
                <img
                    src="/images/CodeSphere_icon.PNG"
                    alt="CodeSphere Icon"
                    className="h-10 w-10 mr-5"
                />
                <div className="text-2xl font-extrabold text-blue-400">CodeSphere</div>
            </Link>
            <div className="flex items-center space-x-6">
                <button
                    onClick={toggleTheme}
                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition duration-300">
                    {theme === 'dark' ? (
                        <i className="fas fa-sun"></i>
                    ) : (
                        <i className="fas fa-moon"></i>
                    )}
                </button>

                <Link to="/problems" className="px-5 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition duration-300">
                    Problems
                </Link>

                <Link to="/contests" className="px-5 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition duration-300">
                    Contests
                </Link>

                {!isAuthenticated ? (
                    <Link to="/login" className="px-5 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition duration-300">
                        Login
                    </Link>
                ) : (
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="rounded-full ml-3 bg-gray-700 w-10 h-10 flex items-center justify-center hover:bg-gray-600 transition"
                        >
                            <i className="fas fa-user text-white"></i>
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-40 bg-gray-800 dark:bg-gray-800 rounded-lg shadow-lg border border-gray-700 dark:border-gray-700">
                                <button
                                    onClick={handleViewProfile}
                                    className="block w-full text-left px-4 py-2 text-gray-200 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700"
                                >
                                    View Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-700 dark:hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar