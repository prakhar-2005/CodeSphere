import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';

const ContestListPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch('/api/contests');
        const data = await res.json();
        setContests(data);
      } catch (err) {
        console.error('Error fetching contests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const now = new Date();
  const upcoming = contests.filter(c => new Date(c.startTime) > now);
  const past = contests.filter(c => new Date(c.endTime) < now);

  const renderContestCard = (contest) => {
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    const isUpcoming = start > now;
    const isPast = end < now;

    return (
      <div
        key={contest._id}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-3xl mx-auto shadow-md mb-6 border border-gray-300 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">{contest.title}</h2>
          <span
            className={`text-sm font-semibold ${
              isUpcoming ? 'text-green-600' : isPast ? 'text-gray-400' : 'text-blue-500'
            }`}
          >
            {isUpcoming ? 'Upcoming' : isPast ? 'Past' : 'Running'}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          Starts: {format(start, 'PPPpp')}
          <br />
          Duration: {Math.round((end - start) / 60000)} mins
        </p>

        <button
          className={`mt-3 px-4 py-2 rounded font-medium ${
            isUpcoming
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'border border-gray-400 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {isUpcoming ? 'Register' : isPast ? 'View' : 'Enter'} Contest
        </button>
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="pt-24 min-h-[calc(100vh-50px)] p-6 flex flex-col bg-gradient-to-br from-white to-gray-100 text-gray-900
                    dark:from-gray-900 dark:to-black dark:text-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-300">Contests</h1>

      <div className="flex justify-center mb-4 space-x-4">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded ${
            tab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-4 py-2 rounded ${
            tab === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Past
        </button>
      </div>

      {tab === 'upcoming' ? (
        upcoming.length === 0 ? (
          <p className="text-center text-gray-500">No upcoming contests.</p>
        ) : (
          upcoming.map(renderContestCard)
        )
      ) : past.length === 0 ? (
        <p className="text-center text-gray-500">No past contests.</p>
      ) : (
        past.map(renderContestCard)
      )}
    </div>
  );
};

export default ContestListPage;