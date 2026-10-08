import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BrandLogo from '../components/BrandLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      showToast('Welcome back to LostLink!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo user quick fill buttons
  const fillDemoFinder = () => {
    setEmail('24eg112c54@anurag.edu.in');
    setPassword('password123');
  };

  const fillDemoOwner = () => {
    setEmail('24eg112c55@anurag.edu.in');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full feature-card-electric p-8 rounded-3xl space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-flex mb-3" aria-label="Go to LostLink home">
              <BrandLogo variant="auth" />
            </Link>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">University Login</h2>
            <p className="text-xs text-gray-500 mt-1">
              Sign in with your Anurag University institutional account
            </p>
          </div>

          {/* Quick Fill Demo Banner */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Hackathon Quick Demo Accounts:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoFinder}
                className="py-1.5 px-2.5 rounded-xl bg-white border border-blue-200 text-blue-800 font-bold hover:bg-blue-100 transition-colors text-left"
              >
                User A (Finder)
                <span className="block text-[10px] font-normal text-blue-600 truncate">24eg112c54@anurag.edu.in</span>
              </button>
              <button
                type="button"
                onClick={fillDemoOwner}
                className="py-1.5 px-2.5 rounded-xl bg-white border border-blue-200 text-blue-800 font-bold hover:bg-blue-100 transition-colors text-left"
              >
                User B (Owner)
                <span className="block text-[10px] font-normal text-blue-600 truncate">24eg112c55@anurag.edu.in</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs font-semibold text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                College Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="24eg112c54@anurag.edu.in"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl gradient-cta-primary text-white font-bold text-sm electric-glow-dual flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Don't have an institutional account yet?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
