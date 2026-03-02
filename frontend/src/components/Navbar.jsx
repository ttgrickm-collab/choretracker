import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { t, icon } from '../config/theme';
import { ic } from '../utils/iconRenderer';
import { rewardsAPI } from '../services/api';

export default function Navbar() {
  const { user, logout, isParent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Badge counts
  const [awardedCount, setAwardedCount] = useState(0);       // kid: ready-to-redeem cargo
  const [pendingRedemptions, setPendingRedemptions] = useState(0); // parent: redeemed awaiting fulfillment

  useEffect(() => {
    if (!user) return;
    if (!isParent) {
      loadKidBadge();
    } else {
      loadParentBadge();
    }
  }, [user, isParent, location.pathname]);

  const loadKidBadge = async () => {
    try {
      const res = await rewardsAPI.getMyCargo();
      setAwardedCount(res.data.filter(c => c.status === 'awarded').length);
    } catch (_) {}
  };

  const loadParentBadge = async () => {
    try {
      const res = await rewardsAPI.getRedemptions('redeemed');
      setPendingRedemptions(res.data.length);
    } catch (_) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // ── Kid Navbar ─────────────────────────────────────────────────────────────
  if (!isParent) {
    const isLaunchBay = location.pathname === '/launch-bay';
    const isDashboard = location.pathname === '/';

    return (
      <nav className="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 border-b-2 border-cyan-400 shadow-lg">
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
              </div>
            </Link>

            {/* Nav links */}
            <div className="flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isDashboard
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="hidden sm:inline">{t('terms.dashboard')}</span>
                <span className="sm:hidden">{icon('missionControl')}</span>
              </Link>

              {/* Launch Bay link with cargo badge */}
              <Link
                to="/launch-bay"
                className={`relative px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  isLaunchBay
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-base">{icon('launchBay')}</span>
                <span className="hidden sm:inline">{t('terms.launchBay')}</span>
                {awardedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-400 text-gray-900 text-xs font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-0.5 shadow-lg shadow-green-400/50 animate-pulse">
                    {awardedCount}
                  </span>
                )}
              </Link>
            </div>

            {/* User info + logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-lg">{icon('kid')}</span>
                <span className="text-sm font-semibold text-white">{user.display_name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-red-500/80 hover:bg-red-600 text-white font-semibold rounded-lg backdrop-blur-sm border border-red-400/30 transition-all duration-200 hover:scale-105 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // ── Parent Navbar ──────────────────────────────────────────────────────────
  return (
    <nav className="bg-white shadow-sm border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Nav */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="text-3xl transform group-hover:scale-110 transition-transform duration-200">
                {icon('brand')}
              </span>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">Launch Pad</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t('terms.dashboard')}
                </span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/review"
                className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Review Submissions
              </Link>
              <Link
                to="/rewards"
                className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Manage Rewards
              </Link>
              <Link
                to="/reward-redemptions"
                className="relative px-3 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Reward Redemptions
                {pendingRedemptions > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-gray-900 text-xs font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-0.5">
                    {pendingRedemptions}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{user.display_name}</span>
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-white rounded">Admin</span>
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
