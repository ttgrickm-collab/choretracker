import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import FuelIcon from '../components/FuelIcon';
import { t, icon } from '../config/theme';

export default function ParentDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load objectives');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage active {t('terms.tasks').toLowerCase()} and track family progress
          </p>
        </div>
        <Link
          to="/tasks/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200"
        >
          <span className="text-xl">+</span>
          Create {t('terms.tasks')}
        </Link>
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

      {/* Active Objectives Card */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl">{icon('objective')}</span>
            Active {t('terms.tasks')}
          </h2>
        </div>
        
        <div className="px-6 py-6">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 opacity-20">{icon('objective')}</div>
              <p className="text-gray-500 mb-4">
                No {t('terms.tasks').toLowerCase()} created yet.
              </p>
              <Link
                to="/tasks/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                <span>+</span>
                Create your first {t('terms.tasks').toLowerCase()}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {task.icon_path && (
                      <img
                        src={task.icon_path}
                        alt=""
                        className="w-12 h-12 rounded object-cover border border-gray-200"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                          <FuelIcon />
                          {task.points_value} {t('terms.points')}
                        </span>
                        <span className="inline-flex items-center gap-1 text-gray-600">
                          {task.task_type === 'recurring' ? '🔄 Recurring' : '📅 One-time'}
                        </span>
                        {task.photo_required && (
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            {icon('photo')} Photo required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats (Future Enhancement) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Total {t('terms.tasks')}</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{tasks.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Recurring</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {tasks.filter(t => t.task_type === 'recurring').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">One-time</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {tasks.filter(t => t.task_type === 'custom').length}
          </div>
        </div>
      </div>
    </div>
  );
}
