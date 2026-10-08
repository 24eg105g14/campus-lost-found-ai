import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bot, FileText, Package, Search, Send, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ItemCard from '../components/ItemCard';
import api from '../services/api';

const INITIAL_MESSAGE = "Tell me what you remember about your lost item. You don't need to fill out filters manually.";
const CHIP_LABELS = {
  category: 'Category', itemName: 'Item', brand: 'Brand', model: 'Model', color: 'Color',
  location: 'Location', date: 'Date', timeHint: 'Time', description: 'Details'
};
const CATEGORIES = ['All', 'Smartphone', 'Laptop', 'Smartwatch', 'Watch', 'Earphones', 'ID Card', 'Wallet', 'Keys', 'Bag', 'Books', 'Documents', 'Accessories', 'Clothing', 'Other'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState(searchParams.get('q') || '');
  const [messages, setMessages] = useState([{ role: 'assistant', content: INITIAL_MESSAGE }]);
  const [searchState, setSearchState] = useState({});
  const [unknownFields, setUnknownFields] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [results, setResults] = useState(null);
  const [highMatchesCount, setHighMatchesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ itemName: '', category: 'All', brand: '', color: '', location: '' });

  const chips = useMemo(() => Object.entries(searchState).filter(([, value]) => value), [searchState]);

  const submitMessage = async (event) => {
    event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage || loading) return;
    const userMessage = { role: 'user', content: cleanMessage };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/ai/search-assistant', {
        message: cleanMessage,
        searchState,
        unknownFields,
        questionCount,
        conversationContext: messages.slice(-7)
      });
      const data = response.data;
      setSearchState(data.searchState || {});
      setUnknownFields(data.unknownFields || []);

      if (data.readyToSearch) {
        setResults(data.results || []);
        setHighMatchesCount(data.highMatchesCount || 0);
        setMessages([...nextMessages, {
          role: 'assistant',
          content: data.totalCount > 0
            ? `I found ${data.totalCount} possible match${data.totalCount === 1 ? '' : 'es'}, ranked by similarity.`
            : "I couldn't find a strong match yet. Add another detail, or create a Missing Item Request so LostLink can keep watching."
        }]);
      } else {
        const nextQuestion = data.nextQuestion || 'What other detail do you remember about the item?';
        setQuestionCount((count) => Math.min(5, count + 1));
        setMessages([...nextMessages, { role: 'assistant', content: nextQuestion }]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI search is temporarily unavailable. Please try again or use manual search.');
    } finally {
      setLoading(false);
    }
  };

  const removeAttribute = (field) => {
    setSearchState((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setUnknownFields((current) => current.filter((item) => item !== field));
    setResults(null);
    setMessages((current) => [...current, { role: 'assistant', content: `${CHIP_LABELS[field]} removed. Tell me the correction naturally, or add another useful detail.` }]);
  };

  const runManualSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(manual).forEach(([key, value]) => {
        if (value && value !== 'All') params.set(key, value);
      });
      const response = await api.get(`/search?${params.toString()}`);
      setResults(response.data.results || []);
      setHighMatchesCount(response.data.highMatchesCount || 0);
    } catch {
      setError('Manual search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const missingRequestState = {
    aiSearchState: searchState,
    aiDescription: messages.filter((entry) => entry.role === 'user').map((entry) => entry.content).join(' ')
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="electric-card bg-white rounded-3xl border border-blue-200 overflow-hidden">
          <header className="p-5 sm:p-7 border-b border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-rose-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl gradient-cta-primary text-white flex items-center justify-center electric-glow-dual"><Sparkles className="w-5 h-5" /></div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">LostLink AI Item Finder</h1>
                <p className="text-xs sm:text-sm text-gray-500">Tell me what you remember. I’ll handle the filters.</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowManual((value) => !value)} className="px-4 py-2 rounded-xl border border-blue-200 bg-white text-blue-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> {showManual ? 'Hide manual search' : 'Use manual search'}
            </button>
          </header>

          {!showManual ? (
            <div className="p-5 sm:p-7">
              <div className="max-h-[390px] min-h-[220px] overflow-y-auto space-y-4 pr-1" aria-live="polite">
                {messages.map((entry, index) => (
                  <div key={`${entry.role}-${index}`} className={`flex gap-2.5 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {entry.role === 'assistant' && <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0"><Bot className="w-4 h-4" /></div>}
                    <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${entry.role === 'user' ? 'bg-blue-600 text-white rounded-br-md shadow-md shadow-blue-500/10' : 'bg-white border border-blue-100 text-gray-700 rounded-bl-md shadow-sm'}`}>{entry.content}</div>
                  </div>
                ))}
                {loading && <div className="flex items-center gap-2.5 text-sm text-blue-700 font-semibold"><div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center animate-pulse"><Sparkles className="w-4 h-4" /></div>LostLink AI is understanding your item…</div>}
              </div>

              {chips.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs font-extrabold text-gray-700 flex items-center gap-1.5 mb-3"><Sparkles className="w-3.5 h-3.5 text-rose-500" /> AI understood</p>
                  <div className="flex flex-wrap gap-2">
                    {chips.map(([field, value]) => (
                      <span key={field} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-200 text-xs font-bold text-blue-800 badge-dual-glow">
                        <span className="text-blue-500 font-semibold">{CHIP_LABELS[field]}:</span> {value}
                        <button type="button" onClick={() => removeAttribute(field)} className="text-gray-400 hover:text-rose-500" aria-label={`Remove ${CHIP_LABELS[field]}`}><X className="w-3.5 h-3.5" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</div>}
              <form onSubmit={submitMessage} className="mt-5 flex gap-2">
                <label htmlFor="ai-search-message" className="sr-only">Describe your lost item</label>
                <input id="ai-search-message" value={message} onChange={(event) => setMessage(event.target.value)} disabled={loading} maxLength={1000} autoComplete="off" placeholder="Describe your item or answer the question…" className="flex-1 min-w-0 px-4 py-3 bg-white border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60" />
                <button type="submit" disabled={loading || !message.trim()} className="w-12 h-12 rounded-2xl gradient-cta-primary text-white flex items-center justify-center shadow-lg shadow-blue-500/20 disabled:opacity-50" aria-label="Send description"><Send className="w-5 h-5" /></button>
              </form>
            </div>
          ) : (
            <form onSubmit={runManualSearch} className="p-5 sm:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <input value={manual.itemName} onChange={(event) => setManual({ ...manual, itemName: event.target.value })} placeholder="Item or keywords" className="lg:col-span-2 px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold" />
              <select value={manual.category} onChange={(event) => setManual({ ...manual, category: event.target.value })} className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold">{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>
              <input value={manual.brand} onChange={(event) => setManual({ ...manual, brand: event.target.value })} placeholder="Brand" className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold" />
              <input value={manual.location} onChange={(event) => setManual({ ...manual, location: event.target.value })} placeholder="Location" className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold" />
              <button type="submit" disabled={loading} className="rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2"><Search className="w-4 h-4" /> Search</button>
            </form>
          )}
        </section>

        {results !== null && (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Smart Match Results</p>
                <h2 className="text-xl font-extrabold text-gray-900">{results.length ? `${results.length} possible match${results.length === 1 ? '' : 'es'} found` : 'No strong matches yet'}</h2>
                {highMatchesCount > 0 && <p className="text-xs font-bold text-blue-600 mt-1">⚡ {highMatchesCount} high-confidence match{highMatchesCount === 1 ? '' : 'es'}</p>}
              </div>
              <Link to="/create-missing" state={missingRequestState} className="px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-blue-700 font-bold text-xs inline-flex items-center justify-center gap-2"><FileText className="w-4 h-4" /> Create Missing Request</Link>
            </div>
            {results.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{results.map((item) => <ItemCard key={item._id} item={item} matchScore={item.matchScore} matchConfidence={item.confidence} matchReasons={item.reasons} />)}</div>
            ) : (
              <div className="electric-card bg-white rounded-3xl border border-blue-100 p-10 text-center max-w-xl mx-auto">
                <Package className="w-11 h-11 text-blue-400 mx-auto mb-3" />
                <h3 className="font-extrabold text-gray-900">LostLink can keep watching</h3>
                <p className="text-sm text-gray-500 mt-1 mb-5">Add another detail in the conversation, or create a pre-filled Missing Item Request for future matches.</p>
                <Link to="/create-missing" state={missingRequestState} className="gradient-cta-primary text-white px-5 py-3 rounded-2xl text-xs font-bold inline-flex items-center gap-2"><FileText className="w-4 h-4" /> Create Pre-filled Request</Link>
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
