import { useState } from 'react';
import { rewardsAPI } from '../services/api';
import { t, tm, icon } from '../config/theme';
import { ic } from '../utils/iconRenderer';

export default function CargoSelectionModal({ redemption, rewards, onSuccess }) {
  const [selectedRewardId, setSelectedRewardId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClaim = async () => {
    if (!selectedRewardId) return;
    setLoading(true);
    setError('');
    try {
      await rewardsAPI.claimCargo(redemption.id, selectedRewardId);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to secure cargo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableRewards = rewards.filter(r => r.quantity === null || r.quantity > 0);
  const outOfStockRewards = rewards.filter(r => r.quantity !== null && r.quantity <= 0);
  const allRewards = [...availableRewards, ...outOfStockRewards];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Non-dismissable backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative max-w-2xl w-full">
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-60 animate-pulse" />

          <div className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-2xl">

            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 px-6 py-5 border-b-2 border-cyan-400/50">
              <div className="absolute inset-0 opacity-20">
                <div className="stars-small" />
                <div className="stars-medium" />
              </div>
              <div className="relative text-center">
                <div className="text-5xl mb-2 animate-float">
                  {redemption.tier_icon_path
                    ? <img src={redemption.tier_icon_path} alt="" className="w-14 h-14 mx-auto rounded-full object-cover border-2 border-cyan-400" />
                    : <span>{icon('destination')}</span>
                  }
                </div>
                <h2 className="text-2xl font-black text-white [text-shadow:_0_0_20px_rgba(139,92,246,0.8)]">
                  {tm('arrivalMessage', { destination: redemption.tier_title })}
                </h2>
                <p className="text-purple-200 mt-1 text-sm font-medium">
                  {tm('arrivalSubtitle')}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-black/40 border border-amber-400/50 rounded-full px-4 py-1.5">
                  <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                    {tm('fuelCost')}:
                  </span>
                  <div className="flex items-center gap-1">
                    {ic('fuel')}
                    <span className="text-lg font-black text-white">{redemption.points_spent}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning — cannot dismiss */}
            <div className="mx-6 mt-4 bg-amber-900/30 border border-amber-500/50 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span className="text-amber-400 text-lg">⚠️</span>
              <p className="text-amber-300 text-xs font-semibold">
                {tm('pendingCargoWarning')}
              </p>
            </div>

            {/* Cargo grid */}
            <div className="p-6">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                {ic('cargo', { width: 18, height: 18 })}
                <span>{tm('selectCargo')}</span>
              </h3>

              {allRewards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2 opacity-30">{icon('destination')}</div>
                  <p>No cargo available at this destination.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {allRewards.map((reward) => {
                    const isOOS = reward.quantity !== null && reward.quantity <= 0;
                    const isSelected = selectedRewardId === reward.id;

                    return (
                      <button
                        key={reward.id}
                        onClick={() => !isOOS && setSelectedRewardId(reward.id)}
                        disabled={isOOS}
                        className={`
                          relative text-left rounded-xl border-2 p-3 transition-all duration-200
                          ${isOOS
                            ? 'border-gray-700 bg-gray-800/40 opacity-40 cursor-not-allowed'
                            : isSelected
                              ? 'border-cyan-400 bg-cyan-900/30 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                              : 'border-gray-700 bg-gray-800/60 hover:border-purple-500/60 hover:bg-gray-800 cursor-pointer'
                          }
                        `}
                      >
                        {/* Selected glow */}
                        {isSelected && (
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-30" />
                        )}

                        <div className="relative flex items-start gap-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                            ${isSelected ? 'bg-cyan-900/50 border border-cyan-400/50' : 'bg-gray-700/50 border border-gray-600/50'}
                          `}>
                            {reward.icon_path
                              ? <img src={reward.icon_path} alt="" className="w-8 h-8 rounded object-cover" />
                              : <span className="text-xl">{isOOS ? icon('outOfStock') : ic('cargo', { width: 20, height: 20 })}</span>
                            }
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`font-bold text-sm truncate ${isOOS ? 'text-gray-500' : isSelected ? 'text-cyan-300' : 'text-white'}`}>
                                {reward.title}
                              </p>
                              {isOOS && (
                                <span className="flex-shrink-0 text-xs bg-gray-700 text-gray-400 border border-gray-600 px-2 py-0.5 rounded-full font-semibold">
                                  {tm('outOfStock')}
                                </span>
                              )}
                              {isSelected && !isOOS && (
                                <span className="flex-shrink-0 text-cyan-400 text-lg">✓</span>
                              )}
                            </div>
                            {reward.description && (
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{reward.description}</p>
                            )}
                            {!isOOS && reward.quantity !== null && (
                              <p className="text-xs text-amber-400 mt-1 font-medium">
                                {tm('remainingLabel', { count: reward.quantity })}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mx-6 mb-4 bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-2.5">
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={handleClaim}
                disabled={!selectedRewardId || loading}
                className="
                  w-full group relative overflow-hidden
                  bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500
                  hover:from-purple-600 hover:via-purple-700 hover:to-pink-600
                  text-white font-black text-base
                  px-8 py-4 rounded-xl
                  shadow-lg hover:shadow-2xl shadow-purple-500/30
                  transform hover:scale-[1.02] active:scale-95
                  transition-all duration-200
                  border-2 border-transparent hover:border-cyan-400
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
                "
              >
                <span className="flex items-center justify-center gap-3 relative z-10">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {tm('securingCargo')}
                    </>
                  ) : (
                    <>
                      {ic('cargoOpen', { width: 22, height: 22 })}
                      {tm('secureCargo')}
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
