import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 

const ProblemDetailPage = () => {
  const { id } = useParams(); // To get problem ID from URL
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL; 

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/problems/${id}`); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProblem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemDetails();
  }, [id, API_BASE_URL]); // Re-fetch if ID or API_BASE_URL changes (though API_BASE_URL won't change)

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen p-8 pt-24 bg-gradient-to-br from-white to-gray-100 text-gray-900 dark:from-gray-900 dark:to-black dark:text-white items-center justify-center">
        <p className="text-xl dark:text-white">Loading problem details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen p-8 pt-24 bg-gradient-to-br from-white to-gray-100 text-gray-900 dark:from-gray-900 dark:to-black dark:text-white items-center justify-center">
        <p className="text-xl text-red-500">Error: {error}</p>
        <p className="text-md text-gray-400">Could not load problem. Please check the ID and server connection.</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex flex-col min-h-screen p-8 pt-24 bg-gradient-to-br from-white to-gray-100 text-gray-900 dark:from-gray-900 dark:to-black dark:text-white items-center justify-center">
        <p className="text-xl text-gray-400">Problem not found.</p>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Hard': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-8 pt-24
                    bg-gradient-to-br from-white to-gray-100 text-gray-900
                    dark:from-gray-900 dark:to-black dark:text-white">
      
      <div className="container mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 mt-4 mb-24"> {/* two-column layout */}
        {/* Left Column: Problem Details */}
        <div className="lg:w-1/2 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
              {problem.name}
            </h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          </div>

          <p className="text-gray-800 dark:text-gray-200 mb-6 leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </p>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Input Format</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {problem.inputFormat}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Output Format</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {problem.outputFormat}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Constraints</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {problem.constraints}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Sample Test Cases</h3>
            {problem.sampleTestCases && problem.sampleTestCases.map((sample, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-4 last:mb-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Input {index + 1}:</h4>
                <pre className="bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded-md overflow-x-auto text-sm">
                  <code>{sample.input}</code>
                </pre>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mt-3 mb-1">Output {index + 1}:</h4>
                <pre className="bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded-md overflow-x-auto text-sm">
                  <code>{sample.output}</code>
                </pre>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {problem.tags && problem.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Compiler Area */}
        <div className="lg:w-1/2 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">Code Editor</h2>
          <div className="flex-grow bg-gray-100 dark:bg-gray-900 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg">
            [Compiler/Editor UI goes here]
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Custom Input</h3>
            <textarea
              className="w-full h-24 p-3 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 resize-y"
              placeholder="Enter custom input here..."
            ></textarea>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Output</h3>
            <pre className="w-full h-24 p-3 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 overflow-auto whitespace-pre-wrap">
              <code>{`// Your code output will appear here`}</code>
            </pre>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button className="px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition duration-300">
              Run
            </button>
            <button className="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition duration-300">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;