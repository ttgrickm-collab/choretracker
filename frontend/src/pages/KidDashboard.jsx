import { useState, useEffect } from 'react';
import { taskInstancesAPI, photosAPI } from '../services/api';
import TaskSubmissionModal from '../components/TaskSubmissionModal';

export default function KidDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await taskInstancesAPI.getMyTasks();
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClick = (task) => {
    setSelectedTask(task);
    setShowSubmitModal(true);
  };

  const handleSubmitSuccess = () => {
    setShowSubmitModal(false);
    setSelectedTask(null);
    loadTasks(); // Reload to update status
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      incomplete: { color: 'bg-yellow-100 text-yellow-800', text: 'To Do' },
      pending: { color: 'bg-blue-100 text-blue-800', text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      locked: { color: 'bg-gray-100 text-gray-800', text: 'Expired' },
    };
    const badge = badges[status] || badges.incomplete;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  // Group tasks by date
  const groupedTasks = tasks.reduce((acc, task) => {
    const date = new Date(task.available_start).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center">Loading your tasks...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="mt-2 text-sm text-gray-600">
          Complete tasks to earn points!
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-center">
            No tasks available right now. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([date, dateTasks]) => (
            <div key={date} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {formatDate(dateTasks[0].available_start)}
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {dateTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {task.icon_path && (
                          <img
                            src={task.icon_path}
                            alt=""
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{task.title}</h3>
                            {getStatusBadge(task.status)}
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                          )}
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="font-medium text-primary-600">
                              {task.points_value} points
                            </span>
                            <span>
                              Due: {formatTime(task.available_end)}
                            </span>
                            {task.photo_required && (
                              <span className="text-gray-400">📸 Photo required</span>
                            )}
                          </div>
                          {task.rejection_reason && (
                            <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                              <strong>Rejected:</strong> {task.rejection_reason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {task.status === 'incomplete' && (
                          <button
                            onClick={() => handleSubmitClick(task)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                          >
                            Submit
                          </button>
                        )}
                        {task.status === 'pending' && (
                          <div className="text-sm text-blue-600 font-medium">
                            ⏳ Waiting for review
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSubmitModal && selectedTask && (
        <TaskSubmissionModal
          task={selectedTask}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
