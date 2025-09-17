import React, { Fragment, useState, useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Components
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  }


  async function isAuth() {
    try {

      const token = localStorage.getItem("token") || '';
      const response = await fetch("http://localhost:3000/auth/is-verify", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      const parseRes = await response.json();


      parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);

    } catch (err) {
      console.error(err.message);
    }
  }



  useEffect(() => {
    isAuth();
  }, []);



  return (
    <Router>
      <div className="container">
        <Routes>
          
          <Route 
            // Redirect to dashboard if already logged in
            path="/login" 
            element={!isAuthenticated ? <Login setAuth={setAuth} /> : <Navigate to="/dashboard" />} 
          />
          
          <Route 
            // Redirect to dashboard if already logged in
            path="/register" 
            element={!isAuthenticated ? <Register setAuth={setAuth} /> : <Navigate to="/dashboard" />} 
          />

          <Route 
            // Redirect to dashboard if already logged in
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard setAuth={setAuth} /> : <Navigate to="/login" />} 
          />

        </Routes>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>
    </Router>
  )
}

export default App
