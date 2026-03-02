import { useState, useEffect } from 'react';
import { taskInstancesAPI } from '../services/api';
import { t, tm, icon } from '../config/theme';
import { ic } from '../utils/iconRenderer';

export default function ParentReview() {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [expandedPhotoId, setExpandedPhotoId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    loadPendingTasks();
  }, []);

  const loadPendingTasks = async () => {
    try {
      const response = await taskInstancesAPI.getPending();
      setPendingTasks(response.data);
    } catch (err) {
      setError(tm('loadSubmissionsError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId) => {
    setActionError('');
    try {
      await taskInstancesAPI.approve(taskId);
      setApproving(null);
      setExpandedPhotoId(null);
      loadPendingTasks();
    } catch (err) {
      setActionError(err.response?.data?.detail || tm('approveError'));
    }
  };

  const handleReject = async (taskId) => {
    if (!rejectReason.trim()) {
      setActionError(tm('rejectReasonRequired'));
      return;
    }
    setActionError('');
    try {
      await taskInstancesAPI.reject(taskId, rejectReason);
      setRejecting(null);
      setRejectReason('');
      setExpandedPhotoId(null);
      loadPendingTasks();
    } catch (err) {
      setActionError(err.response?.data?.detail || tm('rejectError'));
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">{tm('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{tm('reviewTitle')}</h1>
            <p className="text-blue-100 text-sm mt-1">{tm('reviewSubtitle')}</p>
          </div>
          {pendingTasks.length > 0 && (
            <span className="bg-amber-400 text-gray-900 font-black text-sm px-3 py-1 rounded-full shadow-lg">
              {tm('pendingCount', { count: pendingTasks.length })}
            </span>
          )}
        </div>
      </div>

      {/* ── Load Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ── Action Error ────────────────────────────────────────────────────── */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError('')}
            className="ml-4 text-red-400 hover:text-red-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Pending Submissions ──────────────────────────────────────────────── */}
      {pendingTasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-lg">{icon('review')}</span>
              {tm('reviewTitle')}
            </h2>
          </div>
          <div className="p-12 text-center">
            <div className="text-6xl mb-4 opacity-20">{icon('approved')}</div>
            <p className="text-gray-500">{tm('noSubmissions')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.map((task) => {
            const photoExpanded = expandedPhotoId === task.id;
            return (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Task Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {task.icon_path && (
                      <img
                        src={task.icon_path}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {tm('submittedBy')} <strong>{task.kid_name}</strong> · {formatDate(task.submitted_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-700 font-semibold flex-shrink-0">
                      {ic('fuel')}
                      <span>{task.points_value}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-sm text-gray-700 mb-4">{task.description}</p>
                  )}

                  {/* Photo Criteria */}
                  {task.photo_criteria && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                        {tm('photoCriteria')}
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{task.photo_criteria}</p>
                    </div>
                  )}

                  {/* Photo Thumbnail + Expand Toggle */}
                  {task.photo_path && (
                    <div className="mb-4">
                      <button
                        onClick={() => setExpandedPhotoId(photoExpanded ? null : task.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                      >
                        {ic('photo')}
                        {photoExpanded ? tm('hidePhoto') : tm('viewPhoto')}
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${photoExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {photoExpanded && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          <img
                            src={task.photo_path}
                            alt={tm('submissionPhotoAlt')}
                            className="w-full object-contain max-h-[480px]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {approving === task.id ? (
                      <div className="flex-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {tm('approveConfirmText', { title: task.title })} {ic('fuel')} {task.points_value}?
                        </span>
                        <button
                          onClick={() => handleApprove(task.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                        >
                          {tm('confirmYes')}
                        </button>
                        <button
                          onClick={() => setApproving(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                        >
                          {tm('cancel')}
                        </button>
                      </div>
                    ) : rejecting === task.id ? (
                      <div className="flex-1 flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder={tm('rejectReasonPlaceholder')}
                          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleReject(task.id)}
                        />
                        <button
                          onClick={() => handleReject(task.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                        >
                          {tm('confirmYes')}
                        </button>
                        <button
                          onClick={() => { setRejecting(null); setRejectReason(''); }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                        >
                          {tm('cancel')}
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { setApproving(task.id); setRejecting(null); }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                        >
                          {t('terms.approve')}
                        </button>
                        <button
                          onClick={() => { setRejecting(task.id); setApproving(null); setRejectReason(''); }}
                          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-md transition-colors"
                        >
                          {t('terms.reject')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
