import React, { Fragment, useState} from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Components
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  }

  return (
    <Router>
      <div className="container">
        <Routes>
          
          <Route 
            // Redirect to dashboard if already logged in
            exact path="/login" 
            element={!isAuthenticated ? <Login setAuth={setAuth} /> : <Navigate to="/dashboard" />} 
          />
          
          <Route 
            // Redirect to dashboard if already logged in
            exact path="/register" 
            element={!isAuthenticated ? <Register setAuth={setAuth} /> : <Navigate to="/dashboard" />} 
          />

          <Route 
            // Redirect to dashboard if already logged in
            exact path="/dashboard" 
            element={isAuthenticated ? <Dashboard setAuth={setAuth} /> : <Navigate to="/login" />} 
          />

        </Routes>
      </div>
    </Router>
  )
}

export default App
