import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI, iconsAPI } from '../services/api';

export default function CreateTask() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon_path: '',
    points_value: 10,
    task_type: 'recurring',
    recurrence_pattern: 'daily',
    recurrence_days: [1, 2, 3, 4, 5], // Mon-Fri by default
    photo_required: true,
    photo_criteria: '',
    assigned_to: null,
  });
  
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const days = prev.recurrence_days || [];
      if (days.includes(day)) {
        return { ...prev, recurrence_days: days.filter(d => d !== day) };
      } else {
        return { ...prev, recurrence_days: [...days, day].sort() };
      }
    });
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      // Create preview
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
      
      // Upload icon if one was selected
      if (iconFile) {
        const uploadResponse = await iconsAPI.uploadIcon(iconFile);
        iconPath = uploadResponse.data.icon_path;
      }

      // Create task
      const taskData = {
        ...formData,
        icon_path: iconPath,
        points_value: parseInt(formData.points_value),
        recurrence_days: formData.task_type === 'recurring' ? formData.recurrence_days : null,
      };

      await tasksAPI.createTask(taskData);
      
      // Success - navigate back to dashboard
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
        <p className="mt-2 text-sm text-gray-600">
          Set up a new chore or task for your kids to complete
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Make Bed, Do Dishes"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Brief description of the task"
          />
        </div>

        {/* Icon Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Icon
          </label>
          <div className="flex items-center space-x-4">
            {iconPreview && (
              <img
                src={iconPreview}
                alt="Icon preview"
                className="w-16 h-16 object-cover rounded border border-gray-300"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              className="text-sm text-gray-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Optional: Upload a custom icon for this task
          </p>
        </div>

        {/* Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Points Value *
          </label>
          <input
            type="number"
            name="points_value"
            required
            min="1"
            value={formData.points_value}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Task Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Type *
          </label>
          <select
            name="task_type"
            value={formData.task_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="recurring">Recurring</option>
            <option value="one-off">One-off</option>
          </select>
        </div>

        {/* Recurrence Pattern (only for recurring tasks) */}
        {formData.task_type === 'recurring' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurrence Pattern *
              </label>
              <select
                name="recurrence_pattern"
                value={formData.recurrence_pattern}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly (specific days)</option>
              </select>
            </div>

            {formData.recurrence_pattern === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Days *
                </label>
                <div className="flex flex-wrap gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDayToggle(index)}
                      className={`px-4 py-2 rounded-md border ${
                        formData.recurrence_days?.includes(index)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Photo Requirements */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="photo_required"
              checked={formData.photo_required}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Photo proof required
            </span>
          </label>
        </div>

        {formData.photo_required && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Acceptance Criteria
            </label>
            <textarea
              name="photo_criteria"
              value={formData.photo_criteria}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe what makes a photo acceptable. Example: Bed must be made with sheets pulled tight, pillows arranged neatly, no wrinkles visible."
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be shown to kids before they take photos
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
