import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginContext } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.register(formData);
      if (response.token) {
        loginContext(response.token, response.user);
        toast.success('Registration successful!');
        navigate('/');
      } else {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 bg-zinc-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-black tracking-tighter text-zinc-900 mb-2">
          Join the circle.
        </h2>
        <p className="text-center text-sm text-zinc-500 font-medium">
          Already a member?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 border border-zinc-200 rounded-3xl shadow-xl shadow-zinc-900/5">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 placeholder-zinc-200 focus:ring-1 focus:ring-blue-500 outline-none transition-luxury sm:text-sm"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 placeholder-zinc-200 focus:ring-1 focus:ring-blue-500 outline-none transition-luxury sm:text-sm"
                  placeholder="jdoe"
                />
              </div>
            </div>

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
                className="block w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 placeholder-zinc-200 focus:ring-1 focus:ring-blue-500 outline-none transition-luxury sm:text-sm"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 placeholder-zinc-200 focus:ring-1 focus:ring-blue-500 outline-none transition-luxury sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-full bg-zinc-900 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-zinc-900/10 hover:bg-black focus:outline-none transition-luxury disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
