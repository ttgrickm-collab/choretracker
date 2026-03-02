import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { t, tm, icon } from '../config/theme';
import { ic } from '../utils/iconRenderer';

// ─── Inline Edit Form ────────────────────────────────────────────────────────

function InlineEditForm({ task, onSaved, onDeactivated, onCancel }) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    points_value: task.points_value,
    photo_required: task.photo_required === 1 || task.photo_required === true,
    photo_criteria: task.photo_criteria || '',
    recurrence_pattern: task.recurrence_pattern || 'daily',
    recurrence_days: task.recurrence_days || [1, 2, 3, 4, 5],
    available_start_offset: task.available_start_offset ?? 360,
    duration: task.duration ?? 2340,
  });
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [error, setError] = useState('');

  const calculatePreview = () => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(midnight.getTime() + formData.available_start_offset * 60000);
    const end = new Date(start.getTime() + formData.duration * 60000);
    const fmt = (d) => d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    return { start: fmt(start), end: fmt(end) };
  };

  const preview = calculatePreview();
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleDayToggle = (idx) => {
    const newDays = formData.recurrence_days.includes(idx)
      ? formData.recurrence_days.filter(d => d !== idx)
      : [...formData.recurrence_days, idx].sort();
    setFormData({ ...formData, recurrence_days: newDays });
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await tasksAPI.updateTask(task.id, {
        title: formData.title,
        description: formData.description,
        points_value: formData.points_value,
        photo_required: formData.photo_required,
        photo_criteria: formData.photo_criteria,
        recurrence_pattern: task.task_type === 'recurring' ? formData.recurrence_pattern : undefined,
        recurrence_days: task.task_type === 'recurring' && formData.recurrence_pattern === 'weekly'
          ? formData.recurrence_days : undefined,
        available_start_offset: task.task_type === 'recurring' ? formData.available_start_offset : undefined,
        duration: task.task_type === 'recurring' ? formData.duration : undefined,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || tm('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await tasksAPI.updateTask(task.id, { active: false });
      onDeactivated();
    } catch (err) {
      setError(err.response?.data?.detail || tm('deactivateError'));
      setDeactivating(false);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-gray-50/60 p-5 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <span>{icon('basicInfo')}</span>
            {tm('sectionBasicInfo')}
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {tm('taskNameLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {tm('taskDescriptionLabel')}
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={tm('taskDescriptionPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {tm('fuelValueLabel')} {ic('fuel')}
            </label>
            <input
              type="number"
              min="1"
              value={formData.points_value}
              onChange={(e) => setFormData({ ...formData, points_value: parseInt(e.target.value) || 1 })}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>
      </div>

      {/* Photo Requirements */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <span>{icon('photo')}</span>
            {tm('sectionPhotoReqs')}
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.photo_required}
              onChange={(e) => setFormData({ ...formData, photo_required: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{tm('photoRequired')}</span>
          </label>
          {formData.photo_required && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {tm('photoCriteria')}
              </label>
              <textarea
                value={formData.photo_criteria}
                onChange={(e) => setFormData({ ...formData, photo_criteria: e.target.value })}
                placeholder="What should the photo show?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Schedule — recurring tasks only */}
      {task.task_type === 'recurring' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span>{icon('recurring')}</span>
              {tm('sectionSchedule')}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Pattern</label>
              <select
                value={formData.recurrence_pattern}
                onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly (specific days)</option>
              </select>
            </div>
            {formData.recurrence_pattern === 'weekly' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Days</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day, idx) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(idx)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        formData.recurrence_days.includes(idx)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {day.slice(0, 3).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Start offset (minutes from midnight)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1439"
                  value={formData.available_start_offset}
                  onChange={(e) => setFormData({ ...formData, available_start_offset: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
              Preview: {preview.start} → {preview.end}
            </p>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-1">
        {/* Deactivate — left side, isolated */}
        <div>
          {confirmDeactivate ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">{tm('deactivateConfirm')}</span>
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {deactivating ? tm('deactivating') : tm('confirmYes')}
              </button>
              <button
                onClick={() => setConfirmDeactivate(false)}
                className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                {tm('cancel')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDeactivate(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
            >
              {icon('deactivate')} {t('terms.deactivate')}
            </button>
          )}
        </div>

        {/* Cancel / Save — right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {tm('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.title.trim()}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {tm('saving')}
              </span>
            ) : tm('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Parent Dashboard ─────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      setTasks(response.data);
    } catch (err) {
      setError(tm('loadError'));
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-xl font-bold text-white">{tm('dashboardTitle')}</h1>
            <p className="text-blue-100 text-sm mt-1">{tm('dashboardSubtitle')}</p>
          </div>
          <Link
            to="/tasks/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 font-semibold rounded-lg shadow-sm hover:bg-blue-50 transition-colors text-sm"
          >
            <span>+</span>
            {tm('createObjectiveCTA')}
          </Link>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ── Active Objectives Card ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">{icon('objective')}</span>
            {tm('activeObjectivesHeader')}
          </h2>
        </div>

        <div className="px-6 py-6">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 opacity-20">{icon('objective')}</div>
              <p className="text-gray-500 mb-4">{tm('noTasksYet')}</p>
              <Link
                to="/tasks/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                <span>+</span>
                {tm('createFirst')}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                const isEditing = editingTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className={`border rounded-lg overflow-hidden transition-all duration-150 ${
                      isEditing
                        ? 'border-blue-300 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Summary Row — always visible, muted when editing */}
                    <div
                      className={`p-4 flex items-start gap-4 transition-opacity duration-150 ${
                        isEditing ? 'opacity-40 bg-gray-50' : 'bg-white'
                      }`}
                    >
                      {task.icon_path && (
                        <img
                          src={task.icon_path}
                          alt=""
                          className="w-10 h-10 rounded object-cover border border-gray-200 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                          <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                            {ic('fuel')} {task.points_value}
                          </span>
                          <span className="inline-flex items-center gap-1 text-gray-500">
                            {task.task_type === 'recurring'
                              ? <>{icon('recurring')} {tm('recurring')}</>
                              : <>{icon('oneTime')} {tm('oneTime')}</>}
                          </span>
                          {task.photo_required === 1 || task.photo_required === true ? (
                            <span className="inline-flex items-center gap-1 text-gray-500">
                              {icon('photo')} {tm('photoRequired')}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingTaskId(isEditing ? null : task.id)}
                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-md font-medium transition-colors ${
                          isEditing
                            ? 'border-blue-300 text-blue-600 bg-blue-50'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {icon('edit')} {isEditing ? tm('editing') : t('terms.edit')}
                      </button>
                    </div>

                    {/* Inline Edit Form */}
                    {isEditing && (
                      <InlineEditForm
                        task={task}
                        onSaved={() => { setEditingTaskId(null); loadTasks(); }}
                        onDeactivated={() => { setEditingTaskId(null); loadTasks(); }}
                        onCancel={() => setEditingTaskId(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
