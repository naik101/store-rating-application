import React, { useState, useEffect } from 'react';
import { X, User, Mail, MapPin, ShieldCheck, Store, Star, Calendar, Loader2 } from 'lucide-react';
import api from '../api/client';
import StarRating from './StarRating';

const UserDetailsModal = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      setError('');
      api.get(`/admin/users/${userId}`)
        .then((res) => setUser(res.data.data.user))
        .catch((err) => {
          console.error('Failed to load user details', err);
          setError('Failed to load user details.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <User className="w-5 h-5" />
            Complete User Profile
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm">Fetching user information...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>
          ) : user ? (
            <div className="space-y-6">
              {/* Header profile card */}
              <div className="flex items-start justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{user.address}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : user.role === 'STORE_OWNER'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {user.role}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Owned Stores (If Store Owner) */}
              {user.role === 'STORE_OWNER' && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-indigo-600" />
                    Managed Stores ({user.stores?.length || 0})
                  </h4>
                  {user.stores && user.stores.length > 0 ? (
                    <div className="space-y-2">
                      {user.stores.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-sm"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 block">{s.name}</span>
                            <span className="text-xs text-slate-500">{s.address}</span>
                          </div>
                          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                            {s._count?.ratings || 0} Ratings
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No stores assigned to this owner yet.</p>
                  )}
                </div>
              )}

              {/* Ratings Submitted by this user */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  Submitted Ratings ({user.ratings?.length || 0})
                </h4>
                {user.ratings && user.ratings.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {user.ratings.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-sm"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {r.store.name}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">This user has not submitted any ratings.</p>
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
