import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BrandLogo from '../components/BrandLogo';

const ANURAG_REGEX = /^(\d{2})eg(\d{3})([a-z])(\d{2})@anurag\.edu\.in$/i;

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Real-time Anurag email details parser
  const emailMatch = email.trim().match(ANURAG_REGEX);
  const isValidEmail = Boolean(emailMatch);
  const parsedDetails = emailMatch
    ? {
        batch: emailMatch[1],
        dept: emailMatch[2],
        section: emailMatch[3].toUpperCase(),
        roll: emailMatch[4]
      }
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail) {
      setError('Please enter a valid Anurag University email format (e.g. 24eg112c54@anurag.edu.in)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password, confirmPassword });
      showToast('Registration successful! Welcome to LostLink.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-xs text-gray-500 mt-1">
              Only Anurag University institutional accounts can register.
            </p>
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
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                College Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="24eg112c54@anurag.edu.in"
                  className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    email.length > 0
                      ? isValidEmail
                        ? 'border-emerald-400 focus:ring-emerald-500'
                        : 'border-amber-400 focus:ring-amber-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Format: YYegDDDCRR@anurag.edu.in</p>

              {/* Real-time Parsed Student Info Box */}
              {parsedDetails && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs fade-in">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Validated Institutional Format:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[11px] text-emerald-900 font-semibold text-center mt-1">
                    <div className="bg-white/80 p-1 rounded border border-emerald-200">
                      <span className="block text-[9px] text-emerald-600 uppercase">Batch</span>
                      {parsedDetails.batch}
                    </div>
                    <div className="bg-white/80 p-1 rounded border border-emerald-200">
                      <span className="block text-[9px] text-emerald-600 uppercase">Dept</span>
                      {parsedDetails.dept}
                    </div>
                    <div className="bg-white/80 p-1 rounded border border-emerald-200">
                      <span className="block text-[9px] text-emerald-600 uppercase">Section</span>
                      {parsedDetails.section}
                    </div>
                    <div className="bg-white/80 p-1 rounded border border-emerald-200">
                      <span className="block text-[9px] text-emerald-600 uppercase">Roll</span>
                      {parsedDetails.roll}
                    </div>
                  </div>
                </div>
              )}
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

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isValidEmail}
              className="w-full py-3 px-4 rounded-xl gradient-cta-primary text-white font-bold text-sm electric-glow-dual flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Complete Registration
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
