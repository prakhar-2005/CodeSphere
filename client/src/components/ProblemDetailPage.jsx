import { useState, useEffect, act } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Editor from '@monaco-editor/react';
import { useRef } from 'react';
//manual preload so syntax highlighting doesn't take time on first render
import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution';
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [activeTab, setActiveTab] = useState('Problem');

    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const [leftWidth, setLeftWidth] = useState(50); // percent width
    const [isDragging, setIsDragging] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showOutput, setShowOutput] = useState(false);
    const [isSubmitResult, setIsSubmitResult] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const [selectedCode, setSelectedCode] = useState(null);
    const [theme, setTheme] = useState(
        document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(
                document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'
            );
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (activeTab !== 'My Submissions') return;

            setLoadingSubmissions(true);
            setSubmissionError(null);

            try {
                const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_BASE_URL}/submission/${id}/mine`,
                    {
                        method: 'GET',
                        credentials: 'include', 
                    }
                );

                if (!res.ok) {
                    throw new Error('Failed to fetch submissions');
                }

                const data = await res.json();
                setSubmissions(data.submissions);
            } catch (err) {
                setSubmissionError(err.response?.data?.message || 'Failed to load submissions');
            } finally {
                setLoadingSubmissions(false);
            }
        };

        fetchSubmissions();
    }, [activeTab, id]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const startDragging = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !leftRef.current) return;

            const container = leftRef.current.parentNode;
            const containerRect = container.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Clamp between 20% and 80%
            if (newLeftWidth > 20 && newLeftWidth < 80) {
                setLeftWidth(newLeftWidth);
            }
        };

        const stopDragging = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', stopDragging);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopDragging);
        };
    }, [isDragging]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 2000);
    };

    const languagesOptions = [
        { value: 'python', label: 'Python' },
        { value: 'c', label: 'C' },
        { value: 'cpp', label: 'C++' },
        { value: 'java', label: 'Java' },
    ];

    const starterCodeMap = {
        cpp: `#include<iostream>
using namespace std;

int main() {
    // your code goes here
    return 0;
}`,
        java: `public class Main {
    public static void main(String[] args) {
        // your code goes here
    }
}`,
        python: `def main():
    # your code goes here

main()`,
        c: `#include <stdio.h>

int main() {
    // your code goes here
    return 0;
}`
    };

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
                setCode(starterCodeMap[selectedLanguage] || '// Write your code here');
                if (data.sampleTestCases && data.sampleTestCases.length > 0) {
                    setCustomInput(data.sampleTestCases[0].input);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProblemDetails();
    }, [id, API_BASE_URL]);

    useEffect(() => {
        setCode(starterCodeMap[selectedLanguage] || '// Write your code here');
    }, [selectedLanguage]);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput('Running code...');
        setShowOutput(true);
        setIsSubmitResult(false);

        try {
            const response = await fetch(`${API_BASE_URL}/submission/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language: selectedLanguage, customInput }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to run code.');
            }

            const data = await response.json();
            setOutput(data.output || data.error);
        } catch (err) {
            setOutput(`Error running code: ${err.message}`);
            console.error('Run Code Error:', err);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            alert('Please log in to submit your solution.');
            navigate('/login');
            return;
        }
        setIsSubmitting(true);
        setShowOutput(true);
        setIsSubmitResult(true);
        setOutput('Submitting solution...');

        try {
            const response = await fetch(`${API_BASE_URL}/submission/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ problemId: id, code, language: selectedLanguage }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit solution.');
            }

            const data = await response.json();
            setOutput(data.verdict === 'Accepted'
                ? '✅ Accepted'
                : data.verdict === 'Wrong Answer'
                    ? `❌ Wrong Answer on Test Case ${data.failedCaseIndex + 1}`
                    : data.verdict === 'Time Limit Exceeded'
                        ? '⏱️ Time Limit Exceeded'
                        : `❌ ${data.verdict}`);
        } catch (err) {
            setOutput(`Error submitting solution: ${err.message}`);
            console.error('Submit Solution Error:', err);
        } finally {
            setIsSubmitting(false);
        }
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
            <div
                className={`container mx-auto flex flex-grow p-3 relative
                ${isMobile ? 'flex-col' : 'flex-row'}
                ${isMobile ? 'gap-4' : 'gap-0'}`}
                style={{ height: 'calc(100vh - 6.5rem)' }}
            >
                {/* Left Column */}
                <div
                    ref={leftRef}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700 overflow-y-auto"
                    style={{
                        width: isMobile ? '100%' : `${leftWidth}%`,
                        transition: isDragging ? 'none' : 'width 0.2s'
                    }}
                >
                    {/* Tabs */}
                    <nav className="flex space-x-4 mb-6">
                        <button
                            onClick={() => setActiveTab('Problem')}
                            className={`px-4 py-2 rounded ${activeTab === 'Problem' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
                        >
                            Problem
                        </button>
                        <button
                            onClick={() => setActiveTab('My Submissions')}
                            className={`px-4 py-2 rounded ${activeTab === 'My Submissions' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
                        >
                            My Submissions
                        </button>
                    </nav>
                    {activeTab === 'Problem' ? (
                        <>
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
                                            <div className="relative group">
                                                <button
                                                    onClick={() => handleCopy(sample.input)}
                                                    className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Copy
                                                </button>
                                                <pre className="bg-gray-300 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded-md overflow-x-auto text-sm">
                                                    <code>{sample.input}</code>
                                                </pre>
                                            </div>
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mt-3 mb-1">Output {index + 1}:</h4>
                                            <div className="relative group">
                                                <button
                                                    onClick={() => handleCopy(sample.input)}
                                                    className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Copy
                                                </button>
                                                <pre className="bg-gray-300 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 rounded-md overflow-x-auto text-sm">
                                                    <code>{sample.output}</code>
                                                </pre>
                                            </div>
                                        </div>
                                    ))}
                                    {showSnackbar && (
                                        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 z-50">
                                            Copied to clipboard!
                                        </div>
                                    )}
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
                        </>
                    ) : (
                        <div className="space-y-4">
                            {loadingSubmissions ? (
                                <p className="text-gray-500">Loading submissions...</p>
                            ) : submissionError ? (
                                <p className="text-red-500">{submissionError}</p>
                            ) : submissions.length === 0 ? (
                                <p className="text-gray-500">No submissions yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-300 text-sm">
                                        <thead className="bg-gray-100 dark:bg-gray-700 text-left">
                                            <tr>
                                                <th className="p-2 border-b">#</th>
                                                <th className="p-2 border-b">Language</th>
                                                <th className="p-2 border-b">Status</th>
                                                <th className="p-2 border-b">Submitted At</th>
                                                <th className="p-2 border-b">Code</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {submissions.map((submission, index) => (
                                                <tr key={submission._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="p-2 border-b">{index + 1}</td>
                                                    <td className="p-2 border-b">{submission.language.toUpperCase()}</td>
                                                    <td className={`p-2 border-b font-semibold ${submission.status === 'Accepted' ? 'text-green-600' : 'text-red-500'}`}>
                                                        {submission.status === 'Accepted'
                                                            ? 'Accepted'
                                                            : `${submission.status}${typeof submission.failedCaseIndex === 'number'
                                                                ? ` (on test case ${submission.failedCaseIndex + 1})`
                                                                : ''
                                                            }`}
                                                        {!(submission.status === 'Accepted') && (typeof failedCaseIdx === 'number' && submission.testResults?.[submission.failedCaseIndex + 1]) && (
                                                            <div className="text-sm mt-1 text-gray-600">
                                                                <div><strong>Expected:</strong> {typeof failedCaseIdx === 'number' && submission.testResults?.[submission.failedCaseIndex + 1].expectedOutput}</div>
                                                                <div><strong>Your Output:</strong> {typeof failedCaseIdx === 'number' && submission.testResults?.[submission.failedCaseIndex + 1].actualOutput}</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-2 border-b">
                                                        {new Date(submission.submittedAt).toLocaleString()}
                                                    </td>
                                                    <td className="p-2 border-b">
                                                        <button
                                                            onClick={() => setSelectedCode({ code: submission.code, language: submission.language })}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            &lt;/&gt;
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {selectedCode && (
                                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                            <div className="bg-white dark:bg-gray-900 dark:text-white w-[90%] md:w-[60%] lg:w-[50%] rounded-lg shadow-lg p-4 relative max-h-[80vh] overflow-y-auto">

                                                <button
                                                    className="absolute top-2 right-3 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white text-xl font-bold"
                                                    onClick={() => setSelectedCode(null)}
                                                >
                                                    &times;
                                                </button>

                                                <div className="mb-3 text-sm text-gray-800 dark:text-gray-200">
                                                    <strong>Language:</strong> {selectedCode.language.toUpperCase()}
                                                </div>

                                                <div className="h-[60vh]">
                                                    <Editor
                                                        value={selectedCode.code}
                                                        language={selectedCode.language.toLowerCase()}
                                                        theme={theme}
                                                        options={{
                                                            readOnly: true,
                                                            minimap: { enabled: false },
                                                            lineNumbers: "on",
                                                            fontSize: 14,
                                                            scrollBeyondLastLine: false,
                                                            wordWrap: "on",
                                                            renderLineHighlight: "all",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                {!isMobile && (
                    <div
                        onMouseDown={startDragging}
                        className="w-1 cursor-col-resize bg-gray-300 dark:bg-gray-600 hover:bg-blue-400 transition-colors"
                        style={{ zIndex: 10 }}
                    />
                )}

                {/* Right Column: Compiler Area */}
                <div
                    ref={rightRef}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700"
                    style={{
                        width: isMobile ? '100%' : `${100 - leftWidth}%`,
                        transition: isDragging ? 'none' : 'width 0.2s'
                    }}
                >
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
                    <div className="flex-grow min-h-[400px] bg-gray-100 dark:bg-gray-900 rounded-md overflow-y-auto relative">
                        <Editor
                            value={code}
                            onChange={(newValue) => setCode(newValue)}
                            language={selectedLanguage}
                            theme={theme}
                            options={{
                                domReadOnly: false,
                                readOnly: false,
                                minimap: { enabled: false },
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                            className="code-editor-container"
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
                    {showOutput && (
                        <div className="mt-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Output</h3>
                            <pre className="w-full min-h-[5rem] p-3 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 overflow-auto whitespace-pre-wrap">
                                <code>
                                    {output}
                                </code>
                            </pre>
                        </div>
                    )}

                    {/* Run/Submit Buttons */}
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition duration-300 shadow-md transform hover:scale-105"
                        >
                            {isRunning ? 'Running...' : 'Run'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition duration-300 shadow-md transform hover:scale-105"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProblemDetailPage;