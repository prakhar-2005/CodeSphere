import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ContestDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, isAuthenticated } = useAuth();

    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('problems');
    const [participants, setParticipants] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

    // Helper function to fetch a single contest
    const fetchContest = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/contests/${id}`, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setContest(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to fetch participants
    const fetchParticipants = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/contests/${id}/participants`);
            if (!response.ok) {
                throw new Error('Failed to fetch participants');
            }
            const data = await response.json();
            setParticipants(data);
        } catch (err) {
            console.error("Error fetching participants:", err);
            setParticipants([]);
        }
    };

    // Helper function to fetch the leaderboard
    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/contests/${id}/leaderboard`);
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            const data = await response.json();
            setLeaderboard(data);
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
            setLeaderboard([]);
        }
    };

    useEffect(() => {
        fetchContest();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'participants') {
            fetchParticipants();
        } else if (activeTab === 'leaderboard') {
            fetchLeaderboard();
        }
    }, [activeTab, id]);

    const handleRegister = async () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        const isConfirmed = window.confirm(
            `Are you sure you want to participate in '${contest.name}' contest?`
        );
        if (!isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/contests/register/${id}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                setSnackbarMessage(`Successfully registered for '${contest.name}'! 🎉`);
                setShowSnackbar(true);
                setTimeout(() => setShowSnackbar(false), 3000); 
                fetchContest();
            } else {
                const errorData = await response.json();
                setSnackbarMessage(`${errorData}`);
                setShowSnackbar(true);
                setTimeout(() => setShowSnackbar(false), 3000); 
            }
        } catch (error) {
            setSnackbarMessage("Error registering for contest");
            setShowSnackbar(true);
            setTimeout(() => setShowSnackbar(false), 3000); 
        }
    };

    const getContestStatus = (contest) => {
        const now = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);
        if (now < startTime) {
            return 'Upcoming';
        } else if (now >= startTime && now <= endTime) {
            return 'Ongoing';
        } else {
            return 'Past';
        }
    };
    
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen p-8 pt-24 dark:bg-gray-900 dark:text-white items-center justify-center">
                <p className="text-xl">Loading contest details...</p>
            </div>
        );
    }

    if (error || !contest) {
        return (
            <div className="flex flex-col min-h-screen p-8 pt-24 dark:bg-gray-900 dark:text-white items-center justify-center">
                <p className="text-xl text-red-500">Error: {error || 'Contest not found'}</p>
            </div>
        );
    }

    const contestStatus = getContestStatus(contest);
    const isRegistered = isAuthenticated && contest.registeredUsers.includes(currentUser?._id?.toString());
    const showProblems = contestStatus === 'Ongoing' || contestStatus === 'Past' || isRegistered;
    const showRegisterButton = contestStatus === 'Upcoming' && !isRegistered;
    const showContestLink = contestStatus === 'Ongoing' || isRegistered || contestStatus === 'Past';

    return (
        <div className="flex flex-col min-h-screen p-8 pt-24
                        bg-gradient-to-br from-white to-gray-100 text-gray-900
                        dark:from-gray-900 dark:to-black dark:text-white">

            <header className="text-center mt-8 mb-10 px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-up">
                    <span className="text-blue-600 drop-shadow-lg dark:text-blue-400">{contest.name}</span>
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100
                              text-gray-700 dark:text-gray-300">
                    {contest.description}
                </p>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <p>Starts: {new Date(contest.startTime).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</p>
                    <p>Ends: {new Date(contest.endTime).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</p>
                    <p className={`font-semibold ${contestStatus === 'Ongoing' ? 'text-green-500' : 'text-yellow-500'}`}>{contestStatus}</p>
                </div>

                {showRegisterButton && (
                    <div className="mt-6">
                        <button
                            onClick={handleRegister}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-300"
                        >
                            Register
                        </button>
                    </div>
                )}
            </header>

            <section className="flex-grow w-full max-w-6xl mx-auto mb-24">
                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-6">
                    {['problems', 'participants', 'leaderboard'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-md font-semibold transition ${activeTab === tab
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 shadow hover:shadow-lg"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content based on Active Tab */}
                {activeTab === 'problems' && (
                    <div className="mt-8">
                        {showProblems ? (
                            <div className="overflow-x-auto rounded-lg shadow-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-200 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">Problem Name</th>
                                            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Difficulty</th>
                                            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {contest.problems.length > 0 ? (
                                            contest.problems.map((problem) => (
                                                <tr key={problem._id} className="hover:bg-gray-100 dark:hover:bg-slate-900 transition duration-150 ease-in-out">
                                                    <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                                                        <Link to={`/problems/${problem._id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                            {problem.name}
                                                        </Link>
                                                    </td>
                                                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {problem.difficulty}
                                                    </td>
                                                    <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                                                        {contestStatus !== 'Upcoming' ? (
                                                            <Link to={`/problems/${problem._id}`} className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200">
                                                                Solve
                                                            </Link>
                                                        ) : (
                                                            <span className="px-4 py-1 text-sm bg-gray-400 text-white rounded cursor-not-allowed">
                                                                Starts {new Date(contest.startTime).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="py-10 text-center text-gray-500">
                                                    Problems will be visible once the contest starts.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-xl text-gray-500 mt-16">
                                <p>You must be registered for this contest to view the problems.</p>
                                <p>Problems will be available starting at: {new Date(contest.startTime).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'participants' && (
                    <div className="mt-8">
                        {participants.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg shadow-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-200 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider rounded-lg">Username</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {participants.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-slate-900 transition duration-150 ease-in-out">
                                                <td className="py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {user.username}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-xl text-gray-500 mt-16">No participants registered yet.</p>
                        )}
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <div className="mt-8">
                        {leaderboard.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg shadow-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-200 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                                            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Username</th>
                                            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Problems Solved</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {leaderboard.map((entry, index) => (
                                            <tr key={index} className="hover:bg-gray-100 dark:hover:bg-slate-900 transition duration-150 ease-in-out">
                                                <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">{index + 1}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">{entry.username}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">{entry.solvedCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-xl text-gray-500 mt-16">No submissions yet.</p>
                        )}
                    </div>
                )}
            </section>

            {showSnackbar && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 p-1 rounded-full z-50 animate-snackbar-in">
                    <div className="bg-gray-900/70 text-white dark:bg-white/70 dark:text-gray-900 px-6 py-3 rounded-full shadow-lg border border-gray-800/50 dark:border-white/50 backdrop-blur-md">
                        <p className="font-semibold text-sm sm:text-base">{snackbarMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContestDetailPage;