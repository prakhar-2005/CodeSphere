import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

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
          <Link
            to="/problems"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
          >
            Explore Problems
          </Link>
          {!isAuthenticated && (
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
            >
              Sign Up Now
            </Link>
          )}
        </div>
      </header>

      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 mx-auto animate-fade-in-up delay-300">
        <FeatureCard
          icon="fas fa-gavel"
          title="Precision Judging"
          description="Test your code against robust test cases with our lightning-fast online judge. Get instant feedback and detailed reports."
        />
        <FeatureCard
          icon="fas fa-code"
          title="Seamless Compilation"
          description="Write and run code directly in your browser with support for multiple programming languages."
        />
        <FeatureCard
          icon="fas fa-trophy"
          title="Compete & Grow"
          description="Join thrilling contests, climb the leaderboards, and access unique learning paths with personalized feedback."
        />
      </section>

      {/* AI Features Section */}
      <section className="w-full max-w-6xl mx-auto mb-24 animate-fade-in-up delay-400">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 text-gray-800 dark:text-white">
          Supercharge Your Journey with <span className="text-blue-600 dark:text-blue-400">Gemini AI</span> 🚀
        </h2>
        <div className="space-y-8 sm:space-y-12">
          <AICard
            icon="fas fa-robot"
            title="Generate Starter Code"
            description="Instantly get a boilerplate solution for any problem in your preferred language, so you can focus on the core logic."
          />
          <AICard
            icon="fas fa-lightbulb"
            title="Simplify Problems"
            description="Can't understand a problem? Let Gemini simplify it into a clear, concise explanation with helpful examples."
          />
          <AICard
            icon="fas fa-chart-line"
            title="Find Time Complexity"
            description="Analyze your code's efficiency. Get an accurate time and space complexity analysis to optimize your solutions."
          />
        </div>
      </section>

      {/* Tailwind CSS Animation Keyframes */}
      <style>{`
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

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-200 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer
                    dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:shadow-none
                    bg-white hover:border-blue-500 hover:shadow-lg">
    <div className="text-4xl sm:text-5xl mb-4 text-center text-blue-600 dark:text-blue-400">
      <i className={icon}></i>
    </div>
    <h3 className="text-xl sm:text-2xl font-semibold text-center mb-2 text-gray-800 dark:text-white">
      {title}
    </h3>
    <p className="text-center leading-relaxed text-gray-700 dark:text-gray-300">
      {description}
    </p>
  </div>
);

const AICard = ({ icon, title, description }) => (
  <div className="p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-200 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer
                    dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-400 dark:shadow-none
                    bg-white hover:border-green-400 hover:shadow-lg">
    <div className="text-4xl sm:text-5xl mb-4 text-center text-green-600 dark:text-green-400">
      <i className={icon}></i>
    </div>
    <h3 className="text-xl sm:text-2xl font-semibold text-center mb-2 text-gray-800 dark:text-white">
      {title}
    </h3>
    <p className="text-center leading-relaxed text-gray-700 dark:text-gray-300">
      {description}
    </p>
  </div>
);

export default HomePage;