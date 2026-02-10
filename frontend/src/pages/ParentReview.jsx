import { useState, useEffect } from 'react';
import { taskInstancesAPI } from '../services/api';
import PhotoViewer from '../components/PhotoViewer';

export default function ParentReview() {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  useEffect(() => {
    loadPendingTasks();
  }, []);

  const loadPendingTasks = async () => {
    try {
      const response = await taskInstancesAPI.getPending();
      setPendingTasks(response.data);
    } catch (err) {
      setError('Failed to load pending tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPhoto = (task) => {
    setSelectedTask(task);
    setShowPhotoViewer(true);
  };

  const handleApprove = async (taskId) => {
    try {
      await taskInstancesAPI.approve(taskId);
      loadPendingTasks(); // Reload list
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to approve task');
    }
  };

  const handleReject = async (taskId, reason) => {
    try {
      await taskInstancesAPI.reject(taskId, reason);
      loadPendingTasks(); // Reload list
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject task');
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
    return <div className="text-center">Loading pending submissions...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review Submissions</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and approve or reject task submissions from your kids
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {pendingTasks.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-center">
            No pending submissions to review. Great job keeping up!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.map((task) => (
            <div key={task.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {task.icon_path && (
                      <img
                        src={task.icon_path}
                        alt=""
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Submitted by <strong>{task.kid_name}</strong> on {formatDate(task.submitted_at)}
                      </p>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm mb-4">
                    <span className="font-medium text-primary-600">
                      {task.points_value} points
                    </span>
                    <span className="text-gray-500">
                      Due: {formatDate(task.available_end)}
                    </span>
                  </div>

                  {task.photo_criteria && (
                    <div className="bg-gray-50 rounded p-3 mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Photo Criteria:
                      </p>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {task.photo_criteria}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    {task.photo_path && (
                      <button
                        onClick={() => handleViewPhoto(task)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        📸 View Photo
                      </button>
                    )}
                    <button
                      onClick={() => handleApprove(task.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for rejection:');
                        if (reason) {
                          handleReject(task.id, reason);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPhotoViewer && selectedTask && (
        <PhotoViewer
          task={selectedTask}
          onClose={() => setShowPhotoViewer(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
