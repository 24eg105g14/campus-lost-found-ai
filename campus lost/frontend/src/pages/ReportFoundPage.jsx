import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Image as ImageIcon, ShieldAlert, Sparkles, HelpCircle, Lock, Trash2, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  'Smartphone', 'Laptop', 'Smartwatch', 'Watch', 'Earphones',
  'ID Card', 'Wallet', 'Keys', 'Bag', 'Books', 'Documents', 'Accessories', 'Clothing', 'Other'
];

export default function ReportFoundPage() {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Smartphone');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [locationFound, setLocationFound] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Private Verification Questions state
  const [questions, setQuestions] = useState([
    { question: 'What wallpaper or custom marking appears on the item?', answer: '' },
    { question: 'What unique scratch, engraving, or sticker is present?', answer: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    if (questions.length < 5) {
      setQuestions([...questions, { question: '', answer: '' }]);
    }
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  // Call AIService endpoint for question suggestions
  const handleAISuggestions = async () => {
    setAiSuggesting(true);
    try {
      const res = await api.post('/ai/suggest-questions', {
        category,
        brand,
        itemName,
        description
      });
      if (res.data && res.data.suggestions) {
        const newQuestions = res.data.suggestions.slice(0, 3).map((q) => ({
          question: q,
          answer: ''
        }));
        setQuestions(newQuestions);
        showToast('Suggested verification questions loaded!', 'info');
      }
    } catch (err) {
      showToast('Could not fetch AI suggestions. Standard templates loaded.', 'info');
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check that all questions have expected secret answers
    const invalidQ = questions.some((q) => !q.question.trim() || !q.answer.trim());
    if (invalidQ) {
      showToast('Please provide both the question and secret expected answer for all verification fields.', 'error');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('itemName', itemName);
      formData.append('category', category);
      formData.append('brand', brand);
      formData.append('color', color);
      formData.append('description', description);
      formData.append('locationFound', locationFound);
      formData.append('dateFound', dateFound);
      formData.append('verificationQuestions', JSON.stringify(questions));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/found-items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Found item reported successfully! Status set to PENDING.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error posting found item.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Finder Workflow</span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">Report Found Item</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in public details so lost owners can search for their item, and private verification details to prevent false claimers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: PUBLIC INFORMATION */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Public Information</h2>
                <p className="text-xs text-gray-500">This information will be displayed on public search cards.</p>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Item Photo (Cloudinary Upload)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-40 h-32 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-3">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <span className="text-[10px] text-gray-400 block">No image selected</span>
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageChange}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-400 mt-2">
                    Allowed formats: JPG, PNG, WEBP (Max 5MB). Image is securely hosted on Cloudinary.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Black Noise Smartwatch"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Noise, Apple, JBL, Casio"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Primary Color *
                </label>
                <input
                  type="text"
                  required
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Black, Silver, White"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Location Found *
                </label>
                <input
                  type="text"
                  required
                  value={locationFound}
                  onChange={(e) => setLocationFound(e.target.value)}
                  placeholder="e.g. Central Library, C Block, Cafeteria"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Date Found *
                </label>
                <input
                  type="date"
                  required
                  value={dateFound}
                  onChange={(e) => setDateFound(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Public Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe visible general features (e.g. Black Noise smartwatch found near library entrance bench)."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* SECTION 2: PRIVATE OWNERSHIP VERIFICATION */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-200 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Private Ownership Verification</h2>
                  <p className="text-xs text-indigo-700 font-medium">
                    🔐 Private details will NEVER be shown publicly. Used only to verify real owners.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAISuggestions}
                disabled={aiSuggesting}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1.5 transition-all shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                {aiSuggesting ? 'Generating...' : '✨ Suggest Verification Questions'}
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Question #{idx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="text-red-500 hover:text-red-700 p-1 text-xs flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      value={q.question}
                      onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                      placeholder="e.g. What wallpaper appears on the watch?"
                      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                      Secret Expected Answer (Private):
                    </label>
                    <input
                      type="text"
                      required
                      value={q.answer}
                      onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
                      placeholder="e.g. Batman"
                      className="w-full px-3.5 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}

              {questions.length < 5 && (
                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Add Another Verification Question
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                Publish Found Item Post (PENDING)
              </>
            )}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
