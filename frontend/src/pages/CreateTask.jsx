import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, icon } from '../config/theme';
import api from '../services/api';

function CreateTask() {
  const navigate = useNavigate();
  const [kids, setKids] = useState([]);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon_path: '',
    points_value: 10,
    photo_required: true,
    photo_criteria: '',
    task_type: 'recurring',
    recurrence_pattern: 'daily',
    recurrence_days: [1, 2, 3, 4, 5],
    available_start_offset: 360,
    duration: 2340,
    custom_start_datetime: '',
    custom_end_datetime: '',
    assigned_to: []
  });

  useEffect(() => {
    fetchKids();
    
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(todayMidnight);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const defaultStart = new Date(todayMidnight.getTime() + 360 * 60000);
    const defaultEnd = new Date(tomorrow.getTime() + 1260 * 60000);
    
    setFormData(prev => ({
      ...prev,
      custom_start_datetime: defaultStart.toISOString().slice(0, 16),
      custom_end_datetime: defaultEnd.toISOString().slice(0, 16)
    }));
  }, []);

  const fetchKids = async () => {
    try {
      const response = await api.get('/users/kids');
      setKids(response.data);
    } catch (error) {
      console.error('Failed to fetch kids:', error);
    }
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let iconPath = formData.icon_path;
      
      if (iconFile) {
        const formDataIcon = new FormData();
        formDataIcon.append('icon', iconFile);
        const uploadResponse = await api.post('/icons/upload', formDataIcon, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        iconPath = uploadResponse.data.icon_path;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        icon_path: iconPath,
        points_value: formData.points_value,
        photo_required: formData.photo_required,
        photo_criteria: formData.photo_criteria,
        task_type: formData.task_type,
        recurrence_pattern: formData.task_type === 'recurring' ? formData.recurrence_pattern : 'custom',
        recurrence_days: formData.recurrence_pattern === 'weekly' ? formData.recurrence_days : null,
        available_start_offset: formData.available_start_offset,
        duration: formData.duration,
        assigned_to: formData.assigned_to.length === 1 ? formData.assigned_to[0] : null
      };

      if (formData.task_type === 'custom') {
        const params = new URLSearchParams({
          custom_start_datetime: new Date(formData.custom_start_datetime).toISOString(),
          custom_end_datetime: new Date(formData.custom_end_datetime).toISOString()
        });
        await api.post(`/tasks?${params.toString()}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      
      navigate('/parent');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(day);
    const newDays = formData.recurrence_days.includes(dayIndex)
      ? formData.recurrence_days.filter(d => d !== dayIndex)
      : [...formData.recurrence_days, dayIndex].sort();
    setFormData({ ...formData, recurrence_days: newDays });
  };

  const calculatePreviewTimes = () => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startTime = new Date(todayMidnight.getTime() + formData.available_start_offset * 60000);
    const endTime = new Date(startTime.getTime() + formData.duration * 60000);
    
    return {
      start: startTime.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      end: endTime.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const preview = calculatePreviewTimes();
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Task</h1>
        <p className="text-gray-600">Set up a new chore for your kids to complete and earn points</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              Basic Information
            </h2>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g., Make Your Bed"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                rows="3"
                placeholder="Optional: Additional details about the task"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Icon
                </label>
                <div className="flex items-start space-x-4">
                  {iconPreview && (
                    <div className="flex-shrink-0">
                      <img
                        src={iconPreview}
                        alt="Icon preview"
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition text-center">
                        <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-1 text-xs text-gray-600">Click to upload icon</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">Optional custom icon for this task</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('terms.points')} Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.points_value}
                    onChange={(e) => setFormData({ ...formData, points_value: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    min="1"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">pts</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">How many points kids earn for completing this task</p>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Requirements Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">📸</span>
              Photo Requirements
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.photo_required}
                onChange={(e) => setFormData({ ...formData, photo_required: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition"
              />
              <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Require photo proof of completion
              </span>
            </label>

            {formData.photo_required && (
              <div className="ml-8 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo Requirements
                </label>
                <textarea
                  value={formData.photo_criteria}
                  onChange={(e) => setFormData({ ...formData, photo_criteria: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  rows="2"
                  placeholder="e.g., Bed must be made with pillows arranged neatly"
                />
                <p className="mt-1 text-xs text-gray-500">Tell kids what should be visible in their photo</p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Recurrence Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">🔄</span>
              Schedule & Recurrence
            </h2>
          </div>
          
          <div className="p-6 space-y-5">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.task_type === 'recurring'}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  task_type: e.target.checked ? 'recurring' : 'custom' 
                })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition"
              />
              <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Recurring Task (auto-generates daily/weekly)
              </span>
            </label>

            {formData.task_type === 'recurring' ? (
              <div className="ml-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recurrence Pattern
                  </label>
                  <select
                    value={formData.recurrence_pattern}
                    onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="daily">Daily (every day)</option>
                    <option value="weekly">Weekly (specific days)</option>
                  </select>
                </div>

                {formData.recurrence_pattern === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Days
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {daysOfWeek.map((day, idx) => (
                        <label key={day} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.recurrence_days.includes(idx)}
                            onChange={() => handleDayToggle(day)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition"
                          />
                          <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 capitalize">
                            {day}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time (minutes from midnight)
                    </label>
                    <input
                      type="number"
                      value={formData.available_start_offset}
                      onChange={(e) => setFormData({ ...formData, available_start_offset: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      min="0"
                      max="1440"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500 bg-blue-50 rounded px-2 py-1">
                      ⏰ Preview: <span className="font-medium text-blue-700">{preview.start}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      min="1"
                      max="10080"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500 bg-blue-50 rounded px-2 py-1">
                      ⏰ Ends: <span className="font-medium text-blue-700">{preview.end}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ml-8 space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Custom Task:</span> This task will be created immediately with specific dates/times. It won't auto-generate on a schedule.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Start
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.custom_start_datetime}
                      onChange={(e) => setFormData({ ...formData, custom_start_datetime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available End
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.custom_end_datetime}
                      onChange={(e) => setFormData({ ...formData, custom_end_datetime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assignment Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">👥</span>
              Assign To
            </h2>
          </div>
          
          <div className="p-6">
            {kids.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No kids found. Create kid accounts first.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {kids.map(kid => (
                  <label key={kid.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition group border border-transparent hover:border-blue-200">
                    <input
                      type="checkbox"
                      checked={formData.assigned_to.includes(kid.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            assigned_to: [...formData.assigned_to, kid.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            assigned_to: formData.assigned_to.filter(id => id !== kid.id)
                          });
                        }
                      }}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {kid.display_name}
                    </span>
                  </label>
                ))}
                <p className="mt-3 text-xs text-gray-500 ml-1">
                  {formData.assigned_to.length === 0 
                    ? "No kids selected - task will be assigned to all kids" 
                    : formData.assigned_to.length === kids.length
                    ? "All kids selected"
                    : `${formData.assigned_to.length} of ${kids.length} kids selected`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/parent')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTask;
