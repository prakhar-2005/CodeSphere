import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { format } from 'date-fns';

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProfile = async (pageNumber = 1) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/users/profile?page=${pageNumber}&limit=10`,
                { credentials: 'include' }
            );
            const data = await res.json();
            if (res.ok) {
                setProfile(data);
                setTotalPages(data.totalPages);
            } else {
                console.error(data.message);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile(page);
    }, [page]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-xl text-gray-500 dark:text-gray-400">
                Loading profile...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex justify-center items-center min-h-screen text-xl text-red-500">
                Failed to load profile.
            </div>
        );
    }

    const { user, submissions, activity } = profile;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // 1 year heatmap

    return (
        <div className="min-h-screen pt-[6rem] px-6 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
            <div className="max-w-6xl mx-auto">
                {/* User Info Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
                            <p className="text-gray-600 dark:text-gray-400">📧 {user.email}</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm">
                                Joined on {formatDate(user.createdAt)}
                            </p>
                        </div>
                        <div className="bg-blue-500 text-white w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold">
                            {user.username[0].toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-500">Activity Heatmap</h2>
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={new Date()}
                        values={activity}
                        classForValue={(value) => {
                            if (!value || value.count === 0) return 'color-empty';
                            if (value.count < 2) return 'color-scale-1';
                            if (value.count < 4) return 'color-scale-2';
                            if (value.count < 6) return 'color-scale-3';
                            return 'color-scale-4';
                        }}
                        tooltipDataAttrs={(value) => {
                            if (!value || !value.date) return {};
                            return { 'data-tip': `${value.date}: ${value.count} submissions` };
                        }}
                        showWeekdayLabels
                    />
                </div>

                {/* Recent Submissions with Pagination */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-500">Recent Submissions</h2>
                    {submissions.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                            <th className="p-3">Problem</th>
                                            <th className="p-3">Language</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Submitted At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map((s) => (
                                            <tr
                                                key={s._id}
                                                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                            >
                                                <td className="p-3">{s.problemId?.name || 'Unknown'}</td>
                                                <td className="p-3">{s.language}</td>
                                                <td
                                                    className={`p-3 font-semibold ${s.status === 'Accepted'
                                                            ? 'text-green-500'
                                                            : s.status === 'Wrong Answer'
                                                                ? 'text-red-500'
                                                                : 'text-yellow-500'
                                                        }`}
                                                >
                                                    {s.status}
                                                </td>
                                                <td className="p-3">
                                                    {new Date(s.submittedAt).toLocaleString('en-GB', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false,
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex justify-center items-center mt-4 space-x-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <span className="text-gray-700 dark:text-gray-300">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No submissions yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;