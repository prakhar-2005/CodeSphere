import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism.css'; // Light theme
// import 'prismjs/themes/prism-tomorrow.css'; 

const ProblemDetailPage = () => {
    const { id } = useParams(); // To get problem ID from URL
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [code, setCode] = useState('// Write your code here');
    const [selectedLanguage, setSelectedLanguage] = useState('cpp');
    const [customInput, setCustomInput] = useState('');
    const [output, setOutput] = useState('// Your code output will appear here');
    const languagesOptions = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'c', label: 'C' },
        { value: 'cpp', label: 'C++' },
        { value: 'java', label: 'Java' },
    ];

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
                // set initial code based on language 
                // setCode(data.starterCode[selectedLanguage] || '// Write your code here');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProblemDetails();
    }, [id, API_BASE_URL]); // Re-fetch if ID or API_BASE_URL changes (though API_BASE_URL won't change)

    const handleRun = () => {
        // Placeholder 
        setOutput(`Running code in ${selectedLanguage} with input:\n${customInput || 'No custom input'}\n\n(This is a frontend simulation. Actual compilation and execution will be handled by the backend judge.)`);

        // Simulate some processing time
        setTimeout(() => {
            setOutput(prev => prev + "\n\n... Simulation complete. No actual output generated.");
        }, 1500);
    };

    const handleSubmit = () => {
        if (!isAuthenticated) {
            alert('Please log in to submit your solution.'); // custom model for later
            navigate('/login');
            return;
        }

        // Placeholder for submitting code logic
        setOutput(`Submitting solution in ${selectedLanguage} for Problem ID: ${id}\n\nCode:\n${code}\n\n(Submission logic will be implemented in the backend.)`);

        // Simulate submission processing
        setTimeout(() => {
            setOutput(prev => prev + "\n\n... Submission received. Awaiting judge results.");
        }, 2000);
    };

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
        <div className="flex flex-col min-h-screen p-0 pt-[4.5rem]
                    bg-gradient-to-br from-white to-gray-100 text-gray-900
                    dark:from-gray-900 dark:to-black dark:text-white">
            <div className="container mx-auto flex flex-col lg:flex-row gap-8 lg:gap-2 p-3 flex-grow" style={{ height: 'calc(100vh - 6.5rem)' }}> 

                {/* Left Column: Problem Details */}
                <div className="lg:w-1/2 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700 overflow-y-auto">
                    {/* Problem Header/Title */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                            {problem.name}
                        </h1>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                        </span>
                    </div>

                    {/* Problem Description, Formats, Constraints, Sample Test Cases, Tags */}
                    <div className="flex-grow pr-2">
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
                </div> 

                {/* Right Column: Compiler Area */}
                <div className="lg:w-1/2 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Code Editor</h2>
                        {/* Language Dropdown */}
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {languagesOptions.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-grow min-h-[350px] bg-gray-100 dark:bg-gray-900 rounded-md overflow-y-auto relative">
                        <Editor
                            value={code}
                            onValueChange={setCode}
                            highlight={code =>
                                highlight(code, languages[selectedLanguage] || languages.clike, selectedLanguage)
                            }
                            padding={15}
                            style={{
                                fontFamily: '"Fira Code", "Consolas", "monospace"',
                                fontSize: 16,
                                lineHeight: '1.5',
                                color: '#f8f8f2',
                                backgroundColor: '#282a36',
                                borderRadius: '0.375rem',
                                height: '100%', 
                                overflow: 'auto', 
                            }}
                            className="code-editor-container h-full"
                        />
                    </div>

                    {/* Custom Input */}
                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Custom Input</h3>
                        <textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            className="w-full h-24 p-3 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 resize-y focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter custom input here..."
                        ></textarea>
                    </div>

                    {/* Output */}
                    <div className="mt-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Output</h3>
                        <pre className="w-full h-24 p-3 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 overflow-auto whitespace-pre-wrap">
                            <code>{output}</code>
                        </pre>
                    </div>

                    {/* Run/Submit Buttons */}
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            onClick={handleRun}
                            className="px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition duration-300 shadow-md transform hover:scale-105"
                        >
                            Run
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition duration-300 shadow-md transform hover:scale-105"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemDetailPage;