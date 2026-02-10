import { useState } from 'react';
import { photosAPI, taskInstancesAPI } from '../services/api';

export default function TaskSubmissionModal({ task, onClose, onSuccess }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photoFile && task.photo_required) {
      setError('Photo is required for this task');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let photoPath = '';
      
      // Upload photo if provided
      if (photoFile) {
        const uploadResponse = await photosAPI.uploadPhoto(photoFile);
        photoPath = uploadResponse.data.photo_path;
      }

      // Submit task instance
      await taskInstancesAPI.submitTask(task.id, photoPath);
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Submit Task: {task.title}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {task.photo_required && (
              <>
                {task.photo_criteria && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <h3 className="font-medium text-blue-900 mb-2">
                      📸 Photo Requirements:
                    </h3>
                    <p className="text-sm text-blue-800 whitespace-pre-line">
                      {task.photo_criteria}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Photo *
                  </label>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded border border-gray-300 mb-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    required={task.photo_required}
                  />
                </div>
              </>
            )}

            <div className="bg-gray-50 rounded p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Points to earn:</span>
                <span className="text-lg font-bold text-primary-600">
                  {task.points_value} points
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
