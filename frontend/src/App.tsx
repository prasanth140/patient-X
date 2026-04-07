import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ShoppingCart, 
  X, 
  Trash2, 
  Check, 
  Download, 
  ArrowRight, 
  User as UserIcon, 
  LogOut, 
  Mail, 
  Lock, 
  ShieldCheck,
  Search,
  Filter,
  ChevronRight,
  Package,
  Stethoscope,
  Activity,
  BarChart3,
  AlertTriangle,
  History,
  BrainCircuit,
  Settings,
  Zap,
  Layers,
  Info,
  CreditCard,
  Building2,
  LockKeyhole,
  Clock,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import QRCode from 'qrcode';

// --- Types ---
interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'admin';
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface FraudResult {
  transaction_id: string;
  iso_score: string;
  rf_score: string;
  svm_score: string;
  xgb_score: string;
  ensemble_score: string;
  fraud_prediction: string;
  risk_level: string;
}

// --- Constants ---
const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Neuro-Enhance X1',
    price: 2499,
    category: 'Nootropics',
    image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&q=80&w=800',
    description: 'Bioluminescent cognitive boosters for enhanced focus and neural clarity.'
  },
  {
    id: '2',
    name: 'Precision Insulin Vials',
    price: 1250,
    category: 'Diabetes',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800',
    description: 'Clinical-grade molecularly stabilized insulin for precision management.'
  },
  {
    id: '3',
    name: 'Immune Shield Elite',
    price: 899,
    category: 'Supplements',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    description: 'Gold-standard high-absorption tablets designed for 24-hour protection.'
  },
  {
    id: '4',
    name: 'Nano-Pain Relief',
    price: 349,
    category: 'Analgesics',
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=800',
    description: 'Rapid-acting pain relief targeting acute discomfort with nano-precision.'
  },
  {
    id: '5',
    name: 'Bio-Sync Multi-Vitamin',
    price: 1899,
    category: 'Vitamins',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=800',
    description: 'Chronobiology-aligned nutrient matrix for optimal metabolic synchronization.'
  },
  {
    id: '6',
    name: 'Z-Level Recovery Serum',
    price: 4200,
    category: 'Recovery',
    image: 'https://images.unsplash.com/photo-1587854680352-936b22b91030?auto=format&fit=crop&q=80&w=800',
    description: 'Post-operative grade tissue regeneration serum with growth factor complex.'
  },
  {
    id: '7',
    name: 'Atmospheric Inhaler Pro',
    price: 3100,
    category: 'Respiratory',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=800',
    description: 'Advanced nebulizer targeting deep lung tissue for immediate bronchial relief.'
  },
  {
    id: '8',
    name: 'Cardiac Guard S9',
    price: 5600,
    category: 'Cardiac',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    description: 'Proactive arterial health maintenance capsules with pure Omega-X extract.'
  }
];

const MODEL_STATS = [
  { name: 'ISO Forest', weight: 20, accuracy: 88, color: '#0ea5e9', desc: 'Anomalous path length detection engine.' },
  { name: 'Rand Forest', weight: 30, accuracy: 94, color: '#10b981', desc: 'Decision tree ensemble for high-variance data.' },
  { name: 'SVM Payment', weight: 25, accuracy: 91, color: '#f59e0b', desc: 'Kernel-based hyperplane classification.' },
  { name: 'XGBoost', weight: 25, accuracy: 96, color: '#ef4444', desc: 'Gradient boosted framework for structured mining.' },
];

const RISK_DISTRIBUTION = [
  { name: 'Safe', value: 700, color: '#10b981' },
  { name: 'Targeted', value: 450, color: '#f59e0b' },
  { name: 'Anomalous', value: 320, color: '#ef4444' },
];

// --- Subcomponents ---

const DynamicQR = ({ amount, onConfirm }: { amount: number, onConfirm: () => void }) => {
  const [qrUrl, setQrUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    // Dynamic UPI QR — real payee details
    const upiUrl = `upi://pay?pa=sathyamarudhu6@okhdfcbank&pn=Sathya%20Marudhu6&am=${amount}&cu=INR&tn=MedSecure-Payment&mc=5912`;
    QRCode.toDataURL(upiUrl, { width: 256, margin: 2, color: { dark: '#000000', light: '#ffffff' } }).then(setQrUrl);

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [amount]);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-6 rounded-3xl mb-4 relative overflow-hidden shadow-2xl">
        {timeLeft === 0 && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
             <div className="text-white font-black text-sm uppercase tracking-widest leading-tight">Session <br/>Expired</div>
          </div>
        )}
        {qrUrl ? <img src={qrUrl} className="w-56 h-56" alt="UPI QR" /> : <div className="w-56 h-56 bg-slate-100 animate-pulse" />}
      </div>
      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full mb-8">
        <Clock className={`w-4 h-4 ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-sky-400'}`} />
        <span className="font-bold text-sm tracking-widest text-slate-300 uppercase">Expires in {timeLeft}s</span>
      </div>
      <button 
        onClick={onConfirm} 
        disabled={timeLeft === 0}
        className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/40 disabled:opacity-50 active:scale-95"
      >
        Complete Purchase
      </button>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('patient_x_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [regStep, setRegStep] = useState(1);
  const [regData, setRegData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', otp: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'models' | 'settings' | 'products' | 'alerts'>('dashboard');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fraudData, setFraudData] = useState<FraudResult[]>([]);
  const [selectedTx, setSelectedTx] = useState<FraudResult | null>(null);

  // Payment/Model Flow
  const [paymentStep, setPaymentStep] = useState<'details' | 'analyzing' | 'result' | 'qr' | 'success'>('details');
  const [bankDetails, setBankDetails] = useState({ cardholderName: '', accountNumber: '', ifsc: '', bankName: '', cvv: '', expiry: '' });
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/fraud-results').then(res => res.json()).then(setFraudData);
      setActiveTab('dashboard');
    } else if (user) {
      setActiveTab('products');
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('patient_x_user');
    setUser(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regData.email, password: regData.password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('patient_x_user', JSON.stringify(data.user));
      } else {
        alert('Credentials Invalid. Use admin@patientx.com / admin123 for master access.');
      }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regData.email }),
      });
      if (res.ok) {
        setRegStep(2);
      } else {
        const errorData = await res.json();
        alert(`Verification Error: ${errorData.message || "Failed to send code"}`);
      }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const verifyRes = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regData.email, otp: regData.otp }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.verified) {
        const regRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fullName: regData.fullName, 
            email: regData.email, 
            password: regData.password 
          }),
        });
        if (regRes.ok) {
          setRegStep(3);
        } else {
          alert("Registration failed on server.");
        }
      } else {
        alert("Verification code invalid or expired.");
      }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const startAnalysis = async () => {
    // --- Regex Validations ---
    const nameRegex = /^[A-Za-z\s]+$/;
    const cardNumberRegex = /^\d{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    if (!nameRegex.test(bankDetails.cardholderName)) {
      alert("Invalid Cardholder Name: Use only letters and spaces.");
      return;
    }
    if (!nameRegex.test(bankDetails.bankName)) {
      alert("Invalid Bank Name: Use only letters.");
      return;
    }
    if (!cardNumberRegex.test(bankDetails.accountNumber)) {
      alert("Invalid Card Number: Must be exactly 16 digits.");
      return;
    }
    if (!expiryRegex.test(bankDetails.expiry)) {
      alert("Invalid Expiry: Format must be MM/YY.");
      return;
    }
    if (!cvvRegex.test(bankDetails.cvv)) {
      alert("Invalid CVV: Must be exactly 3 digits.");
      return;
    }
    if (!ifscRegex.test(bankDetails.ifsc)) {
      alert("Invalid IFSC Code: Format 'ABCD0123456' required.");
      return;
    }

    setPaymentStep('analyzing');
    const totalAmount = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const hour = new Date().getHours();

    // --- Behavioral Signal Collection ---
    // Device fingerprint (simplified)
    const savedDevice = localStorage.getItem('px_device_id');
    const currentDevice = navigator.userAgent + screen.width + screen.colorDepth;
    const isNewDevice = savedDevice && savedDevice !== currentDevice ? 1 : 0;
    if (!savedDevice) localStorage.setItem('px_device_id', currentDevice);

    // Transaction velocity (count recent txns in session)
    const txnHistory: number[] = JSON.parse(sessionStorage.getItem('px_txn_times') || '[]');
    const now = Date.now();
    const recentTxns = txnHistory.filter(t => now - t < 5 * 60 * 1000); // last 5 min
    recentTxns.push(now);
    sessionStorage.setItem('px_txn_times', JSON.stringify(recentTxns));

    // Account age (days since registration saved in user object)
    const accountCreated = localStorage.getItem('px_account_created');
    if (!accountCreated) localStorage.setItem('px_account_created', String(now));
    const accountAgeDays = Math.floor((now - parseInt(localStorage.getItem('px_account_created') || String(now))) / 86400000);

    const behavioralContext = {
      isNewDevice:    isNewDevice,
      isNewLocation:  hour >= 0 && hour <= 5 ? 1 : 0, // midnight flag as proxy
      txnVelocity:    recentTxns.length,
      avgAmount:      parseFloat(localStorage.getItem('px_avg_amount') || '500'),
      accountAgeDays: Math.max(accountAgeDays, 0),
      pastFraudCount: 0,
      transactionHour: hour,
    };

    // Update rolling average amount
    const prevAvg = parseFloat(localStorage.getItem('px_avg_amount') || '500');
    const newAvg = (prevAvg * 0.8) + (totalAmount * 0.2);
    localStorage.setItem('px_avg_amount', String(newAvg.toFixed(2)));

    const res = await fetch('/api/predict-fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, bankDetails, behavioralContext })
    });
    const result = await res.json();
    setAnalysisResult(result);
    setTimeout(() => setPaymentStep('result'), 1800);
  };

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Deep Field Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[200px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-emerald-600/10 blur-[200px] rounded-full animate-pulse" style={{ animationDelay: '-8s' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-lg">
          <div className="bg-[#0a0a1a]/80 backdrop-blur-3xl border border-white/5 p-12 rounded-[60px] shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="flex justify-center mb-10 relative">
               <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)]">
                  <ShieldCheck className="w-12 h-12 text-white" />
               </div>
            </div>

            {authMode === 'login' ? (
              <>
                <div className="text-center mb-12">
                   <h1 className="text-5xl font-black text-white tracking-tight uppercase italic mb-2">MedSecure Login</h1>
                   <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em]">Node Access Terminal</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                   <div className="space-y-4">
                      <div className="relative group/input">
                        <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within/input:text-blue-500 transition-colors" />
                        <input type="email" placeholder="Email ID" required className="w-full pl-20 pr-8 py-6 bg-white/5 border border-white/10 rounded-[30px] outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all text-lg placeholder:text-slate-700" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
                      </div>
                      <div className="relative group/input">
                        <Zap className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within/input:text-emerald-500 transition-colors" />
                        <input type="password" placeholder="Access Password" required className="w-full pl-20 pr-8 py-6 bg-white/5 border border-white/10 rounded-[30px] outline-none focus:ring-2 focus:ring-emerald-500/50 text-white transition-all text-lg placeholder:text-slate-700 font-mono tracking-widest" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
                      </div>
                   </div>
                   <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 py-7 rounded-[32px] font-black text-white text-2xl transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center justify-center gap-4 active:scale-95 uppercase tracking-tighter italic">
                      {isLoading ? <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <>Login to Node</>}
                   </button>
                </form>
                <p className="mt-10 text-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  New researcher? <button type="button" onClick={() => setAuthMode('register')} className="text-blue-400 hover:underline cursor-pointer relative z-20">Create Account</button>
                </p>
              </>
            ) : (
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-12">
                   {[1,2,3].map(s => (
                     <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${regStep >= s ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-600 border border-white/5'}`}>
                        {regStep > s ? <Check className="w-5 h-5"/> : s}
                     </div>
                   ))}
                </div>

                {regStep === 1 && (
                  <motion.form initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} onSubmit={handleRegisterStep1} className="space-y-6">
                    <div className="text-center mb-8">
                      <h4 className="text-4xl font-black text-white tracking-tighter italic uppercase">Step 1: Protocol Info</h4>
                    </div>
                    <div className="space-y-4">
                       <input type="text" placeholder="Full Name" required className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white outline-none focus:ring-2 focus:ring-blue-500" value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})} />
                       <input type="email" placeholder="Email Address" required className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white outline-none focus:ring-2 focus:ring-blue-500" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
                       <input type="password" placeholder="Create Password" required className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white outline-none focus:ring-2 focus:ring-blue-500" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
                       <input type="password" placeholder="Confirm Password" required className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white outline-none focus:ring-2 focus:ring-blue-500" value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 py-7 rounded-[32px] font-black text-white text-xl hover:bg-blue-500 transition-all uppercase italic">
                       {isLoading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" /> : "Next: Verify Node"}
                    </button>
                    <button onClick={() => setAuthMode('login')} className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest mt-4">Cancel and Return</button>
                  </motion.form>
                )}

                {regStep === 2 && (
                  <motion.form initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} onSubmit={handleRegisterStep2} className="space-y-8 text-center">
                    <div>
                      <h4 className="text-4xl font-black text-white tracking-tighter italic uppercase mb-2">Step 2: 2FA Secure</h4>
                      <p className="text-slate-500 text-xs font-medium italic">Sent code to {regData.email}</p>
                    </div>
                    <div className="relative group">
                       <ShieldCheck className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 w-6 h-6 group-focus-within:text-emerald-500 transition-colors" />
                       <input type="text" placeholder="6-Digit Verification Code" required className="w-full pl-20 pr-8 py-7 bg-white/5 border border-white/10 rounded-[40px] text-white text-3xl font-black tracking-[0.5em] text-center outline-none focus:ring-2 focus:ring-emerald-500" value={regData.otp} onChange={e => setRegData({...regData, otp: e.target.value})} />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 py-7 rounded-[32px] font-black text-white text-xl hover:bg-emerald-500 transition-all uppercase italic">
                       {isLoading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" /> : "Authorize & Register"}
                    </button>
                  </motion.form>
                )}

                {regStep === 3 && (
                  <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="text-center space-y-10 py-10">
                    <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-900/40">
                       <Check className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <h4 className="text-5xl font-black text-white tracking-tighter italic uppercase mb-2">Protocol Active</h4>
                      <p className="text-slate-400 font-medium italic leading-relaxed">Account #PX-{Math.floor(Math.random()*900000+100000)} successfully initialized in the pharmacy ensemble.</p>
                    </div>
                    <button onClick={() => { setAuthMode('login'); setRegStep(1); }} className="w-full bg-white text-slate-950 py-7 rounded-[32px] font-black text-2xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl uppercase tracking-tighter italic">Go Back to Login</button>
                  </motion.div>
                )}
              </div>
            )}

            <div className="mt-12 flex items-center justify-center gap-6 border-t border-white/5 pt-10">
               <span className="text-slate-700 font-black text-[9px] uppercase tracking-widest leading-none">Quantum Encryption Protocol Active v.2.6</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar - Premium Restoration */}
      <aside className="hidden lg:flex w-80 bg-slate-900/50 backdrop-blur-3xl border-r border-white/5 p-10 flex-col h-screen z-30">
        <div className="flex items-center gap-4 mb-20 group cursor-default">
          <div className="w-14 h-14 bg-gradient-to-tr from-sky-600 to-sky-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-sky-900/20 group-hover:rotate-6 transition-transform">
            <Activity className="text-white w-8 h-8" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-widest uppercase block leading-none">Patient-X</span>
            <span className="text-[10px] text-sky-500 font-bold uppercase tracking-[0.2em]">Ensemble Intel</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-4">
          {(isAdmin ? [
            { id: 'dashboard', icon: BarChart3, label: 'Analytics' },
            { id: 'transactions', icon: History, label: 'Alert Feed' },
            { id: 'models', icon: BrainCircuit, label: 'Core Models' },
            { id: 'settings', icon: Settings, label: 'Global System' },
          ] : [
            { id: 'products', icon: Package, label: 'Pharma Shop' },
            { id: 'history', icon: Clock, label: 'Order History' },
            { id: 'settings', icon: UserIcon, label: 'My Node' },
          ]).map((item: any) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all group ${activeTab === item.id ? 'bg-sky-600 text-white shadow-2xl shadow-sky-900/40 active-neon' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform" /> 
              {item.label}
              {activeTab === item.id && <motion.div layoutId="side_active" className="ml-auto w-1.5 h-6 bg-white rounded-full" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5 space-y-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10">
                 <UserIcon className="w-6 h-6 text-slate-400" />
              </div>
              <div className="min-w-0">
                 <p className="text-sm font-black text-white truncate">{user.name}</p>
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{user.role} tier</p>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-4 py-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black rounded-2xl shadow-inner group">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Exit System
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative h-screen">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
          <div>
            <h2 className="text-5xl font-black text-white leading-none tracking-tighter mb-2">
               {isAdmin ? 
                  (activeTab === 'dashboard' ? "Deployment Overview" : activeTab === 'models' ? "Ensemble Matrix" : "System Intelligence") : 
                  "Premium Pharma Node"
               }
            </h2>
            <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full animate-ping ${isAdmin ? 'bg-sky-500' : 'bg-emerald-500'}`} />
               <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">Protocol {user.role} Sync Complete</p>
            </div>
          </div>
          {!isAdmin && (
            <button onClick={() => setIsCartOpen(true)} className="relative p-6 glass-card rounded-3xl text-sky-400 hover:scale-105 transition-all shadow-2xl">
                <ShoppingCart className="w-8 h-8" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-black w-8 h-8 flex items-center justify-center rounded-full border-4 border-slate-950">
                    {cart.reduce((s,i)=>s+i.quantity,0)}
                  </span>
                )}
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {!isAdmin && activeTab === 'products' && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-16 pb-32">
               {/* About MedSecure Section */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 relative h-[520px] rounded-[64px] overflow-hidden shadow-2xl group border border-white/5">
                    <img src="https://images.unsplash.com/photo-1547489432-cf93fa6c71ee?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Medicine E-commerce" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-transparent to-transparent" />
                    <div className="relative p-20 flex flex-col justify-center h-full max-w-xl">
                       <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Established 2026 - Secure Relay</span>
                       <h3 className="text-8xl font-black text-white leading-[0.85] tracking-tighter italic mb-8">Clinical <br/>Intelligence.</h3>
                       <p className="text-lg text-slate-300 font-bold leading-relaxed mb-10 opacity-80 italic">Predictive security meets clinical precision. Every medication is verified through our 4-point ML ensemble matrix for absolute integrity and safety.</p>
                       <div className="flex gap-4">
                          <button className="px-10 py-5 bg-blue-600 text-white rounded-[28px] font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40">Marketplace</button>
                          <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[28px] font-black text-lg hover:bg-white/10 transition-all">About Our Node</button>
                       </div>
                    </div>
                  </div>
                  <div className="lg:col-span-4 bg-[#0a0a1a] border border-white/5 p-12 rounded-[64px] flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full" />
                     <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20">
                        <Activity className="w-8 h-8 text-blue-400" />
                     </div>
                     <h4 className="text-4xl font-black text-white tracking-tighter italic mb-6">Security First</h4>
                     <ul className="space-y-6 flex-1 relative z-10">
                        {[
                           {t:'Weighted Ensemble', d:'4 Simultaneous ML models evaluate every transaction risk score.'},
                           {t:'2FA Protocol', d:'Advanced app-password verification for secure account access.'},
                           {t:'UPI Dynamic QR', d:'Instant secure payment generation for verified low-risk users.'}
                        ].map((f,idx) => (
                           <li key={idx} className="flex gap-4">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                              <div>
                                 <p className="text-white font-black text-sm uppercase tracking-wider">{f.t}</p>
                                 <p className="text-slate-500 text-xs font-bold mt-1 leading-relaxed italic">{f.d}</p>
                              </div>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
                  {PRODUCTS.map(p => (
                    <div key={p.id} className="glass-card rounded-[52px] overflow-hidden group transition-all hover:translate-y-[-10px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/[0.03] flex flex-col">
                        <div className="h-72 overflow-hidden relative">
                           <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={p.name} />
                           <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6">
                              <span className="px-4 py-1.5 bg-blue-500/20 backdrop-blur-md rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/30">{p.category}</span>
                           </div>
                        </div>
                        <div className="p-10 flex flex-col flex-1">
                           <h4 className="text-2xl font-black text-white mb-4 tracking-tight italic">{p.name}</h4>
                           <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium flex-1 italic">"{p.description}"</p>
                           <div className="flex items-center justify-between mt-auto">
                              <div className="flex flex-col">
                                 <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Protocol Value</span>
                                 <span className="text-3xl font-black text-white tracking-widest italic">₹{p.price}</span>
                              </div>
                              <button onClick={() => addToCart(p)} className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40 active:scale-90 overflow-hidden relative group/btn">
                                <Plus className="w-8 h-8 group-hover/btn:rotate-90 transition-transform duration-500 relative z-10" />
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                              </button>
                           </div>
                        </div>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {/* ORDER HISTORY */}
          {!isAdmin && activeTab === 'history' && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-8 pb-32">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  {label:'Total Orders', val:'4', icon:Package, color:'sky'},
                  {label:'Amount Spent', val:'₹7,047', icon:CreditCard, color:'emerald'},
                  {label:'Fraud Alerts', val:'0', icon:ShieldCheck, color:'blue'},
                ].map((s,i) => (
                  <motion.div key={i} initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:i*0.1}} className="glass-card p-8 rounded-[40px] relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-28 h-28 bg-${s.color}-500/10 blur-[60px] rounded-full`} />
                    <div className={`w-12 h-12 bg-${s.color}-500/15 rounded-2xl flex items-center justify-center mb-6`}><s.icon className={`text-${s.color}-400 w-6 h-6`}/></div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{s.label}</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter">{s.val}</h4>
                  </motion.div>
                ))}
              </div>
              <div className="glass-card rounded-[52px] overflow-hidden border border-white/5">
                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">Prescription History</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1 italic">All past pharmaceutical orders and ML risk assessments</p>
                  </div>
                  <button className="px-8 py-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                    <Download className="w-4 h-4"/> Export PDF
                  </button>
                </div>
                <div className="divide-y divide-white/5">
                  {[
                    {id:'RX-0041', date:'21 Mar 2026', items:'Neuro-Enhance X1 × 1', amount:'₹2,499', status:'Delivered', risk:'LOW RISK'},
                    {id:'RX-0038', date:'19 Mar 2026', items:'Immune Shield Elite × 2', amount:'₹1,798', status:'Delivered', risk:'LOW RISK'},
                    {id:'RX-0034', date:'15 Mar 2026', items:'Nano-Pain Relief × 4', amount:'₹1,396', status:'In Transit', risk:'LOW RISK'},
                    {id:'RX-0029', date:'10 Mar 2026', items:'Bio-Sync Multi-Vitamin × 1, Cardiac Guard S9 × 1 ', amount:'₹7,499', status:'Processing', risk:'MEDIUM RISK'},
                  ].map((order, i) => (
                    <motion.div key={i} initial={{opacity:0, x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}} className="flex flex-col md:flex-row md:items-center gap-6 p-8 hover:bg-white/[0.02] transition-colors group cursor-pointer">
                      <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                        <Package className="w-7 h-7 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-white text-lg">{order.id}</p>
                          <span className={`px-3 py-0.5 rounded-xl text-[9px] font-black tracking-widest uppercase ${order.risk === 'MEDIUM RISK' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'}`}>{order.risk}</span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium truncate">{order.items}</p>
                        <p className="text-slate-600 text-xs mt-1 font-bold uppercase tracking-widest">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-black text-white tracking-tight">{order.amount}</p>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'text-emerald-400' : order.status === 'In Transit' ? 'text-sky-400' : 'text-amber-400'}`}>{order.status}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* MY NODE — User Profile */}
          {!isAdmin && activeTab === 'settings' && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-8 pb-32 max-w-4xl mx-auto">
              {/* Profile Hero */}
              <div className="glass-card p-10 rounded-[52px] relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full" />
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-emerald-400 rounded-[36px] flex items-center justify-center shadow-2xl shadow-blue-900/40">
                      <UserIcon className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-4xl font-black text-white tracking-tighter mb-1">{user.name}</h3>
                    <p className="text-slate-400 font-bold mb-4">{user.email}</p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5"/>2FA Active</span>
                      <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2"><Zap className="w-3.5 h-3.5"/>Patient Tier</span>
                      <span className="px-4 py-1.5 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">Node ID: PX-{user.email.slice(0,4).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Security Level</p>
                    <p className="text-5xl font-black text-white">9.4</p>
                    <p className="text-emerald-400 text-[10px] font-black tracking-widest uppercase">/ 10 Secured</p>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-10 rounded-[44px] border border-white/5">
                  <h4 className="text-xl font-black text-white tracking-tighter mb-8 flex items-center gap-3"><LockKeyhole className="w-5 h-5 text-blue-400"/>Security Protocol</h4>
                  <div className="space-y-5">
                    {[
                      {label:'2FA Email Verification', status:true},
                      {label:'App Password Auth', status:true},
                      {label:'ML Transaction Shield', status:true},
                      {label:'Device Fingerprinting', status:true},
                      {label:'Biometric Lock', status:false},
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <span className="text-slate-300 font-bold text-sm">{item.label}</span>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center ${item.status ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                          {item.status ? <Check className="w-4 h-4 text-emerald-400"/> : <X className="w-4 h-4 text-slate-600"/>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-10 rounded-[44px] border border-white/5">
                  <h4 className="text-xl font-black text-white tracking-tighter mb-8 flex items-center gap-3"><Activity className="w-5 h-5 text-emerald-400"/>Node Statistics</h4>
                  <div className="space-y-6">
                    {[
                      {label:'Total Orders', val:'4', sub:'Since joining'},
                      {label:'Total Spent', val:'₹12,192', sub:'Lifetime value'},
                      {label:'Fraud Blocks', val:'0', sub:'Successfully cleared'},
                      {label:'Risk Score Avg', val:'LOW', sub:'Across all sessions'},
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-black">{stat.label}</p>
                          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">{stat.sub}</p>
                        </div>
                        <span className="text-2xl font-black text-blue-400">{stat.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Update Profile Form */}
              <div className="glass-card p-10 rounded-[44px] border border-white/5">
                <h4 className="text-xl font-black text-white tracking-tighter mb-8 flex items-center gap-3"><UserIcon className="w-5 h-5 text-sky-400"/>Update Node Identity</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Full Name</label>
                    <input type="text" defaultValue={user.name} className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[28px] text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Email Address</label>
                    <input type="email" defaultValue={user.email} className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[28px] text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold" readOnly/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[28px] text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Confirm Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[28px] text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button className="px-12 py-5 bg-blue-600 text-white rounded-[28px] font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 active:scale-95">Save Changes</button>
                  <button className="px-12 py-5 bg-white/5 border border-white/10 text-slate-300 rounded-[28px] font-black text-lg hover:bg-white/10 transition-all">Reset</button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="glass-card p-10 rounded-[44px] border border-rose-500/10">
                <h4 className="text-xl font-black text-rose-400 tracking-tighter mb-4 flex items-center gap-3"><AlertTriangle className="w-5 h-5"/>Danger Zone</h4>
                <p className="text-slate-500 font-medium mb-6 text-sm">Permanently delete your node and all associated transaction data. This action cannot be reversed.</p>
                <button onClick={handleLogout} className="px-10 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-[24px] font-black hover:bg-rose-500 hover:text-white transition-all text-sm uppercase tracking-widest">Terminate Node</button>
              </div>
            </motion.div>
          )}

          {isAdmin && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-12 pb-32">
               {activeTab === 'dashboard' && (
                 <>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        {label:'Nodes Scanned',val:'1,899',icon:Activity,color:'sky'},
                        {label:'Flagged Ops',val:'320',icon:AlertTriangle,color:'rose'},
                        {label:'Mean Consensus',val:'0.428',icon:BrainCircuit,color:'emerald'},
                        {label:'System Health',val:'99.4%',icon:ShieldCheck,color:'amber'}
                      ].map((s,i)=>(
                        <motion.div key={i} initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:i*0.1}} className="glass-card p-10 rounded-[48px] relative overflow-hidden group">
                          <div className={`absolute top-0 right-0 w-32 h-32 bg-${s.color}-500/10 blur-[60px] rounded-full transition-all group-hover:bg-${s.color}-500/20`} />
                          <div className={`w-14 h-14 bg-${s.color}-500/20 rounded-2xl flex items-center justify-center mb-8`}><s.icon className={`text-${s.color}-400 w-7 h-7`}/></div>
                          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mb-2">{s.label}</p>
                          <h4 className="text-4xl font-black text-white tracking-tighter">{s.val}</h4>
                        </motion.div>
                      ))}
                   </div>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="glass-card p-12 rounded-[60px] h-[500px] flex flex-col shadow-2xl shadow-sky-500/5">
                         <div className="flex items-center justify-between mb-12">
                            <h4 className="text-2xl font-black text-white tracking-tight flex items-center gap-3"><Gauge className="w-7 h-7 text-sky-500"/> Ensemble Weights</h4>
                            <div className="text-[10px] text-slate-500 font-bold uppercase border border-white/5 px-3 py-1 rounded-full">Primary Consensus</div>
                         </div>
                         <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={MODEL_STATS}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false}/>
                                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false}/>
                                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false}/>
                                  <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px'}} />
                                  <Bar dataKey="weight" radius={[10, 10, 0, 0]}>
                                    {MODEL_STATS.map((e,i)=><Cell key={i} fill={e.color}/>)}
                                  </Bar>
                               </BarChart>
                            </ResponsiveContainer>
                         </div>
                      </div>
                      <div className="glass-card p-12 rounded-[60px] h-[500px] flex flex-col items-center">
                        <div className="w-full flex items-center justify-between mb-12">
                            <h4 className="text-2xl font-black text-white tracking-tight flex items-center gap-3"><Layers className="w-7 h-7 text-emerald-500"/> Risk Matrix</h4>
                            <div className="w-3 h-3 rounded-full bg-emerald-500 neon-glow animate-pulse" />
                        </div>
                        <div className="flex-1 w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={RISK_DISTRIBUTION} innerRadius={80} outerRadius={130} paddingAngle={8} dataKey="value" stroke="none">
                                    {RISK_DISTRIBUTION.map((e,i)=><Cell key={i} fill={e.color} fillOpacity={0.8}/>)}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                               <span className="text-5xl font-black text-white tracking-tight">1.9K</span>
                               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aggregate</span>
                            </div>
                        </div>
                      </div>
                   </div>

                   <div className="glass-card rounded-[60px] overflow-hidden shadow-2xl border border-white/5">
                      <div className="p-12 border-b border-white/5 flex items-center justify-between">
                         <div>
                            <h4 className="text-3xl font-black text-white tracking-tighter">Critical Alert Feed</h4>
                            <p className="text-slate-500 font-medium">Anomalous triggers identified by neural cross-referencing.</p>
                         </div>
                         <button onClick={()=>setActiveTab('transactions')} className="px-8 py-3 bg-white/5 text-slate-200 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-sky-600 hover:text-white transition-all">Inspect Full Stream</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-white/5">
                             <tr className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-black italic">
                               <th className="px-12 py-8">Transmission ID</th>
                               <th className="px-12 py-8">Confidence Level</th>
                               <th className="px-12 py-8">Consensus Protocol</th>
                               <th className="px-12 py-8">Classification</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5 font-medium">
                             {fraudData.slice(0,6).map((r,i)=>(
                               <tr key={i} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={()=>setSelectedTx(r)}>
                                 <td className="px-12 py-8 font-mono font-black text-slate-100 italic group-hover:text-sky-400 transition-colors">#TX-{r.transaction_id.padStart(4,'0')}</td>
                                 <td className="px-12 py-8 font-bold text-sky-400">
                                   <div className="flex items-center gap-3">
                                      <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                                         <div className={`h-full ${parseFloat(r.ensemble_score) > 0.6 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${parseFloat(r.ensemble_score)*100}%`}} />
                                      </div>
                                      {(parseFloat(r.ensemble_score)*100).toFixed(1)}%
                                   </div>
                                 </td>
                                 <td className="px-12 py-8">
                                    <div className="flex gap-1.5">
                                       {['iso','rf','svm','xgb'].map(m => (
                                          <div key={m} title={m.toUpperCase()} className={`w-3.5 h-3.5 rounded-full ${parseFloat(r[m+'_score' as keyof FraudResult]) > 0.5 ? 'bg-rose-500 neon-glow' : 'bg-slate-800'}`} />
                                       ))}
                                    </div>
                                 </td>
                                 <td className="px-12 py-8 text-right pr-20">
                                   <span className={`px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest ${r.risk_level === 'HIGH RISK' ? 'bg-rose-600/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/10'}`}>{r.risk_level}</span>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                        </table>
                      </div>
                   </div>
                 </>
               )}

               {activeTab === 'models' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                    {MODEL_STATS.map((m,i)=>(
                      <div key={i} className="glass-card p-12 rounded-[64px] relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 transition-all group-hover:opacity-30" style={{backgroundColor:m.color}} />
                         <div className="flex items-center gap-8 mb-16 relative z-10">
                            <div className="w-24 h-24 rounded-[32px] flex items-center justify-center shadow-inner p-1" style={{backgroundColor:`${m.color}15`}}>
                               <div className="w-full h-full bg-slate-950 rounded-[28px] flex items-center justify-center">
                                  <BrainCircuit className="w-12 h-12" style={{color:m.color}} />
                               </div>
                            </div>
                            <div>
                               <h3 className="text-4xl font-black text-white tracking-tighter italic">{m.name}</h3>
                               <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Deep Learning Ensemble Participant</p>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-8 mb-12">
                            <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[40px]">
                               <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] block mb-3">Model Weight</span>
                               <h4 className="text-5xl font-black text-white tracking-tight">{m.weight}<span className="text-xl text-slate-700 ml-1">%</span></h4>
                            </div>
                            <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[40px]">
                               <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] block mb-3">Confidence</span>
                               <h4 className="text-5xl font-black text-emerald-400 tracking-tight">{m.accuracy}<span className="text-xl text-slate-700 ml-1 ml-1">%</span></h4>
                            </div>
                         </div>
                         <p className="text-slate-400 text-lg leading-relaxed mb-12 italic">"{m.desc}" This architectural component delivers real-time validation scores to the weighted consensus module.</p>
                         <button className="w-full py-6 rounded-3xl bg-white/5 border border-white/5 text-white font-black hover:bg-white/10 transition-all flex items-center justify-center gap-4 group italic">
                            Inspect Model Params <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                         </button>
                      </div>
                    ))}
                 </div>
               )}

               {(activeTab === 'transactions' || activeTab === 'settings') && (
                 <div className="glass-card p-20 rounded-[80px] text-center max-w-4xl mx-auto border border-white/5 shadow-2xl">
                    <div className="w-24 h-24 bg-sky-600/10 rounded-[32px] flex items-center justify-center mx-auto mb-10"><Settings className="w-12 h-12 text-sky-400 animate-spin-slow" /></div>
                    <h3 className="text-4xl font-black text-white tracking-tighter mb-4 italic uppercase">Module Encrypted</h3>
                    <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-lg mx-auto mb-12">Please re-verify your Protocol Credentials to access the global transmission history and system settings. Security Phase 4 is currently engaged.</p>
                    <div className="flex gap-4 justify-center">
                       <button className="px-12 py-5 bg-sky-600 text-white rounded-[28px] font-black text-lg hover:bg-sky-500 transition-all active:scale-95">Re-auth Node</button>
                       <button onClick={()=>setActiveTab('dashboard')} className="px-12 py-5 bg-white/5 text-slate-300 rounded-[28px] font-black text-lg hover:bg-white/10 transition-all">Back to Deck</button>
                    </div>
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setIsCartOpen(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-[60]" />
            <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 shadow-2xl z-[70] p-12 flex flex-col border-l border-white/10">
               <div className="flex items-center justify-between mb-16">
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tighter">Medical Queue</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Refining selection...</p>
                  </div>
                  <button onClick={()=>setIsCartOpen(false)} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-all"><X className="w-7 h-7 text-white"/></button>
               </div>
               <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                       <ShoppingCart className="w-20 h-20 text-slate-500" />
                       <p className="text-slate-500 font-black text-lg uppercase tracking-widest">Queue Empty</p>
                    </div>
                  ) : cart.map((i)=>(
                    <div key={i.id} className="flex gap-6 p-6 bg-white/[0.03] rounded-[40px] border border-white/5 relative group">
                       <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                          <img src={i.image} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 min-w-0 py-1">
                          <p className="text-xl font-black text-white truncate">{i.name}</p>
                          <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mt-1 italic">₹{i.price} per unit</p>
                          <div className="mt-4 flex items-center justify-between">
                             <div className="flex items-center gap-4 bg-slate-950/50 px-4 py-2 rounded-2xl border border-white/5 group-hover:border-sky-500/30 transition-colors">
                                <button onClick={()=>setCart(prev=>prev.map(x=>x.id===i.id?{...x,quantity:Math.max(1,x.quantity-1)}:x))} className="text-slate-500 hover:text-white font-black text-xl">-</button>
                                <span className="font-black text-white text-lg min-w-4 text-center">{i.quantity}</span>
                                <button onClick={()=>setCart(prev=>prev.map(x=>x.id===i.id?{...x,quantity:x.quantity+1}:x))} className="text-slate-500 hover:text-white font-black text-xl">+</button>
                             </div>
                          </div>
                       </div>
                       <button onClick={()=>setCart(prev => prev.filter(x=>x.id !== i.id))} className="absolute -top-2 -right-2 p-3 bg-slate-950 rounded-2xl text-slate-600 hover:text-rose-500 border border-white/10 hover:border-rose-500/30 transition-all opacity-0 group-hover:opacity-100 shadow-2xl">
                          <Trash2 className="w-5 h-5"/>
                       </button>
                    </div>
                  ))}
               </div>
               {cart.length > 0 && (
                 <div className="pt-12 border-t border-white/10 space-y-10">
                    <div className="flex justify-between items-end">
                       <div>
                          <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Consolidated Cost</span>
                          <p className="text-xs text-sky-500 font-bold mt-1">Excl. Ensemble Processing</p>
                       </div>
                       <span className="text-5xl font-black text-white tracking-tighter">₹{cart.reduce((s,i)=>s+i.price*i.quantity,0)}</span>
                    </div>
                    <button onClick={()=>{setIsCartOpen(false); setPaymentStep('details'); setAnalysisResult(null);}} className="w-full bg-white text-slate-950 py-6 rounded-[32px] font-black text-2xl hover:bg-sky-500 hover:text-white shadow-2xl shadow-sky-900/10 transition-all active:scale-95 uppercase tracking-tighter italic">Execute Checkout</button>
                 </div>
               )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Unified Payment & Analysis Engine */}
      <AnimatePresence>
        {(paymentStep !== 'details' || (activeTab === 'products' && cart.length > 0 && !isCartOpen && paymentStep === 'details' && bankDetails.accountNumber === '')) && cart.length > 0 && paymentStep !== 'qr' && (
          paymentStep === 'details' ? (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
               <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" onClick={()=>setCart([])} />
               <motion.div initial={{scale:0.9,opacity:0,y:40}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.9,opacity:0}} className="glass-card w-full max-w-xl p-14 rounded-[80px] relative z-10 border border-white/10 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 p-10"><div className="w-3 h-3 rounded-full bg-blue-500 neon-glow animate-ping" /></div>
                  <div className="flex items-center gap-6 mb-16">
                     <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl rotate-3"><CreditCard className="text-white w-8 h-8"/></div>
                     <div>
                        <h3 className="text-4xl font-black text-white tracking-tighter leading-none italic uppercase">Verified Bank Link</h3>
                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.3em] mt-2">Neural Checkout Sequence Active</p>
                     </div>
                  </div>
                  <div className="space-y-5">
                     <div className="grid grid-cols-2 gap-5">
                        <div className="relative group">
                           <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within:text-blue-400 transition-colors"/>
                           <input type="text" placeholder="Cardholder Name" className="w-full pl-20 pr-10 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-800 font-bold transition-all" value={bankDetails.cardholderName} onChange={e => setBankDetails({...bankDetails, cardholderName: e.target.value})}/>
                        </div>
                        <div className="relative group">
                           <Building2 className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within:text-blue-400 transition-colors"/>
                           <input type="text" placeholder="Institution Name" className="w-full pl-20 pr-10 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-800 font-bold transition-all" value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})}/>
                        </div>
                     </div>
                     <div className="relative group text-lg">
                        <CreditCard className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 w-6 h-6 group-focus-within:text-blue-400 transition-colors"/>
                        <input type="text" placeholder="16-Digit Card Number" className="w-full pl-20 pr-10 py-7 bg-white/5 border border-white/10 rounded-[40px] text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-800 font-black tracking-[0.2em] transition-all" value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})}/>
                     </div>
                     <div className="grid grid-cols-3 gap-5">
                        <div className="col-span-1 relative group">
                           <Clock className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within:text-blue-400 transition-colors"/>
                           <input type="text" placeholder="MM/YY" className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-800 font-bold transition-all text-center" value={bankDetails.expiry} onChange={e => setBankDetails({...bankDetails, expiry: e.target.value})}/>
                        </div>
                        <div className="col-span-1 relative group">
                           <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within:text-blue-400 transition-colors"/>
                           <input type="text" placeholder="CVV" className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-800 font-bold transition-all text-center" value={bankDetails.cvv} onChange={e => setBankDetails({...bankDetails, cvv: e.target.value})}/>
                        </div>
                        <div className="col-span-1 relative group">
                           <Layers className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 group-focus-within:text-blue-400 transition-colors"/>
                           <input type="text" placeholder="IFSC Code" className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-[30px] text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-800 font-bold transition-all text-center" value={bankDetails.ifsc} onChange={e => setBankDetails({...bankDetails, ifsc: e.target.value})}/>
                        </div>
                     </div>
                  </div>
                  <div className="mt-12 p-8 bg-blue-500/5 border border-blue-500/10 rounded-[48px] flex items-start gap-6 relative group overflow-hidden">
                     <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <ShieldCheck className="text-blue-400 w-8 h-8 flex-shrink-0 mt-1" />
                     <p className="text-xs text-slate-400 font-black uppercase tracking-widest leading-loose">Automated <span className="text-white">Ensemble Verification Matrix</span> is active. Card patterns are verified across ISO, RF, SVM, and XGBoost nodes for maximum fraud protection.</p>
                  </div>
                  <button onClick={startAnalysis} className="w-full mt-12 bg-blue-600 text-white py-7 rounded-[40px] font-black text-2xl hover:bg-blue-500 transition-all shadow-2xl active:scale-[0.98] uppercase tracking-tighter italic">Verify and Pay</button>
               </motion.div>
            </div>
          ) : paymentStep === 'analyzing' ? (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/95 backdrop-blur-[100px]">
               <div className="text-center space-y-12">
                  <div className="relative w-48 h-48 mx-auto">
                     <div className="absolute inset-0 border-[6px] border-sky-500/10 rounded-full" />
                     <motion.div animate={{rotate:360}} transition={{repeat:Infinity, duration:1.5, ease:'linear'}} className="absolute inset-0 border-[6px] border-sky-500 border-t-transparent rounded-full shadow-[0_0_30px_rgba(14,165,233,0.4)]" />
                     <div className="absolute inset-0 m-auto w-20 h-20 bg-sky-600/10 rounded-full animate-pulse flex items-center justify-center">
                        <BrainCircuit className="w-12 h-12 text-sky-400" />
                     </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic">Phase: Analysis</h3>
                    <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-[10px]">Evaluating Ensemble Consensus Protocol (RF • XGB • IF • SVM)</p>
                  </div>
               </div>
            </div>
          ) : paymentStep === 'result' && analysisResult && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
               <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" />
               <motion.div initial={{y:200,opacity:0, scale:0.8}} animate={{y:0,opacity:1, scale:1}} className="glass-card w-full max-w-xl p-16 rounded-[80px] relative z-10 border border-white/10 shadow-2xl shadow-sky-900/40 text-center">
                  <div className={`w-32 h-32 mx-auto rounded-[40px] flex items-center justify-center mb-10 rotate-3 ${analysisResult.risk_level === 'HIGH RISK' ? 'bg-rose-500 shadow-rose-900/40 shadow-2xl' : 'bg-emerald-600 shadow-emerald-900/40 shadow-2xl'}`}>
                    {analysisResult.risk_level === 'HIGH RISK' ? <AlertTriangle className="w-16 h-16 text-white" /> : <ShieldCheck className="w-16 h-16 text-white" />}
                  </div>
                  <h3 className="text-5xl font-black text-white tracking-widest uppercase mb-4 italic">
                    Verdict: <span className={analysisResult.risk_level === 'HIGH RISK' ? 'text-rose-500' : 'text-emerald-400'}>
                      {analysisResult.risk_level === 'HIGH RISK' ? 'PAYMENT DECLINED' : analysisResult.risk_level}
                    </span>
                  </h3>
                  <div className="bg-white/5 p-8 rounded-[48px] border border-white/5 mb-8">
                     <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-3">Weighted Ensemble Consensus</p>
                     <h2 className="text-6xl font-black text-white tracking-tighter italic">{(analysisResult.ensemble_score * 100).toFixed(1)}<span className="text-2xl text-slate-700 ml-1">%</span></h2>
                  </div>

                  {/* 4-Model Accuracy/Score Matrix Integration */}
                  <div className="grid grid-cols-2 gap-4 mb-10 text-left">
                     {[
                        { k: 'iso', l: 'ISO Forest', c: 'sky' },
                        { k: 'rf', l: 'Rand Forest', c: 'emerald' },
                        { k: 'svm', l: 'SVM Kernel', c: 'amber' },
                        { k: 'xgb', l: 'XGBoost Pipe', c: 'rose' }
                     ].map(m => (
                        <div key={m.k} className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-sky-500/20 transition-colors">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.l}</span>
                              <div className={`w-1.5 h-1.5 rounded-full bg-${m.c}-500 neon-glow`} />
                           </div>
                           <div className="flex items-end gap-2">
                              <span className="text-2xl font-black text-white italic">{(analysisResult.models?.[m.k] * 100).toFixed(1)}%</span>
                              <span className="text-[10px] font-bold text-slate-600 mb-1">Score</span>
                           </div>
                           <div className="w-full h-1 bg-slate-900 rounded-full mt-3 overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }} 
                                 animate={{ width: `${analysisResult.models?.[m.k]*100}%` }} 
                                 transition={{ duration: 1, delay: 0.5 }}
                                 className={`h-full bg-${m.c}-500`} 
                              />
                           </div>
                        </div>
                     ))}
                  </div>
                  
                  {analysisResult.risk_level === 'HIGH RISK' ? (
                    <div className="space-y-6">
                       <p className="text-rose-400 font-bold text-lg max-w-xs mx-auto leading-relaxed">System protocols have engaged. Transaction locked for node safety.</p>
                       <button onClick={()=>{setPaymentStep('details'); setBankDetails({...bankDetails, accountNumber:''});}} className="w-full py-7 bg-white/5 rounded-[40px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest italic">Switch Encryption Key</button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                       <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em]">Verification Sequence Optimized</p>
                       <button onClick={()=>setPaymentStep('qr')} className="w-full py-7 bg-sky-600 text-white rounded-[40px] font-black text-2xl hover:bg-sky-500 shadow-2xl shadow-sky-900/40 transition-all active:scale-95 uppercase tracking-tighter italic">Generate Quantum Link</button>
                    </div>
                  )}
               </motion.div>
            </div>
          )
        )}
      </AnimatePresence>

      {/* Dynamic QR Pay - Quantum Generation */}
      <AnimatePresence>
        {paymentStep === 'qr' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-950/95 backdrop-blur-[120px]" />
             <motion.div initial={{scale:0.7,opacity:0,rotate:-5}} animate={{scale:1,opacity:1,rotate:0}} className="glass-card w-full max-w-sm p-14 rounded-[80px] relative z-10 border border-white/10 text-center shadow-[0_0_100px_rgba(14,165,233,0.1)]">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mx-auto mb-10 animate-ping" />
                <h3 className="text-3xl font-black text-white mb-3 tracking-tighter italic uppercase">Payment Link</h3>
                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mb-12">Dynamic Real-world Synchronization</p>
                <DynamicQR 
                  amount={cart.reduce((s,i)=>s+i.price*i.quantity,0)} 
                  onConfirm={() => {
                    setPaymentStep('success');
                  }} 
                />
                <p className="mt-8 text-[9px] text-slate-700 font-black uppercase tracking-widest">Quantum Expiration Protocol V.2.4</p>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* Payment Success Screen */}
      <AnimatePresence>
        {paymentStep === 'success' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-[120px]">
             <motion.div 
               initial={{scale:0.5, opacity:0}} 
               animate={{scale:1, opacity:1}} 
               className="glass-card w-full max-w-lg p-20 rounded-[80px] text-center border border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.2)]"
             >
                <div className="w-32 h-32 bg-emerald-600 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-900/50 rotate-6">
                   <ShieldCheck className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase mb-4">Payment Successfully</h2>
                <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.4em] mb-12">Transaction Verified & Credited</p>
                <button 
                  onClick={() => {
                    setCart([]);
                    setPaymentStep('details');
                    setActiveTab('history');
                  }} 
                  className="w-full py-7 bg-emerald-600 text-white rounded-[40px] font-black text-2xl hover:bg-emerald-500 transition-all uppercase tracking-tighter italic"
                >
                  Return to Dashboard
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Detail Modal Restoration - Admin Deep Inspect */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTx(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-3xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-2xl rounded-[80px] relative z-10 p-16 border border-white/10 text-center overflow-hidden">
              <button onClick={() => setSelectedTx(null)} className="absolute top-12 right-12 p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all"><X className="w-8 h-8 text-white"/></button>
              <div className="w-24 h-24 bg-sky-600/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-sky-400/20 shadow-2xl">
                 <BrainCircuit className="w-12 h-12 text-sky-400" />
              </div>
              <h3 className="text-5xl font-black text-white tracking-tighter mb-2 italic">Deep Intel View</h3>
              <p className="text-[10px] text-sky-500 font-bold uppercase tracking-[0.5em] mb-12 leading-relaxed">Transmission #TX-{selectedTx.transaction_id.padStart(8,'0')}</p>
              
              <div className="grid grid-cols-2 gap-5 mb-12">
                 {[
                   {k:'iso_score',l:'Isolation'},
                   {k:'rf_score',l:'RandomForest'},
                   {k:'svm_score',l:'Kernel SVM'},
                   {k:'xgb_score',l:'XGBoost Pipe'}
                 ].map(m => (
                   <div key={m.k} className="p-8 bg-white/5 rounded-[40px] text-left border border-white/5 transition-all hover:bg-white/10">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">{m.l}</p>
                      <h4 className="text-3xl font-black text-white tracking-tight leading-none italic">{parseFloat(selectedTx[m.k as keyof FraudResult]).toFixed(4)}</h4>
                   </div>
                 ))}
              </div>

              <div className="bg-gradient-to-tr from-sky-500 to-sky-700 p-0.5 rounded-[40px] shadow-2xl shadow-sky-900/20">
                 <div className="bg-slate-950 p-8 rounded-[38px] flex items-center justify-between">
                    <div className="text-left leading-none">
                       <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Weighted Output</span>
                       <h4 className="text-4xl font-black text-sky-400 italic">{(parseFloat(selectedTx.ensemble_score)*100).toFixed(1)}%</h4>
                    </div>
                    <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${selectedTx.risk_level === 'HIGH RISK' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>{selectedTx.risk_level}</div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
