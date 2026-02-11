import { useState, useEffect } from 'react';
import { taskInstancesAPI } from '../services/api';
import TaskSubmissionModal from '../components/TaskSubmissionModal';
import FuelIcon from '../components/FuelIcon';
import { t, tm } from '../config/theme';

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

  const handleSubmitClick = (task) => {
    setSelectedTask(task);
    setShowSubmitModal(true);
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
        icon: '🎯'
      },
      pending: { 
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 animate-pulse', 
        text: t('status.pending'),
        icon: '📡'
      },
      approved: { 
        color: 'bg-green-500/20 text-green-300 border-green-500/50', 
        text: t('status.approved'),
        icon: '✅'
      },
      rejected: { 
        color: 'bg-red-500/20 text-red-300 border-red-500/50', 
        text: t('status.rejected'),
        icon: '❌'
      },
      locked: { 
        color: 'bg-gray-600/20 text-gray-400 border-gray-600/50', 
        text: t('status.expired'),
        icon: '⏰'
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
  const groupedTasks = tasks.reduce((acc, task) => {
    const date = new Date(task.available_start).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-300">{t('status.pending')}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Mission Control Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 border-b-4 border-cyan-400">
        {/* Animated starfield background */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-[radial-gradient(2px_2px_at_20%_30%,white,transparent),radial-gradient(2px_2px_at_60%_70%,white,transparent),radial-gradient(1px_1px_at_50%_50%,white,transparent),radial-gradient(1px_1px_at_80%_10%,white,transparent),radial-gradient(2px_2px_at_90%_60%,white,transparent)] bg-[length:200%_200%] animate-[stars_20s_linear_infinite]" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 px-8 py-12 text-center">
          <div className="text-7xl mb-4 animate-[float_3s_ease-in-out_infinite]">
            🎛️
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-3 [text-shadow:_0_0_30px_rgba(255,255,255,0.5),_0_0_60px_rgba(102,126,234,0.8)] tracking-wider">
            MISSION CONTROL
          </h1>
          <p className="text-xl font-bold text-cyan-400">
            Your mission awaits, astronaut
          </p>
        </div>
      </div>

      <div className="py-8">
        {/* Fuel Display */}
        <div className="mb-8">
          <div className="relative group max-w-md mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-400 rounded-2xl px-8 py-6 shadow-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <FuelIcon />
                </div>
                <div className="text-6xl font-black text-white mb-1 [text-shadow:_0_0_20px_rgba(34,197,94,0.5)]">
                  {totalFuel}
                </div>
                <div className="text-lg font-bold text-green-400 uppercase tracking-wide">
                  {t('terms.points')} Available
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-500 rounded-r-lg p-4 shadow-md mb-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h4 className="font-bold text-red-300">Transmission Failure</h4>
                <p className="text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
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
                                onClick={() => handleSubmitClick(task)}
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
                                <span className="relative z-10 flex items-center gap-2">
                                  📡 {t('terms.submit')}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </button>
                            )}
                            {task.status === 'pending' && (
                              <div className="text-center px-4 py-3 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-xl backdrop-blur-sm">
                                <div className="text-2xl mb-1 animate-pulse">📡</div>
                                <div className="text-sm font-bold text-yellow-300">
                                  Awaiting Review
                                </div>
                              </div>
                            )}
                            {task.status === 'approved' && (
                              <button
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500
                                           hover:from-green-600 hover:to-emerald-600
                                           text-white font-bold rounded-xl
                                           shadow-lg hover:shadow-xl
                                           transform hover:scale-105
                                           transition-all duration-200
                                           border-2 border-green-400/50"
                                onClick={() => {
                                  // TODO: Implement collect fuel
                                  alert('Fuel collection coming soon!');
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  <FuelIcon /> {t('terms.collect')}
                                </span>
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
