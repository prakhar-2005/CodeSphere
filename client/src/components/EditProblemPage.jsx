import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';

const EditProblemPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { isAuthenticated, currentUser, loadingAuth } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

    const isAdmin = isAuthenticated && currentUser && currentUser.role === 'admin';

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [inputFormat, setInputFormat] = useState('');
    const [outputFormat, setOutputFormat] = useState('');
    const [constraints, setConstraints] = useState('');
    const [tags, setTags] = useState(''); // Comma-separated string
    const [difficulty, setDifficulty] = useState('Easy');
    const [rating, setRating] = useState(0); 
    const [timeLimit, setTimeLimit] = useState(0); 
    const [memoryLimit, setMemoryLimit] = useState(0); 

    const [sampleTestCases, setSampleTestCases] = useState([{ input: '', output: '' }]);
    const [testCases, setTestCases] = useState([{ input: '', output: '' }]);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchProblem = async () => {
            if (!id) { 
                navigate('/problems');
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/problems/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                setName(data.name);
                setDescription(data.description);
                setInputFormat(data.inputFormat);
                setOutputFormat(data.outputFormat);
                setConstraints(data.constraints);
                setTags(data.tags.join(', ')); 
                setDifficulty(data.difficulty);
                setRating(data.rating);
                setTimeLimit(data.timeLimit);
                setMemoryLimit(data.memoryLimit);
                setSampleTestCases(data.sampleTestCases.length > 0 ? data.sampleTestCases : [{ input: '', output: '' }]);
                setTestCases(data.testCases.length > 0 ? data.testCases : [{ input: '', output: '' }]);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching problem for edit:', err);
                alert('Error loading problem for edit: ' + err.message);
                navigate('/problems'); 
            } finally {
                setLoading(false);
            }
        };

        if (!loadingAuth && isAdmin) {
            fetchProblem();
        } else if (!loadingAuth && (!isAuthenticated || currentUser.role !== 'admin')) {
            alert('You must be logged in as an administrator to edit problems.');
            navigate('/login');
        }
    }, [id, API_BASE_URL, isAuthenticated, currentUser, loadingAuth, isAdmin, navigate]);


    const handleSampleTestCaseChange = (index, field, value) => {
        const newSampleTestCases = [...sampleTestCases];
        newSampleTestCases[index][field] = value;
        setSampleTestCases(newSampleTestCases);
    };

    const addSampleTestCase = () => {
        setSampleTestCases([...sampleTestCases, { input: '', output: '' }]);
    };

    const removeSampleTestCase = (index) => {
        const newSampleTestCases = sampleTestCases.filter((_, i) => i !== index);
        setSampleTestCases(newSampleTestCases);
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...testCases];
        newTestCases[index][field] = value;
        setTestCases(newTestCases);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: '', output: '' }]);
    };

    const removeTestCase = (index) => {
        const newTestCases = testCases.filter((_, i) => i !== index);
        setTestCases(newTestCases);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!name || !description || !inputFormat || !outputFormat || !constraints || !tags || !difficulty || !timeLimit || !memoryLimit) {
            setError('Please fill all required basic problem fields.');
            setLoading(false);
            return;
        }
        if (sampleTestCases.some(tc => !tc.input || !tc.output)) {
            setError('Please fill all sample test case inputs and outputs.');
            setLoading(false);
            return;
        }
        if (testCases.some(tc => !tc.input || !tc.output)) {
            setError('Please fill all hidden test case inputs and outputs.');
            setLoading(false);
            return;
        }
        if (timeLimit < 1000) {
            setError('Time Limit must be at least 1000ms.');
            setLoading(false);
            return;
        }
        if (memoryLimit < 256) {
            setError('Memory Limit must be at least 256MB.');
            setLoading(false);
            return;
        }

        const problemData = {
            name,
            description,
            inputFormat,
            outputFormat,
            constraints,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
            difficulty,
            rating: Number(rating),
            timeLimit: Number(timeLimit),
            memoryLimit: Number(memoryLimit),
            sampleTestCases,
            testCases,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/problems/${id}`, {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(problemData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update problem.');
            }

            alert('Problem updated successfully!');
            navigate('/problems');
        } catch (err) {
            setError(err.message);
            console.error('Update Problem Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loadingAuth || loading) {
        return (
            <div className="flex flex-col min-h-screen p-8 pt-24 bg-gradient-to-br from-white to-gray-100 text-gray-900 dark:from-gray-900 dark:to-black dark:text-white items-center justify-center">
                <p className="text-xl dark:text-white">
                    {loadingAuth ? 'Checking administrator access...' : 'Loading problem for edit...'}
                </p>
            </div>
        );
    }

    if (!isAdmin) {
        return null; 
    }

    return (
        <div className="flex flex-col min-h-screen p-8 pt-24
                        bg-gradient-to-br from-white to-gray-100 text-gray-900
                        dark:from-gray-900 dark:to-black dark:text-white">
            <div className="container mx-auto bg-white dark:bg-gray-800 p-10 rounded-lg shadow-2xl w-full max-w-5xl my-10 border border-gray-200 dark:border-gray-700">
                <h2 className="text-4xl font-extrabold text-center mb-10 text-blue-600 dark:text-blue-400">
                    Edit Problem
                </h2>

                {error && (
                    <p className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-md mb-6 text-sm text-center">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Problem Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label htmlFor="name" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Problem Name</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required
                                className="w-full px-5 py-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div className="col-span-full">
                            <label htmlFor="description" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows="8"
                                className="w-full px-5 py-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 resize-y focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        <div>
                            <label htmlFor="inputFormat" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Input Format</label>
                            <textarea id="inputFormat" value={inputFormat} onChange={(e) => setInputFormat(e.target.value)} required rows="4"
                                className="w-full px-5 py-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 resize-y focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        <div>
                            <label htmlFor="outputFormat" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Output Format</label>
                            <textarea id="outputFormat" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} required rows="4"
                                className="w-full px-5 py-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 resize-y focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        <div className="col-span-full">
                            <label htmlFor="constraints" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Constraints</label>
                            <textarea id="constraints" value={constraints} onChange={(e) => setConstraints(e.target.value)} required rows="4"
                                className="w-full px-5 py-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 resize-y focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        <div className="col-span-full">
                            <label htmlFor="tags" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma-separated)</label>
                            <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} required
                                className="w-full px-5 py-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="difficulty" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                            <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} required
                                className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="rating" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                            <input type="number" id="rating" value={rating} onChange={(e) => setRating(e.target.value)} required min="0"
                                className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="timeLimit" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Time Limit (ms)</label>
                            <input type="number" id="timeLimit" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} required min="1000"
                                className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="memoryLimit" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Memory Limit (MB)</label>
                            <input type="number" id="memoryLimit" value={memoryLimit} onChange={(e) => setMemoryLimit(e.target.value)} required min="256"
                                className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    {/* Sample Test Cases */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Sample Test Cases (Visible to User)</h3>
                        {sampleTestCases.map((testCase, index) => (
                            <div key={index} className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor={`sampleInput-${index}`} className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Input {index + 1}</label>
                                        <textarea id={`sampleInput-${index}`} value={testCase.input} onChange={(e) => handleSampleTestCaseChange(index, 'input', e.target.value)} required rows="4"
                                            className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 dark:border-gray-600 resize-y focus:ring-blue-500 focus:border-blue-500"></textarea>
                                    </div>
                                    <div>
                                        <label htmlFor={`sampleOutput-${index}`} className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Output {index + 1}</label>
                                        <textarea id={`sampleOutput-${index}`} value={testCase.output} onChange={(e) => handleSampleTestCaseChange(index, 'output', e.target.value)} required rows="4"
                                            className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 dark:border-gray-600 resize-y focus:ring-blue-500 focus:border-blue-500"></textarea>
                                </div>
                            </div>
                            {sampleTestCases.length > 1 && (
                                <button type="button" onClick={() => removeSampleTestCase(index)}
                                    className="mt-3 text-red-600 hover:text-red-800 text-lg font-medium inline-flex items-center justify-center w-32">
                                    <i className="fas fa-minus-circle mr-1"></i> Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addSampleTestCase}
                        className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 dark:bg-blue-300 hover:bg-blue-200 transition duration-300 w-60">
                        <i className="fas fa-plus-circle mr-2"></i> Add Sample Test Case
                    </button>
                </div>

                {/* Hidden Test Cases */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Hidden Test Cases (For Judging)</h3>
                    {testCases.map((testCase, index) => (
                        <div key={index} className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor={`testInput-${index}`} className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Input {index + 1}</label>
                                    <textarea id={`testInput-${index}`} value={testCase.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} required rows="4"
                                        className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 dark:border-gray-600 resize-y focus:ring-blue-500 focus:border-blue-500"></textarea>
                                </div>
                                <div>
                                    <label htmlFor={`testOutput-${index}`} className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Output {index + 1}</label>
                                    <textarea id={`testOutput-${index}`} value={testCase.output} onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)} required rows="4"
                                        className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 dark:border-gray-600 resize-y focus:ring-blue-500 focus:border-blue-500"></textarea>
                                </div>
                            </div>
                            {testCases.length > 1 && (
                                <button type="button" onClick={() => removeTestCase(index)}
                                    className="mt-3 text-red-600 hover:text-red-800 text-lg font-medium inline-flex items-center justify-center w-32">
                                    <i className="fas fa-minus-circle mr-1"></i> Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addTestCase}
                        className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 dark:bg-blue-300 hover:bg-blue-200 transition duration-300 w-60">
                        <i className="fas fa-plus-circle mr-2"></i> Add Hidden Test Case
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm
                                text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-300 ease-in-out
                                disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving changes...' : 'Save changes'}
                </button>
            </form>
        </div>
    </div>
);
};

export default EditProblemPage;