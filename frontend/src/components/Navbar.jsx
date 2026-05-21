import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Plane, LogOut, LayoutDashboard, PlusCircle, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-md border-b border-white/20">
      <div className="max-w-[95%] xl:max-w-[1536px] mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-blue-600 rounded-xl group-hover:scale-105 transition-transform">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800">
            TripPilot
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 transition-colors font-semibold">
                  <Shield className="w-5 h-5" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
              )}
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors font-medium">
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link to="/create-trip" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors font-medium">
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline">New Trip</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-full transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
