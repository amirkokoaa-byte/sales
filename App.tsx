import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, 
  Plus, 
  Search, 
  Trash2, 
  ShoppingCart, 
  FileText, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Calculator,
  MessageCircle,
  X,
  Home
} from 'lucide-react';
import { Branch, Contact, Invoice, Order, Payment, Product, ViewState } from './types';
import { INITIAL_BRANCHES, PRODUCT_LIST } from './constants';

// --- Helper Functions ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const App: React.FC = () => {
  // --- State Management ---
  const [time, setTime] = useState(new Date());
  
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('softrose_branches');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('softrose_orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('softrose_invoices');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('softrose_contacts');
    return saved ? JSON.parse(saved) : [];
  });

  // UI State
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  
  // Modals
  const [activeModal, setActiveModal] = useState<'NONE' | 'ORDER' | 'INVOICE' | 'SALES' | 'CONTACTS'>('NONE');
  const [newBranchName, setNewBranchName] = useState('');

  // Persist Data
  useEffect(() => { localStorage.setItem('softrose_branches', JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem('softrose_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('softrose_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('softrose_contacts', JSON.stringify(contacts)); }, [contacts]);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedBranch = useMemo(() => 
    branches.find(b => b.id === selectedBranchId), 
  [branches, selectedBranchId]);

  // Handle Sidebar Responsive toggle
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // --- Handlers ---
  const handleAddBranch = () => {
    if (newBranchName.trim()) {
      setBranches([...branches, { id: generateId(), name: newBranchName, isCustom: true }]);
      setNewBranchName('');
    }
  };

  const handleOrderSubmit = (orderData: Omit<Order, 'id' | 'timestamp'>) => {
    const newOrder: Order = { ...orderData, id: generateId(), timestamp: Date.now() };
    setOrders([...orders, newOrder]);
    setActiveModal('NONE');
  };

  const handleInvoiceSubmit = (invoiceData: Omit<Invoice, 'id'>) => {
    setInvoices([...invoices, { ...invoiceData, id: generateId() }]);
    setActiveModal('NONE');
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
  };

  const handleAddContact = (contactData: Omit<Contact, 'id'>) => {
    setContacts([...contacts, { ...contactData, id: generateId() }]);
  };

  // --- Components ---

  const Header = () => (
    <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-lg p-3 md:p-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2 md:gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg md:text-2xl font-bold truncate">Softrose Sales</h1>
      </div>
      
      <div className="flex flex-col items-end text-[10px] md:text-sm bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
        <span className="font-bold text-yellow-300">
          {time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </span>
        <span className="text-gray-200 hidden xs:inline">
          {time.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </header>
  );

  const Sidebar = () => (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`fixed md:relative top-0 bottom-0 right-0 z-40 bg-white shadow-2xl md:shadow-none h-full transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0 w-72' : 'translate-x-full md:translate-x-0 md:w-0'} ${!isSidebarOpen && 'md:hidden'} flex flex-col border-l border-gray-200`}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h3 className="font-bold text-blue-900">القائمة</h3>
            <button onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6" /></button>
          </div>

          <button 
            onClick={() => {
              setCurrentView(ViewState.DASHBOARD);
              setSelectedBranchId(null);
              closeSidebarOnMobile();
            }}
            className="flex items-center gap-3 p-3 mb-2 rounded-lg hover:bg-gray-100 text-gray-700 font-bold"
          >
            <Home className="w-5 h-5 text-blue-600" /> الرئيسية
          </button>

          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-2">الفروع</h3>
          <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1">
            {branches.map(branch => (
              <button
                key={branch.id}
                onClick={() => {
                  setSelectedBranchId(branch.id);
                  setCurrentView(ViewState.BRANCH_DETAILS);
                  closeSidebarOnMobile();
                }}
                className={`text-right p-3 rounded-xl transition-all flex items-center justify-between group ${
                  selectedBranchId === branch.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <span className="font-medium truncate text-sm">{branch.name}</span>
                <ArrowRight className={`w-4 h-4 ${selectedBranchId === branch.id ? 'block' : 'hidden group-hover:block'}`} />
              </button>
            ))}
          </div>

          <button 
            onClick={() => {
              setCurrentView(ViewState.CONTACTS);
              setSelectedBranchId(null);
              closeSidebarOnMobile();
            }}
            className="mt-4 p-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all"
          >
            <Users className="w-5 h-5" />
            ارقام السلاسل
          </button>

          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="فرع جديد..."
                className="flex-1 border rounded-lg px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button onClick={handleAddBranch} className="bg-green-600 text-white p-2 rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );

  const GlobalDashboard = () => {
    const today = formatDate(new Date());
    const dailyOrders = orders.filter(o => o.date === today);
    const totalDailyValue = dailyOrders.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalInvoicesValue = invoices.reduce((acc, curr) => acc + curr.totalValue, 0);

    return (
      <div className="p-4 md:p-8 space-y-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">نظرة عامة</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="اوردارات اليوم" value={`${dailyOrders.length} طلب`} subValue={`${totalDailyValue.toLocaleString()} ج.م`} color="blue" />
          <StatCard title="إجمالي الفواتير" value={`${invoices.length} فاتورة`} subValue={`${totalInvoicesValue.toLocaleString()} ج.م`} color="purple" />
          <StatCard title="الفروع النشطة" value={`${branches.length} فرع`} color="green" />
          <StatCard title="جهات الاتصال" value={`${contacts.length} جهة`} color="orange" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6">
          <h3 className="font-bold text-gray-700 mb-4">أحدث العمليات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs md:text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">الفرع</th>
                  <th className="p-3">القيمة</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(-5).reverse().map(o => (
                  <tr key={o.id} className="border-b">
                    <td className="p-3">{o.date}</td>
                    <td className="p-3 font-medium">{branches.find(b => b.id === o.branchId)?.name || '...'}</td>
                    <td className="p-3 text-blue-600 font-bold">{o.totalValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const BranchDashboard = () => {
    if (!selectedBranch) return null;
    return (
      <div className="p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-black text-blue-900 mb-2">{selectedBranch.name}</h2>
            <p className="text-gray-500 text-sm">اختر العملية التي تريد القيام بها</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full max-w-5xl">
          <ActionButton 
            icon={<ShoppingCart className="w-8 h-8 md:w-10 md:h-10" />} 
            title="الاوردارات اليومية" 
            desc="تسجيل طلبات الصرف الجديدة"
            color="blue" 
            onClick={() => setActiveModal('ORDER')} 
          />
          <ActionButton 
            icon={<FileText className="w-8 h-8 md:w-10 md:h-10" />} 
            title="الفواتير والتحصيل" 
            desc="إدارة المستحقات والمدفوعات"
            color="purple" 
            onClick={() => setActiveModal('INVOICE')} 
          />
          <ActionButton 
            icon={<TrendingUp className="w-8 h-8 md:w-10 md:h-10" />} 
            title="كشف مبيعات" 
            desc="سجل العمليات الشهرية"
            color="teal" 
            onClick={() => setActiveModal('SALES')} 
          />
        </div>
      </div>
    );
  };

  // --- Sub-components for cleaner UI ---
  const StatCard = ({ title, value, subValue, color }: any) => {
    const colors: any = {
      blue: 'border-blue-500 text-blue-600',
      purple: 'border-purple-500 text-purple-600',
      green: 'border-green-500 text-green-600',
      orange: 'border-orange-500 text-orange-600',
    };
    return (
      <div className={`bg-white p-5 rounded-2xl shadow-sm border-r-4 ${colors[color]}`}>
        <div className="text-gray-400 text-xs font-bold mb-1">{title}</div>
        <div className="text-xl md:text-2xl font-black text-gray-800">{value}</div>
        {subValue && <div className="text-xs font-bold mt-1 opacity-80">{subValue}</div>}
      </div>
    );
  };

  const ActionButton = ({ icon, title, desc, color, onClick }: any) => {
    const colors: any = {
      blue: 'hover:bg-blue-50 border-blue-200 text-blue-600',
      purple: 'hover:bg-purple-50 border-purple-200 text-purple-600',
      teal: 'hover:bg-teal-50 border-teal-200 text-teal-600',
    };
    return (
      <button 
        onClick={onClick}
        className={`bg-white p-6 md:p-10 rounded-3xl border-2 shadow-sm flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95 ${colors[color]}`}
      >
        <div className="p-4 rounded-2xl bg-current bg-opacity-10">{icon}</div>
        <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-gray-800">{title}</div>
            <div className="text-xs text-gray-400 mt-1">{desc}</div>
        </div>
      </button>
    );
  };

  // --- Main Render ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Cairo']">
      <Header />
      
      <main className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 overflow-y-auto pb-16 relative">
          {currentView === ViewState.DASHBOARD && <GlobalDashboard />}
          {currentView === ViewState.BRANCH_DETAILS && <BranchDashboard />}
          {currentView === ViewState.CONTACTS && <ContactsView contacts={contacts} onAdd={handleAddContact} />}
          
          <footer className="absolute bottom-0 w-full text-center py-4 text-[10px] text-gray-400">
             Softrose Management System &copy; {new Date().getFullYear()} - Amir Lamay
          </footer>
        </div>
      </main>

      {/* Modals Logic */}
      {activeModal === 'ORDER' && selectedBranchId && <OrderModal branchId={selectedBranchId} onClose={() => setActiveModal('NONE')} onSave={handleOrderSubmit} />}
      {activeModal === 'INVOICE' && selectedBranchId && <InvoiceModal branchId={selectedBranchId} onClose={() => setActiveModal('NONE')} onSave={handleInvoiceSubmit} />}
      {activeModal === 'SALES' && selectedBranchId && <SalesModal branchId={selectedBranchId} invoices={invoices} onUpdate={handleUpdateInvoice} onClose={() => setActiveModal('NONE')} />}
    </div>
  );
};

// --- View: Contacts ---
const ContactsView = ({ contacts, onAdd }: any) => {
  const [form, setForm] = useState({ branchName: '', managerName: '', managerPhone: '', supervisorName: '' });
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-600" /> ارقام السلاسل
      </h2>
      <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
        <input placeholder="اسم الفرع" className="border p-2 rounded-lg text-sm" value={form.branchName} onChange={e => setForm({...form, branchName: e.target.value})} />
        <input placeholder="اسم المدير" className="border p-2 rounded-lg text-sm" value={form.managerName} onChange={e => setForm({...form, managerName: e.target.value})} />
        <input placeholder="رقم الموبايل" className="border p-2 rounded-lg text-sm" value={form.managerPhone} onChange={e => setForm({...form, managerPhone: e.target.value})} />
        <input placeholder="اسم المشرف" className="border p-2 rounded-lg text-sm" value={form.supervisorName} onChange={e => setForm({...form, supervisorName: e.target.value})} />
        <button onClick={() => onAdd(form)} className="bg-blue-600 text-white p-2 rounded-lg font-bold">إضافة</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c: any) => (
          <div key={c.id} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all">
            <h3 className="font-bold text-lg mb-3">{c.branchName}</h3>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
               <div><span className="font-bold">المدير:</span> {c.managerName}</div>
               <div><span className="font-bold">المشرف:</span> {c.supervisorName}</div>
            </div>
            <a href={`https://wa.me/${c.managerPhone}`} target="_blank" className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-xl text-sm font-bold">
               <MessageCircle className="w-4 h-4" /> واتساب: {c.managerPhone}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Modals (Simplified & Responsive) ---
const OrderModal = ({ onClose, onSave, branchId }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [cur, setCur] = useState({ name: '', qty: 1, price: 0 });
  const total = items.reduce((s, i) => s + (i.quantity * i.price), 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-2 md:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <h3 className="font-bold">تسجيل اوردر</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          <div className="bg-gray-50 p-3 rounded-xl space-y-3">
             <select className="w-full p-2 border rounded-lg text-sm" value={cur.name} onChange={e => setCur({...cur, name: e.target.value})}>
               <option value="">اختر صنف...</option>
               {PRODUCT_LIST.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
             <div className="flex gap-2">
               <input type="number" placeholder="كمية" className="w-1/2 p-2 border rounded-lg text-sm" value={cur.qty} onChange={e => setCur({...cur, qty: Number(e.target.value)})} />
               <input type="number" placeholder="سعر" className="w-1/2 p-2 border rounded-lg text-sm" value={cur.price} onChange={e => setCur({...cur, price: Number(e.target.value)})} />
             </div>
             <button onClick={() => cur.name && setItems([...items, {name: cur.name, quantity: cur.qty, price: cur.price}])} className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg text-xs font-black">إضافة للصنف</button>
          </div>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-xs border-b pb-1">
                <span>{it.name} (x{it.quantity})</span>
                <span className="font-bold">{(it.quantity * it.price).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-900 text-white p-4 rounded-2xl flex justify-between items-center">
            <span className="text-sm">إجمالي الاوردر:</span>
            <span className="text-xl font-black">{total.toLocaleString()} ج.م</span>
          </div>
          <button onClick={() => onSave({branchId, date: formatDate(new Date()), items, totalValue: total})} className="w-full bg-green-600 text-white py-3 rounded-2xl font-bold shadow-lg">حفظ الاوردر</button>
        </div>
      </div>
    </div>
  );
};

const InvoiceModal = ({ onClose, onSave, branchId }: any) => {
  const [num, setNum] = useState('');
  const [val, setVal] = useState(0);
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
           <h3 className="font-bold text-purple-700">فاتورة جديدة</h3>
           <button onClick={onClose}><X /></button>
        </div>
        <div className="space-y-3">
          <input placeholder="رقم الفاتورة" className="w-full border p-3 rounded-xl" value={num} onChange={e => setNum(e.target.value)} />
          <input type="number" placeholder="قيمة الفاتورة" className="w-full border p-3 rounded-xl font-bold text-lg" value={val} onChange={e => setVal(Number(e.target.value))} />
        </div>
        <button onClick={() => onSave({branchId, invoiceNumber: num, totalValue: val, payments: [], date: formatDate(new Date())})} className="w-full bg-purple-600 text-white py-3 rounded-2xl font-bold">حفظ الفاتورة</button>
      </div>
    </div>
  );
};

const SalesModal = ({ onClose, invoices, branchId, onUpdate }: any) => {
  const filtered = invoices.filter((i: any) => i.branchId === branchId);
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-2 md:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 bg-teal-700 text-white flex justify-between items-center">
          <h3 className="font-bold">سجل الفواتير</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="p-4 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs md:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">الفاتورة</th>
                  <th className="p-3">القيمة</th>
                  <th className="p-3">المحصل</th>
                  <th className="p-3">أكشن</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv: any) => {
                  const coll = inv.payments.reduce((s: any, p: any) => s + p.amount, 0);
                  return (
                    <tr key={inv.id} className="border-b">
                      <td className="p-3">{inv.date}</td>
                      <td className="p-3 font-bold">{inv.invoiceNumber}</td>
                      <td className="p-3">{inv.totalValue.toLocaleString()}</td>
                      <td className="p-3 text-green-600">{coll.toLocaleString()}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => {
                            const a = prompt("قيمة التحصيل:");
                            if(a) onUpdate({...inv, payments: [...inv.payments, {id: generateId(), amount: Number(a), date: formatDate(new Date())}]});
                          }}
                          className="text-blue-600 font-bold"
                        >+ تحصيل</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;