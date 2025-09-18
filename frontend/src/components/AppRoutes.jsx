import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Components
import Register from './Register.jsx'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'

function AppRoutes({ isAuthenticated, setAuth }) {
  return (
    <div className="container">
      <Routes>
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />

        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login setAuth={setAuth} /> : <Navigate to="/dashboard" />} 
        />
        
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register setAuth={setAuth} /> : <Navigate to="/dashboard" />} 
        />

        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard setAuth={setAuth} /> : <Navigate to="/login" />} 
        />
      </Routes>
      
      {/* <ToastContainer position="top-right" autoClose={3000} theme="colored" /> */}
    </div>
  )
}

export default AppRoutes
