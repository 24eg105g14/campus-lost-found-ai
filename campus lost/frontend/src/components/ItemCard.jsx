import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, CheckCircle, Clock, Sparkles } from 'lucide-react';

export default function ItemCard({ item, matchScore, matchConfidence, matchReasons }) {
  const isDelivered = item.status === 'DELIVERED';

  return (
    <div className="electric-card bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      {/* Image & Badges Container */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.itemName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {isDelivered ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
              <CheckCircle className="w-3.5 h-3.5" /> REUNITED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
              <Clock className="w-3.5 h-3.5" /> PENDING
            </span>
          )}
        </div>

        {/* Match Percentage Badge if provided */}
        {matchScore !== undefined && matchScore !== null && (
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-md ${
                matchScore >= 80
                  ? 'bg-blue-600 text-white border border-blue-400'
                  : matchScore >= 60
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <Sparkles className="w-3 h-3" /> {matchScore}% MATCH
            </span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-800 border border-gray-200/60 shadow-sm">
            {item.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {item.itemName}
            </h3>
            {item.brand && (
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase shrink-0">
                {item.brand}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Reasons pills if high match */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {matchReasons.slice(0, 3).map((r, i) => (
              <span key={i} className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                ✓ {r}
              </span>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1 truncate max-w-[150px]" title={item.locationFound}>
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{item.locationFound}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{new Date(item.dateFound || item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>

        {/* View Action Button */}
        <div className="mt-4">
          <Link
            to={`/items/${item._id}`}
            className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            View Details & Claim
          </Link>
        </div>
      </div>
    </div>
  );
}
