import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Share2, 
  IndianRupee, 
  Search, 
  Fuel, 
  Droplets, 
  Utensils, 
  Wrench, 
  Users, 
  Zap, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Wallet,
  ArrowRight,
  Sparkles,
  PieChart,
  BarChart3,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  { id: 'Fuel', name: 'Fuel / Diesel', tamil: 'வாகன எரிபொருள் / டீசல்', icon: Fuel, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'Water Refill', name: 'Water Refill', tamil: 'கேன்கள் ரீஃபில் செலவு', icon: Droplets, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'Plates/Materials', name: 'Plates / Raw Materials', tamil: 'தட்டுகள் / பாக்கிங் பொருட்கள்', icon: Utensils, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Vehicle Maintenance', name: 'Vehicle Service & Repair', tamil: 'வண்டி சர்வீஸ் / பழுது', icon: Wrench, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'Salary/Bata', name: 'Salary & Driver Bata', tamil: 'ஓட்டுநர் / தொழிலாளர் சம்பளம்', icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'Electricity/Bills', name: 'Electricity & Shop Rent', tamil: 'மின்சாரம் / வாடகை / பில்கள்', icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { id: 'Other', name: 'Other Expenses', tamil: 'இதர செலவுகள்', icon: Package, color: 'text-slate-600 bg-slate-50 border-slate-200' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const LOCAL_STORAGE_KEY = 'ss_water_expenses_cache';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profit Calculator View Mode: 'month', 'year', 'today', 'all'
  const [profitViewMode, setProfitViewMode] = useState('month');
  
  // Selected Month and Year for custom inspection
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  // Filter States for Transaction List
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('month'); // 'today', 'month', 'all'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Fuel',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMode: 'Cash',
    notes: ''
  });

  // Fetch initial data
  const fetchData = async () => {
    let loadedExpenses = [];
    let loadedPayments = [];

    // 1. Fetch Expenses
    try {
      const expRes = await api.get('/expenses');
      if (Array.isArray(expRes.data)) {
        loadedExpenses = expRes.data;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loadedExpenses));
      }
    } catch (err) {
      console.warn('API expense fetch failed, using local storage cache:', err.message);
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        try {
          loadedExpenses = JSON.parse(cached);
        } catch (e) {
          console.error(e);
        }
      } else {
        loadedExpenses = [
          {
            _id: 'sample-1',
            title: 'Diesel for Delivery Auto',
            category: 'Fuel',
            amount: 500,
            date: new Date().toISOString(),
            paymentMode: 'UPI',
            notes: 'HP Petrol bunk'
          },
          {
            _id: 'sample-2',
            title: 'Water Plant 50 Cans Refill',
            category: 'Water Refill',
            amount: 750,
            date: new Date().toISOString(),
            paymentMode: 'Cash',
            notes: 'Refill batch 1'
          }
        ];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loadedExpenses));
      }
    }

    // 2. Fetch Payments to calculate exact Monthly and Yearly income
    try {
      const payRes = await api.get('/payments');
      if (Array.isArray(payRes.data)) {
        loadedPayments = payRes.data;
      }
    } catch (e) {
      console.warn('Could not fetch payments:', e.message);
    }

    setExpenses(loadedExpenses);
    setPayments(loadedPayments);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered expenses for Transactions Table
  const filteredExpenses = useMemo(() => {
    const curNow = new Date();
    const todayStr = format(curNow, 'yyyy-MM-dd');
    const currentMonth = curNow.getMonth();
    const currentYear = curNow.getFullYear();

    return expenses.filter(exp => {
      // Category filter
      if (selectedCategory !== 'All' && exp.category !== selectedCategory) {
        return false;
      }

      // Time filter
      if (timeFilter !== 'all') {
        const expDate = new Date(exp.date);
        const expDateStr = format(expDate, 'yyyy-MM-dd');

        if (timeFilter === 'today' && expDateStr !== todayStr) {
          return false;
        }

        if (timeFilter === 'month' && (expDate.getMonth() !== currentMonth || expDate.getFullYear() !== currentYear)) {
          return false;
        }
      }

      // Search keyword
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = exp.title?.toLowerCase().includes(term);
        const matchesCategory = exp.category?.toLowerCase().includes(term);
        const matchesNotes = exp.notes?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesCategory && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, selectedCategory, timeFilter, searchTerm]);

  // Comprehensive Financial Analytics (Today, Monthly, Yearly, Overall)
  const analytics = useMemo(() => {
    const curNow = new Date();
    const currentMonth = curNow.getMonth();
    const currentYear = curNow.getFullYear();
    const todayStr = format(curNow, 'yyyy-MM-dd');

    // 1. Calculate Income stats from payments
    let todayIncome = 0;
    let thisMonthIncome = 0;
    let thisYearIncome = 0;
    let totalIncome = 0;

    payments.forEach(p => {
      const amt = Number(p.amount) || 0;
      totalIncome += amt;
      const pDate = new Date(p.date);
      if (format(pDate, 'yyyy-MM-dd') === todayStr) {
        todayIncome += amt;
      }
      if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
        thisMonthIncome += amt;
      }
      if (pDate.getFullYear() === currentYear) {
        thisYearIncome += amt;
      }
    });

    // 2. Calculate Expense stats
    let todayExpense = 0;
    let thisMonthExpense = 0;
    let thisYearExpense = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    expenses.forEach(exp => {
      const amt = Number(exp.amount) || 0;
      totalExpense += amt;
      const expDate = new Date(exp.date);

      if (format(expDate, 'yyyy-MM-dd') === todayStr) {
        todayExpense += amt;
      }
      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        thisMonthExpense += amt;
      }
      if (expDate.getFullYear() === currentYear) {
        thisYearExpense += amt;
      }

      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amt;
    });

    // 3. Net Profits & Margins
    const todayNetProfit = todayIncome - todayExpense;
    const thisMonthNetProfit = thisMonthIncome - thisMonthExpense;
    const thisYearNetProfit = thisYearIncome - thisYearExpense;
    const totalNetProfit = totalIncome - totalExpense;

    const thisMonthMargin = thisMonthIncome > 0 ? ((thisMonthNetProfit / thisMonthIncome) * 100).toFixed(1) : 0;
    const thisYearMargin = thisYearIncome > 0 ? ((thisYearNetProfit / thisYearIncome) * 100).toFixed(1) : 0;
    const totalMargin = totalIncome > 0 ? ((totalNetProfit / totalIncome) * 100).toFixed(1) : 0;

    // 4. Custom Selected Month / Year Calculations
    let customMonthIncome = 0;
    let customMonthExpense = 0;

    payments.forEach(p => {
      const pDate = new Date(p.date);
      if (pDate.getMonth() === selectedMonth && pDate.getFullYear() === selectedYear) {
        customMonthIncome += Number(p.amount) || 0;
      }
    });

    expenses.forEach(e => {
      const eDate = new Date(e.date);
      if (eDate.getMonth() === selectedMonth && eDate.getFullYear() === selectedYear) {
        customMonthExpense += Number(e.amount) || 0;
      }
    });

    const customMonthNetProfit = customMonthIncome - customMonthExpense;
    const customMonthMargin = customMonthIncome > 0 ? ((customMonthNetProfit / customMonthIncome) * 100).toFixed(1) : 0;

    // 5. Custom Selected Year Calculations
    let customYearIncome = 0;
    let customYearExpense = 0;

    payments.forEach(p => {
      const pDate = new Date(p.date);
      if (pDate.getFullYear() === selectedYear) {
        customYearIncome += Number(p.amount) || 0;
      }
    });

    expenses.forEach(e => {
      const eDate = new Date(e.date);
      if (eDate.getFullYear() === selectedYear) {
        customYearExpense += Number(e.amount) || 0;
      }
    });

    const customYearNetProfit = customYearIncome - customYearExpense;
    const customYearMargin = customYearIncome > 0 ? ((customYearNetProfit / customYearIncome) * 100).toFixed(1) : 0;

    // 6. 12-Month Table Breakdown for the Selected Year
    const monthlyBreakdown = MONTH_NAMES.map((name, idx) => {
      let mIncome = 0;
      let mExpense = 0;

      payments.forEach(p => {
        const pDate = new Date(p.date);
        if (pDate.getMonth() === idx && pDate.getFullYear() === selectedYear) {
          mIncome += Number(p.amount) || 0;
        }
      });

      expenses.forEach(e => {
        const eDate = new Date(e.date);
        if (eDate.getMonth() === idx && eDate.getFullYear() === selectedYear) {
          mExpense += Number(e.amount) || 0;
        }
      });

      const mProfit = mIncome - mExpense;
      const mMargin = mIncome > 0 ? ((mProfit / mIncome) * 100).toFixed(1) : 0;

      return {
        monthIndex: idx,
        monthName: name,
        income: mIncome,
        expense: mExpense,
        profit: mProfit,
        margin: mMargin
      };
    });

    return {
      todayIncome,
      todayExpense,
      todayNetProfit,

      thisMonthIncome,
      thisMonthExpense,
      thisMonthNetProfit,
      thisMonthMargin,

      thisYearIncome,
      thisYearExpense,
      thisYearNetProfit,
      thisYearMargin,

      totalIncome,
      totalExpense,
      totalNetProfit,
      totalMargin,

      customMonthIncome,
      customMonthExpense,
      customMonthNetProfit,
      customMonthMargin,

      customYearIncome,
      customYearExpense,
      customYearNetProfit,
      customYearMargin,

      monthlyBreakdown,
      categoryTotals
    };
  }, [expenses, payments, selectedMonth, selectedYear]);

  // Filtered Total in transaction table
  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [filteredExpenses]);

  // Modal open helpers
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'Fuel',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMode: 'Cash',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setFormData({
      title: exp.title || '',
      category: exp.category || 'Fuel',
      amount: exp.amount || '',
      date: exp.date ? format(new Date(exp.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      paymentMode: exp.paymentMode || 'Cash',
      notes: exp.notes || ''
    });
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      alert('Please enter description and amount.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: formData.title,
      category: formData.category,
      amount: Number(formData.amount),
      date: new Date(formData.date).toISOString(),
      paymentMode: formData.paymentMode,
      notes: formData.notes
    };

    let updatedList = [...expenses];

    try {
      if (editingExpense) {
        try {
          const res = await api.put(`/expenses/${editingExpense._id}`, payload);
          updatedList = updatedList.map(item => item._id === editingExpense._id ? res.data : item);
        } catch {
          updatedList = updatedList.map(item => 
            item._id === editingExpense._id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item
          );
        }
      } else {
        try {
          const res = await api.post('/expenses', payload);
          updatedList = [res.data, ...updatedList];
        } catch {
          const newExp = {
            ...payload,
            _id: 'local-' + Date.now(),
            createdAt: new Date().toISOString()
          };
          updatedList = [newExp, ...updatedList];
        }
      }

      setExpenses(updatedList);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving expense:', err);
      alert('Could not save expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense entry? (இந்த செலவை நீக்க விரும்புகிறீர்களா?)')) {
      return;
    }

    try {
      try {
        await api.delete(`/expenses/${id}`);
      } catch (e) {
        console.warn('API delete failed, removing locally:', e.message);
      }
      const updatedList = expenses.filter(exp => exp._id !== id);
      setExpenses(updatedList);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (err) {
      console.error('Failed to delete expense', err);
    }
  };

  // Share WhatsApp Summary with Monthly & Yearly Profit
  const handleShareSummary = () => {
    const todayStr = format(new Date(), 'dd-MM-yyyy');
    let text = `*📊 SS Water & Plates - Profit & Expense Report*\n`;
    text += `*Date:* ${todayStr}\n\n`;
    
    text += `*🗓️ Monthly Profit (இந்த மாத லாபம் - ${MONTH_NAMES[now.getMonth()]}):*\n`;
    text += `• Collections (வருமானம்): ₹${analytics.thisMonthIncome.toLocaleString()}\n`;
    text += `• Expenses (செலவுகள்): ₹${analytics.thisMonthExpense.toLocaleString()}\n`;
    text += `• *Net Monthly Profit: ₹${analytics.thisMonthNetProfit.toLocaleString()}* (${analytics.thisMonthMargin}% Margin)\n\n`;

    text += `*📅 Yearly Profit (வருடாந்திர லாபம் - ${now.getFullYear()}):*\n`;
    text += `• Collections (வருமானம்): ₹${analytics.thisYearIncome.toLocaleString()}\n`;
    text += `• Expenses (செலவுகள்): ₹${analytics.thisYearExpense.toLocaleString()}\n`;
    text += `• *Net Yearly Profit: ₹${analytics.thisYearNetProfit.toLocaleString()}* (${analytics.thisYearMargin}% Margin)\n\n`;

    text += `*⚡ Today's Status (இன்றைய நிலை):*\n`;
    text += `• Today Income: ₹${analytics.todayIncome.toLocaleString()}\n`;
    text += `• Today Expense: ₹${analytics.todayExpense.toLocaleString()}\n`;
    text += `• Today Net Profit: ₹${analytics.todayNetProfit.toLocaleString()}\n\n`;

    text += `*🏷️ Top Spending Categories:*\n`;
    Object.entries(analytics.categoryTotals).forEach(([cat, amt]) => {
      text += `• ${cat}: ₹${Number(amt).toLocaleString()}\n`;
    });

    const url = `https://wa.me/919677540740?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const getCategoryMeta = (catId) => {
    return CATEGORIES.find(c => c.id === catId) || {
      id: catId,
      name: catId,
      tamil: 'செலவு',
      icon: Package,
      color: 'text-slate-600 bg-slate-50 border-slate-200'
    };
  };

  // Available years for dropdown
  const availableYears = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Monthly & Yearly Profit (மாத & வருட லாப கணக்கீடு)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              Profit Calculator
            </span>
          </div>
          <p className="text-slate-500 mt-1">
            Real-time monthly profit, yearly net gain, expense breakdown & collections comparison
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleShareSummary}
            className="btn-outline flex items-center justify-center flex-1 sm:flex-initial text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
            title="Share report on WhatsApp"
          >
            <Share2 className="h-4 w-4 mr-2 text-emerald-600" />
            Share Report
          </button>
          
          <button 
            onClick={handleOpenAdd} 
            className="btn-danger flex items-center justify-center flex-1 sm:flex-initial shadow-lg shadow-rose-500/20"
          >
            <Plus className="h-5 w-5 mr-1.5" />
            Add Expense (செலவு சேர்க்க)
          </button>
        </div>
      </div>

      {/* Primary Profit Cards: Monthly & Yearly Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Monthly Profit (மாதாந்திர லாபம்) */}
        <div className={`card bg-gradient-to-br ${analytics.thisMonthNetProfit >= 0 ? 'from-emerald-500/10 via-teal-500/15 to-emerald-600/20 border-emerald-300' : 'from-rose-500/10 via-red-500/15 to-rose-600/20 border-rose-300'} relative overflow-hidden group shadow-lg`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Calendar className="h-24 w-24 text-emerald-700" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className={`text-xs font-black uppercase tracking-wider ${analytics.thisMonthNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                Monthly Profit (இந்த மாத லாபம்)
              </p>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${analytics.thisMonthNetProfit >= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                {analytics.thisMonthMargin}% Margin
              </span>
            </div>
            <h3 className={`text-3xl sm:text-4xl font-black ${analytics.thisMonthNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              ₹{analytics.thisMonthNetProfit.toLocaleString()}
            </h3>
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex justify-between text-xs text-slate-600 font-medium">
              <span>Income: <strong className="text-emerald-700">₹{analytics.thisMonthIncome.toLocaleString()}</strong></span>
              <span>Expense: <strong className="text-rose-700">₹{analytics.thisMonthExpense.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* 2. Yearly Profit (வருடாந்திர லாபம்) */}
        <div className={`card bg-gradient-to-br ${analytics.thisYearNetProfit >= 0 ? 'from-indigo-500/10 via-blue-500/15 to-indigo-600/20 border-indigo-300' : 'from-rose-500/10 via-red-500/15 to-rose-600/20 border-rose-300'} relative overflow-hidden group shadow-lg`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-24 w-24 text-indigo-700" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className={`text-xs font-black uppercase tracking-wider ${analytics.thisYearNetProfit >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
                Yearly Profit (வருட லாபம் - {now.getFullYear()})
              </p>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${analytics.thisYearNetProfit >= 0 ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                {analytics.thisYearMargin}% Margin
              </span>
            </div>
            <h3 className={`text-3xl sm:text-4xl font-black ${analytics.thisYearNetProfit >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
              ₹{analytics.thisYearNetProfit.toLocaleString()}
            </h3>
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex justify-between text-xs text-slate-600 font-medium">
              <span>Income: <strong className="text-indigo-700">₹{analytics.thisYearIncome.toLocaleString()}</strong></span>
              <span>Expense: <strong className="text-rose-700">₹{analytics.thisYearExpense.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* 3. Today's Profit (இன்றைய லாபம்) */}
        <div className="card bg-gradient-to-br from-teal-500/10 to-cyan-600/15 border-teal-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Sparkles className="h-24 w-24 text-teal-700" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
              Today's Net Profit <span className="text-[10px] opacity-80">(இன்றைய லாபம்)</span>
            </p>
            <h3 className="text-3xl font-black text-teal-800">
              ₹{analytics.todayNetProfit.toLocaleString()}
            </h3>
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex justify-between text-xs text-slate-600 font-medium">
              <span>Income: <strong className="text-teal-700">₹{analytics.todayIncome.toLocaleString()}</strong></span>
              <span>Expense: <strong className="text-rose-700">₹{analytics.todayExpense.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* 4. This Month's Expenses (இந்த மாத செலவுகள்) */}
        <div className="card bg-gradient-to-br from-rose-500/10 to-red-600/15 border-rose-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Fuel className="h-24 w-24 text-rose-700" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
              This Month Expenses <span className="text-[10px] opacity-80">(மாத செலவுகள்)</span>
            </p>
            <h3 className="text-3xl font-black text-rose-700">
              ₹{analytics.thisMonthExpense.toLocaleString()}
            </h3>
            <p className="text-xs text-rose-500 font-medium mt-3 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" /> Diesel, plant refills, maintenance, labor
            </p>
          </div>
        </div>

      </div>

      {/* Dedicated Interactive Monthly / Yearly Profit Calculator */}
      <div className="card bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <BarChart3 className="w-80 h-80 text-indigo-400" />
        </div>

        <div className="relative z-10 space-y-6">
          
          {/* Controls: Mode Switcher & Date Pickers */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Advanced Profit Analyzer
              </span>
              <h3 className="text-2xl font-black text-white">
                {profitViewMode === 'month' && `Monthly Profit Calculator (${MONTH_NAMES[selectedMonth]} ${selectedYear})`}
                {profitViewMode === 'year' && `Yearly Profit Calculator (${selectedYear} Full Year)`}
                {profitViewMode === 'today' && `Today's Profit Calculator (${format(now, 'dd MMMM yyyy')})`}
                {profitViewMode === 'all' && `All-Time Business Profit (மொத்த வாழ்நாள் லாபம்)`}
              </h3>
            </div>

            {/* View Mode Switcher Pills */}
            <div className="flex items-center gap-2 flex-wrap bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setProfitViewMode('month')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  profitViewMode === 'month' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Monthly (மாதம்)
              </button>
              <button
                onClick={() => setProfitViewMode('year')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  profitViewMode === 'year' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Yearly (வருடம்)
              </button>
              <button
                onClick={() => setProfitViewMode('today')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  profitViewMode === 'today' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Today (இன்று)
              </button>
              <button
                onClick={() => setProfitViewMode('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  profitViewMode === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                All-Time (மொத்தம்)
              </button>
            </div>
          </div>

          {/* Month / Year Selector dropdowns if viewing month or year */}
          {(profitViewMode === 'month' || profitViewMode === 'year') && (
            <div className="flex items-center gap-4 flex-wrap bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-xs font-bold text-indigo-300 uppercase flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> Select Period:
              </span>

              {profitViewMode === 'month' && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-300 font-medium">Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(Number(e.target.value))}
                    className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={name} value={i}>{name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">Year:</label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Dynamic 3-Box Calculator */}
          {(() => {
            let activeIncome = 0;
            let activeExpense = 0;
            let activeProfit = 0;
            let activeMargin = 0;
            let periodLabel = '';

            if (profitViewMode === 'month') {
              activeIncome = analytics.customMonthIncome;
              activeExpense = analytics.customMonthExpense;
              activeProfit = analytics.customMonthNetProfit;
              activeMargin = analytics.customMonthMargin;
              periodLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
            } else if (profitViewMode === 'year') {
              activeIncome = analytics.customYearIncome;
              activeExpense = analytics.customYearExpense;
              activeProfit = analytics.customYearNetProfit;
              activeMargin = analytics.customYearMargin;
              periodLabel = `${selectedYear} Full Year`;
            } else if (profitViewMode === 'today') {
              activeIncome = analytics.todayIncome;
              activeExpense = analytics.todayExpense;
              activeProfit = analytics.todayNetProfit;
              activeMargin = activeIncome > 0 ? ((activeProfit / activeIncome) * 100).toFixed(1) : 0;
              periodLabel = 'Today';
            } else {
              activeIncome = analytics.totalIncome;
              activeExpense = analytics.totalExpense;
              activeProfit = analytics.totalNetProfit;
              activeMargin = analytics.totalMargin;
              periodLabel = 'All-Time Lifetime';
            }

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Collections */}
                  <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-colors">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                      1. {periodLabel} Income (வருமானம்)
                    </span>
                    <div className="text-3xl font-black text-emerald-300">
                      ₹{activeIncome.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Water can deliveries & plates customer collections</p>
                  </div>

                  {/* Expenses */}
                  <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-rose-500/40 transition-colors">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
                      2. {periodLabel} Expenses (செலவுகள்)
                    </span>
                    <div className="text-3xl font-black text-rose-300">
                      ₹{activeExpense.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Fuel, refill purchases, maintenance & wages</p>
                  </div>

                  {/* Net Profit */}
                  <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-colors">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                      3. {periodLabel} Net Profit (நிகர லாபம்)
                    </span>
                    <div className={`text-3xl font-black ${activeProfit >= 0 ? 'text-indigo-200' : 'text-rose-400'}`}>
                      {activeProfit >= 0 ? '+' : ''}₹{activeProfit.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Profit Margin: <strong className={activeProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{activeMargin}%</strong>
                    </p>
                  </div>

                </div>

                {/* Progress bar visual */}
                {activeIncome > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-300 font-semibold">
                      <span>Expenses: {((activeExpense / activeIncome) * 100).toFixed(1)}%</span>
                      <span>Net Profit Kept: {activeMargin}%</span>
                    </div>
                    <div className="h-3.5 bg-white/10 rounded-full overflow-hidden flex shadow-inner">
                      <div 
                        className="bg-rose-500 h-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (activeExpense / activeIncome) * 100)}%` }}
                        title="Expenses"
                      />
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500 flex-1" 
                        title="Profit"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      </div>

      {/* 12-Month Profit Breakdown Table for the Selected Year */}
      <div className="card p-0 overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-200/40">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Monthly Profit Breakdown for Year {selectedYear} (மாதாந்திர லாப அட்டவணை)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Month-by-month income, expense, and net profit history</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
            Year {selectedYear} Total: ₹{analytics.customYearNetProfit.toLocaleString()} Profit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 text-xs uppercase tracking-widest font-semibold bg-white/40">
                <th className="px-6 py-3.5">Month (மாதம்)</th>
                <th className="px-6 py-3.5">Collections (வருமானம்)</th>
                <th className="px-6 py-3.5">Expenses (செலவுகள்)</th>
                <th className="px-6 py-3.5">Net Profit (நிகர லாபம்)</th>
                <th className="px-6 py-3.5">Margin %</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white/60">
              {analytics.monthlyBreakdown.map((row) => {
                const isCurrent = row.monthIndex === now.getMonth() && selectedYear === now.getFullYear();
                const hasActivity = row.income > 0 || row.expense > 0;

                return (
                  <tr 
                    key={row.monthIndex} 
                    className={`transition-colors ${isCurrent ? 'bg-indigo-50/40 font-semibold' : 'hover:bg-slate-50/80'}`}
                  >
                    <td className="px-6 py-3.5 text-sm text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{row.monthName}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-600 text-white rounded-md">
                            Current
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-3.5 text-sm font-bold text-emerald-700">
                      ₹{row.income.toLocaleString()}
                    </td>

                    <td className="px-6 py-3.5 text-sm font-bold text-rose-700">
                      ₹{row.expense.toLocaleString()}
                    </td>

                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${
                        row.profit >= 0 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {row.profit >= 0 ? '+' : ''}₹{row.profit.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-xs font-semibold text-slate-600">
                      {hasActivity ? `${row.margin}%` : '-'}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      {!hasActivity ? (
                        <span className="text-xs text-slate-400">No data</span>
                      ) : row.profit >= 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <TrendingUp className="h-3.5 w-3.5" /> Profit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                          <TrendingDown className="h-3.5 w-3.5" /> Loss
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-indigo-600" />
            Spending by Category (வகை வாரியாக செலவுகள்)
          </h3>
          <span className="text-xs font-medium text-slate-500">
            Click any category to filter list below
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const catAmount = analytics.categoryTotals[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'All' : cat.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected 
                    ? 'ring-2 ring-indigo-500 bg-indigo-50/80 border-indigo-200 shadow-md transform -translate-y-0.5' 
                    : 'bg-white/80 hover:bg-slate-50 border-slate-200/80 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2 w-full">
                  <div className={`p-2 rounded-xl border ${cat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 truncate" title={cat.name}>
                    {cat.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mb-1">
                    {cat.tamil}
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    ₹{catAmount.toLocaleString()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transactions & Filter Table */}
      <div className="card p-0 overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-200/40">
        
        {/* Controls Toolbar */}
        <div className="bg-slate-50/70 p-4 border-b border-slate-100 backdrop-blur-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase mr-1">Time:</span>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeFilter === 'month' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              This Month (இந்த மாதம்)
            </button>
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeFilter === 'today' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Today (இன்று)
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Time
            </button>

            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1"
              >
                Category: {selectedCategory} ✕
              </button>
            )}
          </div>

          {/* Search Bar & Sum */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search expense details..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-black shrink-0">
              Sum: ₹{filteredTotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 text-xs uppercase tracking-widest font-semibold bg-white/40">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Expense Details (விவரம்)</th>
                <th className="px-6 py-4">Category (வகை)</th>
                <th className="px-6 py-4">Payment Mode</th>
                <th className="px-6 py-4">Amount (₹)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 animate-pulse">
                    Loading expenses data...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No expense records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const cat = getCategoryMeta(exp.category);
                  const Icon = cat.icon;

                  return (
                    <tr key={exp._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                        {format(new Date(exp.date), 'MMM dd, yyyy')}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {format(new Date(exp.date), 'hh:mm a')}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {exp.title}
                        </p>
                        {exp.notes && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                            {exp.notes}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${cat.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {cat.name}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {exp.paymentMode || 'Cash'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 font-black shadow-sm text-base">
                          ₹{Number(exp.amount).toLocaleString()}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Expense"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Expense"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg overflow-hidden transform transition-all scale-100">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingExpense ? 'Edit Expense (செலவை மாற்று)' : 'Add New Expense (செலவு பதிவு)'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record daily business expenses for automated calculations
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Category Quick Selector */}
              <div>
                <label className="label-field">Category (செலவு வகை)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = formData.category === cat.id;

                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' 
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="label-field">Expense Title / Description (செலவு விவரம்)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diesel for delivery van, 100 cans refill, Driver bata"
                  className="input-field shadow-sm"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Amount and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Amount (தொகை ₹)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <IndianRupee className="h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="0.00"
                      className="input-field pl-10 text-xl font-bold shadow-sm"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label-field">Date (தேதி)</label>
                  <input
                    type="date"
                    required
                    className="input-field shadow-sm"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              {/* Payment Mode and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Payment Mode</label>
                  <select
                    className="input-field shadow-sm"
                    value={formData.paymentMode}
                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}
                  >
                    <option value="Cash">Cash (ரொக்கம்)</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Bank">Bank Transfer / Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label-field">Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Receipt No #42, Bunk name"
                    className="input-field shadow-sm"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline flex-1 py-3"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title || !formData.amount}
                  className="btn-danger flex-1 py-3 disabled:opacity-50 shadow-lg shadow-rose-500/30 flex items-center justify-center"
                >
                  {isSubmitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense (பதிவு செய்)'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Expenses;
