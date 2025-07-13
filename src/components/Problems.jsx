const Problems = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <header className="text-center mt-24 mb-16 px-4"> {/* Adjusted top margin (mt-24), bottom margin (mb-16) */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-up">
          Explore <span className="text-blue-400 drop-shadow-lg">Problems</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
          Sharpen your coding skills with a diverse collection of algorithmic challenges.
        </p>
      </header>
    </div>
  );
};

export default Problems;