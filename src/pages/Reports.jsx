import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Share2, AlertCircle, IndianRupee, TrendingUp, Truck, Package } from 'lucide-react';

const Reports = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get('/customers'),
          api.get('/dashboard/stats')
        ]);
        setCustomers(cRes.data);
        setStats(sRes.data);
      } catch (error) {
        console.error('Error fetching report data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendReport = () => {
    if (!stats || customers.length === 0) return;

    let text = `*Daily Business Report*\n\n`;
    text += `*Overview:*\n`;
    text += `Deliveries Today: ${stats.todayDeliveriesCount}\n`;
    text += `Income Today: ₹${stats.todayIncome.toLocaleString()}\n`;
    text += `Total Pending Payments: ₹${stats.pendingPaymentsTotal.toLocaleString()}\n\n`;

    text += `*20L Cans Inventory:*\n`;
    text += `Total Stock: 170\n`;
    text += `With Customers: ${stats.totalMissingCans}\n`;
    text += `In Stock Now: ${170 - stats.totalMissingCans}\n\n`;

    const customersWithDues = customers.filter(c => c.balance > 0);
    if (customersWithDues.length > 0) {
      text += `*Pending Amounts:*\n`;
      customersWithDues.forEach(c => {
        text += `- ${c.name}: ₹${c.balance.toLocaleString()}\n`;
      });
      text += `\n`;
    }

    const customersWithCans = customers.filter(c => c.pendingEmptyCans > 0);
    if (customersWithCans.length > 0) {
      text += `*Empty Cans to Collect:*\n`;
      customersWithCans.forEach(c => {
        text += `- ${c.name}: ${c.pendingEmptyCans} cans\n`;
      });
    }

    const url = `https://wa.me/919677540740?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading amazing data...</div>;

  const customersWithDues = customers.filter(c => c.balance > 0);
  const customersWithCans = customers.filter(c => c.pendingEmptyCans > 0);

  const StatCard = ({ title, value, icon: Icon, gradientClass, textColor }) => (
    <div className={`card bg-gradient-to-br ${gradientClass} border-none overflow-hidden relative group p-5`}>
      <div className="absolute top-0 right-0 p-3 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
        <Icon className={`h-16 w-16 ${textColor}`} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{title}</p>
        </div>
        <h3 className={`text-3xl font-black ${textColor}`}>
          {value}
        </h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Business Reports</h2>
          <p className="text-slate-500 mt-1">Daily summaries and inventory tracking</p>
        </div>
        <button onClick={handleSendReport} className="btn-primary flex items-center w-full sm:w-auto justify-center bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-teal-500/30">
          <Share2 className="h-5 w-5 mr-2" /> Share Daily Report
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Today's Income"
            value={`₹${stats.todayIncome.toLocaleString()}`}
            icon={IndianRupee}
            gradientClass="from-emerald-400/10 to-teal-500/20"
            textColor="text-emerald-700"
          />
          <StatCard
            title="Today's Deliveries"
            value={stats.todayDeliveriesCount}
            icon={Truck}
            gradientClass="from-blue-500/10 to-indigo-600/20"
            textColor="text-blue-700"
          />
          <StatCard
            title="Total Pending Dues"
            value={`₹${stats.pendingPaymentsTotal.toLocaleString()}`}
            icon={IndianRupee}
            gradientClass="from-red-500/10 to-rose-600/20"
            textColor="text-red-700"
          />
          <StatCard
            title="Missing Cans"
            value={stats.totalMissingCans}
            icon={AlertCircle}
            gradientClass="from-orange-500/10 to-amber-600/20"
            textColor="text-orange-700"
          />
        </div>
      )}

      {/* Inventory Summary */}
      {stats && (
        <div className="card p-0 overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-200/40">
          <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-100 backdrop-blur-sm flex items-center">
            <Package className="h-6 w-6 text-indigo-500 mr-3" />
            <h3 className="font-bold text-slate-800 text-lg">20L Water Cans Inventory</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center bg-white/60">
            <div className="p-6 bg-gradient-to-b from-blue-50 to-white rounded-2xl border border-blue-100/50 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
                <Package className="w-24 h-24" />
              </div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Total Stock</p>
              <h4 className="text-5xl font-black text-blue-900 drop-shadow-sm">170</h4>
              <p className="text-xs font-medium text-blue-500 mt-2">Total 20L Cans Owned</p>
            </div>
            <div className="p-6 bg-gradient-to-b from-orange-50 to-white rounded-2xl border border-orange-100/50 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-24 h-24" />
              </div>
              <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">With Customers</p>
              <h4 className="text-5xl font-black text-orange-900 drop-shadow-sm">{stats.totalMissingCans}</h4>
              <p className="text-xs font-medium text-orange-500 mt-2">Pending Collection</p>
            </div>
            <div className="p-6 bg-gradient-to-b from-emerald-50 to-white rounded-2xl border border-emerald-100/50 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
                <Truck className="w-24 h-24" />
              </div>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">In Stock Now</p>
              <h4 className="text-5xl font-black text-emerald-900 drop-shadow-sm">{170 - stats.totalMissingCans}</h4>
              <p className="text-xs font-medium text-emerald-500 mt-2">Ready for Delivery</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Amounts List */}
        <div className="card p-0 overflow-hidden border border-slate-200/60 shadow-lg shadow-slate-200/30 h-fit">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center bg-slate-50/80 backdrop-blur-sm">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <IndianRupee className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-bold text-slate-800">Pending Amounts</h3>
          </div>
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto bg-white/60 p-2">
            {customersWithDues.length === 0 ? (
              <p className="p-8 text-center text-slate-400 font-medium">No pending amounts. Great job!</p>
            ) : (
              customersWithDues.map(c => (
                <div key={c._id} className="p-4 flex justify-between items-center hover:bg-slate-50 rounded-xl transition-colors m-1">
                  <div>
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{c.phone}</p>
                  </div>
                  <div className="px-3 py-1 bg-red-50 text-red-700 font-black rounded-lg border border-red-100">
                    ₹{c.balance.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Empty Cans List */}
        <div className="card p-0 overflow-hidden border border-slate-200/60 shadow-lg shadow-slate-200/30 h-fit">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center bg-slate-50/80 backdrop-blur-sm">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-slate-800">Empty Cans to Collect</h3>
          </div>
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto bg-white/60 p-2">
            {customersWithCans.length === 0 ? (
              <p className="p-8 text-center text-slate-400 font-medium">No empty cans to collect.</p>
            ) : (
              customersWithCans.map(c => (
                <div key={c._id} className="p-4 flex justify-between items-center hover:bg-slate-50 rounded-xl transition-colors m-1">
                  <div>
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{c.phone}</p>
                  </div>
                  <div className="px-3 py-1 bg-orange-100 text-orange-800 font-black rounded-lg border border-orange-200 shadow-sm">
                    {c.pendingEmptyCans} Cans
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
