import React, { Fragment, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Components
import Register from './pages/RegisterPage.jsx'
import Login from './pages/LoginPage.jsx'
import Dashboard from './pages/DashboardPage.jsx'
import AppRoutes from './components/AppRoutes.jsx'
import NavBar from './components/NavBar.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true); // NEW


  const setAuth = (boolean) => { setIsAuthenticated(boolean); }


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
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  }



  useEffect(() => {
    isAuth();
  }, []);


  // To make sure refresh on edit product does not send back to /dashboard 
  if (authChecking) {
    return (
      <div
        className="min-h-screen grid place-items-center bg-base-200 text-base-content"
        style={{
          backgroundColor: '#1d232a', // fallback color matching bg-base-200 for DaisyUI forest
        }}
        data-theme="forest" // apply DaisyUI theme early
      >
        <div className="loading loading-spinner loading-lg" />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300" data-theme="forest">

      {isAuthenticated && <NavBar isAuthenticated={isAuthenticated} setAuth={setAuth} />}

      <AppRoutes isAuthenticated={isAuthenticated} setAuth={setAuth} />

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  )
}

export default App
