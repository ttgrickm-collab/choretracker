import { useState, useEffect } from 'react';
import { taskInstancesAPI, usersAPI } from '../services/api';
import TaskSubmissionModal from '../components/TaskSubmissionModal';
import { t, tm } from '../config/theme';
import { ic } from '../utils/iconRenderer';

export default function KidDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [totalFuel, setTotalFuel] = useState(0);
  const [crewFuel, setCrewFuel] = useState(0);
  const [collectingTaskId, setCollectingTaskId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadTasks();
    loadBalances();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await taskInstancesAPI.getMyTasks();
      setTasks(response.data);
    } catch (err) {
      setError(tm('loadError'));
    } finally {
      setLoading(false);
    }
  };

  const loadBalances = async () => {
    try {
      const [personalResponse, totalResponse] = await Promise.all([
        usersAPI.getMyBalance(),
        usersAPI.getTotalBalance()
      ]);
      setTotalFuel(personalResponse.data.balance);
      setCrewFuel(totalResponse.data.total_balance);
    } catch (err) {
      console.error('Failed to load balances:', err);
    }
  };

  const handleSubmitClick = (task) => {
    setSelectedTask(task);
    setShowSubmitModal(true);
  };

  const handleCollectFuel = async (task) => {
    setCollectingTaskId(task.id);
    setSuccessMessage('');
    
    try {
      const response = await taskInstancesAPI.collect(task.id);
      
      // Show success message
      setSuccessMessage(`${tm('fuelCollected')} +${response.data.points_collected} ${tm('fuelUnit')}!`);
      
      // Reload tasks and balances
      await Promise.all([loadTasks(), loadBalances()]);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || tm('collectError'));
    } finally {
      setCollectingTaskId(null);
    }
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
        icon: ic('objective')
      },
      pending: { 
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 animate-pulse', 
        text: t('status.pending'),
        icon: ic('pending')
      },
      approved: { 
        color: 'bg-green-500/20 text-green-300 border-green-500/50', 
        text: t('status.approved'),
        icon: ic('approved')
      },
      completed: { 
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/50', 
        text: t('status.completed'),
        icon: ic('completed')
      },
      rejected: { 
        color: 'bg-red-500/20 text-red-300 border-red-500/50', 
        text: t('status.rejected'),
        icon: ic('rejected')
      },
      locked: { 
        color: 'bg-gray-600/20 text-gray-400 border-gray-600/50', 
        text: t('status.expired'),
        icon: ic('expired')
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

  // Helper to check if task is expired
  const isExpired = (availableEnd) => {
    return new Date(availableEnd) < new Date();
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
              <span className="text-7xl">{ic('missionControl')}</span>
            </div>
            <h1 className="text-5xl font-black text-white mb-3 [text-shadow:_0_0_30px_rgba(139,92,246,0.5)]">
              {t('terms.dashboard')}
            </h1>
            <p className="text-xl text-purple-200 font-medium">
              {t('brand.tagline')}
            </p>
          </div>

          {/* Fuel Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Fuel */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-400 rounded-2xl px-8 py-6 shadow-2xl">
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {ic('fuel')}
                  </div>
                  <div className="text-5xl font-black text-white mb-1 [text-shadow:_0_0_20px_rgba(250,204,21,0.5)]">
                    {totalFuel}
                  </div>
                  <div className="text-base font-bold text-yellow-400/80 uppercase tracking-wide">
                    Your {t('terms.points')}
                  </div>
                </div>
              </div>
            </div>

            {/* Crew Fuel */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-cyan-400 rounded-2xl px-8 py-6 shadow-2xl">
                <div className="text-center">
                  <div className="text-4xl mb-2">🚀</div>
                  <div className="text-5xl font-black text-white mb-1 [text-shadow:_0_0_20px_rgba(34,211,238,0.5)]">
                    {crewFuel}
                  </div>
                  <div className="text-base font-bold text-cyan-400/80 uppercase tracking-wide">
                    Crew {t('terms.points')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-500 rounded-r-lg p-4 mb-6 backdrop-blur-sm max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{ic('rejected')}</span>
              <div>
                <h4 className="font-bold text-red-300">Error</h4>
                <p className="text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-green-900/50 border-l-4 border-green-500 rounded-r-lg p-4 mb-6 backdrop-blur-sm max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{ic('approved')}</span>
              <div>
                <h4 className="font-bold text-green-300">Success!</h4>
                <p className="text-sm text-green-200 mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Objectives */}
        {tasks.length === 0 ? (
          <div className="max-w-4xl mx-auto text-center py-16 px-4">
            <div className="text-8xl mb-6 opacity-20 animate-float">{ic('objective')}</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">
              {tm('noObjectives')}
            </h3>
            <p className="text-gray-400">
              {tm('emptyObjectives')}
            </p>
          </div>
        ) : (
          // Objectives by Day
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([date, dateTasks]) => (
              <div key={date}>
                {/* Day Header */}
                <div className="bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-purple-900/50 backdrop-blur-sm px-6 py-4 rounded-t-2xl border-2 border-purple-500/30 border-b-0">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">{ic('objective')}</span>
                    {formatDate(dateTasks[0].available_start)}
                  </h2>
                </div>

                {/* Objectives List */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-b-2xl border-2 border-purple-500/30 shadow-lg overflow-hidden">
                  <div className="divide-y divide-purple-500/20">
                    {dateTasks.map((task) => (
                      <div key={task.id} className="relative p-6 hover:bg-purple-900/20 transition-all duration-200">
                        <div className="space-y-4">
                          {/* Row 1: Left Column (Badge + Icon + Well) and Right Column (Rewards + Button) */}
                          <div className="flex items-start gap-4">
                            {/* Left Column: Badge + Icon + Themed Well */}
                            <div className="flex items-start gap-4 flex-1">
                              {/* Badge + Icon Column - Stacked Vertically */}
                              <div className="flex flex-col items-center gap-2">
                                {/* Rewards Box */}
                                <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-[2px] rounded-lg">
                                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg px-4 py-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-green-400 uppercase tracking-wide">{t('labels.rewards')}</span>
                                      <div className="flex items-center gap-1.5">
                                        {ic('fuel')}
                                        <span className="text-xl font-black text-white">{task.points_value}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {task.icon_path && (
                                  <img
                                    src={task.icon_path}
                                    alt=""
                                    className="w-16 h-16 rounded-lg object-cover border-2 border-purple-500/50 shadow-sm"
                                  />
                                )}
                              </div>

                              {/* Themed Well with OBJECTIVE and BRIEFING */}
                              <div className="flex-1 min-w-0 relative group">
                                {/* Glowing border effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-20 group-hover:opacity-40 transition duration-300 blur"></div>
                                
                                {/* Content well */}
                                <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border-2 border-purple-500/30 rounded-lg p-4 space-y-2">
                                  {/* OBJECTIVE */}
                                  <div>
                                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{t('labels.objective')}</span>
                                    <h3 className="text-lg font-bold text-white mt-1 [text-shadow:_0_0_10px_rgba(168,85,247,0.4)]">
                                      {task.title}
                                    </h3>
                                  </div>
                                  
                                  {/* BRIEFING */}
                                  {task.description && (
                                    <div>
                                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{t('labels.briefing')}</span>
                                      <p className="text-sm text-gray-300 leading-relaxed mt-1">
                                        {task.description}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Column: Rewards + Button grouped at bottom */}
                            <div className="flex flex-col justify-end gap-3">
                              {/* Status Badge */}
                              {getStatusBadge(task.status)}
                              {/* Action Buttons */}
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
                                  <span className="relative z-10 flex items-center gap-2 justify-center">
                                    {ic('approved')} {t('terms.complete')}
                                  </span>
                                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </button>
                              )}

                              {task.status === 'rejected' && !isExpired(task.available_end) && (
                                <button
                                  onClick={() => handleSubmitClick(task)}
                                  className="group relative overflow-hidden
                                             bg-gradient-to-r from-red-500 via-red-600 to-pink-600
                                             hover:from-red-600 hover:via-red-700 hover:to-pink-700
                                             text-white font-bold text-base
                                             px-6 py-3 rounded-xl
                                             shadow-lg hover:shadow-2xl
                                             transform hover:scale-105 active:scale-95
                                             transition-all duration-200
                                             border-2 border-transparent hover:border-red-400"
                                >
                                  <span className="relative z-10 flex items-center gap-2 justify-center">
                                    {ic('review')} {t('terms.review')}
                                  </span>
                                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </button>
                              )}

                              {task.status === 'pending' && (
                                <div className="text-center px-4 py-3 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-xl backdrop-blur-sm">
                                  <div className="text-2xl mb-1 animate-pulse">{ic('pending')}</div>
                                  <div className="text-sm font-bold text-yellow-300">
                                    {tm('awaitingReview')}
                                  </div>
                                </div>
                              )}

                              {task.status === 'approved' && (
                                <button
                                  onClick={() => handleCollectFuel(task)}
                                  disabled={collectingTaskId === task.id}
                                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500
                                             hover:from-green-600 hover:to-emerald-600
                                             text-white font-bold rounded-xl
                                             shadow-lg hover:shadow-xl
                                             transform hover:scale-105
                                             transition-all duration-200
                                             border-2 border-green-400/50
                                             disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                  {collectingTaskId === task.id ? (
                                    <span className="flex items-center gap-2 justify-center">
                                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      {tm('collecting')}
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-2 justify-center">
                                      {ic('collect')} {t('terms.collect')}
                                    </span>
                                  )}
                                </button>
                              )}

                              {task.status === 'completed' && (
                                <div className="text-center px-4 py-3 bg-purple-500/20 border-2 border-purple-500/50 rounded-xl backdrop-blur-sm">
                                  <div className="text-2xl mb-1">{ic('collected')}</div>
                                  <div className="text-sm font-bold text-purple-300">
                                    {t('terms.collected')}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Meta Info - Full Width */}
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            {task.photo_required && (
                              <div className="flex items-center gap-1.5">
                                <span>{ic('photo')}</span>
                                <span>{tm('photoRequiredMeta')}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span>{ic('time')}</span>
                              <span>{tm('dueLabel')} {formatTime(task.available_end)}</span>
                            </div>
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
