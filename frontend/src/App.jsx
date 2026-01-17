import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import PublicBoard from './pages/PublicBoard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import { AuthContext } from './context/AuthContext';

function Navbar() {
  const { token, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow p-4 flex gap-4 items-center">
      <Link to="/" className="font-bold text-blue-600 text-lg">FeedbackTool</Link>
      <Link to="/" className="text-gray-600 hover:text-blue-600">Board</Link>
      <Link to="/admin" className="text-gray-600 hover:text-blue-600">Admin</Link>

      <div className="ml-auto flex gap-4 items-center">
        {token ? (
          <>
            <span className="text-sm text-gray-500">Logged in</span>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<PublicBoard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
