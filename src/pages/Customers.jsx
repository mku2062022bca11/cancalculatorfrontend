import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Search, Edit, UserPlus, Users as UsersIcon } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', customerType: 'Regular', businessType: 'Both', balance: 0, pendingEmptyCans: 0
  });

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openEditModal = (customer) => {
    setEditingId(customer._id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
      customerType: customer.customerType,
      businessType: customer.businessType,
      balance: customer.balance || 0,
      pendingEmptyCans: customer.pendingEmptyCans || 0
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', address: '', customerType: 'Regular', businessType: 'Both', balance: 0, pendingEmptyCans: 0 });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', address: '', customerType: 'Regular', businessType: 'Both', balance: 0, pendingEmptyCans: 0 });
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer', error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to save customer: ${msg}`);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Customer Directory (வாடிக்கையாளர்கள்)</h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Manage your client base and their details</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center w-full sm:w-auto justify-center bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-indigo-500/30">
          <UserPlus className="h-5 w-5 mr-2" /> Add Customer (புதிய வாடிக்கையாளர்)
        </button>
      </div>

      <div className="card p-0 overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="bg-slate-50/80 px-4 sm:px-6 py-5 border-b border-slate-100 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center text-slate-700 font-semibold">
            <UsersIcon className="h-5 w-5 mr-2 text-indigo-500" />
            All Customers ({filteredCustomers.length})
          </div>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or phone... (தேடுக)" 
              className="input-field pl-10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 text-[10px] sm:text-xs uppercase tracking-widest font-semibold bg-white/40">
                <th className="px-4 sm:px-6 py-4">Customer Details<br/><span className="lowercase capitalize-first opacity-80">(வாடிக்கையாளர் விவரங்கள்)</span></th>
                <th className="px-4 sm:px-6 py-4">Type<br/><span className="lowercase capitalize-first opacity-80">(வகை)</span></th>
                <th className="px-4 sm:px-6 py-4">Balance (₹)<br/><span className="lowercase capitalize-first opacity-80">(நிலுவைத் தொகை)</span></th>
                <th className="px-4 sm:px-6 py-4">Empty Cans<br/><span className="lowercase capitalize-first opacity-80">(காலி கேன்கள்)</span></th>
                <th className="px-4 sm:px-6 py-4 text-right">Actions<br/><span className="lowercase capitalize-first opacity-80">(செயல்கள்)</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white/60">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400 animate-pulse">Loading amazing data (காத்திருக்கவும்)...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No customers found. (வாடிக்கையாளர்கள் இல்லை)</td></tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm sm:text-base">{customer.name}</p>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{customer.phone}</p>
                      {customer.address && <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{customer.address}</p>}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap mb-1 sm:mb-0">
                        {customer.customerType}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 sm:ml-2 whitespace-nowrap">
                        {customer.businessType}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {customer.balance > 0 ? (
                        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg bg-red-50 border border-red-100 text-red-700 font-black shadow-sm text-sm">
                          ₹{customer.balance.toLocaleString()}
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold shadow-sm text-xs sm:text-sm">
                          Clear (சுத்தம்)
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {customer.pendingEmptyCans > 0 ? (
                        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-black shadow-sm text-xs sm:text-sm">
                          {customer.pendingEmptyCans} Cans
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end sm:opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(customer)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit Customer">
                          <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden transform transition-all scale-100 my-8">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Customer Details' : 'Add New Customer (புதிய வாடிக்கையாளர்)'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-full hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-field">Name (பெயர்)</label>
                  <input required type="text" className="input-field shadow-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ramesh" />
                </div>
                <div>
                  <label className="label-field">Phone (போன்)</label>
                  <input required type="tel" className="input-field shadow-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="10-digit number" />
                </div>
              </div>
              
              <div>
                <label className="label-field">Address / Area (முகவரி)</label>
                <textarea className="input-field shadow-sm" rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street, landmark, city..."></textarea>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-field">Customer Type (வகை)</label>
                  <select className="input-field shadow-sm" value={formData.customerType} onChange={e => setFormData({...formData, customerType: e.target.value})}>
                    <option value="Regular">Regular</option>
                    <option value="Function">Function</option>
                    <option value="Catering">Catering</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Business Needs (பொருட்கள்)</label>
                  <select className="input-field shadow-sm" value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})}>
                    <option value="Both">Both Water & Plates</option>
                    <option value="Water">Water Only</option>
                    <option value="Plates">Plates Only</option>
                  </select>
                </div>
              </div>
              
              {editingId && (
                <div className="mt-6 pt-6 border-t border-slate-200/60">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Manual Adjustments</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100 shadow-inner">
                    <div>
                      <label className="label-field text-orange-900">Current Balance (நிலுவைத் தொகை)</label>
                      <input type="number" className="input-field border-orange-200 focus:ring-orange-500 shadow-sm" value={formData.balance} onChange={e => setFormData({...formData, balance: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="label-field text-orange-900">Pending Empty Cans (காலி கேன்கள்)</label>
                      <input type="number" className="input-field border-orange-200 focus:ring-orange-500 shadow-sm" value={formData.pendingEmptyCans} onChange={e => setFormData({...formData, pendingEmptyCans: Number(e.target.value)})} />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1 py-3">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-3 shadow-lg shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-blue-600 text-sm sm:text-base">{editingId ? 'Update (புதுப்பி)' : 'Save (சேமி)'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
