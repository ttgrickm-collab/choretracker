import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { t, icon } from '../config/theme';

export default function Navbar() {
  const { user, logout, isParent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // Kid Navbar - Space themed
  if (!isParent) {
    return (
      <nav className="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 border-b-2 border-cyan-400 shadow-lg">
        {/* Subtle starfield effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_30%,white,transparent),radial-gradient(1px_1px_at_60%_70%,white,transparent),radial-gradient(1px_1px_at_80%_10%,white,transparent)] bg-[length:200%_200%]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <span className="text-4xl transform group-hover:scale-110 transition-transform duration-200">
                {icon('brand')}
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-wide [text-shadow:_0_0_20px_rgba(0,212,255,0.6)]">
                  LAUNCH PAD
                </span>
                {/* TODO: Add family crew name here (configurable per family) */}
                {/* <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  CREW ALPHA
                </span> */}
              </div>
            </Link>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-lg">
                  {icon('kid')}
                </span>
                <span className="text-sm font-semibold text-white">
                  {user.display_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white font-semibold rounded-lg backdrop-blur-sm border border-red-400/30 transition-all duration-200 hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Parent Navbar - Clean professional
  return (
    <nav className="bg-white shadow-sm border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="text-3xl transform group-hover:scale-110 transition-transform duration-200">
                {icon('brand')}
              </span>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">
                  Launch Pad
                </span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('terms.dashboard')}
                </span>
              </div>
            </Link>

            {/* Parent Navigation Links */}
            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/review"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Review Submissions
              </Link>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                {user.display_name}
              </span>
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-white rounded">
                Admin
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
