import { useState, useEffect } from 'react';
import { rewardsAPI } from '../services/api';
import { t, tm, icon } from '../config/theme';
import { ic } from '../utils/iconRenderer';
import CargoSelectionModal from '../components/CargoSelectionModal';
import CargoHoldPanel from '../components/CargoHoldPanel';

// ── Tier Card ─────────────────────────────────────────────────────────────────

function TierCard({ tier, isSelected, balance, onSelect }) {
  const canAfford = balance >= tier.cost;
  const hasStock = tier.rewards.some(r => r.quantity === null || r.quantity > 0);

  return (
    <div
      className={`
        relative rounded-2xl border-2 overflow-hidden transition-all duration-300 cursor-pointer
        ${isSelected
          ? 'border-cyan-400 shadow-2xl shadow-cyan-400/20'
          : canAfford
            ? 'border-gray-700 hover:border-purple-500/70 hover:shadow-xl hover:shadow-purple-500/10'
            : 'border-gray-800 opacity-60'
        }
      `}
      onClick={() => canAfford && onSelect(tier.id)}
    >
      {/* Outer glow when selected */}
      {isSelected && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-30 -z-10" />
      )}

      {/* Header band */}
      <div className={`
        px-5 py-4 flex items-center justify-between
        ${isSelected
          ? 'bg-gradient-to-r from-cyan-900/60 via-purple-900/60 to-cyan-900/60'
          : 'bg-gradient-to-r from-gray-800/80 to-gray-900/80'
        }
        border-b border-gray-700/50
      `}>
        <div className="flex items-center gap-4">
          {/* Planet icon */}
          <div className={`
            w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0
            ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900' : ''}
          `}>
            {tier.icon_path
              ? <img src={tier.icon_path} alt="" className="w-14 h-14 rounded-full object-cover" />
              : <span className="text-4xl">{icon('destination')}</span>
            }
          </div>

          <div>
            <h3 className={`text-xl font-black ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
              {tier.title}
            </h3>
            {tier.description && (
              <p className="text-sm text-gray-400 mt-0.5">{tier.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {tier.rewards.length} {t('terms.reward')}{tier.rewards.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {/* Cost badge */}
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{tm('fuelCost')}</p>
          <div className={`flex items-center justify-end gap-1.5 ${canAfford ? '' : 'opacity-50'}`}>
            {ic('fuel')}
            <span className={`text-2xl font-black ${canAfford ? 'text-white' : 'text-gray-500'}`}>
              {tier.cost}
            </span>
          </div>
          {!canAfford && (
            <p className="text-xs text-red-400 mt-1 font-semibold">{tm('launchBayInsufficient')}</p>
          )}
        </div>
      </div>

      {/* Expanded cargo preview — visible when selected */}
      {isSelected && (
        <div className="bg-gray-900/60 px-5 py-4">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            {ic('cargo', { width: 14, height: 14 })}
            <span>Available Cargo</span>
          </p>
          {tier.rewards.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No cargo at this destination.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {tier.rewards.map((reward) => {
                const oos = reward.quantity !== null && reward.quantity <= 0;
                return (
                  <div
                    key={reward.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
                      oos
                        ? 'border-gray-700/40 bg-gray-800/20 opacity-40'
                        : 'border-gray-700/60 bg-gray-800/40'
                    }`}
                  >
                    {reward.icon_path
                      ? <img src={reward.icon_path} alt="" className="w-7 h-7 rounded object-cover flex-shrink-0" />
                      : <span className="flex-shrink-0">{oos ? icon('outOfStock') : ic('cargo', { width: 18, height: 18 })}</span>
                    }
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${oos ? 'text-gray-500' : 'text-gray-200'}`}>
                        {reward.title}
                      </p>
                      {oos ? (
                        <p className="text-xs text-red-500">{tm('outOfStock')}</p>
                      ) : reward.quantity !== null ? (
                        <p className="text-xs text-amber-400">{tm('remainingLabel', { count: reward.quantity })}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Launch Bay Page ───────────────────────────────────────────────────────────

export default function LaunchBay() {
  const [tiers, setTiers] = useState([]);
  const [balance, setBalance] = useState(0);
  const [selectedTierId, setSelectedTierId] = useState(null);
  const [cargo, setCargo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Cargo hold panel
  const [cargoOpen, setCargoOpen] = useState(false);

  // Pending claim modal (if kid has pending_cargo row)
  const [pendingClaim, setPendingClaim] = useState(null);
  const [pendingRewards, setPendingRewards] = useState([]);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [availRes, cargoRes, pendingRes] = await Promise.all([
        rewardsAPI.getAvailable(),
        rewardsAPI.getMyCargo(),
        rewardsAPI.getPendingClaim(),
      ]);

      setTiers(availRes.data.tiers);
      setBalance(availRes.data.balance);
      setCargo(cargoRes.data);

      if (pendingRes.data.pending) {
        setPendingClaim(pendingRes.data.redemption);
        setPendingRewards(pendingRes.data.rewards);
        setShowClaimModal(true);
      }
    } catch (err) {
      setError('Failed to load Launch Bay.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedTierId) return;
    setPurchasing(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await rewardsAPI.purchaseTier(selectedTierId);
      const redemptionId = res.data.redemption_id;

      // Immediately fetch the pending claim to open modal
      const pendingRes = await rewardsAPI.getPendingClaim();
      if (pendingRes.data.pending) {
        setPendingClaim(pendingRes.data.redemption);
        setPendingRewards(pendingRes.data.rewards);
        setShowClaimModal(true);
      }

      // Refresh balance
      const availRes = await rewardsAPI.getAvailable();
      setBalance(availRes.data.balance);
      setSelectedTierId(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Launch failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleCargoSelected = async () => {
    setShowClaimModal(false);
    setPendingClaim(null);
    setPendingRewards([]);
    setSuccessMessage(tm('cargoSecured'));
    setTimeout(() => setSuccessMessage(''), 4000);

    // Reload everything
    const [availRes, cargoRes] = await Promise.all([
      rewardsAPI.getAvailable(),
      rewardsAPI.getMyCargo(),
    ]);
    setTiers(availRes.data.tiers);
    setBalance(availRes.data.balance);
    setCargo(cargoRes.data);

    // Auto-open cargo hold
    setCargoOpen(true);
  };

  const handleCargoUpdate = async () => {
    const [cargoRes, availRes] = await Promise.all([
      rewardsAPI.getMyCargo(),
      rewardsAPI.getAvailable(),
    ]);
    setCargo(cargoRes.data);
    setBalance(availRes.data.balance);
  };

  const awardedCargoCount = cargo.filter(c => c.status === 'awarded').length;
  const selectedTier = tiers.find(t => t.id === selectedTierId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-300">{tm('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="stars-small" />
          <div className="stars-medium" />
          <div className="stars-large" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Top row: title + cargo hold button */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-block animate-float mb-2">
                <span className="text-6xl">{icon('launchBay')}</span>
              </div>
              <h1 className="text-4xl font-black text-white [text-shadow:_0_0_30px_rgba(139,92,246,0.5)]">
                {t('terms.launchBay')}
              </h1>
              <p className="text-purple-200 mt-1">{tm('launchBayTagline')}</p>
            </div>

            {/* Cargo Hold button */}
            <button
              onClick={() => setCargoOpen(true)}
              className="relative flex-shrink-0 flex flex-col items-center gap-1.5 group"
            >
              <div className="relative p-3 rounded-xl bg-gray-800/60 border-2 border-gray-600/50 group-hover:border-cyan-400/70 group-hover:bg-gray-800 transition-all duration-200 shadow-lg">
                {ic('cargo', { width: 32, height: 32 })}
                {awardedCargoCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-400 text-gray-900 text-xs font-black min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 shadow-lg shadow-green-400/50">
                    {awardedCargoCount}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors font-semibold">
                {t('terms.cargoHold')}
              </span>
            </button>
          </div>

          {/* Fuel balance */}
          <div className="relative group inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-60 group-hover:opacity-80 transition duration-300" />
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-400 rounded-xl px-6 py-3 shadow-xl flex items-center gap-3">
              <span className="text-2xl">{icon('kid')}</span>
              <div>
                <div className="text-xs font-bold text-yellow-400/80 uppercase tracking-wide">{tm('yourBalance')}</div>
                <div className="flex items-center gap-2">
                  {ic('fuel')}
                  <span className="text-3xl font-black text-white [text-shadow:_0_0_15px_rgba(250,204,21,0.4)]">
                    {balance}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {successMessage && (
          <div className="mt-4 bg-green-900/40 border border-green-500/50 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-green-400 text-xl">✅</span>
            <p className="text-green-300 font-semibold">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-500/40 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-red-400 text-xl">❌</span>
            <p className="text-red-300 font-semibold">{error}</p>
          </div>
        )}
      </div>

      {/* ── Tier List + Rocket CTA ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tiers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-7xl mb-4 opacity-20">{icon('destination')}</div>
            <p className="text-gray-400 text-lg">{tm('noTiersAvailable')}</p>
          </div>
        ) : (
          <>
            {/* Destination heading */}
            <div className="mb-5 flex items-center gap-3">
              <span className="text-lg">{icon('destination')}</span>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                {tm('selectDestination')}
              </h2>
            </div>

            {/* Tier cards — stacked highest display_order first */}
            <div className="space-y-4 mb-10">
              {tiers.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  isSelected={selectedTierId === tier.id}
                  balance={balance}
                  onSelect={(id) => setSelectedTierId(prev => prev === id ? null : id)}
                />
              ))}
            </div>

            {/* ── Rocket + Launch Pad CTA ────────────────────────────────────── */}
            <div className="flex flex-col items-center">
              {/* Cost preview when tier selected */}
              {selectedTier && (
                <div className="mb-6 bg-gray-800/60 border border-gray-700/50 rounded-xl px-6 py-4 text-center w-full max-w-xs">
                  <p className="text-sm text-gray-400 mb-3">
                    Launching to <span className="text-white font-bold">{selectedTier.title}</span>
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">{tm('destinationCost')}</span>
                      <div className="flex items-center gap-1.5">
                        {ic('fuel')}
                        <span className="font-bold text-white">-{selectedTier.cost}</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-700 pt-1.5 flex justify-between items-center">
                      <span className="text-gray-400">{tm('afterLaunch')}</span>
                      <div className="flex items-center gap-1.5">
                        {ic('fuel')}
                        <span className={`font-black text-lg ${balance - selectedTier.cost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {balance - selectedTier.cost}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rocket illustration */}
              <div className="relative mb-2">
                {/* Launch exhaust — only when ready */}
                {selectedTierId && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 flex flex-col items-center">
                    <div className="w-3 h-8 bg-gradient-to-b from-orange-400 via-yellow-400 to-transparent rounded-full opacity-80 animate-pulse" />
                    <div className="w-5 h-4 bg-gradient-to-b from-yellow-300/60 to-transparent rounded-full blur-sm -mt-4" />
                  </div>
                )}
                <div className={`text-7xl transition-all duration-500 ${selectedTierId ? 'animate-float' : 'opacity-60'}`}>
                  🚀
                </div>
              </div>

              {/* Launch pad base */}
              <div className="w-40 h-3 bg-gradient-to-r from-transparent via-gray-600 to-transparent rounded-full mb-6 opacity-60" />

              {/* Initiate Launch button */}
              <button
                onClick={handlePurchase}
                disabled={!selectedTierId || purchasing}
                className={`
                  group relative overflow-hidden
                  px-12 py-4 rounded-2xl
                  font-black text-lg tracking-wide
                  transform transition-all duration-300
                  border-2
                  ${selectedTierId && !purchasing
                    ? `bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500
                       hover:from-purple-600 hover:via-purple-700 hover:to-pink-600
                       text-white
                       shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60
                       hover:scale-105 active:scale-95
                       border-transparent hover:border-cyan-400`
                    : 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {/* Shimmer on active */}
                {selectedTierId && !purchasing && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                )}
                <span className="relative flex items-center gap-3">
                  {purchasing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {tm('launching')}
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🚀</span>
                      {tm('initiateLaunch')}
                    </>
                  )}
                </span>
              </button>

              {!selectedTierId && (
                <p className="mt-3 text-xs text-gray-500">{tm('selectDestination')}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Modals & Panels ───────────────────────────────────────────────────── */}

      {showClaimModal && pendingClaim && (
        <CargoSelectionModal
          redemption={pendingClaim}
          rewards={pendingRewards}
          onSuccess={handleCargoSelected}
        />
      )}

      <CargoHoldPanel
        isOpen={cargoOpen}
        onClose={() => setCargoOpen(false)}
        cargo={cargo}
        onCargoUpdate={handleCargoUpdate}
      />
    </div>
  );
}
