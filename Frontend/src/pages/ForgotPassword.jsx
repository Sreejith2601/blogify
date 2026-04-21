import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success('Recovery email sent!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to send recovery email.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 bg-zinc-950 text-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Check your signal.</h2>
          <p className="text-zinc-500 mb-10 text-sm leading-relaxed max-w-xs mx-auto">
            We've sent a recovery link to <strong>{email}</strong>. Please check your inbox and spam folder.
          </p>
          <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-luxury">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 bg-zinc-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-black tracking-tighter text-white mb-2">
          Lost your key?
        </h2>
        <p className="text-center text-sm text-zinc-500 font-medium">
          Enter your email to receive a recovery link.
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/50 py-10 px-8 border border-zinc-800 rounded-3xl shadow-2xl shadow-zinc-950/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder-zinc-800 focus:ring-1 focus:ring-zinc-700 outline-none transition-luxury sm:text-sm"
                placeholder="you@email.com"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-full bg-white px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-950 shadow-xl shadow-white/5 hover:bg-zinc-200 focus:outline-none transition-luxury disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Recovery Link'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-luxury">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
