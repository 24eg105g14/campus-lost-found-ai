import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, MessageSquare, Package, Sparkles, AlertCircle, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ChatPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeConvData, setActiveConvData] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      const list = res.data || [];
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0]._id);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      setMessages(res.data.messages || []);
      setActiveConvData(res.data);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      const interval = setInterval(() => fetchMessages(activeConvId), 4000);
      return () => clearInterval(interval);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConvId) return;

    const currentText = text.trim();
    setText('');

    try {
      const res = await api.post(`/conversations/${activeConvId}/messages`, { text: currentText });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      showToast('Could not send message.', 'error');
    }
  };

  // Mark Delivered action for finder
  const handleMarkDelivered = async () => {
    if (!activeConvData?.foundItem?._id) return;
    try {
      await api.post(`/found-items/${activeConvData.foundItem._id}/delivered`);
      setShowDeliveryModal(false);
      setDeliverySuccess(true);
      showToast('Item status updated to DELIVERED!', 'success');
      fetchMessages(activeConvId);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error marking item delivered.', 'error');
    }
  };

  const isFinder = activeConvData?.foundItem && user && (activeConvData.foundItem.postedBy === user._id || activeConvData.foundItem.postedBy?._id === user._id);
  const isDelivered = activeConvData?.foundItem?.status === 'DELIVERED';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[600px] h-[calc(100vh-180px)]">
          {/* Left Column: Conversations List */}
          <div className="border-r border-gray-200 flex flex-col bg-gray-50/50">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Verified Messages</h2>
              <p className="text-xs text-gray-500">Private 1-on-1 chats with verified owners/finders.</p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {loading ? (
                <div className="p-6 text-center text-xs text-gray-400">Loading chats...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 space-y-2">
                  <Lock className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="font-bold text-gray-600">No verified conversations yet.</p>
                  <p>Chat unlocks only after ownership verification.</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConvId(conv._id)}
                    className={`w-full text-left p-4 hover:bg-gray-100 transition-colors flex items-start gap-3 ${
                      activeConvId === conv._id ? 'bg-blue-50/80 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <img
                      src={conv.foundItem?.imageUrl}
                      alt={conv.foundItem?.itemName}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {conv.foundItem?.itemName}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                        {conv.otherUser?.name} ({conv.otherUser?.dept})
                      </p>
                      <p className="text-[11px] text-gray-400 truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Chat View */}
          <div className="md:col-span-2 flex flex-col bg-white">
            {activeConvData ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeConvData.foundItem?.imageUrl}
                      alt={activeConvData.foundItem?.itemName}
                      className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{activeConvData.foundItem?.itemName}</h3>
                      <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Chat with {activeConvData.otherUser?.name}
                      </p>
                    </div>
                  </div>

                  {/* Finder Mark Delivered Button */}
                  <div className="flex items-center gap-2">
                    {isDelivered ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> DELIVERED
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowDeliveryModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Item as Delivered
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
                  <div className="text-center py-2">
                    <span className="px-3 py-1 bg-gray-200/80 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      🔒 End-to-End Verified LostLink Chat
                    </span>
                  </div>

                  {messages.map((msg) => {
                    const isMe = msg.senderId === user?._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs shadow-xs font-medium ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                          <span
                            className={`block text-[9px] mt-1 text-right font-normal ${
                              isMe ? 'text-blue-100' : 'text-gray-400'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex gap-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message to schedule safe return..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8 text-gray-400 text-xs">
                Select a verified conversation to start chatting.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Delivery */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-gray-200 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Mark Item as Delivered?</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Has this <strong>{activeConvData?.foundItem?.itemName}</strong> been successfully returned to its verified owner?
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeliveryModal(false)}
                className="py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkDelivered}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-md"
              >
                Yes, Mark Delivered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ITEM REUNITED Success Modal */}
      {deliverySuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-md fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-4 border border-gray-100 shadow-2xl">
            <div className="text-5xl mb-2 animate-bounce">🎉</div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">ITEM REUNITED!</h2>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Another item has found its way back to its owner. <br />
              <strong className="text-blue-600">Find What Matters. Return What Belongs.</strong>
            </p>
            <div className="pt-4">
              <button
                onClick={() => setDeliverySuccess(false)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg"
              >
                Continue (LostLink ✓)
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
