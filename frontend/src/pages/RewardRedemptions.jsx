import { useState, useEffect } from 'react';
import { rewardsAPI } from '../services/api';
import { tm, icon } from '../config/theme';
import { ic } from '../utils/iconRenderer';

function StatusBadge({ status }) {
  const config = {
    awarded: { className: 'bg-green-50 border-green-200 text-green-700', text: 'In Cargo Hold' },
    redeemed: { className: 'bg-amber-50 border-amber-200 text-amber-700', text: tm('filterPending') },
    fulfilled: { className: 'bg-blue-50 border-blue-200 text-blue-700', text: 'Fulfilled' },
  }[status] || { className: 'bg-gray-100 border-gray-200 text-gray-600', text: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
      {config.text}
    </span>
  );
}

function RedemptionCard({ redemption, onAction }) {
  const [confirmAction, setConfirmAction] = useState(null); // 'fulfill' | 'cancel'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (action) => {
    setLoading(true);
    setError('');
    try {
      if (action === 'fulfill') await rewardsAPI.fulfill(redemption.id);
      else if (action === 'return') await rewardsAPI.returnToCargo(redemption.id);
      else if (action === 'cancel') await rewardsAPI.cancel(redemption.id);
      setConfirmAction(null);
      onAction();
    } catch (err) {
      setError(err.response?.data?.detail || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-150">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
            {redemption.reward_icon_path
              ? <img src={redemption.reward_icon_path} alt="" className="w-9 h-9 rounded object-cover" />
              : ic('cargo', { width: 22, height: 22 })
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{redemption.reward_title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {redemption.kid_name} · {redemption.tier_title}
                </p>
              </div>
              <StatusBadge status={redemption.status} />
            </div>

            <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                {ic('fuel', { width: 14, height: 14 })}
                {tm('fuelSpent')} {redemption.points_spent}
              </span>
              {redemption.redeemed_at && (
                <span>{tm('redeemedAt')} {new Date(redemption.redeemed_at).toLocaleDateString()}</span>
              )}
              {redemption.fulfilled_at && (
                <span>{tm('fulfilledAt')} {new Date(redemption.fulfilled_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">{error}</div>
        )}

        {/* Actions */}
        {redemption.status === 'redeemed' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {confirmAction === 'fulfill' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-600">
                  {tm('fulfillConfirm', { kidName: redemption.kid_name })}
                </span>
                <button onClick={() => handleAction('fulfill')} disabled={loading}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50">
                  {loading ? tm('fulfilling') : tm('confirmYes')}
                </button>
                <button onClick={() => setConfirmAction(null)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">
                  {tm('cancel')}
                </button>
              </div>
            ) : confirmAction === 'cancel' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-600">
                  {tm('cancelConfirm', { points: redemption.points_spent, kidName: redemption.kid_name })}
                </span>
                <button onClick={() => handleAction('cancel')} disabled={loading}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50">
                  {loading ? tm('cancelling') : tm('confirmYes')}
                </button>
                <button onClick={() => setConfirmAction(null)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">
                  {tm('cancel')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setConfirmAction('fulfill')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors">
                  {icon('approved')} {tm('fulfillReward')}
                </button>
                <button onClick={() => handleAction('return')} disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50">
                  {ic('cargo', { width: 14, height: 14 })} {tm('returnToCargo')}
                </button>
                <button onClick={() => setConfirmAction('cancel')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 border border-red-200 text-xs font-medium rounded-md hover:bg-red-50 transition-colors">
                  {icon('rejected')} {tm('cancelReward')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Awarded — cancel only */}
        {redemption.status === 'awarded' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {confirmAction === 'cancel' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-600">
                  {tm('cancelConfirm', { points: redemption.points_spent, kidName: redemption.kid_name })}
                </span>
                <button onClick={() => handleAction('cancel')} disabled={loading}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50">
                  {loading ? tm('cancelling') : tm('confirmYes')}
                </button>
                <button onClick={() => setConfirmAction(null)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">
                  {tm('cancel')}
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmAction('cancel')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 border border-red-200 text-xs font-medium rounded-md hover:bg-red-50 transition-colors">
                {icon('rejected')} {tm('cancelReward')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RewardRedemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending'); // 'all' | 'pending' | 'fulfilled'
  const [error, setError] = useState('');

  useEffect(() => { loadRedemptions(); }, []);

  const loadRedemptions = async () => {
    try {
      const res = await rewardsAPI.getRedemptions();
      setRedemptions(res.data);
    } catch (err) {
      setError('Failed to load redemptions');
    } finally {
      setLoading(false);
    }
  };

  const filtered = redemptions.filter(r => {
    if (activeFilter === 'pending') return r.status === 'redeemed' || r.status === 'awarded';
    if (activeFilter === 'fulfilled') return r.status === 'fulfilled';
    return true;
  });

  const pendingCount = redemptions.filter(r => r.status === 'redeemed').length;

  const tabs = [
    { key: 'pending', label: tm('filterPending'), count: pendingCount },
    { key: 'all', label: tm('filterAll'), count: null },
    { key: 'fulfilled', label: tm('filterFulfilled'), count: null },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{tm('rewardRedemptionsTitle')}</h1>
            <p className="text-blue-100 text-sm mt-1">{tm('rewardRedemptionsSubtitle')}</p>
          </div>
          {pendingCount > 0 && (
            <span className="bg-amber-400 text-gray-900 font-black text-sm px-3 py-1 rounded-full shadow-lg">
              {pendingCount} pending
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeFilter === tab.key
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Redemption cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
          <div className="mb-3 opacity-20 flex justify-center">{ic('cargo', { width: 48, height: 48 })}</div>
          <p className="text-gray-500">{tm('noRedemptions')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <RedemptionCard key={r.id} redemption={r} onAction={loadRedemptions} />
          ))}
        </div>
      )}
    </div>
  );
}
