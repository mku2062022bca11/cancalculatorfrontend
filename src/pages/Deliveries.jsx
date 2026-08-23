import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash2, Search, Edit, Truck, Package, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const PRODUCTS = [
  { id: 'water-20l', name: '20L Water Can', type: 'Water', hasEmpty: true },
  { id: 'water-5l', name: '5L Water Can', type: 'Water', hasEmpty: false },
  { id: 'water-2l', name: '2L Water Bottle', type: 'Water', hasEmpty: false },
  { id: 'water-1l', name: '1L Water Bottle', type: 'Water', hasEmpty: false },
  { id: 'water-500ml', name: '500ml Water Bottle', type: 'Water', hasEmpty: false },
  { id: 'water-300ml', name: '300ml Water Bottle', type: 'Water', hasEmpty: false },
  { id: 'plate-8', name: '8-inch Areca Plate', type: 'Plates', hasEmpty: false },
  { id: 'plate-10', name: '10-inch Areca Plate', type: 'Plates', hasEmpty: false },
  { id: 'plate-12', name: '12-inch Areca Plate', type: 'Plates', hasEmpty: false },
];

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [customerId, setCustomerId] = useState('');
  const [deliveryType, setDeliveryType] = useState('Both');
  const [items, setItems] = useState([{ itemType: '20L Water Can', quantity: 1, rate: 0, total: 0 }]);
  const [emptyCansCollected, setEmptyCansCollected] = useState(0);
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      const [dRes, cRes] = await Promise.all([
        api.get('/deliveries'),
        api.get('/customers')
      ]);
      setDeliveries(dRes.data);
      setCustomers(cRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const calculateTotal = (item) => item.quantity * item.rate;

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      newItems[index].total = newItems[index].quantity * newItems[index].rate;
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { itemType: '20L Water Can', quantity: 1, rate: 0, total: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customerId,
        deliveryType,
        items,
        emptyCansCollected: Number(emptyCansCollected),
        totalAmount,
        notes
      };
      await api.post('/deliveries', payload);
      setIsModalOpen(false);
      setItems([{ itemType: '20L Water Can', quantity: 1, rate: 0, total: 0 }]);
      setEmptyCansCollected(0);
      setCustomerId('');
      fetchData();
    } catch (error) {
      console.error('Error saving delivery', error);
      alert('Failed to save delivery.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/deliveries/${editingDelivery._id}`, {
        emptyCansCollected: Number(editingDelivery.emptyCansCollected),
        status: editingDelivery.status,
        notes: editingDelivery.notes
      });
      setIsEditModalOpen(false);
      setEditingDelivery(null);
      fetchData();
    } catch (error) {
      console.error('Error updating delivery', error);
      alert('Failed to update delivery.');
    }
  };

  const openEditModal = (delivery) => {
    setEditingDelivery({ ...delivery });
    setIsEditModalOpen(true);
  };

  const selectedCustomer = customers.find(c => c._id === customerId);
  const has20L = items.some(item => item.itemType === '20L Water Can' || item.itemType === '20L Water');

  const filteredDeliveries = deliveries.filter(d => 
    d.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    format(new Date(d.date), 'dd MMM yyyy').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Deliveries</h2>
          <p className="text-slate-500 mt-1">Track daily orders and empty can collections</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center w-full sm:w-auto justify-center bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-indigo-500/30">
          <Plus className="h-5 w-5 mr-2" /> New Delivery
        </button>
      </div>

      <div className="card p-0 overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-100 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center text-slate-700 font-semibold">
            <Truck className="h-5 w-5 mr-2 text-indigo-500" />
            Recent Deliveries ({filteredDeliveries.length})
          </div>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by customer or date..." 
              className="input-field pl-10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 text-xs uppercase tracking-widest font-semibold bg-white/40">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items Details</th>
                <th className="px-6 py-4">Returned Cans</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white/60">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400 animate-pulse">Loading amazing data...</td></tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No deliveries found.</td></tr>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{format(new Date(delivery.date), 'dd MMM yyyy')}</div>
                      <div className="text-xs text-slate-400 font-medium">{format(new Date(delivery.date), 'p')}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-base">{delivery.customerId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {delivery.items.map((item, i) => (
                          <div key={i} className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded inline-block mr-1 mb-1">
                            {item.quantity}x {item.itemType}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {delivery.items.some(i => i.itemType === '20L Water Can' || i.itemType === '20L Water') ? 
                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-50 border border-orange-100 text-orange-700 font-black shadow-sm">
                          {delivery.emptyCansCollected} Cans
                        </div> : 
                        <span className="text-slate-300 font-medium">-</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-800">₹{delivery.totalAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${
                          delivery.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 
                          delivery.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {delivery.status}
                        </span>
                        <button onClick={() => openEditModal(delivery)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-60 group-hover:opacity-100">
                          <Edit className="h-4 w-4" />
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

      {/* Add Delivery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-3xl my-8 transform transition-all scale-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10 rounded-t-3xl">
              <div className="flex items-center text-slate-800">
                <Package className="w-5 h-5 mr-2 text-indigo-500" />
                <h3 className="text-xl font-bold">New Delivery Entry</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-full hover:bg-slate-100">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <label className="label-field text-sm font-bold text-slate-700">Select Customer</label>
                  <select required className="input-field shadow-sm bg-white" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                  </select>
                  {selectedCustomer && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100/60 rounded-xl shadow-inner">
                      <p className="text-sm font-bold text-orange-900 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 text-orange-600" />
                        Pending Empty Cans to Collect: {selectedCustomer.pendingEmptyCans}
                      </p>
                      <p className="text-xs text-orange-700 mt-1 font-medium">
                        (வாடிக்கையாளரிடம் இருந்து பெற வேண்டிய பழைய காலி கேன்கள்: {selectedCustomer.pendingEmptyCans})
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <label className="label-field text-sm font-bold text-slate-700">Delivery Type</label>
                  <select className="input-field shadow-sm bg-white" value={deliveryType} onChange={e => setDeliveryType(e.target.value)}>
                    <option value="Both">Both Water & Plates</option>
                    <option value="Water">Water Only</option>
                    <option value="Plates">Plates Only</option>
                  </select>
                </div>
              </div>

              <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-indigo-100/50 pb-3">
                  <label className="label-field mb-0 text-indigo-900 font-bold">Items Details</label>
                  <button type="button" onClick={addItem} className="text-sm text-indigo-600 font-bold hover:text-indigo-800 flex items-center bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm transition-all hover:shadow">
                    <Plus className="h-4 w-4 mr-1" /> Add Product
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm group">
                      <div className="flex-1 min-w-[200px]">
                        <select 
                          className="input-field py-2 text-sm font-semibold text-slate-700" 
                          value={item.itemType}
                          onChange={e => handleItemChange(index, 'itemType', e.target.value)}
                        >
                          {PRODUCTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="w-24">
                        <div className="relative">
                          <span className="absolute text-xs text-slate-400 -top-2 left-2 bg-white px-1">Qty</span>
                          <input 
                            type="number" min="1" className="input-field py-2 text-center font-bold text-slate-800"
                            value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="w-28">
                        <div className="relative">
                          <span className="absolute text-xs text-slate-400 -top-2 left-2 bg-white px-1">Rate ₹</span>
                          <input 
                            type="number" min="0" className="input-field py-2 font-bold text-slate-800"
                            value={item.rate || ''} onChange={e => handleItemChange(index, 'rate', Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="w-28 flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                        <span className="font-black text-indigo-900">₹{item.total.toLocaleString()}</span>
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {has20L && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-5">
                    <Truck className="w-32 h-32" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <label className="label-field text-blue-900 text-lg font-black tracking-tight flex items-center">
                      <Truck className="w-5 h-5 mr-2 text-blue-600" />
                      Return Empty Cans (காலி கேன்கள்)
                    </label>
                    <p className="text-sm text-blue-800 mb-3 font-medium bg-white/50 inline-block px-3 py-1 rounded-md border border-white">How many empty cans did the customer return today? <span className="block mt-0.5 text-xs text-blue-600">(இன்று வாடிக்கையாளர் திருப்பி அளித்த காலி கேன்கள்)</span></p>
                    <div className="flex items-center">
                      <input 
                        type="number" min="0" className="input-field w-32 border-blue-200 focus:ring-blue-500 font-bold text-xl text-center shadow-sm"
                        value={emptyCansCollected} onChange={e => setEmptyCansCollected(e.target.value)}
                      />
                      <span className="ml-3 font-bold text-blue-800">Cans</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl text-white">
                <span className="font-semibold text-slate-300 uppercase tracking-widest text-sm">Grand Total Amount</span>
                <span className="text-4xl font-black tracking-tight text-emerald-400">₹{totalAmount.toLocaleString()}</span>
              </div>

              <div className="pt-4 flex gap-4 sticky bottom-0 bg-white/90 backdrop-blur py-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1 py-3.5 font-bold text-slate-600 border-slate-300">Cancel Entry</button>
                <button type="submit" disabled={!customerId || totalAmount === 0} className="btn-primary flex-1 py-3.5 shadow-lg shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-blue-600 disabled:opacity-50 text-lg">
                  Confirm Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Delivery Modal */}
      {isEditModalOpen && editingDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-xl font-bold text-slate-800">Edit Delivery Status</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-full hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-inner">
                <p className="text-sm font-bold text-indigo-900 mb-1">Customer: <span className="text-slate-800">{editingDelivery.customerId?.name}</span></p>
                <p className="text-xs text-indigo-700/80 font-medium">Date: {format(new Date(editingDelivery.date), 'dd MMM yyyy, p')}</p>
                <p className="text-xs text-indigo-700/80 font-medium mt-1">Total Items: {editingDelivery.items.reduce((sum, i) => sum + i.quantity, 0)}</p>
                <div className="mt-3 pt-3 border-t border-indigo-100 flex justify-between">
                  <span className="text-sm font-bold text-indigo-900">Total Amount</span>
                  <span className="text-sm font-black text-emerald-600">₹{editingDelivery.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 shadow-sm">
                <label className="label-field text-orange-900">Modify Empty 20L Cans Collected</label>
                <input 
                  type="number" min="0" className="input-field border-orange-200 focus:ring-orange-500 font-bold"
                  value={editingDelivery.emptyCansCollected} 
                  onChange={e => setEditingDelivery({...editingDelivery, emptyCansCollected: e.target.value})}
                />
              </div>

              <div>
                <label className="label-field">Delivery Status</label>
                <select 
                  className="input-field shadow-sm font-semibold"
                  value={editingDelivery.status}
                  onChange={e => setEditingDelivery({...editingDelivery, status: e.target.value})}
                >
                  <option value="Delivered">✅ Delivered Successfully</option>
                  <option value="Pending">⏳ Pending Delivery</option>
                  <option value="Cancelled">❌ Cancelled</option>
                </select>
              </div>

              <div>
                <label className="label-field">Admin Notes</label>
                <textarea 
                  className="input-field shadow-sm" rows="2" placeholder="Any issues or comments..."
                  value={editingDelivery.notes || ''}
                  onChange={e => setEditingDelivery({...editingDelivery, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-outline flex-1 py-3">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-3 shadow-lg shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-blue-600">Update Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
