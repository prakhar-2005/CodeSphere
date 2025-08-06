import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import ProfilePicture from './ProfilePicture';

const ProfilePage = () => {
    const { currentUser } = useAuth();

    const [userInfo, setUserInfo] = useState(null);
    const [activity, setActivity] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [loadingSubmissions, setLoadingSubmissions] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

    const fetchUserInfo = async () => {
        try {
            const res = await fetch(`${BASE_URL}/users/profile/info`, { credentials: 'include' });
            const data = await res.json();
            if (res.ok) setUserInfo(data);
        } catch (err) {
            console.error('Error fetching user info:', err);
        } finally {
            setLoadingUser(false);
        }
    };

    const fetchActivity = async () => {
        try {
            const res = await fetch(`${BASE_URL}/users/profile/activity`, { credentials: 'include' });
            const data = await res.json();
            if (res.ok) setActivity(data);
        } catch (err) {
            console.error('Error fetching activity:', err);
        } finally {
            setLoadingActivity(false);
        }
    };

    const fetchSubmissions = async (pageNumber = 1) => {
        try {
            const res = await fetch(`${BASE_URL}/users/profile/submissions?page=${pageNumber}&limit=10`, { credentials: 'include' });
            const data = await res.json();
            if (res.ok) {
                setSubmissions(data.submissions);
                setTotalPages(data.totalPages);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleUploadProfilePic = async (file) => {
        const formData = new FormData();
        formData.append('profilePic', file);

        try {
            const res = await fetch(`${BASE_URL}/users/upload-profile-pic`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await res.json();
            if (res.ok) {
                setUserInfo((prev) => ({
                    ...prev,
                    profilePic: data.profilePic,
                }));
            } else {
                alert('Failed to upload profile picture');
            }
        } catch (err) {
            console.error('Error uploading profile pic:', err);
        }
    };

    useEffect(() => {
        fetchUserInfo();
        fetchActivity();
        fetchSubmissions(page);
    }, [page]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    };

    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    if (loadingUser) {
        return (
            <div className="flex justify-center items-center min-h-screen text-xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
                Loading profile...
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="flex justify-center items-center min-h-screen text-xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black text-red-500">
                Failed to load profile.
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-[6rem] px-6 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
            <div className="max-w-6xl mx-auto">
                {/* User Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{userInfo.username}</h1>
                            <p className="text-gray-600 dark:text-gray-400">📧 {userInfo.email}</p>
                            <p className="text-gray-500 text-sm">
                                Joined on {formatDate(userInfo.createdAt)}
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <ProfilePicture userInfo={userInfo} onUpload={handleUploadProfilePic} />
                        </div>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-500">Activity Heatmap</h2>
                    {loadingActivity ? (
                        <p>Loading activity...</p>
                    ) : (
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
                            tooltipDataAttrs={(value) =>
                                value?.date ? { 'data-tip': `${value.date}: ${value.count} submissions` } : {}
                            }
                            showWeekdayLabels
                        />
                    )}
                </div>

                {/* Submissions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-500">Recent Submissions</h2>
                    {loadingSubmissions ? (
                        <p>Loading submissions...</p>
                    ) : submissions.length > 0 ? (
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
                                            <tr key={s._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                                <td className="p-3">{s.problemId?.name || 'Unknown'}</td>
                                                <td className="p-3">{s.language}</td>
                                                <td className={`p-3 font-semibold ${s.status === 'Accepted'
                                                    ? 'text-green-500'
                                                    : s.status === 'Wrong Answer'
                                                        ? 'text-red-500'
                                                        : 'text-yellow-500'
                                                    }`}>
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