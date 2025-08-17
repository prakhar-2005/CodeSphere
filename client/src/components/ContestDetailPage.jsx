import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

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
    const [solvedProblems, setSolvedProblems] = useState(new Set());
    const [contestProblems, setContestProblems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(25);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLeaderboard = leaderboard.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(leaderboard.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

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

    const fetchSolvedProblems = async () => {
        if (!isAuthenticated || !currentUser) return;

        try {
            const response = await fetch(`${API_BASE_URL}/submission/contest/${id}/accepted`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setSolvedProblems(new Set(data));
            }
        } catch (err) {
            console.error("Error fetching solved problems:", err);
        }
    };

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

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/contests/${id}/leaderboard`);
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            const data = await response.json();
            setLeaderboard(data.leaderboard);
            setContestProblems(data.problems);
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
            setLeaderboard([]);
            setContestProblems([]);
        }
    };

    useEffect(() => {
        fetchContest();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'problems' && isAuthenticated) {
            fetchSolvedProblems();
        } else if (activeTab === 'participants') {
            fetchParticipants();
        } else if (activeTab === 'leaderboard') {
            fetchLeaderboard();
        }
    }, [activeTab, id, isAuthenticated]);

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
                                                <tr
                                                    key={problem._id}
                                                    className={`hover:bg-gray-100 dark:hover:bg-slate-900 transition duration-150 ease-in-out ${solvedProblems.has(problem._id) ? 'bg-green-200 dark:bg-green-900' : ''}`}
                                                >
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
                                                                Starts {new Date(contest.startTime).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
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
                                            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Points</th>
                                            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Solved</th>

                                            {contestProblems.map((problem, index) => (
                                                <th key={problem._id} scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                    {index + 1}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {leaderboard.map((entry, index) => {
                                            return (<tr key={entry.username} className="hover:bg-gray-100 dark:hover:bg-slate-900 transition duration-150 ease-in-out">
                                                <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">{indexOfFirstItem + index + 1}</td>
                                                <td className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{entry.username}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">{entry.score}</td>
                                                <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">{entry.solvedCount}</td>

                                                {contestProblems.map((problem) => {
                                                    const problemStatus = entry.problemScores[problem._id];
                                                    const status = problemStatus ? problemStatus.status : 'Not Attempted';
                                                    const wrongAttempts = problemStatus ? problemStatus.wrongAttempts : 0;
                                                    const timeTaken = problemStatus ? problemStatus.timeTaken : null;

                                                    return (
                                                        <td key={problem._id} className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">
                                                            {status === 'Accepted' ? (
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-green-600 font-semibold">{timeTaken}m</span>
                                                                    {wrongAttempts > 0 && (
                                                                        <div className="flex items-center bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
                                                                            <FaTimesCircle className="w-3 h-3" />
                                                                            <span className="ml-1">{wrongAttempts}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : wrongAttempts > 0 ? (
                                                                <div className="flex items-center">
                                                                    <span className="text-red-500 font-bold">
                                                                        <FaTimesCircle className="inline-block mr-1" />
                                                                    </span>
                                                                    <span className="text-sm text-red-500">{wrongAttempts}</span>
                                                                </div>
                                                            ) : (
                                                                <span>-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-xl text-gray-500 mt-16">No submissions yet.</p>
                        )}

                        {leaderboard.length > itemsPerPage && (
                            <nav className="flex justify-center items-center space-x-2 mt-8">
                                <button
                                    onClick={goToFirstPage}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                >
                                    &lt;&lt;
                                </button>
                                <button
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                >
                                    &lt;
                                </button>

                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => paginate(index + 1)}
                                        className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} transition duration-200`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                >
                                    &gt;
                                </button>
                                <button
                                    onClick={goToLastPage}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                >
                                    &gt;&gt;
                                </button>
                            </nav>
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