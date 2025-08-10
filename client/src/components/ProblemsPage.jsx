import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRef } from 'react';

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy': return 'text-green-500 dark:text-green-400';
    case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
    case 'Hard': return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-500 dark:text-gray-400';
  }
};

const ProblemsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && currentUser && currentUser.role === 'admin';

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination 
  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage] = useState(10);

  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortOrder, setSortOrder] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagDropdownRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/problems/tags`);
      const data = await response.json();
      setAllTags(data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const fetchProblems = async () => {
    try {
      const tagsQuery = selectedTags.length > 0 ? `tags=${selectedTags.join(',')}` : '';
      const difficultyQuery = selectedDifficulty !== 'All' ? `&difficulty=${selectedDifficulty}` : '';
      const sortQuery = sortOrder ? `&sort=rating-${sortOrder}` : '';

      const query = [tagsQuery, difficultyQuery, sortQuery].filter(Boolean).join('&');
      const response = await fetch(`${API_BASE_URL}/problems?${query}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProblems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllFilters = () => {
    setSelectedTags([]);
    setSelectedDifficulty('All');
    setSortOrder(null);
  };

  useEffect(() => {
    fetchTags();
    fetchProblems();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchProblems();
  }, [selectedTags, selectedDifficulty, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      return; // User cancelled
    }

    try {
      const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete problem.');
      }
      alert('Problem deleted successfully!');
      fetchProblems();
    } catch (err) {
      setError(err.message);
      alert('Error deleting problem: ' + err.message);
    }
  };

  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = problems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(problems.length / problemsPerPage);
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen p-8 pt-24 bg-gradient-to-br from-white to-gray-100 text-gray-900 dark:from-gray-900 dark:to-black dark:text-white items-center justify-center">
        <p className="text-xl dark:text-white">Loading problems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen p-8 pt-24 bg-gradient-to-br from-white to-gray-100 text-gray-900 dark:from-gray-900 dark:to-black dark:text-white items-center justify-center">
        <p className="text-xl text-red-500">Error: {error}</p>
        <p className="text-md text-gray-400">Please ensure the backend server is running on port 5000.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-8 pt-24
                    bg-gradient-to-br from-white to-gray-100 text-gray-900
                    dark:from-gray-900 dark:to-black dark:text-white">

      <header className="text-center mt-8 mb-10 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-up">
          Explore <span className="text-blue-600 drop-shadow-lg dark:text-blue-400">Problems</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100
                      text-gray-700 dark:text-gray-300">
          Sharpen your coding skills with a diverse collection of algorithmic challenges.
        </p>
        {/* Admin "Add Problem" Button */}
        {isAdmin && (
          <div className="mt-6">
            <Link
              to="/admin/add-problem"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-300"
            >
              <i className="fas fa-plus-circle mr-2"></i> Add New Problem
            </Link>
          </div>
        )}
      </header>

      <section className="flex-grow w-full max-w-6xl mx-auto mb-24">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          {/* Left: Sort by Rating */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-4 py-2 border rounded bg-white dark:bg-gray-800 dark:text-white shadow hover:shadow-lg transition-all duration-200"
            >
              Sort by Rating
              <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
            </button>
          </div>

          {/* Right: Tags & Difficulty */}
          <div className="flex gap-4 ml-auto">
            {/* Tag Filter */}
            <div className="relative" ref={tagDropdownRef}>
              <button
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className="flex items-center gap-2 px-4 py-2 border rounded bg-white dark:bg-gray-800 dark:text-white shadow hover:shadow-lg transition-all duration-200"
              >
                Tags
                <i className={`fas fa-chevron-${showTagDropdown ? 'up' : 'down'}`}></i>
              </button>

              {showTagDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 transition-all duration-200">
                  <div className="max-h-60 overflow-y-auto">
                    {allTags.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => {
                            setSelectedTags((prev) =>
                              prev.includes(tag)
                                ? prev.filter((t) => t !== tag)
                                : [...prev, tag]
                            );
                          }}
                          className="mr-2"
                        />
                        <span className="text-gray-800 dark:text-gray-200">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border rounded bg-white dark:bg-gray-800 dark:text-white shadow hover:shadow-lg transition-all duration-200"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Clear All Button */}
          {(selectedTags.length > 0 || selectedDifficulty !== 'All' || sortOrder) && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center justify-center w-10 h-10 border rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 shadow transition-all duration-200"
              title="Clear All Filters"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {problems.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                    Problem Name
                  </th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Tags
                  </th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                    {isAdmin ? 'Actions' : 'Action'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentProblems.map((problem) => (
                  <tr key={problem._id} className="hover:bg-gray-100 dark:hover:bg-slate-900 transition duration-150 ease-in-out">
                    <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                      <Link to={`/problems/${problem._id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        {problem.name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex flex-wrap gap-2">
                        {problem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700
                                       dark:bg-gray-700 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {problem.rating}
                    </td>
                    {isAdmin ? (
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium flex space-x-5">
                        <Link to={`/admin/edit-problem/${problem._id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <i className="fas fa-pencil-alt"></i>
                        </Link>
                        <button
                          onClick={() => handleDeleteProblem(problem._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    ) : (
                      <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                        <Link to={`/problems/${problem._id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          Solve
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xl text-gray-400 col-span-full text-center">No problems found.</p>
        )}

        {problems.length > problemsPerPage && (
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
      </section>
    </div>
  );
};

export default ProblemsPage;