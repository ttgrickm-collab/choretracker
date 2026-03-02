import { useState } from 'react';
import { rewardsAPI } from '../services/api';
import { t, tm, icon } from '../config/theme';
import { ic } from '../utils/iconRenderer';

function StatusBadge({ status }) {
  const config = {
    awarded: {
      className: 'bg-green-900/40 border-green-500/60 text-green-300',
      text: tm('cargoStatusAwarded'),
      pulse: true,
    },
    redeemed: {
      className: 'bg-amber-900/40 border-amber-500/60 text-amber-300',
      text: tm('cargoStatusRedeemed'),
      pulse: true,
    },
    fulfilled: {
      className: 'bg-blue-900/40 border-blue-500/60 text-blue-300',
      text: tm('cargoStatusFulfilled'),
      pulse: false,
    },
  }[status] || { className: 'bg-gray-700 border-gray-600 text-gray-400', text: status, pulse: false };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.className}`}>
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'awarded' ? 'bg-green-400' : 'bg-amber-400'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'awarded' ? 'bg-green-400' : 'bg-amber-400'}`} />
        </span>
      )}
      {config.text}
    </span>
  );
}

export default function CargoHoldPanel({ isOpen, onClose, cargo, onCargoUpdate }) {
  const [redeemingId, setRedeemingId] = useState(null);
  const [error, setError] = useState('');

  const handleRedeem = async (redemptionId) => {
    setRedeemingId(redemptionId);
    setError('');
    try {
      await rewardsAPI.redeemCargo(redemptionId);
      onCargoUpdate();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to redeem. Please try again.');
    } finally {
      setRedeemingId(null);
    }
  };

  const awardedCount = cargo.filter(c => c.status === 'awarded').length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`
        fixed top-0 right-0 h-full z-50 w-96 max-w-[90vw]
        bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950
        border-l-2 border-purple-500/50 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-purple-900/80 border-b-2 border-cyan-400/40 px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {ic('cargo', { width: 28, height: 28 })}
                {awardedCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-green-400 text-gray-900 text-xs font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {awardedCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-black text-white [text-shadow:_0_0_10px_rgba(139,92,246,0.5)]">
                  {t('terms.cargoHold')}
                </h2>
                <p className="text-xs text-purple-300">{cargo.length} item{cargo.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-3 bg-red-900/30 border border-red-500/50 rounded-lg px-3 py-2 flex-shrink-0">
            <p className="text-red-300 text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cargo.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="mb-4 opacity-20">
                {ic('cargo', { width: 56, height: 56 })}
              </div>
              <p className="text-gray-400 text-sm px-4">{tm('cargoHoldEmpty')}</p>
              <p className="text-gray-600 text-xs mt-2">Launch to a destination to claim cargo!</p>
            </div>
          ) : (
            cargo.map((item) => (
              <div
                key={item.id}
                className={`
                  relative rounded-xl border-2 p-4 transition-all duration-200
                  ${item.status === 'awarded'
                    ? 'border-green-500/40 bg-green-900/10 hover:border-green-400/60'
                    : item.status === 'redeemed'
                      ? 'border-amber-500/30 bg-amber-900/10'
                      : 'border-gray-700/50 bg-gray-800/30'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                    {item.reward_icon_path
                      ? <img src={item.reward_icon_path} alt="" className="w-9 h-9 rounded object-cover" />
                      : item.status === 'fulfilled'
                        ? ic('cargoOpen', { width: 24, height: 24 })
                        : ic('cargo', { width: 24, height: 24 })
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${item.status === 'fulfilled' ? 'text-gray-400' : 'text-white'}`}>
                      {item.reward_title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.tier_title}</p>
                    <div className="mt-2">
                      <StatusBadge status={item.status} />
                    </div>

                    {/* Redeem button — awarded only */}
                    {item.status === 'awarded' && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2 italic">{tm('redeemInfo')}</p>
                        <button
                          onClick={() => handleRedeem(item.id)}
                          disabled={redeemingId === item.id}
                          className="
                            inline-flex items-center gap-2
                            bg-gradient-to-r from-green-600 to-emerald-600
                            hover:from-green-500 hover:to-emerald-500
                            text-white text-xs font-bold
                            px-4 py-2 rounded-lg
                            shadow-md hover:shadow-green-500/30
                            transform hover:scale-105 active:scale-95
                            transition-all duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                          "
                        >
                          {redeemingId === item.id ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              {tm('redeeming')}
                            </>
                          ) : (
                            <>
                              <span>{icon('redeem')}</span>
                              {tm('redeemCargo')}
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Fulfilled timestamp */}
                    {item.status === 'fulfilled' && item.fulfilled_at && (
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(item.fulfilled_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
