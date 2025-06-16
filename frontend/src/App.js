// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubjectProvider } from './context/SubjectContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Page Components
import Home from './components/pages/Home';
import Dashboard from './components/pages/Dashboard';
import Subjects from './components/pages/Subjects';
import Profile from './components/pages/Profile';
import Files from './components/pages/Files';
import Settings from './components/pages/Settings';
import Revision from './components/pages/Revisions';
import ProgressGraph from './components/pages/Progress';
import Notes from './components/pages/Notes';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();

  // Show loading spinner only during initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? (
        <SubjectProvider user={user}>
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/files" element={<Files />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/revisions" element={<Revision />} />
                <Route path="/progress" element={<ProgressGraph />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </SubjectProvider>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
      <ToastContainer position="top-right" />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
