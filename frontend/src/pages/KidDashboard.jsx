import { useState, useEffect } from 'react';
import { taskInstancesAPI } from '../services/api';
import TaskSubmissionModal from '../components/TaskSubmissionModal';
import FuelIcon from '../components/FuelIcon';
import { t, tm, icon } from '../config/theme';

export default function KidDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [totalFuel, setTotalFuel] = useState(0);

  useEffect(() => {
    loadTasks();
    loadFuelBalance();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await taskInstancesAPI.getMyTasks();
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load objectives');
    } finally {
      setLoading(false);
    }
  };

  const loadFuelBalance = async () => {
    // TODO: Implement fuel balance API endpoint
    // For now, calculate from approved tasks
    try {
      const response = await taskInstancesAPI.getMyTasks();
      const approvedTasks = response.data.filter(task => task.status === 'approved');
      const fuel = approvedTasks.reduce((sum, task) => sum + task.points_value, 0);
      setTotalFuel(fuel);
    } catch (err) {
      console.error('Failed to calculate fuel:', err);
    }
  };

  const handleCompleteObjective = (task) => {
    if (task.photo_required) {
      // Open modal for photo transmission
      setSelectedTask(task);
      setShowSubmitModal(true);
    } else {
      // TODO: Instant complete for non-photo tasks (future implementation)
      alert('Instant completion for non-photo tasks coming soon!');
    }
  };

  const handleCollectFuel = (task) => {
    // TODO: Implement fuel collection
    alert('Fuel collection coming soon!');
  };

  const handleSubmitSuccess = () => {
    setShowSubmitModal(false);
    setSelectedTask(null);
    loadTasks();
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
      incomplete: { 
        color: 'bg-gray-700/80 text-gray-200 border-gray-600', 
        text: t('status.incomplete'),
        icon: icon('objective')
      },
      pending: { 
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 animate-pulse', 
        text: t('status.pending'),
        icon: icon('pending')
      },
      approved: { 
        color: 'bg-green-500/20 text-green-300 border-green-500/50', 
        text: t('status.approved'),
        icon: icon('approved')
      },
      rejected: { 
        color: 'bg-red-500/20 text-red-300 border-red-500/50', 
        text: t('status.rejected'),
        icon: icon('rejected')
      },
      locked: { 
        color: 'bg-gray-600/20 text-gray-400 border-gray-600/50', 
        text: t('status.expired'),
        icon: icon('expired')
      },
    };
    const badge = badges[status] || badges.incomplete;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${badge.color} shadow-sm backdrop-blur-sm`}>
        <span>{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  // Group tasks by date
  const groupedTasks = tasks.reduce((groups, task) => {
    const date = new Date(task.available_start).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">Loading Mission Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header with Starfield */}
      <div className="relative bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-900 overflow-hidden">
        {/* Animated starfield background */}
        <div className="absolute inset-0">
          <div className="stars-small"></div>
          <div className="stars-medium"></div>
          <div className="stars-large"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-block animate-float mb-4">
              <span className="text-7xl">🚀</span>
            </div>
            <h1 className="text-5xl font-black text-white mb-3 [text-shadow:_0_0_30px_rgba(139,92,246,0.5)]">
              {t('terms.dashboard')}
            </h1>
            <p className="text-xl text-purple-200 font-medium">
              {tm('noObjectives').includes('No active') ? 'Ready for new missions' : 'Track your objectives and collect fuel'}
            </p>
          </div>

          {/* Fuel Display */}
          <div className="max-w-md mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-400 rounded-2xl px-8 py-6 shadow-2xl">
                <div className="text-center">
                  <div className="text-5xl mb-3">
                    <FuelIcon />
                  </div>
                  <div className="text-6xl font-black text-white mb-1 [text-shadow:_0_0_20px_rgba(250,204,21,0.5)]">
                    {totalFuel}
                  </div>
                  <div className="text-lg font-bold text-yellow-400/80 uppercase tracking-wide">
                    {t('terms.points')} Available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-500 rounded-r-lg p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h4 className="font-bold text-red-300">Error</h4>
                <p className="text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-8xl mb-6 opacity-40">🎯</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">
              {tm('noObjectives')}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Mission Control hasn't assigned any objectives yet. 
              Check back later for new missions!
            </p>
          </div>
        ) : (
          // Objectives by Day
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([date, dateTasks]) => (
              <div key={date}>
                {/* Day Header */}
                <div className="bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-purple-900/50 backdrop-blur-sm px-6 py-4 rounded-t-2xl border-2 border-purple-500/30 border-b-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      {formatDate(dateTasks[0].available_start)}
                    </h2>
                    {/* Status badge for first task in this day (if only one task per day) */}
                    {dateTasks.length === 1 && getStatusBadge(dateTasks[0].status)}
                  </div>
                </div>

                {/* Objectives List */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-b-2xl border-2 border-purple-500/30 shadow-lg overflow-hidden">
                  <div className="divide-y divide-purple-500/20">
                    {dateTasks.map((task) => (
                      <div key={task.id} className="relative p-6 hover:bg-purple-900/20 transition-all duration-200">
                        <div className="flex items-start gap-4">
                          {/* Left Column: Icon + Details */}
                          <div className="flex items-start gap-4 flex-1">
                            {/* Icon */}
                            {task.icon_path && (
                              <img
                                src={task.icon_path}
                                alt=""
                                className="w-16 h-16 rounded-lg object-cover border-2 border-purple-500/50 shadow-sm"
                              />
                            )}

                            {/* Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                {/* Title - No status badge here anymore if single task */}
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <h3 className="text-lg font-bold text-white">{task.title}</h3>
                                  {/* Only show status in card if multiple tasks per day */}
                                  {dateTasks.length > 1 && getStatusBadge(task.status)}
                                </div>

                                {task.description && (
                                  <p className="text-sm text-gray-300 mb-3">{task.description}</p>
                                )}

                                {/* Rejection Reason */}
                                {task.rejection_reason && (
                                  <div className="mt-3 bg-red-900/50 border-l-4 border-red-500 rounded-r-lg p-3 backdrop-blur-sm">
                                    <div className="flex items-start gap-2">
                                      <span className="text-lg">❌</span>
                                      <div>
                                        <p className="text-sm font-bold text-red-300">{t('status.rejected')}</p>
                                        <p className="text-sm text-red-200 mt-1">{task.rejection_reason}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Meta Info - Bottom */}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-4">
                                {task.photo_required && (
                                  <div className="flex items-center gap-1.5">
                                    <span>📸</span>
                                    <span>Photo required</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <span>⏱️</span>
                                  <span>Due: {formatTime(task.available_end)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Rewards (top) + Button (bottom) stacked */}
                          <div className="flex flex-col justify-between gap-3">
                            {/* Rewards Box */}
                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-[2px] rounded-lg">
                              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Rewards:</span>
                                  <div className="flex items-center gap-1.5">
                                    <FuelIcon />
                                    <span className="text-xl font-black text-white">{task.points_value}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            {task.status === 'incomplete' && (
                              <button
                                onClick={() => handleCompleteObjective(task)}
                                className="group relative overflow-hidden
                                           bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 
                                           hover:from-purple-600 hover:via-purple-700 hover:to-pink-600
                                           text-white font-bold text-base
                                           px-6 py-3 rounded-xl
                                           shadow-lg hover:shadow-2xl
                                           transform hover:scale-105 active:scale-95
                                           transition-all duration-200
                                           border-2 border-transparent hover:border-cyan-400"
                              >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  {icon('approved')} {t('terms.complete')}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </button>
                            )}
                            
                            {task.status === 'pending' && (
                              <button
                                disabled
                                className="relative overflow-hidden
                                           bg-gradient-to-r from-gray-600 to-gray-700
                                           text-gray-400 font-bold text-base
                                           px-6 py-3 rounded-xl
                                           shadow-md
                                           border-2 border-gray-500/30
                                           cursor-not-allowed opacity-60"
                              >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  {icon('approved')} {t('terms.complete')}
                                </span>
                              </button>
                            )}
                            
                            {task.status === 'approved' && (
                              <button
                                onClick={() => handleCollectFuel(task)}
                                className="group relative overflow-hidden
                                           bg-gradient-to-r from-green-500 to-emerald-500
                                           hover:from-green-600 hover:to-emerald-600
                                           text-white font-bold text-base
                                           px-6 py-3 rounded-xl
                                           shadow-lg hover:shadow-2xl
                                           transform hover:scale-105 active:scale-95
                                           transition-all duration-200
                                           border-2 border-transparent hover:border-green-400"
                              >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  {icon('collect')} {t('terms.collect')}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Modal */}
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
