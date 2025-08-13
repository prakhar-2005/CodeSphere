import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EditContestPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser, loadingAuth } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

    const isAdmin = isAuthenticated && currentUser && currentUser.role === 'admin';

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [allProblems, setAllProblems] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState('success');

    const showNotification = (message, type = 'success') => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setShowSnackbar(true);
        setTimeout(() => {
            setShowSnackbar(false);
        }, 3000);
    };

    const formatForDatetimeLocal = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        const fetchContestAndProblems = async () => {
            if (!id) {
                navigate('/contests');
                return;
            }

            try {
                // Fetch ALL problems using the admin-only endpoint
                const problemsResponse = await fetch(`${API_BASE_URL}/problems/admin`, {
                    credentials: 'include'
                });
                if (!problemsResponse.ok) throw new Error('Failed to fetch problems.');
                const problemsData = await problemsResponse.json();
                setAllProblems(problemsData);

                // Fetch the specific contest
                const contestResponse = await fetch(`${API_BASE_URL}/contests/edit/${id}`, {
                    credentials: 'include'
                });
                if (!contestResponse.ok) throw new Error('Failed to fetch contest.');
                const contestData = await contestResponse.json();

                // Populate form fields
                setName(contestData.name);
                setDescription(contestData.description);
                setStartTime(formatForDatetimeLocal(contestData.startTime));
                setEndTime(formatForDatetimeLocal(contestData.endTime));
                setSelectedProblems(contestData.problems?.map(problem => problem._id) || []);

            } catch (err) {
                setError(err.message);
                showNotification(`Error loading contest: ${err.message}`, 'error');
                navigate('/contests');
            } finally {
                setLoading(false);
            }
        };

        if (!loadingAuth && isAdmin) {
            fetchContestAndProblems();
        } else if (!loadingAuth && !isAdmin) {
            navigate('/contests');
            showNotification('You must be an administrator to edit a contest.', 'error');
        }
    }, [id, API_BASE_URL, isAuthenticated, currentUser, loadingAuth, isAdmin, navigate]);

    const handleProblemToggle = (problemId) => {
        setSelectedProblems(prev =>
            prev.includes(problemId)
                ? prev.filter(id => id !== problemId)
                : [...prev, problemId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const updatedContestData = {
            name,
            description,
            startTime,
            endTime,
            problems: selectedProblems
        };

        try {
            const response = await fetch(`${API_BASE_URL}/contests/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updatedContestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update contest.');
            }

            showNotification('Contest updated successfully!');
            setTimeout(() => navigate('/contests'), 3000);
        } catch (err) {
            setError(err.message);
            showNotification(`Error updating contest: ${err.message}`, 'error');
            setLoading(false);
        }
    };

    if (loadingAuth || loading) {
        return (
            <div className="flex flex-col min-h-screen p-8 pt-24 bg-gradient-to-br from-white to-gray-100 text-gray-900 dark:from-gray-900 dark:to-black dark:text-white items-center justify-center">
                <p className="text-xl dark:text-white">
                    {loadingAuth ? 'Checking administrator access...' : 'Loading contest for edit...'}
                </p>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="flex flex-col min-h-screen p-8 pt-24 bg-gradient-to-br from-white to-gray-100 text-gray-900 dark:from-gray-900 dark:to-black dark:text-white">
            <div className="container mx-auto bg-white dark:bg-gray-800 p-10 rounded-lg shadow-2xl w-full max-w-5xl my-10 border border-gray-200 dark:border-gray-700">
                <h2 className="text-4xl font-extrabold text-center mb-10 text-blue-600 dark:text-blue-400">Edit Contest</h2>

                {error && (
                    <p className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-md mb-6 text-sm text-center">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label htmlFor="name" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Contest Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-5 py-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows="4" className="w-full px-5 py-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="startTime" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                            <input type="datetime-local" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                            <input type="datetime-local" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Select Problems</h3>
                        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-inner max-h-60 overflow-y-auto">
                            {allProblems.map(problem => (
                                <label key={problem._id} className="flex items-center space-x-3 mb-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedProblems.includes(problem._id)}
                                        onChange={() => handleProblemToggle(problem._id)}
                                        className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400"
                                    />
                                    <span className="text-gray-900 dark:text-gray-100">{problem.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-md shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Updating Contest...' : 'Update Contest'}
                    </button>
                </form>
            </div>
            {showSnackbar && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 p-1 rounded-full z-50 animate-snackbar-in">
                    <div className={`bg-gray-900/70 text-white dark:bg-white/70 dark:text-gray-900 px-6 py-3 rounded-full shadow-lg border backdrop-blur-md ${snackbarType === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                        <p className="font-semibold text-sm sm:text-base">{snackbarMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditContestPage;