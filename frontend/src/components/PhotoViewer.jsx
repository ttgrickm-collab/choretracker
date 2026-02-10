import { useState } from 'react';

export default function PhotoViewer({ task, onClose, onApprove, onReject }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = () => {
    onApprove(task.id);
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(task.id, rejectReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {task.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Submitted by {task.kid_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {task.photo_criteria && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">
                Expected Photo Criteria:
              </h3>
              <p className="text-sm text-blue-800 whitespace-pre-line">
                {task.photo_criteria}
              </p>
            </div>
          )}

          {task.photo_path && (
            <div className="mb-6">
              <img
                src={task.photo_path}
                alt="Task submission"
                className="w-full rounded-lg border border-gray-300"
              />
            </div>
          )}

          {!showRejectForm ? (
            <div className="flex space-x-3">
              <button
                onClick={handleApprove}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                ✓ Approve ({task.points_value} points)
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                ✗ Reject
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection:
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Explain what needs to be fixed..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
