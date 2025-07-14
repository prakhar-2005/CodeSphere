const Footer = () => {
    return (
        <div className="flex flex-col
                    bg-gradient-to-br from-white to-gray-100 text-gray-900 {/* Light mode defaults */}
                    dark:from-gray-900 dark:to-black dark:text-white"> 
            <footer className="w-full p-4 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} CodeSphere. All rights reserved.
            </footer>
        </div>
    )
}

export default Footer