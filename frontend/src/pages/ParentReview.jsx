import { useState, useEffect } from 'react';
import { taskInstancesAPI } from '../services/api';
import { t, tm, icon } from '../config/theme';
import { ic } from '../utils/iconRenderer';

export default function ParentReview() {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    try {
      await taskInstancesAPI.approve(taskId);
      setApproving(null);
      setExpandedPhotoId(null);
      loadPendingTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to approve');
    }
  };

  const handleReject = async (taskId) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      await taskInstancesAPI.reject(taskId, rejectReason);
      setRejecting(null);
      setRejectReason('');
      setExpandedPhotoId(null);
      loadPendingTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject');
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{tm('reviewTitle')}</h1>
        <p className="mt-1 text-sm text-gray-600">{tm('reviewSubtitle')}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">{icon('rejected')}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Submissions */}
      {pendingTasks.length === 0 ? (
        <div className="bg-white shadow rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-20">{icon('approved')}</div>
            <p className="text-gray-500">{tm('noSubmissions')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.map((task) => {
            const photoExpanded = expandedPhotoId === task.id;
            return (
              <div key={task.id} className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Task Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {task.icon_path && (
                      <img
                        src={task.icon_path}
                        alt=""
                        className="w-14 h-14 rounded object-cover border border-gray-200 flex-shrink-0"
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
                          placeholder={tm('rejectReasonPlaceholder')}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
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
                          onClick={() => setApproving(task.id)}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors"
                        >
                          <span>{icon('approved')}</span>
                          {t('terms.approve')}
                        </button>
                        <button
                          onClick={() => setRejecting(task.id)}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors"
                        >
                          <span>{icon('rejected')}</span>
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
