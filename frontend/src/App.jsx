import React, { Fragment, useState, useEffect} from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Components
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import AppRoutes from './components/AppRoutes.jsx'
import NavBar from './components/NavBar.jsx'

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
      <div className="container ">
        <div className="min-h-screen bg-base-200 transition-colors duration-300" data-theme="forest">

          <NavBar isAuthenticated={isAuthenticated} setAuth={setAuth} />

          <AppRoutes isAuthenticated={isAuthenticated} setAuth={setAuth} />

          <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </div>
      </div>
  )
}

export default App
