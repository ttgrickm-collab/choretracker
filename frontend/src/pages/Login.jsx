import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated starfield background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(2px_2px_at_20%_30%,white,transparent),radial-gradient(2px_2px_at_60%_70%,white,transparent),radial-gradient(1px_1px_at_50%_50%,white,transparent),radial-gradient(1px_1px_at_80%_10%,white,transparent),radial-gradient(2px_2px_at_90%_60%,white,transparent)] bg-[length:200%_200%] animate-[stars_20s_linear_infinite]" />
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-[float_3s_ease-in-out_infinite]">
            🚀
          </div>
          <h1 className="text-5xl font-black text-white mb-2 [text-shadow:_0_0_30px_rgba(255,255,255,0.5),_0_0_60px_rgba(102,126,234,0.8)] tracking-wider">
            LAUNCH PAD
          </h1>
          {/* TODO: Add family crew name here (configurable per family) */}
          {/* <p className="text-lg font-bold text-cyan-400">
            CREW ALPHA
          </p> */}
        </div>

        {/* Login Form Card */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75" />
          
          {/* Form */}
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500/50 rounded-2xl p-8 shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Alert */}
              {error && (
                <div className="bg-red-900/50 border-l-4 border-red-500 rounded-r-lg p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h4 className="font-bold text-red-300">Access Denied</h4>
                      <p className="text-sm text-red-200 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wide">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-lg
                             text-white placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent
                             transition-all duration-200"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wide">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-lg
                             text-white placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent
                             transition-all duration-200"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden
                           bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 
                           hover:from-purple-600 hover:via-purple-700 hover:to-pink-600
                           text-white font-bold text-lg
                           px-6 py-4 rounded-xl
                           shadow-lg hover:shadow-2xl
                           transform hover:scale-105 active:scale-95
                           transition-all duration-200
                           border-2 border-transparent hover:border-cyan-400
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Accessing Systems...
                    </>
                  ) : (
                    <>
                      🚀 Prepare for Launch
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>

            {/* Default Credentials Info */}
            <div className="mt-6 pt-6 border-t border-purple-500/30">
              <div className="bg-purple-900/30 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-2">
                  🔐 Default Access Credentials
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    Username: <span className="font-mono font-bold text-white">parent</span>
                  </p>
                  <p className="text-gray-300">
                    Password: <span className="font-mono font-bold text-white">password123</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Authorized personnel only • Local network access
        </p>
      </div>
    </div>
  );
}
