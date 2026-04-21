import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import uploadService from '../services/uploadService';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profilePic: '',
    twitter: '',
    linkedin: '',
    github: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        profilePic: user.profilePic || '',
        twitter: user.socialLinks?.twitter || '',
        linkedin: user.socialLinks?.linkedin || '',
        github: user.socialLinks?.github || ''
      });
      setInitialLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Signal too large. Limit is 5MB.');
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadService.uploadImage(file);
      setFormData(prev => ({ ...prev, profilePic: url }));
      toast.success('Avatar signal captured');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to capture signal');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData = {
        name: formData.name,
        bio: formData.bio,
        profilePic: formData.profilePic,
        socialLinks: {
          twitter: formData.twitter,
          linkedin: formData.linkedin,
          github: formData.github
        }
      };
      
      await userService.updateProfile(updateData);
      await refreshUser(); // Sync AuthContext
      
      toast.success('Identity modified successfully');
      navigate('/profile');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-xs text-gray-400 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 md:px-10">
      <div className="max-w-2xl mx-auto">
        
        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1">Edit Profile</h1>
          <p className="text-sm text-gray-500">
            Update your personal information and public profile.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Profile Picture Section */}
          <section className="space-y-5 bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Profile Picture</h3>
            
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                {formData.profilePic ? (
                  <img src={formData.profilePic} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-gray-300 uppercase">{user?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="flex-1 w-full space-y-3">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
                <p className="text-xs text-gray-400">JPG, PNG, WebP — Max 5MB</p>
              </div>
            </div>
          </section>

          {/* Personal Info Section */}
          <section className="space-y-5 bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Personal Info</h3>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Full Name</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Bio</label>
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell the world about yourself..."
                  className="w-full border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm resize-none"
                />
              </div>
            </div>
          </section>

          {/* Social Links Section */}
          <section className="space-y-5 bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Social Links</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Twitter / X</label>
                <input 
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://x.com/username"
                  className="w-full border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">LinkedIn</label>
                <input 
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600">GitHub</label>
                <input 
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full border border-gray-200 text-gray-900 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 sm:flex-none px-8 py-3 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/profile')}
              className="flex-1 sm:flex-none px-8 py-3 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Settings;
