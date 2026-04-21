import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, formData.password);
      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 bg-zinc-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-black tracking-tighter text-white mb-2">
          New encryption.
        </h2>
        <p className="text-center text-sm text-zinc-500 font-medium">
          Set a strong password for your account.
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/50 py-10 px-8 border border-zinc-800 rounded-3xl shadow-2xl shadow-zinc-950/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="block w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder-zinc-800 focus:ring-1 focus:ring-zinc-700 outline-none transition-luxury sm:text-sm"
                placeholder="••••••••"
              />
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
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="block w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder-zinc-800 focus:ring-1 focus:ring-zinc-700 outline-none transition-luxury sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-full bg-white px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-950 shadow-xl shadow-white/5 hover:bg-zinc-200 focus:outline-none transition-luxury disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-luxury">
              Cancel and Return
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
