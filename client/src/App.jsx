import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import Problems from './components/ProblemsPage'
import Navbar from './components/Navbar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Footer from './components/Footer'
import LoginPage from './components/LoginPage'
import { AuthProvider } from './context/AuthContext'
import SignupPage from './components/SignupPage'

function App() {
  const [theme, setTheme] = useState('dark');

  // check system preference if no theme is saved.
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If user has a system preference for dark mode, use that.
      setTheme('dark');
    }
  }, []); 

  useEffect(() => {
    if(theme == 'dark') {
      document.documentElement.classList.add('dark');
    }else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <AuthProvider>
      <Router>
        <Navbar theme={theme} toggleTheme={toggleTheme}/> 
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/signup" element={<SignupPage/>} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  )
}

export default App