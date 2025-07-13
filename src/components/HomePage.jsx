const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen p-8 pt-24
                    bg-gradient-to-br from-white to-gray-100 text-gray-900 {/* Light mode defaults */}
                    dark:from-gray-900 dark:to-black dark:text-white"> 
      
      <header className="flex-grow flex flex-col items-center justify-center text-center my-28"> 
        <h1 className="text-6xl font-extrabold mb-6 animate-fade-in-up">
          Welcome to <span className="text-blue-600 drop-shadow-lg dark:text-blue-400">CodeSphere</span> 
        </h1>
        <p className="text-xl mb-12 max-w-2xl mx-auto animate-fade-in-up delay-100 leading-relaxed
                      text-gray-700 dark:text-gray-300"> 
          Your Universe for Coding Mastery.
          <br />
          Conquer Challenges, Compile Brilliance, Connect Globally.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 animate-fade-in-up delay-200"> 
          <a
            href="/problems"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out" 
          >
            Explore Problems
          </a>
          <a
            href="/signup"
            className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out" 
          >
            Sign Up Now
          </a>
        </div>
      </header>

      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 mx-auto animate-fade-in-up delay-300"> 
        <div className="p-10 rounded-xl shadow-xl transform hover:scale-105 transition duration-300 ease-in-out animate-fade-in hover:border-blue-500 hover:shadow-slate-700
                    bg-blue-100 bg-opacity-80 border border-blue-500 {/* Light mode card defaults */}
                    dark:bg-gray-800 dark:bg-opacity-70 dark:border-gray-700 dark:hover:border-blue-500"> 
          <div className="text-5xl mb-6 text-center text-blue-600 dark:text-blue-400"> 
            <i className="fas fa-gavel"></i> 
          </div>
          <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Precision Judging</h3> 
          <p className="text-center leading-relaxed text-gray-700 dark:text-gray-300"> 
            Test your code against robust test cases with our lightning-fast online judge. Get instant feedback and detailed reports.
          </p>
        </div>

        <div className="p-10 rounded-xl shadow-xl transform hover:scale-105 transition duration-300 ease-in-out animate-fade-in hover:border-blue-500 hover:shadow-slate-700
                    bg-blue-100 bg-opacity-80 border border-blue-500 {/* Light mode card defaults */}
                    dark:bg-gray-800 dark:bg-opacity-70 dark:border-gray-700 dark:hover:border-blue-500"> 
          <div className="text-5xl mb-6 text-center text-blue-600 dark:text-blue-400">
            <i className="fas fa-code"></i> 
          </div>
          <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Seamless Compilation</h3> 
          <p className="text-center leading-relaxed text-gray-700 dark:text-gray-300"> 
            Write and run code directly in your browser with support for multiple programming languages.
          </p>
        </div>

        <div className="p-10 rounded-xl shadow-xl transform hover:scale-105 transition duration-300 ease-in-out animate-fade-in hover:border-blue-500 hover:shadow-slate-700
                    bg-blue-100 bg-opacity-80 border border-blue-500 {/* Light mode card defaults */}
                    dark:bg-gray-800 dark:bg-opacity-70 dark:border-gray-700 dark:hover:border-blue-500">
          <div className="text-5xl mb-6 text-center text-blue-600 dark:text-blue-400"> 
            <i className="fas fa-trophy"></i> 
          </div>
          <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Compete & Grow</h3> 
          <p className="text-center leading-relaxed text-gray-700 dark:text-gray-300"> 
            Join thrilling contests, climb the leaderboards, and access unique learning paths with personalized feedback.
          </p>
        </div>
      </section>

      {/* Tailwind CSS Animation Keyframes (no changes here) */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
};

export default HomePage;