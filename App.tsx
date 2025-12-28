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
  Home,
  RefreshCcw
} from 'lucide-react';
import { Branch, Contact, Invoice, Order, Payment, Product, ViewState } from './types';
import { INITIAL_BRANCHES, PRODUCT_LIST } from './constants';

// --- Helper Functions ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (date: Date) => {
  try {
    return date.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

// Safe Local Storage Access
const getStorageItem = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return defaultValue;
  }
};

// --- Sub-Components (Outside App to prevent re-mounting issues) ---

const Header = ({ onToggleSidebar, time }: { onToggleSidebar: () => void, time: Date }) => (
  <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-lg p-3 md:p-4 flex justify-between items-center sticky top-0 z-50">
    <div className="flex items-center gap-2 md:gap-4">
      <button onClick={onToggleSidebar} className="p-2 hover:bg-white/10 rounded-full transition-colors">
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

const Sidebar = ({ isOpen, onClose, branches, selectedBranchId, onSelectBranch, onSetView, onAddBranch, newBranchName, setNewBranchName }: any) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
    )}
    
    <aside className={`fixed md:relative top-0 bottom-0 right-0 z-40 bg-white shadow-2xl md:shadow-none h-full transition-all duration-300 transform ${isOpen ? 'translate-x-0 w-72' : 'translate-x-full md:translate-x-0 md:w-0'} ${!isOpen && 'md:hidden'} flex flex-col border-l border-gray-200`}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h3 className="font-bold text-blue-900">القائمة</h3>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>

        <button 
          onClick={() => { onSetView(ViewState.DASHBOARD); onSelectBranch(null); onClose(); }}
          className="flex items-center gap-3 p-3 mb-2 rounded-lg hover:bg-gray-100 text-gray-700 font-bold"
        >
          <Home className="w-5 h-5 text-blue-600" /> الرئيسية
        </button>

        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-2">الفروع</h3>
        <div className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1">
          {branches.map((branch: Branch) => (
            <button
              key={branch.id}
              onClick={() => { onSelectBranch(branch.id); onSetView(ViewState.BRANCH_DETAILS); onClose(); }}
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
          onClick={() => { onSetView(ViewState.CONTACTS); onSelectBranch(null); onClose(); }}
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
            <button onClick={onAddBranch} className="bg-green-600 text-white p-2 rounded-lg"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </aside>
  </>
);

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

// --- Main Application Component ---

const App: React.FC = () => {
  const [time, setTime] = useState(new Date());
  
  // Initialize Data Safely
  const [branches, setBranches] = useState<Branch[]>(() => getStorageItem('softrose_branches', INITIAL_BRANCHES));
  const [orders, setOrders] = useState<Order[]>(() => getStorageItem('softrose_orders', []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStorageItem('softrose_invoices', []));
  const [contacts, setContacts] = useState<Contact[]>(() => getStorageItem('softrose_contacts', []));

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'NONE' | 'ORDER' | 'INVOICE' | 'SALES' | 'CONTACTS'>('NONE');
  const [newBranchName, setNewBranchName] = useState('');

  // Persist Changes
  useEffect(() => { localStorage.setItem('softrose_branches', JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem('softrose_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('softrose_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('softrose_contacts', JSON.stringify(contacts)); }, [contacts]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedBranch = useMemo(() => branches.find(b => b.id === selectedBranchId), [branches, selectedBranchId]);

  const handleAddBranch = () => {
    if (newBranchName.trim()) {
      setBranches([...branches, { id: generateId(), name: newBranchName, isCustom: true }]);
      setNewBranchName('');
    }
  };

  const handleOrderSubmit = (orderData: Omit<Order, 'id' | 'timestamp'>) => {
    setOrders([...orders, { ...orderData, id: generateId(), timestamp: Date.now() }]);
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

  // --- Views ---

  const GlobalDashboard = () => {
    const today = formatDate(new Date());
    const dailyOrders = orders.filter(o => o.date === today);
    const totalDailyValue = dailyOrders.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalInvoicesValue = invoices.reduce((acc, curr) => acc + curr.totalValue, 0);

    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">لوحة التحكم العامة</h2>
            <button onClick={() => window.location.reload()} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <RefreshCcw className="w-5 h-5" />
            </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="اوردارات اليوم" value={`${dailyOrders.length} طلب`} subValue={`${totalDailyValue.toLocaleString()} ج.م`} color="blue" />
          <StatCard title="إجمالي الفواتير" value={`${invoices.length} فاتورة`} subValue={`${totalInvoicesValue.toLocaleString()} ج.م`} color="purple" />
          <StatCard title="الفروع النشطة" value={`${branches.length} فرع`} color="green" />
          <StatCard title="جهات الاتصال" value={`${contacts.length} جهة`} color="orange" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-6">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> أحدث العمليات
          </h3>
          <div className="overflow-x-auto">
            {orders.length > 0 ? (
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
                    <tr key={o.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{o.date}</td>
                      <td className="p-3 font-medium">{branches.find(b => b.id === o.branchId)?.name || 'فرع محذوف'}</td>
                      <td className="p-3 text-blue-600 font-bold">{o.totalValue.toLocaleString()} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">لا توجد عمليات مسجلة حالياً</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const BranchDashboard = () => {
    if (!selectedBranch) return null;
    return (
      <div className="p-4 md:p-8 flex flex-col items-center animate-in fade-in duration-300">
        <div className="w-full max-w-4xl text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-black text-blue-900 mb-2">{selectedBranch.name}</h2>
            <p className="text-gray-500 text-sm">اختر العملية المطلوبة للفرع</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full max-w-5xl">
          <ActionButton 
            icon={<ShoppingCart className="w-8 h-8 md:w-10 md:h-10" />} 
            title="الاوردارات اليومية" 
            desc="إضافة طلب صرف جديد"
            color="blue" 
            onClick={() => setActiveModal('ORDER')} 
          />
          <ActionButton 
            icon={<FileText className="w-8 h-8 md:w-10 md:h-10" />} 
            title="الفواتير والتحصيل" 
            desc="إدارة المديونيات والمدفوعات"
            color="purple" 
            onClick={() => setActiveModal('INVOICE')} 
          />
          <ActionButton 
            icon={<TrendingUp className="w-8 h-8 md:w-10 md:h-10" />} 
            title="سجل المبيعات" 
            desc="مراجعة العمليات السابقة"
            color="teal" 
            onClick={() => setActiveModal('SALES')} 
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Cairo']">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} time={time} />
      
      <main className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          branches={branches}
          selectedBranchId={selectedBranchId}
          onSelectBranch={setSelectedBranchId}
          onSetView={setCurrentView}
          onAddBranch={handleAddBranch}
          newBranchName={newBranchName}
          setNewBranchName={setNewBranchName}
        />
        
        <div className="flex-1 overflow-y-auto pb-16 relative bg-[#f8fafc]">
          {currentView === ViewState.DASHBOARD && <GlobalDashboard />}
          {currentView === ViewState.BRANCH_DETAILS && <BranchDashboard />}
          {currentView === ViewState.CONTACTS && <ContactsView contacts={contacts} onAdd={handleAddContact} />}
          
          <footer className="absolute bottom-0 w-full text-center py-4 text-[10px] text-gray-400 pointer-events-none">
             Softrose Management &copy; {new Date().getFullYear()} - Amir Lamay
          </footer>
        </div>
      </main>

      {/* Modals */}
      {activeModal === 'ORDER' && selectedBranchId && (
        <OrderModal 
          branchId={selectedBranchId} 
          onClose={() => setActiveModal('NONE')} 
          onSave={handleOrderSubmit} 
        />
      )}
      {activeModal === 'INVOICE' && selectedBranchId && (
        <InvoiceModal 
          branchId={selectedBranchId} 
          onClose={() => setActiveModal('NONE')} 
          onSave={handleInvoiceSubmit} 
        />
      )}
      {activeModal === 'SALES' && selectedBranchId && (
        <SalesModal 
          branchId={selectedBranchId} 
          invoices={invoices} 
          orders={orders}
          onUpdate={handleUpdateInvoice} 
          onClose={() => setActiveModal('NONE')} 
        />
      )}
    </div>
  );
};

// --- View: Contacts ---
const ContactsView = ({ contacts, onAdd }: any) => {
  const [form, setForm] = useState({ branchName: '', managerName: '', managerPhone: '', supervisorName: '' });
  
  const handleSubmit = () => {
    if (form.branchName && form.managerPhone) {
        onAdd(form);
        setForm({ branchName: '', managerName: '', managerPhone: '', supervisorName: '' });
    } else {
        alert("يرجى إدخال اسم الفرع ورقم الهاتف على الأقل");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in slide-in-from-bottom duration-500">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-600" /> ارقام السلاسل وجهات الاتصال
      </h2>
      <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
        <div>
            <label className="text-[10px] text-gray-400 block mb-1 px-1">اسم الفرع</label>
            <input placeholder="اسم الفرع" className="w-full border p-2 rounded-lg text-sm" value={form.branchName} onChange={e => setForm({...form, branchName: e.target.value})} />
        </div>
        <div>
            <label className="text-[10px] text-gray-400 block mb-1 px-1">اسم المدير</label>
            <input placeholder="اسم المدير" className="w-full border p-2 rounded-lg text-sm" value={form.managerName} onChange={e => setForm({...form, managerName: e.target.value})} />
        </div>
        <div>
            <label className="text-[10px] text-gray-400 block mb-1 px-1">رقم الموبايل</label>
            <input placeholder="رقم الموبايل" className="w-full border p-2 rounded-lg text-sm" value={form.managerPhone} onChange={e => setForm({...form, managerPhone: e.target.value})} />
        </div>
        <div>
            <label className="text-[10px] text-gray-400 block mb-1 px-1">اسم المشرف</label>
            <input placeholder="اسم المشرف" className="w-full border p-2 rounded-lg text-sm" value={form.supervisorName} onChange={e => setForm({...form, supervisorName: e.target.value})} />
        </div>
        <button onClick={handleSubmit} className="bg-blue-600 text-white p-2 rounded-lg font-bold shadow-md hover:bg-blue-700 h-[38px]">إضافة</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c: any) => (
          <div key={c.id} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all group">
            <h3 className="font-bold text-lg mb-3 text-gray-800">{c.branchName}</h3>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
               <div className="flex justify-between"><span>المدير:</span> <span className="text-gray-900">{c.managerName || '---'}</span></div>
               <div className="flex justify-between"><span>المشرف:</span> <span className="text-gray-900">{c.supervisorName || '---'}</span></div>
            </div>
            <a href={`https://wa.me/${c.managerPhone}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors">
               <MessageCircle className="w-4 h-4" /> واتساب: {c.managerPhone}
            </a>
          </div>
        ))}
        {contacts.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400">لا توجد جهات اتصال مسجلة</div>
        )}
      </div>
    </div>
  );
};

// --- Modals ---

const OrderModal = ({ onClose, onSave, branchId }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [cur, setCur] = useState({ name: '', qty: 1, price: 0 });
  const total = items.reduce((s, i) => s + (i.quantity * i.price), 0);

  const handleAddItem = () => {
    if (cur.name && cur.qty > 0) {
        setItems([...items, { name: cur.name, quantity: cur.qty, price: cur.price }]);
        setCur({ name: '', qty: 1, price: 0 });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-2 md:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> تسجيل اوردر جديد</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X /></button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          <div className="bg-gray-50 p-4 rounded-2xl border space-y-3">
             <label className="text-xs font-bold text-gray-500 px-1">اختر الصنف</label>
             <select className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={cur.name} onChange={e => setCur({...cur, name: e.target.value})}>
               <option value="">-- اختر من القائمة --</option>
               {PRODUCT_LIST.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
             <div className="flex gap-2">
               <div className="flex-1">
                 <label className="text-[10px] text-gray-400 block mb-1">الكمية</label>
                 <input type="number" className="w-full p-2 border rounded-lg text-sm" value={cur.qty} onChange={e => setCur({...cur, qty: Math.max(0, Number(e.target.value))})} />
               </div>
               <div className="flex-1">
                 <label className="text-[10px] text-gray-400 block mb-1">السعر</label>
                 <input type="number" className="w-full p-2 border rounded-lg text-sm" value={cur.price} onChange={e => setCur({...cur, price: Math.max(0, Number(e.target.value))})} />
               </div>
             </div>
             <button onClick={handleAddItem} className="w-full bg-blue-100 text-blue-700 py-2.5 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all">إضافة للصنف</button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white border rounded-lg">
                <span className="font-medium text-gray-700">{it.name} <span className="text-blue-600">(x{it.quantity})</span></span>
                <span className="font-bold">{(it.quantity * it.price).toLocaleString()} ج.م</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-inner">
            <span className="text-sm font-bold">إجمالي قيمة الاوردر:</span>
            <span className="text-2xl font-black">{total.toLocaleString()} ج.م</span>
          </div>

          <button 
            onClick={() => items.length > 0 && onSave({branchId, date: formatDate(new Date()), items, totalValue: total})} 
            disabled={items.length === 0}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
          >
            حفظ الاوردر النهائي
          </button>
        </div>
      </div>
    </div>
  );
};

const InvoiceModal = ({ onClose, onSave, branchId }: any) => {
  const [num, setNum] = useState('');
  const [val, setVal] = useState(0);
  
  const handleSave = () => {
    if (num && val > 0) {
        onSave({branchId, invoiceNumber: num, totalValue: val, payments: [], date: formatDate(new Date())});
    } else {
        alert("يرجى إدخال رقم الفاتورة وقيمتها");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
           <h3 className="font-bold text-purple-700 text-lg flex items-center gap-2"><FileText className="w-5 h-5" /> فاتورة مبيعات</h3>
           <button onClick={onClose}><X /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">رقم الفاتورة</label>
            <input placeholder="مثال: INV-2024-001" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" value={num} onChange={e => setNum(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">قيمة الفاتورة الاجمالية</label>
            <input type="number" placeholder="0.00" className="w-full border p-3 rounded-xl font-bold text-xl text-purple-900 focus:ring-2 focus:ring-purple-500 outline-none" value={val || ''} onChange={e => setVal(Number(e.target.value))} />
          </div>
        </div>
        <button onClick={handleSave} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-purple-700 transition-colors">حفظ الفاتورة</button>
      </div>
    </div>
  );
};

const SalesModal = ({ onClose, invoices, branchId, onUpdate }: any) => {
  const filteredInvoices = invoices.filter((i: any) => i.branchId === branchId);
  
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-2 md:p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 bg-teal-700 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5" /> سجل الفواتير والمبيعات</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X /></button>
        </div>
        <div className="p-4 overflow-y-auto bg-gray-50 flex-1">
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-right text-xs md:text-sm">
              <thead className="bg-teal-50 text-teal-900">
                <tr>
                  <th className="p-4 border-b">التاريخ</th>
                  <th className="p-4 border-b">رقم الفاتورة</th>
                  <th className="p-4 border-b">القيمة</th>
                  <th className="p-4 border-b">المحصل</th>
                  <th className="p-4 border-b">المتبقي</th>
                  <th className="p-4 border-b">التحصيل</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv: any) => {
                  const collected = inv.payments.reduce((s: any, p: any) => s + p.amount, 0);
                  const remaining = inv.totalValue - collected;
                  return (
                    <tr key={inv.id} className="border-b hover:bg-teal-50 transition-colors">
                      <td className="p-4 text-gray-500">{inv.date}</td>
                      <td className="p-4 font-bold text-gray-800">{inv.invoiceNumber}</td>
                      <td className="p-4 font-bold">{inv.totalValue.toLocaleString()}</td>
                      <td className="p-4 text-green-600 font-bold">{collected.toLocaleString()}</td>
                      <td className="p-4 text-red-600 font-bold">{remaining.toLocaleString()}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => {
                            const amountStr = prompt("أدخل قيمة المبلغ الذي تم تحصيله حالياً:");
                            if (amountStr && !isNaN(Number(amountStr))) {
                                const amount = Number(amountStr);
                                onUpdate({
                                    ...inv, 
                                    payments: [...inv.payments, { id: generateId(), amount, date: formatDate(new Date()) }]
                                });
                            }
                          }}
                          className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Calculator className="w-3 h-3" /> تحصيل
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">لا توجد فواتير مسجلة لهذا الفرع بعد</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 border-t bg-white flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-300">إغلاق</button>
        </div>
      </div>
    </div>
  );
};

export default App;
