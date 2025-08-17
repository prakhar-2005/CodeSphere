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

  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage] = useState(10);

  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortOrder, setSortOrder] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagDropdownRef = useRef(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);

  const showNotification = (message, type = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
    setTimeout(() => {
      setShowSnackbar(false);
    }, 3000);
  };

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
      setLoading(true);
      const tagsQuery = selectedTags.length > 0 ? `tags=${selectedTags.join(',')}` : '';
      const difficultyQuery = selectedDifficulty !== 'All' ? `&difficulty=${selectedDifficulty}` : '';
      const sortQuery = sortOrder ? `&sort=rating-${sortOrder}` : '';

      const query = [tagsQuery, difficultyQuery, sortQuery].filter(Boolean).join('&');

      let response;
      if (isAdmin) {
        response = await fetch(`${API_BASE_URL}/problems/admin?${query}`, { credentials: 'include' });
      } else {
        response = await fetch(`${API_BASE_URL}/problems?${query}`);
      }

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
  }, [selectedTags, selectedDifficulty, sortOrder, currentUser]);

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

  const confirmDelete = async () => {
    setShowDeleteModal(false);

    if (!problemToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/problems/${problemToDelete}`, {
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
      showNotification('Problem deleted successfully!');
      fetchProblems();
    } catch (err) {
      setError(err.message);
      showNotification('Error deleting problem: ' + err.message, 'error');
    } finally {
      setProblemToDelete(null);
    }
  };

  const handleDeleteProblem = (problemId) => {
    setProblemToDelete(problemId);
    setShowDeleteModal(true);
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

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4 transform transition-all scale-100 ease-out duration-300">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.867 2.625 2.607 2.625h14.714c1.74 0 3.473-1.125 2.606-2.625l-7.393-12.822c-.866-1.5-2.607-1.5-3.473 0L4.303 16.751z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Delete Problem</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this problem? This action cannot be undone.
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
          <div className={`bg-gray-900/70 text-white dark:bg-white/70 dark:text-gray-900 px-6 py-3 rounded-full shadow-lg border border-gray-800/50 dark:border-white/50 backdrop-blur-md
            ${snackbarType === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            <p className="font-semibold text-sm sm:text-base">{snackbarMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemsPage;