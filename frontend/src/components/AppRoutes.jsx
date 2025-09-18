import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import PrivateRoute from '../utils/PrivateRoute.jsx'

// Components
import Register from '../pages/RegisterPage.jsx'
import Login from '../pages/LoginPage.jsx'
import Dashboard from '../pages/DashboardPage.jsx'
import TvShowDetails from '../pages/TvShowDetailsPage.jsx'

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
          element={<PrivateRoute isAuthenticated={isAuthenticated}><Dashboard setAuth={setAuth} /></PrivateRoute>} 
        />

        <Route 
          path="/tv-shows/:id" 
          element={<PrivateRoute isAuthenticated={isAuthenticated}><TvShowDetails setAuth={setAuth} /></PrivateRoute>} 
        />

      </Routes>
      
      {/* <ToastContainer position="top-right" autoClose={3000} theme="colored" /> */}
    </div>
  )
}

export default AppRoutes
