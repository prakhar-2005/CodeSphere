import { useEffect, useRef, useState } from 'react';
import {Link} from 'react-router-dom';

const Navbar = ({theme, toggleTheme}) => {
    const [showNavbar, setShowNavbar] = useState(true);
    const lastScrollY = useRef(0); // to store last scroll position 
    const ticking = useRef(false); // to prevent multiple calls to requestAnimationFrame

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
                    {/* conditional rendering  */}
                    {theme === 'dark' ? (
                        <i className="fas fa-sun"></i> 
                    ) : (
                        <i className="fas fa-moon"></i> 
                    )}
                </button>
                <Link to="/problems" className="px-5 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition duration-300">Problems</Link>
                <Link to="/login" className="px-5 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition duration-300">Login</Link>
            </div>
        </nav>
    )
}

export default Navbar