import { useState } from 'react';
import { photosAPI, taskInstancesAPI } from '../services/api';
import FuelIcon from './FuelIcon';
import { t, tm, icon } from '../config/theme';

export default function TaskSubmissionModal({ task, onClose, onSuccess }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
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
      setError('Photo is required for this objective');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let photoPath = '';
      
      if (photoFile) {
        const uploadResponse = await photosAPI.uploadPhoto(photoFile);
        photoPath = uploadResponse.data.photo_path;
      }

      await taskInstancesAPI.submitTask(task.id, photoPath);
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || tm('transmissionFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 border-2 border-gray-200">
          
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 text-white">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-3xl">{icon('transmit')}</span>
              {tm('photoRequired')}
            </h3>
            <p className="text-sm text-white/90 mt-1">{t('terms.task')}: {task.title}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{icon('rejected')}</span>
                  <div>
                    <h4 className="font-bold text-red-900">Transmission Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {task.photo_required && (
                <>
                  {/* Photo Requirements */}
                  {task.photo_criteria && (
                    <div className="bg-cyan-50 border-2 border-cyan-400 rounded-xl p-4">
                      <h4 className="font-bold text-cyan-900 mb-2 flex items-center gap-2">
                        <span className="text-xl">{icon('photo')}</span>
                        {tm('photoRequirements')}
                      </h4>
                      <p className="text-sm text-cyan-800 whitespace-pre-line leading-relaxed">
                        {task.photo_criteria}
                      </p>
                    </div>
                  )}

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Photo *
                    </label>
                    
                    {photoPreview ? (
                      <div className="relative group">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-xl border-2 border-gray-300 shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview('');
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="relative block cursor-pointer group">
                        <div className="border-2 border-dashed border-gray-300 group-hover:border-cyan-400 bg-gray-50 group-hover:bg-cyan-50 rounded-xl p-8 transition-all duration-200 text-center">
                          <div className="text-4xl mb-3 opacity-40 group-hover:opacity-100 transition-opacity">
                            {icon('photo')}
                          </div>
                          <p className="text-sm font-semibold text-gray-600 group-hover:text-cyan-600">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                          required={task.photo_required}
                        />
                      </label>
                    )}
                  </div>
                </>
              )}

              {/* Fuel Reward Display */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">
                    Rewards:
                  </span>
                  <div className="flex items-center gap-2">
                    <FuelIcon />
                    <span className="text-2xl font-black text-gray-900">
                      {task.points_value}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative overflow-hidden
                             bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 
                             hover:from-purple-600 hover:via-purple-700 hover:to-pink-600
                             text-white font-bold text-base
                             px-8 py-3 rounded-xl
                             shadow-lg hover:shadow-2xl
                             transform hover:scale-105 active:scale-95
                             transition-all duration-200
                             border-2 border-transparent hover:border-cyan-400
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        {icon('transmit')} {t('terms.submit')}
                      </>
                    )}
                  </span>
                  {!loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
