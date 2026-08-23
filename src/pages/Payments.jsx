import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, IndianRupee, Share2, Edit, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  
  // Form State
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/payments'),
        api.get('/customers')
      ]);
      setPayments(pRes.data);
      setCustomers(cRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        await api.put(`/payments/${editingPayment._id}`, { amount: Number(amount), method, notes });
      } else {
        await api.post('/payments', { customerId, amount: Number(amount), method, notes });
      }
      setIsModalOpen(false);
      setEditingPayment(null);
      setCustomerId('');
      setAmount('');
      setNotes('');
      fetchData(); // Refresh list and customer balances
    } catch (error) {
      console.error('Error recording payment', error);
      alert('Failed to record payment.');
    }
  };

  const openEditModal = (payment) => {
    setEditingPayment(payment);
    setCustomerId(payment.customerId._id);
    setAmount(payment.amount);
    setMethod(payment.method);
    setNotes(payment.notes || '');
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingPayment(null);
    setCustomerId('');
    setAmount('');
    setMethod('Cash');
    setNotes('');
    setIsModalOpen(true);
  };

  const selectedCustomer = customers.find(c => c._id === customerId);
  
  const handleShareReceipt = (payment) => {
    const customerName = payment.customerId?.name || 'Customer';
    const text = `*Payment Receipt*\nCustomer: ${customerName}\nAmount Paid: ₹${payment.amount}\nMethod: ${payment.method}\nDate: ${format(new Date(payment.date), 'dd MMM yyyy')}\nThank you!`;
    const url = `https://wa.me/919677540740?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Calculate Metrics
  const totalDue = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0); // Simplified total collected

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payments Hub</h2>
          <p className="text-slate-500 mt-1">Manage collections and track outstanding dues</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center w-full sm:w-auto justify-center">
          <Plus className="h-5 w-5 mr-2" /> Record Payment
        </button>
      </div>

      {/* Premium Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-red-500/10 to-rose-600/10 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-1">Total Outstanding Due</p>
              <h3 className="text-4xl font-black text-red-700">₹{totalDue.toLocaleString()}</h3>
              <p className="text-xs text-red-500 mt-2 font-medium">To collect from all customers</p>
            </div>
            <div className="p-4 bg-red-100 rounded-full shadow-inner">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-emerald-400/10 to-teal-500/10 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">Total Collected</p>
              <h3 className="text-4xl font-black text-emerald-700">₹{totalPaid.toLocaleString()}</h3>
              <p className="text-xs text-emerald-500 mt-2 font-medium">Across all recorded payments</p>
            </div>
            <div className="p-4 bg-emerald-100 rounded-full shadow-inner">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Sleek Data Table */}
      <div className="card p-0 overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 backdrop-blur-sm">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 text-xs uppercase tracking-widest font-semibold bg-white/40">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount (₹)</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white/60">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400 animate-pulse">Loading amazing data...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No payments found yet.</td></tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {format(new Date(payment.date), 'MMM dd, yyyy')}
                      <span className="block text-xs text-slate-400 font-normal">{format(new Date(payment.date), 'hh:mm a')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{payment.customerId?.name || 'Unknown'}</p>
                      {payment.notes && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[150px]">{payment.notes}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 font-black shadow-sm">
                        ₹{payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        <span className="text-xs font-bold text-emerald-700 uppercase">{payment.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(payment)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleShareReceipt(payment)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Share Receipt">
                          <Share2 className="h-4 w-4" />
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

      {/* Record/Edit Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden transform transition-all scale-100">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-xl font-bold text-slate-800">{editingPayment ? 'Edit Payment' : 'Record New Payment'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-full hover:bg-slate-100">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {!editingPayment && (
                <div>
                  <label className="label-field">Select Customer</label>
                  <select required className="input-field shadow-sm" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                  </select>
                </div>
              )}

              {editingPayment && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="text-sm font-medium text-slate-700">Editing Payment For: <span className="font-bold text-slate-900">{editingPayment.customerId?.name}</span></p>
                </div>
              )}

              {selectedCustomer && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <IndianRupee className="h-24 w-24" />
                  </div>
                  
                  <div className="flex justify-between items-center mb-3 relative z-10">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Current Due</span>
                    <span className={`text-lg font-black ${selectedCustomer.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      ₹{selectedCustomer.balance.toLocaleString()}
                    </span>
                  </div>
                  
                  {amount > 0 && (
                    <div className="space-y-3 relative z-10 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center text-sm bg-white/60 p-2 rounded-lg">
                        <span className="font-semibold text-slate-600">Amount Being Paid</span>
                        <span className="font-bold text-slate-900">- ₹{Number(amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200/60">
                        <span className="text-sm font-bold text-slate-700">Remaining Balance</span>
                        <span className={`text-xl font-black ${selectedCustomer.balance - Number(amount) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          ₹{(selectedCustomer.balance - Number(amount)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="label-field">Amount Paid (₹)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input required type="number" min="0" step="0.01" className="input-field pl-11 text-xl font-bold shadow-sm" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Payment Method</label>
                  <select className="input-field shadow-sm" value={method} onChange={e => setMethod(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="Credit">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Notes (Optional)</label>
                  <input type="text" className="input-field shadow-sm" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Paid by brother" />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1 py-3">Cancel</button>
                <button type="submit" disabled={!customerId || !amount} className="btn-secondary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30">
                  {editingPayment ? 'Update Payment' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
