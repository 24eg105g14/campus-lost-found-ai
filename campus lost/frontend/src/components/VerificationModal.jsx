import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, X, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function VerificationModal({ item, isOpen, onClose, onVerificationSuccess }) {
  const [answers, setAnswers] = useState(
    (item.verificationQuestions || []).map((q) => ({
      questionId: q._id,
      question: q.question,
      answer: ''
    }))
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  if (!isOpen || !item) return null;

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index].answer = value;
    setAnswers(updated);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/claims/verify', {
        foundItemId: item._id,
        answers
      });

      setResult(res.data);

      if (res.data.verified) {
        showToast('🎉 Ownership verified! Private chat with finder is unlocked.', 'success');
        if (onVerificationSuccess) onVerificationSuccess(res.data);
      } else if (res.data.status === 'MANUAL_REVIEW') {
        showToast('Claim sent for manual finder review.', 'info');
      } else {
        showToast('Verification details did not match. Please check answers.', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification check failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gray-200 shadow-2xl relative space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">VERIFY OWNERSHIP</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Answer specific private details only the real owner of this <strong>{item.itemName}</strong> is likely to know.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs font-semibold text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Success Display */}
        {result?.verified ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">✓ OWNERSHIP CHECK</span>
              <h3 className="text-3xl font-black text-emerald-900 mt-1">{result.score}%</h3>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mt-0.5">HIGH CONFIDENCE</p>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              Several private identifying details matched the finder's verification questions. Chat with finder is now unlocked!
            </p>
            <button
              onClick={() => {
                onClose();
                if (onVerificationSuccess) onVerificationSuccess(result);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all mt-2"
            >
              CONTINUE TO CHAT WITH FINDER →
            </button>
          </div>
        ) : result?.status === 'MANUAL_REVIEW' ? (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center space-y-3 fade-in">
            <h3 className="text-2xl font-black text-indigo-900">{result.score}%</h3>
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">SENT FOR FINDER REVIEW</p>
            <p className="text-xs text-indigo-800 font-medium">
              Your answers have been forwarded to the finder for manual review. You will be notified once they respond.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            {item.verificationQuestions?.map((q, idx) => (
              <div key={q._id || idx} className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  {idx + 1}. {q.question}
                </label>
                <input
                  type="text"
                  required
                  value={answers[idx]?.answer || ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder="Enter specific answer..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  VERIFY OWNERSHIP
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
