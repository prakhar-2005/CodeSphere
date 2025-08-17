import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ContestListPage = () => {
    const [contests, setContests] = useState({ upcoming: [], ongoing: [], past: [] });
    const [activeTab, setActiveTab] = useState("upcoming");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarType, setSnackbarType] = useState('success');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contestToDelete, setContestToDelete] = useState(null);
    const { currentUser, isAuthenticated } = useAuth();
    const isAdmin = isAuthenticated && currentUser && currentUser.role === 'admin';
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

    // Helper function for showing snackbar notifications
    const showNotification = (message, type = 'success') => {
        setSnackbarMessage(message);
        setSnackbarType(type);
        setShowSnackbar(true);
        setTimeout(() => {
            setShowSnackbar(false);
        }, 3000);
    };

    const fetchAndSetContests = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/contests`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const sortedContests = {
                upcoming: data.upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
                ongoing: data.ongoing.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
                past: data.past.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            };

            setContests(sortedContests);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAndSetContests();
    }, []);

    const handleRegister = async (contestId) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        const isConfirmed = window.confirm(
            `Are you sure you want to participate in this contest?`
        );
        if (!isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/contests/register/${contestId}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                showNotification(`Successfully registered 🎉`);
                await fetchAndSetContests();
            } else {
                const errorData = await response.json();
                showNotification(`Error: ${errorData.message || 'Registration failed.'}`, 'error');
            }
        } catch (error) {
            showNotification("Error registering for contest", 'error');
        }
    };

    const confirmDelete = async () => {
        setShowDeleteModal(false);

        if (!contestToDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/contests/${contestToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete contest.');
            }
            showNotification('Contest deleted successfully!');
            fetchAndSetContests();
        } catch (err) {
            showNotification(`Error deleting contest: ${err.message}`, 'error');
        } finally {
            setContestToDelete(null);
        }
    };

    const handleDeleteContest = (contestId) => {
        setContestToDelete(contestId);
        setShowDeleteModal(true);
    };

    const filteredContests = contests[activeTab] || [];

    const isUserRegistered = (contest) =>
        isAuthenticated && contest.registeredUsers?.includes(currentUser?._id);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen p-8 pt-24 bg-gradient-to-br from-white to-gray-100 text-gray-900 dark:from-gray-900 dark:to-black dark:text-white items-center justify-center">
                <p className="text-xl dark:text-white">Loading contests...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col min-h-screen p-8 pt-24 bg-gradient-to-br from-white to-gray-100 text-gray-900 dark:from-gray-900 dark:to-black dark:text-white items-center justify-center">
                <p className="text-xl text-red-500">Error: {error}</p>
                <p className="text-md text-gray-400">Please ensure the backend server is running.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen p-8 pt-24
                         bg-gradient-to-br from-white to-gray-100 text-gray-900
                         dark:from-gray-900 dark:to-black dark:text-white">

            <header className="text-center mt-8 mb-10 px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-up">
                    Upcoming <span className="text-blue-600 drop-shadow-lg dark:text-blue-400">Contests</span>
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100
                              text-gray-700 dark:text-gray-300">
                    Challenge your skills in a time-bound programming competition.
                </p>
                {/* Admin "Add Contest" Button */}
                {isAdmin && (
                    <div className="mt-6">
                        <Link
                            to="/admin/add-contest"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-300"
                        >
                            <i className="fas fa-plus-circle mr-2"></i> Add New Contest
                        </Link>
                    </div>
                )}
            </header>

            <section className="flex-grow w-full max-w-6xl mx-auto mb-24">
                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-6">
                    {["upcoming", "ongoing", "past"].map((tab) => (
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

                {/* Table View */}
                {filteredContests.length === 0 ? (
                    <div className="text-center text-gray-500 mt-16">
                        No {activeTab} contests at the moment.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-200 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                                        Name
                                    </th>
                                    <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Start Time
                                    </th>
                                    <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        End Time
                                    </th>
                                    <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                                        {isAdmin ? 'Actions' : 'Action'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredContests.map((contest, index) => (
                                    <tr
                                        key={contest._id}
                                        className={`hover:bg-gray-100 dark:hover:bg-slate-900 transition duration-150 ease-in-out ${index % 2 === 0
                                            ? "bg-white dark:bg-gray-800"
                                            : "bg-gray-100 dark:bg-gray-900"
                                            }`}
                                    >
                                        <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                                            <Link to={`/contest/${contest._id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                {contest.name}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                                            {contest.description}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(contest.startTime).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(contest.endTime).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                                            {isAdmin ? (
                                                <div className="flex space-x-5">
                                                    <Link to={`/admin/edit-contest/${contest._id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                        <i className="fas fa-pencil-alt"></i>
                                                    </Link>
                                                    <button onClick={() => handleDeleteContest(contest._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            ) : activeTab === "upcoming" && !isUserRegistered(contest) ? (
                                                <button
                                                    onClick={() => handleRegister(contest._id)}
                                                    className="px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition duration-200"
                                                >
                                                    Register
                                                </button>
                                            ) : (
                                                <Link
                                                    to={`/contest/${contest._id}`}
                                                    className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                                                >
                                                    View
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4 transform transition-all scale-100 ease-out duration-300">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.867 2.625 2.607 2.625h14.714c1.74 0 3.473-1.125 2.606-2.625l-7.393-12.822c-.866-1.5-2.607-1.5-3.473 0L4.303 16.751z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Delete Contest</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure you want to delete this contest? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse sm:gap-4">
                            <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSnackbar && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 p-1 rounded-full z-50 animate-snackbar-in">
                    <div className={`bg-gray-900/70 text-white dark:bg-white/70 dark:text-gray-900 px-6 py-3 rounded-full shadow-lg border backdrop-blur-md
                            ${snackbarType === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                        <p className="font-semibold text-sm sm:text-base">{snackbarMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContestListPage;