import { useState, useEffect } from 'react';
import { taskInstancesAPI } from '../services/api';
import PhotoViewer from '../components/PhotoViewer';
import { t, icon } from '../config/theme';

export default function ParentReview() {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadPendingTasks();
  }, []);

  const loadPendingTasks = async () => {
    try {
      const response = await taskInstancesAPI.getPending();
      setPendingTasks(response.data);
    } catch (err) {
      setError('Failed to load pending submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPhoto = (task) => {
    setSelectedTask(task);
    setShowPhotoViewer(true);
  };

  const handleApprove = async (taskId) => {
    if (!confirm(`Award ${t('terms.points').toLowerCase()} for this ${t('terms.tasks').toLowerCase().slice(0, -1)}?`)) {
      return;
    }

    try {
      await taskInstancesAPI.approve(taskId);
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
      loadPendingTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review Submissions</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and approve or reject {t('terms.tasks').toLowerCase()} submissions
        </p>
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
            <p className="text-gray-500">
              No pending submissions to review. Great job keeping up!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.map((task) => (
            <div key={task.id} className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Task Header */}
                <div className="flex items-start gap-4 mb-4">
                  {task.icon_path && (
                    <img
                      src={task.icon_path}
                      alt=""
                      className="w-14 h-14 rounded object-cover border border-gray-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Submitted by <strong>{task.kid_name}</strong> • {formatDate(task.submitted_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700 font-semibold">
                    <span>{icon('fuel')}</span>
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
                    <p className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                      Photo Criteria:
                    </p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {task.photo_criteria}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {task.photo_path && (
                    <button
                      onClick={() => handleViewPhoto(task)}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                    >
                      <span>{icon('photo')}</span>
                      View Photo
                    </button>
                  )}
                  
                  {rejecting === task.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={() => handleReject(task.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setRejecting(null);
                          setRejectReason('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(task.id)}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-sm transition-colors"
                      >
                        <span>{icon('approved')}</span>
                        {t('terms.approve')}
                      </button>
                      <button
                        onClick={() => setRejecting(task.id)}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-sm transition-colors"
                      >
                        <span>{icon('rejected')}</span>
                        {t('terms.reject')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Viewer Modal */}
      {showPhotoViewer && selectedTask && (
        <PhotoViewer
          task={selectedTask}
          onClose={() => {
            setShowPhotoViewer(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
