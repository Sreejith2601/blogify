import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { loginContext } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);

    try {
      const response = await authService.login(formData);
      loginContext(response.token, response.user);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 bg-zinc-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-black tracking-tighter text-zinc-900 mb-2">
          Welcome back.
        </h2>
        <p className="text-center text-sm text-zinc-500 font-medium">
          New here?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 border border-zinc-200 rounded-3xl shadow-xl shadow-zinc-900/5">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`block w-full bg-white border ${errors.email ? 'border-red-500' : 'border-zinc-200'} rounded-2xl px-5 py-4 text-zinc-900 placeholder-zinc-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-luxury sm:text-sm`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Password
                </label>
                <div className="text-[10px] font-black uppercase tracking-widest">
                  <Link to="/forgot-password" title="Recover Password" id="forgotPasswordLink" className="text-zinc-300 hover:text-zinc-900 transition-colors">
                    Forgot?
                  </Link>
                </div>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`block w-full bg-white border ${errors.password ? 'border-red-500' : 'border-zinc-200'} rounded-2xl px-5 py-4 text-zinc-900 placeholder-zinc-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-luxury sm:text-sm`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-full bg-zinc-900 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-zinc-900/10 hover:bg-black focus:outline-none transition-luxury disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
