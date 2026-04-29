import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.changePassword(formData.oldPassword, formData.newPassword);
      toast.success('Password changed successfully!');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 bg-zinc-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-black tracking-tighter text-white mb-2">
          Security update.
        </h2>
        <p className="text-center text-sm text-zinc-500 font-medium">
          Update your account encryption.
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/50 py-10 px-8 border border-zinc-800 rounded-3xl shadow-2xl shadow-zinc-950/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="oldPassword" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Current Password
              </label>
              <input
                id="oldPassword"
                name="oldPassword"
                type="password"
                required
                value={formData.oldPassword}
                onChange={handleChange}
                className={`block w-full bg-zinc-950 border ${errors.oldPassword ? 'border-red-500' : 'border-zinc-800'} rounded-2xl px-5 py-4 text-white placeholder-zinc-800 focus:ring-1 focus:ring-zinc-700 outline-none transition-luxury sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.oldPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.oldPassword}</p>}
            </div>

            <div className="pt-4 border-t border-zinc-900">
              <label htmlFor="newPassword" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 mt-4">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className={`block w-full bg-zinc-950 border ${errors.newPassword ? 'border-red-500' : 'border-zinc-800'} rounded-2xl px-5 py-4 text-white placeholder-zinc-800 focus:ring-1 focus:ring-zinc-700 outline-none transition-luxury sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.newPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.newPassword}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full bg-zinc-950 border ${errors.confirmPassword ? 'border-red-500' : 'border-zinc-800'} rounded-2xl px-5 py-4 text-white placeholder-zinc-800 focus:ring-1 focus:ring-zinc-700 outline-none transition-luxury sm:text-sm`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-full bg-white px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-950 shadow-xl shadow-white/5 hover:bg-zinc-200 focus:outline-none transition-luxury disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Update Password'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link to="/profile" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-luxury">
              Cancel and Return
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
