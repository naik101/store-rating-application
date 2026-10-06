import React, { useState, useEffect } from 'react';
import { X, Store, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

const AddStoreModal = ({ isOpen, onClose, onStoreAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch available store owners to assign
      api.get('/admin/users?role=STORE_OWNER')
        .then((res) => setOwners(res.data.data.users))
        .catch((err) => console.error('Failed to load store owners', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isAddressValid = address.trim().length > 0 && address.length <= 400;
  const isFormValid = isNameValid && isEmailValid && isAddressValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please resolve all validation errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/stores', {
        name,
        email,
        address,
        ownerId: ownerId || null,
      });

      setName('');
      setEmail('');
      setAddress('');
      setOwnerId('');
      onStoreAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Store className="w-5 h-5" />
            Add New Store
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Store Name (20–60 characters)
              </label>
              <span
                className={`text-xs ${
                  isNameValid ? 'text-emerald-600 font-medium' : 'text-slate-400'
                }`}
              >
                {name.length}/60 chars
              </span>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Electronics Superstore"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
            />
            {name.length > 0 && !isNameValid && (
              <p className="text-xs text-amber-600 mt-1">
                Name must be between 20 and 60 characters ({name.trim().length} entered).
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Store Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. contact@apexelectronics.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
            />
            {email.length > 0 && !isEmailValid && (
              <p className="text-xs text-amber-600 mt-1">Please enter a valid email address.</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Store Address (Max 400 characters)
              </label>
              <span
                className={`text-xs ${
                  address.length <= 400 ? 'text-slate-400' : 'text-red-500 font-medium'
                }`}
              >
                {address.length}/400
              </span>
            </div>
            <textarea
              rows={3}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address of the physical store location..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assign Store Owner (Optional)
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
            >
              <option value="">-- No Owner Assigned (Can be assigned later) --</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`px-5 py-2 text-sm font-medium text-white rounded-xl shadow transition ${
                isFormValid && !loading
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoreModal;
