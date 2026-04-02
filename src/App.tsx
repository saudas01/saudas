import * as React from 'react';
import { useState, useEffect, Component, ReactNode } from 'react';
import {
  Heart,
  Stethoscope,
  HandHelping,
  Users,
  Phone,
  MapPin,
  Mail,
  Search,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Droplets,
  Home,
  Activity,
  ShieldCheck,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Lock,
  Unlock,
  Trash2,
  Check,
  Edit3,
  Plus,
  Image as ImageIcon,
  LayoutDashboard,
  Settings,
  UserCog,
  LogIn,
  LogOut,
  User as UserIcon,
  UserCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { db, auth, storage } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  where,
  updateDoc,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User 
} from 'firebase/auth';

// --- Utils ---

const toBengaliNumber = (num: number | string) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(digit => bengaliDigits[parseInt(digit)] || digit).join('');
};

const AnimatedCounter = ({ target, duration = 2 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <>{toBengaliNumber(count)}</>;
};

const INITIAL_MEMBERS = [
  { id: 1, name: "মো: হুমায়ূন কবীর", designation: "সভাপতি", address: "রামপুর", mobile: "01724-120376" },
  { id: 2, name: "মো: সাইদুল ইসলাম", designation: "সহ-সভাপতি", address: "শাহপুর", mobile: "01767-627677" },
  { id: 3, name: "মো: মনিরুল ইসলাম", designation: "সহ-সভাপতি", address: "শাহপুর", mobile: "01314-506935" },
  { id: 4, name: "মো: রাজু আহমেদ", designation: "সহ-সভাপতি", address: "নোয়ালী", mobile: "01737-293846" },
  { id: 5, name: "মো: হাসিবুর রহমান", designation: "সহ-সভাপতি", address: "শাহপুর", mobile: "01717-842941" },
  { id: 6, name: "মো: জলি আহমেদ", designation: "সহ-সভাপতি", address: "মোবারকপুর", mobile: "01929-446455" },
  { id: 7, name: "মো: আল-আমিন", designation: "সহ-সভাপতি", address: "নোয়ালী", mobile: "01759-173958" },
  { id: 8, name: "মো: জি এম মহিউদ্দীন", designation: "সহ-সভাপতি", address: "শয়লা", mobile: "01743-430308" },
  { id: 9, name: "মো: রিফাত হোসেন", designation: "সহ-সভাপতি", address: "মোবারকপুর", mobile: "01928-849559" },
  { id: 10, name: "মো: রাহাজুল ইসলাম", designation: "সহ-সভাপতি", address: "চালুহাটি", mobile: "01931-628988" },
  { id: 11, name: "মো: মনিরুজ্জামান", designation: "সহ-সভাপতি", address: "মশ্বিমনগর", mobile: "01718-104887" },
  { id: 12, name: "মো: ফিরোজ আহমেদ", designation: "সাধারণ সম্পাদক", address: "শাহপুর", mobile: "01611-254580" },
  { id: 13, name: "মো: রায়হান হোসেন", designation: "সহ-সাধারণ সম্পাদক", address: "শাহপুর", mobile: "01960-920648" },
  { id: 14, name: "মো: বাবলু হোসেন", designation: "সহ-সাধারণ সম্পাদক", address: "মশ্বিমনগর", mobile: "01966-087413" },
  { id: 15, name: "মো: আরিফুল ইসলাম", designation: "সহ-সাধারণ সম্পাদক", address: "শাহপুর", mobile: "01778-562599" },
  { id: 16, name: "মো: তাজিল হোসেন", designation: "সহ-সাধারণ সম্পাদক", address: "রামপুর", mobile: "01318-378951" },
  { id: 17, name: "মো: তুহিন হোসেন", designation: "যুগ্ম সাধারণ সম্পাদক", address: "মশ্বিমনগর", mobile: "01313-965094" },
  { id: 18, name: "মো: সানোয়ার আলম", designation: "যুগ্ম সাধারণ সম্পাদক", address: "রামপুর", mobile: "01764-099085" },
  { id: 19, name: "উত্তম কুমার", designation: "যুগ্ম সাধারণ সম্পাদক", address: "রামপুর", mobile: "-" },
  { id: 20, name: "বিষ্ণু দত্ত", designation: "যুগ্ম সাধারণ সম্পাদক", address: "মশ্বিমনগর", mobile: "01754-468969" },
  { id: 21, name: "আব্দুর রহমান", designation: "সাংগঠনিক সম্পাদক", address: "শাহপুর", mobile: "01785-212490" },
  { id: 22, name: "মো: হুমায়ূন কবীর (রকি)", designation: "সহ-সাংগঠনিক সম্পাদক", address: "শাহপুর", mobile: "01996-110962" },
  { id: 23, name: "মো: জাকারিয়া আলম", designation: "সহ-সাংগঠনিক সম্পাদক", address: "শাহপুর", mobile: "01777-003278" },
  { id: 24, name: "মো: জলি", designation: "সহ-সাংগঠনিক সম্পাদক", address: "মশ্বিমনগর", mobile: "01960-795449" },
  { id: 25, name: "মো: সোহেল হোসেন", designation: "সহ-সাংগঠনিক সম্পাদক", address: "রামপুর", mobile: "01776-545420" },
  { id: 26, name: "মো: আবু সাইদ", designation: "কোষাধ্যক্ষ", address: "রামপুর", mobile: "01797-315660" },
  { id: 27, name: "মো: কালাম হোসেন", designation: "সহ-কোষাধ্যক্ষ", address: "রামপুর", mobile: "-" },
  { id: 28, name: "মো: ইমন হোসেন", designation: "সহ-কোষাধ্যক্ষ", address: "রামপুর", mobile: "-" },
  { id: 29, name: "মো: সুমন হোসেন", designation: "সহ-কোষাধ্যক্ষ", address: "রামপুর", mobile: "01916-919129" },
  { id: 30, name: "মো: সাইফুল্লাহ", designation: "দপ্তর সম্পাদক", address: "শাহপুর", mobile: "01788-306525" },
  { id: 31, name: "মো: অপু হোসেন", designation: "সহ-দপ্তর সম্পাদক", address: "রামপুর", mobile: "01728-462042" },
  { id: 32, name: "মো: সাইফুল ইসলাম", designation: "সহ-দপ্তর সম্পাদক", address: "শাহপুর", mobile: "01717-842941" },
  { id: 33, name: "মো: হাসিবুর রহমান", designation: "সহ-দপ্তর সম্পাদক", address: "শাহপুর", mobile: "-" },
  { id: 34, name: "মো: হোসাইন আলী", designation: "ক্রীড়া সম্পাদক", address: "শাহপুর", mobile: "01812-043504" },
  { id: 35, name: "মো: সাজেদুর রহমান", designation: "সহ-ক্রীড়া সম্পাদক", address: "রামপুর", mobile: "01791-753994" },
  { id: 36, name: "মো: আকিজ মিয়া", designation: "সহ-ক্রীড়া সম্পাদক", address: "শাহপুর", mobile: "01798-395678" },
  { id: 37, name: "মো: সোহাগ হোসেন", designation: "সাংস্কৃতিক সম্পাদক", address: "রামপুর", mobile: "-" },
  { id: 38, name: "মো: জাকির হোসেন", designation: "সহ-সাংস্কৃতিক সম্পাদক", address: "শাহপুর", mobile: "01301-359547" },
  { id: 39, name: "মো: নাহিদ হাসান", designation: "আইটি ও তথ্য সম্পাদক", address: "রামপুর", mobile: "01789-297506" },
  { id: 40, name: "মো: রাব্বি হোসেন", designation: "সহ-আইটি ও তথ্য সম্পাদক", address: "রাজগঞ্জ", mobile: "01311-496292" },
  { id: 41, name: "হাফেজ মো: রাসেল হোসেন", designation: "ধর্মীয় বিষয়ক সম্পাদক", address: "মশ্বিমনগর", mobile: "01778-609970" },
  { id: 42, name: "মো: রায়হান হোসেন", designation: "সহ-ধর্মীয় বিষয়ক সম্পাদক", address: "চাকলা", mobile: "01517-016822" },
  { id: 43, name: "ডা. মো: সোহাগ হোসেন", designation: "স্বাস্থ্য ও সচেতনতা সম্পাদক", address: "রামপুর", mobile: "01626-518899" },
  { id: 44, name: "মো: সবুজ হোসেন", designation: "সহ-স্বাস্থ্য ও সচেতনতা সম্পাদক", address: "রামপুর", mobile: "01761-042301" },
  { id: 45, name: "মো: ইউসুফ আলী", designation: "আইন বিষয়ক সম্পাদক", address: "শাহপুর", mobile: "01521-243083" },
  { id: 46, name: "তন্ময় সরকার", designation: "শিক্ষা ও সচেতনতা সম্পাদক", address: "রামপুর", mobile: "01776-616701" },
  { id: 47, name: "মো: তৌহিদ মোড়ল", designation: "যুব উন্নয়ন ও দক্ষতা সম্পাদক", address: "শাহপুর", mobile: "01786-075619" },
  { id: 48, name: "মো: আসাদুজ্জামান", designation: "যুব উন্নয়ন ও দক্ষতা সম্পাদক", address: "শাহপুর", mobile: "01764-420078" },
  { id: 49, name: "প্রসেনজিত কুমার", designation: "কর্মসংস্থান বিষয়ক সম্পাদক", address: "রামপুর", mobile: "01960-067578" },
  { id: 50, name: "মো: সুমন মিয়া", designation: "কর্মসংস্থান বিষয়ক সম্পাদক", address: "মনোহরপুর", mobile: "01946-532297" },
];

// --- Components ---

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "নিশ্চিত করুন", 
  cancelText = "বাতিল",
  type = 'danger'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
  confirmText?: string; 
  cancelText?: string;
  type?: 'danger' | 'primary'
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-emerald-900 border border-emerald-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-8 text-center"
      >
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg",
          type === 'danger' ? "bg-red-600/20 text-red-500 shadow-red-600/10" : "bg-emerald-600/20 text-emerald-500 shadow-emerald-600/10"
        )}>
          {type === 'danger' ? <Trash2 size={32} /> : <Check size={32} />}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-emerald-100/60 text-sm mb-8">{message}</p>
        <div className="flex gap-4">
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={cn(
              "flex-grow py-3 rounded-xl font-bold transition-all shadow-lg",
              type === 'danger' ? "bg-red-600 text-white hover:bg-red-500 shadow-red-600/20" : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20"
            )}
          >
            {confirmText}
          </button>
          <button 
            onClick={onClose}
            className="px-6 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
          >
            {cancelText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Notification = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 50, x: '-50%' }}
      className={cn(
        "fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]",
        type === 'success' ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      )}
    >
      {type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-auto p-1 hover:bg-white/20 rounded-lg transition-colors">
        <X size={16} />
      </button>
    </motion.div>
  );
};

const Navbar = ({ onLoginClick, user, setView }: { onLoginClick: () => void, user: User | null, setView: (v: 'home' | 'admin' | 'payment') => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'হোম', href: '#' },
    { name: 'আমাদের সম্পর্কে', href: '#about' },
    { name: 'সেবা সমূহ', href: '#services' },
    { name: 'সদস্যগণ', href: '#members' },
    { name: 'যুক্ত হোন', href: '#join' },
    { name: 'যোগাযোগ', href: '#contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Heart size={24} fill="currentColor" />
          </div>
          <span className={cn(
            "font-bold text-xl tracking-tight",
            isScrolled ? "text-emerald-950" : "text-white"
          )}>
            সাউদাস
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-emerald-500",
                isScrolled ? "text-emerald-900" : "text-white/90"
              )}
            >
              {link.name}
            </a>
          ))}
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => setView('admin')}
                className={cn(
                  "p-2 rounded-full transition-all hover:bg-emerald-500/10",
                  isScrolled ? "text-emerald-900" : "text-white"
                )}
                title="এডমিন প্যানেল"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full border border-emerald-500" />
                ) : (
                  <LayoutDashboard size={20} />
                )}
              </button>
            ) : (
              <button
              onClick={() => setView('payment')}
              className={cn(
                "p-2 rounded-full transition-all hover:bg-emerald-500/10",
                isScrolled ? "text-emerald-900" : "text-white"
              )}
              title="লগইন"
            >
              <LogIn size={20} />
            </button>
          )}
          <button
            onClick={() => setView('payment')}
            className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
          >
            দান করুন
          </button>
        </div>
      </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          {user ? (
            <button
              onClick={() => setView('admin')}
              className={cn("p-2", isScrolled ? "text-emerald-900" : "text-white")}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full border border-emerald-500/20" />
              ) : (
                <LayoutDashboard size={20} />
              )}
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className={cn("p-2", isScrolled ? "text-emerald-900" : "text-white")}
            >
              <LogIn size={20} />
            </button>
          )}
          <button
            className={cn("p-2", isScrolled ? "text-emerald-900" : "text-white")}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-emerald-50 md:hidden p-6 mx-4 mt-2 rounded-2xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-emerald-900 font-medium py-2 border-b border-emerald-50 last:border-0"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#join"
                className="bg-emerald-600 text-white px-5 py-3 rounded-xl text-center font-semibold mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                সদস্য হিসেবে যুক্ত হোন
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
const Hero = ({ setView }: { setView: (v: 'home' | 'admin' | 'payment') => void }) => {
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(50);

  useEffect(() => {
    if (!db) return;
    
    // Fetch active members for avatars
    const qActive = query(collection(db, 'active_members'), orderBy('order', 'asc'), limit(5));
    const unsubActive = onSnapshot(qActive, (snapshot) => {
      setActiveMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'active_members');
    });

    // Fetch total member count
    const qMembers = query(collection(db, 'members'), where('status', '==', 'approved'));
    const unsubCount = onSnapshot(qMembers, (snapshot) => {
      setTotalCount(Math.max(50, snapshot.size));
    });

    return () => {
      unsubActive();
      unsubCount();
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop"
          alt="সাউদাস মানবিক কার্যক্রম ও আশা"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 to-emerald-900/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6">
            সামাজিক কল্যাণমূলক দাতব্য সংস্থা
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
            মানবতার সেবায় <span className="text-emerald-400">আমরা</span> পাশে আছি
          </h1>
          <p className="text-lg text-emerald-50/80 mb-10 max-w-lg leading-relaxed">
            সামাজিক উন্নয়ন দাতব্য সংস্থা (সাউদাস) দারিদ্র্য বিমোচন, চিকিৎসা সহায়তা এবং টেকসই সামাজিক উন্নয়নে নিবেদিত।
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#join"
              className="bg-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-400 transition-all flex items-center gap-2 group shadow-xl shadow-emerald-500/20"
            >
              সদস্য হন
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </a>
            <button
              onClick={() => setView('payment')}
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
            >
              দান করুন
            </button>
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-4">
              {activeMembers.length > 0 ? (
                activeMembers.map((member) => (
                  <div key={member.id} className="w-12 h-12 rounded-full border-2 border-emerald-900 overflow-hidden bg-emerald-800">
                    {member.image ? (
                      <img src={member.image} alt={member.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-400">
                        <UserCircle size={24} />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-emerald-900 overflow-hidden bg-emerald-800">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="সদস্য" referrerPolicy="no-referrer" />
                  </div>
                ))
              )}
            </div>
            <div className="text-emerald-100/80 text-sm">
              <span className="text-white font-bold block text-lg">
                <AnimatedCounter target={totalCount} />+
              </span>
              সক্রিয় সদস্য
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:block relative"
        >
          <div className="relative z-10 rounded-3xl overflow-hidden border-8 border-white/10 shadow-2xl">
            <img
              src="https://storage.googleapis.com/static.antigravity.ai/projects/d1ac55c9-c597-4d96-a679-bc7e2363429a/attachments/4024f2b1-9f93-455b-801a-64219f7f4514.png"
              alt="সাউদাস ফ্রি মেডিক্যাল ক্যাম্প"
              className="w-full aspect-[4/3] object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Floating Stats */}
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl z-20 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <Droplets size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-900">১.২k+</div>
              <div className="text-xs text-emerald-600 font-medium uppercase tracking-wider">রক্তদাতা</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const About = () => {
  const [gallery, setGallery] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'), limit(4));
    return onSnapshot(q, (snapshot) => {
      setGallery(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  return (
    <section id="about" className="py-24 bg-emerald-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-4">আমাদের সম্পর্কে</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-8 leading-tight">
              মানবতার সেবায় আমরা - <span className="text-emerald-600">সাউদাস (SAUDAS)</span>
            </h3>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                    <Calendar size={18} />
                  </div>
                  আমাদের গল্প
                </h4>
                <p className="text-emerald-900/70 leading-relaxed">
                  ২০২৪ সাল থেকে আমরা একদল উদ্যমী মানুষ একত্রিত হয়েছি সমাজের পিছিয়ে পড়া মানুষদের জন্য কিছু করার তাগিদে। সাউদাস শুধু একটি নাম নয়, এটি একটি আস্থার প্রতীক।
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                    <HandHelping size={18} />
                  </div>
                  আমরা যা করি
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "রক্তদান", desc: "২৪ ঘণ্টা জরুরি প্রয়োজনে রক্তদাতার ব্যবস্থা করা।", icon: <Droplets size={20} /> },
                    { title: "ফ্রি মেডিক্যাল", desc: "প্রত্যন্ত অঞ্চলে অভিজ্ঞ ডাক্তার দ্বারা বিনামূল্যে স্বাস্থ্য সেবা।", icon: <Stethoscope size={20} /> },
                    { title: "অসুস্থদের পাশে", desc: "অসুস্থদের জন্য ফান্ড সংগ্রহ ও সহায়তা প্রদান।", icon: <Activity size={20} /> },
                    { title: "আমাদের শক্তি", desc: "আমাদের শক্তিশালী মেম্বার নেটওয়ার্ক ও তথ্য সংরক্ষণ।", icon: <ShieldCheck size={20} /> }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                      <div className="text-emerald-600 mb-2">{item.icon}</div>
                      <div className="font-bold text-emerald-950 text-sm mb-1">{item.title}</div>
                      <div className="text-emerald-900/60 text-xs leading-relaxed">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-emerald-600 rounded-3xl text-white shadow-xl shadow-emerald-600/20">
                <p className="leading-relaxed italic">
                  "আমাদের প্রতিটি সদস্যের তথ্য ওয়েবসাইটে সংরক্ষিত আছে যাতে যে কেউ বিপদে পড়লে আপনার কাছের সদস্যের সাথে যোগাযোগ করতে পারেন।"
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4 rounded-[2.5rem] overflow-hidden shadow-2xl bg-white p-4">
              {gallery.length > 0 ? gallery.map((photo, i) => (
                <div key={photo.id} className={cn(
                  "overflow-hidden rounded-2xl",
                  i === 0 ? "col-span-2 aspect-video" : "aspect-square"
                )}>
                  {photo.url ? (
                    <img 
                      src={photo.url} 
                      alt="সাউদাস ফ্রি মেডিক্যাল ক্যাম্প" 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
              )) : (
                <div className="col-span-2">
                  <img 
                    src="https://storage.googleapis.com/static.antigravity.ai/projects/d1ac55c9-c597-4d96-a679-bc7e2363429a/attachments/4024f2b1-9f93-455b-801a-64219f7f4514.png" 
                    alt="সাউদাস ফ্রি মেডিক্যাল ক্যাম্প" 
                    className="w-full aspect-video object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeImageIndices, setActiveImageIndices] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Only seed if user is admin
        const isAdmin = user?.email === "md.munnahossain885@gmail.com";
        if (isAdmin) {
          const initialServices = [
            {
              title: "রক্তদান কর্মসূচি",
              description: "জীবন রক্ষাকারী রক্তদাতাদের সাথে সম্প্রদায়ের জরুরি প্রয়োজনে থাকা ব্যক্তিদের সংযুক্ত করা।",
              icon: "Droplets",
              images: ["https://storage.googleapis.com/static.antigravity.ai/projects/d1ac55c9-c597-4d96-a679-bc7e2363429a/attachments/40669f53-5353-487c-8608-89c565893043.png"],
              color: "bg-red-50 text-red-600",
              accent: "border-red-100"
            },
            {
              title: "ফ্রি মেডিক্যাল ক্যাম্প",
              description: "সুবিধাবঞ্চিত জনগোষ্ঠীর জন্য প্রয়োজনীয় স্বাস্থ্যসেবা এবং চেকআপ প্রদান করা।",
              icon: "Stethoscope",
              images: ["https://storage.googleapis.com/static.antigravity.ai/projects/d1ac55c9-c597-4d96-a679-bc7e2363429a/attachments/17596041-35b8-444c-9f69-79a66014603b.png"],
              color: "bg-emerald-50 text-emerald-600",
              accent: "border-emerald-100"
            },
            {
              title: "দরিদ্রদের সহায়তা",
              description: "টেকসই জীবিকা কর্মসূচি এবং সরাসরি সহায়তার মাধ্যমে পরিবারগুলোকে শক্তিশালী করা।",
              icon: "HandHelping",
              images: ["https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop"],
              color: "bg-amber-50 text-amber-600",
              accent: "border-amber-100"
            },
            {
              title: "অসুস্থ ব্যক্তিদের চিকিৎসা",
              description: "অসুস্থ ব্যক্তিদের জন্য জরুরি চিকিৎসা সহায়তা এবং ফান্ড সংগ্রহ করা।",
              icon: "Activity",
              images: ["https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop"],
              color: "bg-blue-50 text-blue-600",
              accent: "border-blue-100"
            }
          ];
          
          try {
            for (const s of initialServices) {
              await setDoc(doc(collection(db, 'services')), s);
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'services');
          }
        }
      } else {
        const fetchedServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(fetchedServices);
        
        // Initialize active image indices
        const indices: {[key: string]: number} = {};
        fetchedServices.forEach(s => {
          indices[s.id] = 0;
        });
        setActiveImageIndices(indices);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'services');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return <Droplets size={32} />;
      case 'Stethoscope': return <Stethoscope size={32} />;
      case 'HandHelping': return <HandHelping size={32} />;
      case 'Activity': return <Activity size={32} />;
      default: return <Heart size={32} />;
    }
  };

  const nextImage = (serviceId: string, imagesCount: number) => {
    setActiveImageIndices(prev => ({
      ...prev,
      [serviceId]: (prev[serviceId] + 1) % imagesCount
    }));
  };

  const prevImage = (serviceId: string, imagesCount: number) => {
    setActiveImageIndices(prev => ({
      ...prev,
      [serviceId]: (prev[serviceId] - 1 + imagesCount) % imagesCount
    }));
  };

  if (loading) return null;

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-4">আমাদের লক্ষ্য</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-6">জীবন বদলে দেওয়া সেবাসমূহ</h3>
          <p className="text-emerald-900/60 text-lg">
            আমরা প্রতিটি ব্যক্তির উন্নতির সুযোগ নিশ্চিত করতে তাৎক্ষণিক ত্রাণ এবং দীর্ঘমেয়াদী ক্ষমতায়নের দিকে মনোনিবেশ করি।
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, idx) => {
            const images = service.images || [];
            const activeIdx = activeImageIndices[service.id] || 0;

            return (
              <motion.div
                key={service.id || service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "overflow-hidden rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1 group",
                  service.accent || "border-emerald-100"
                )}
              >
                <div className="relative h-48 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {images.length > 0 ? (
                      <motion.img 
                        key={activeIdx}
                        src={images[activeIdx]} 
                        alt={service.title}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-200">
                        <ImageIcon size={48} />
                      </div>
                    )}
                  </AnimatePresence>
                  
                  {images.length > 1 && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {images.map((_: any, i: number) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all",
                              i === activeIdx ? "bg-white w-4" : "bg-white/50"
                            )}
                          />
                        ))}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); prevImage(service.id, images.length); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); nextImage(service.id, images.length); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </div>
                <div className="p-8">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", service.color || "bg-emerald-50 text-emerald-600")}>
                    {getIcon(service.icon)}
                  </div>
                  <h4 className="text-xl font-bold text-emerald-950 mb-4">{service.title}</h4>
                  <p className="text-emerald-900/60 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <button className="text-emerald-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                    আরও জানুন <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const ActiveMembers = () => {
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(
      query(collection(db, 'active_members'), orderBy('order', 'asc')),
      (snapshot) => {
        setActiveMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'active_members');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  if (loading || activeMembers.length === 0) return null;

  // Duplicate members for seamless loop
  const displayMembers = [...activeMembers, ...activeMembers];

  return (
    <section id="members" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -ml-48 -mb-48 opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold mb-6 border border-emerald-100"
          >
            <Users size={16} />
            <span>আমাদের পরিবার</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-emerald-950 mb-6 tracking-tight"
          >
            সক্রিয় <span className="text-emerald-600">সদস্যবৃন্দ</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-emerald-900/60 text-lg max-w-2xl mx-auto"
          >
            সাউদাস-এর মূল চালিকাশক্তি হলো আমাদের নিবেদিতপ্রাণ সদস্যগণ। তাদের অক্লান্ত পরিশ্রমেই আমরা এগিয়ে চলছি।
          </motion.p>
        </div>

        {/* Leadership Slider */}
        <div className="relative mb-24 overflow-hidden">
          <motion.div 
            className="flex gap-8 w-max"
            animate={{ x: [0, -(312 * activeMembers.length)] }} // 280px width + 32px gap = 312px
            transition={{ 
              repeat: Infinity, 
              duration: activeMembers.length * 5, 
              ease: "linear" 
            }}
          >
            {displayMembers.map((leader, idx) => (
              <div
                key={`leader-${leader.id}-${idx}`}
                className="w-[280px] bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-900/5 hover:shadow-emerald-900/10 transition-all group relative overflow-hidden flex-shrink-0"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[3rem] -mr-4 -mt-4 group-hover:bg-emerald-100 transition-colors" />
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-emerald-100 rounded-2xl overflow-hidden mb-6 shadow-lg group-hover:scale-110 transition-transform border-2 border-emerald-500/20">
                    {leader.image ? (
                      <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-500">
                        <UserCircle size={40} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-emerald-950 mb-1">{leader.name}</h4>
                  <p className="text-emerald-600 font-bold text-sm uppercase tracking-wider mb-4">{leader.role}</p>
                  <div className="space-y-2 pt-4 border-t border-emerald-50">
                    {leader.address && (
                      <div className="flex items-center gap-3 text-emerald-900/60 text-sm">
                        <MapPin size={14} />
                        <span>{leader.address}</span>
                      </div>
                    )}
                    {leader.phone && (
                      <div className="flex items-center gap-3 text-emerald-900/60 text-sm">
                        <Phone size={14} />
                        <a href={`tel:${leader.phone}`} className="hover:text-emerald-600 transition-colors">{leader.phone}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const MemberDirectory = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("সব");
  const [dbMembers, setDbMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const fetchMembers = async (isNext = false) => {
    if (!db) return;
    setLoading(true);
    try {
      let q = query(
        collection(db, 'members'), 
        where('status', '==', 'approved'), 
        orderBy('joinedAt', 'asc'),
        limit(PAGE_SIZE)
      );

      if (isNext && lastDoc) {
        q = query(
          collection(db, 'members'), 
          where('status', '==', 'approved'), 
          orderBy('joinedAt', 'asc'),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }

      const snapshot = await getDocs(q);
      const newMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (isNext) {
        setDbMembers(prev => [...prev, ...newMembers]);
      } else {
        setDbMembers(newMembers);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Combine hardcoded members with database members
  const allMembers = [
    ...dbMembers,
    ...INITIAL_MEMBERS.filter(im => !dbMembers.some(dm => dm.phone === im.mobile)).map(m => ({
      id: `static-${m.id}`,
      name: m.name,
      role: m.designation,
      address: m.address,
      phone: m.mobile,
      email: '',
      bloodGroup: 'N/A',
      status: 'approved',
      isStatic: true,
      joinedAt: m.id // Use ID as a sort key for static members
    }))
  ].sort((a, b) => {
    // Always keep the President at the top
    if (a.name === "মো: হুমায়ূন কবীর") return -1;
    if (b.name === "মো: হুমায়ূন কবীর") return 1;
    return (a.joinedAt || 0) - (b.joinedAt || 0);
  });

  const roles = ["সব", ...Array.from(new Set(allMembers.map(m => m.role).filter(Boolean)))];

  const filteredMembers = allMembers.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.address?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "সব" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <section id="directory" className="py-24 bg-emerald-50/50">
      <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-4">সম্প্রদায় ডিরেক্টরি</h2>
            <h3 className="text-4xl font-bold text-emerald-950 mb-4">নিবন্ধিত সদস্যগণ</h3>
            <p className="text-emerald-900/60">
              আমাদের সকল সদস্য ও নতুন যুক্ত হওয়া ব্যক্তিদের পূর্ণাঙ্গ তালিকা।
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
              <select
                className="w-full pl-12 pr-10 py-3 bg-white border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer appearance-none"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
              <input
                type="text"
                placeholder="সদস্য খুঁজুন..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <th className="pl-8 pr-4 py-5 text-sm font-bold text-emerald-900 uppercase tracking-wider w-16">ক্র.নং</th>
                  <th className="px-4 py-5 text-sm font-bold text-emerald-900 uppercase tracking-wider">নাম</th>
                  <th className="px-8 py-5 text-sm font-bold text-emerald-900 uppercase tracking-wider">পদবী/ভূমিকা</th>
                  <th className="px-8 py-5 text-sm font-bold text-emerald-900 uppercase tracking-wider">ঠিকানা</th>
                  <th className="px-8 py-5 text-sm font-bold text-emerald-900 uppercase tracking-wider">রক্তের গ্রুপ</th>
                  <th className="px-8 py-5 text-sm font-bold text-emerald-900 uppercase tracking-wider">ফোন ও ইমেইল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {loading && dbMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-emerald-900/40">
                      সদস্য তালিকা লোড হচ্ছে...
                    </td>
                  </tr>
                ) : filteredMembers.map((member, idx) => (
                  <motion.tr
                    key={member.id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    className="hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="pl-8 pr-4 py-5 text-emerald-900/40 font-mono text-sm">
                      {toBengaliNumber(idx + 1)}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0 border border-emerald-200">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-emerald-300">
                              <UserCircle size={24} />
                            </div>
                          )}
                        </div>
                        <div className="font-semibold text-emerald-950">{member.name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "inline-block px-3 py-1 text-xs font-bold rounded-full border",
                        member.isStatic ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-emerald-900/70">{member.address}</td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100">
                        {member.bloodGroup || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <a href={`tel:${member.phone}`} className="text-emerald-900/70 font-mono text-sm whitespace-nowrap hover:text-emerald-600 transition-colors">{member.phone}</a>
                        {member.email && (
                          <>
                            <span className="text-emerald-900/20 hidden sm:inline">|</span>
                            <span className="text-emerald-900/40 text-xs whitespace-nowrap">{member.email}</span>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-emerald-900/40 italic">
                      আপনার অনুসন্ধানের সাথে মেলে এমন কোনো সদস্য পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {hasMore && !loading && (
          <div className="mt-12 text-center">
            <button 
              onClick={() => fetchMembers(true)}
              className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20"
            >
              আরো সদস্য দেখুন
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const RegistrationForm = ({ showNotification }: { showNotification: (m: string, t: 'success' | 'error') => void }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    bloodGroup: '',
    address: '',
    role: 'স্বেচ্ছাসেবক'
  });

  const validatePhone = (phone: string) => {
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    const cleanPhone = phone.replace(/[-\s]/g, '');
    return bdPhoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    if (!validatePhone(formData.phone)) {
      setPhoneError('সঠিক বাংলাদেশি মোবাইল নম্বর প্রদান করুন (যেমন: ০১৭XXXXXXXX)');
      return;
    }

    if (!db) {
      showNotification("ফায়ারবেস কনফিগার করা হয়নি।", 'error');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'members'), {
        ...formData,
        status: 'pending',
        joinedAt: Date.now()
      });
      setIsSubmitted(true);
      setFormData({ name: '', phone: '', email: '', bloodGroup: '', address: '', role: 'স্বেচ্ছাসেবক' });
      showNotification("আপনার আবেদন সফলভাবে জমা হয়েছে।", 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'members');
      showNotification("আবেদন জমা দিতে সমস্যা হয়েছে।", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="join" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50" />
          <div className="relative z-10">
            <h2 className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-4">অংশগ্রহণ করুন</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-6">আজই সদস্য হোন</h3>
            <p className="text-emerald-900/60 text-lg mb-10 leading-relaxed">
              আমাদের পরিবর্তন-প্রণেতাদের সম্প্রদায়ে যোগ দিন। আপনি একজন চিকিৎসা পেশাদার, একজন ছাত্র, অথবা এমন কেউ যিনি সমাজের জন্য কিছু করতে চান, সাউদাস-এ আপনার জন্য জায়গা আছে।
            </p>

            <div className="space-y-6">
              {[
                "বিনামূল্যে মেডিকেল ক্যাম্পে অংশগ্রহণ করুন",
                "রক্তদান কর্মসূচিতে অবদান রাখুন",
                "দারিদ্র্য বিমোচন ত্রাণ বিতরণে সহায়তা করুন",
                "সামাজিক নেটওয়ার্কিং ইভেন্টগুলোতে অংশ নিন"
              ].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-emerald-900 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-emerald-900 p-8 md:p-12 rounded-[2rem] shadow-2xl relative"
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-emerald-100/70 text-sm font-medium ml-1">পুরো নাম</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      placeholder="আপনার নাম"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-emerald-100/70 text-sm font-medium ml-1">মোবাইল নম্বর</label>
                    <input
                      required
                      type="tel"
                      className={cn(
                        "w-full bg-emerald-800/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all",
                        phoneError ? "border-red-500 focus:ring-red-500/50" : "border-emerald-700 focus:ring-emerald-500/50"
                      )}
                      placeholder="০১৯২৪-XXXXXX"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (phoneError) setPhoneError('');
                      }}
                    />
                    {phoneError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs ml-1"
                      >
                        {phoneError}
                      </motion.p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-emerald-100/70 text-sm font-medium ml-1">ইমেইল (ঐচ্ছিক)</label>
                  <input
                    type="email"
                    className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-emerald-100/70 text-sm font-medium ml-1">রক্তের গ্রুপ</label>
                    <select
                      required
                      className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      <option value="">নির্বাচন করুন</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-emerald-100/70 text-sm font-medium ml-1">পছন্দের ভূমিকা</label>
                    <select
                      className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="স্বেচ্ছাসেবক">স্বেচ্ছাসেবক</option>
                      <option value="চিকিৎসা পেশাদার">চিকিৎসা পেশাদার</option>
                      <option value="রক্তদাতা">রক্তদাতা</option>
                      <option value="সমাজকর্মী">সমাজকর্মী</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-emerald-100/70 text-sm font-medium ml-1">পুরো ঠিকানা</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                    placeholder="আপনার পূর্ণ ঠিকানা লিখুন"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
                >
                  {loading ? "জমা দেওয়া হচ্ছে..." : "আবেদন জমা দিন"}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">আবেদন গ্রহণ করা হয়েছে!</h4>
                <p className="text-emerald-100/70">
                  সাউদাস-এ যোগদানের জন্য আপনাকে ধন্যবাদ। আপনার নিবন্ধন সম্পন্ন করতে আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
                >
                  আরেকটি আবেদন জমা দিন
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-emerald-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-12">
            <div>
              <h2 className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-4">যোগাযোগ করুন</h2>
              <h3 className="text-4xl font-bold text-emerald-950 mb-6">চলুন কথা বলি</h3>
              <p className="text-emerald-900/60 leading-relaxed">
                আপনার কি কোনো প্রশ্ন আছে বা আমাদের উদ্দেশ্যকে সমর্থন করতে চান? এই মাধ্যমগুলোর যেকোনো একটির মাধ্যমে আমাদের সাথে যোগাযোগ করুন।
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: <Phone />, title: "ফোন", value: "+৮৮ ০১৯২৪-৪৬৫৪৫৪", href: "tel:+8801924465454" },
                { icon: <Mail />, title: "ইমেইল", value: "sdoo07072025@gmail.com", href: "mailto:sdoo07072025@gmail.com" },
                { icon: <MapPin />, title: "অফিস", value: "প্রধান কার্যালয়ঃ রাজগঞ্জ, মনিরামপুর, যশোর।" }
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">{item.title}</div>
                    {item.href ? (
                      <a href={item.href} className="text-emerald-950 font-semibold hover:text-emerald-600 transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <div className="text-emerald-950 font-semibold">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="h-full min-h-[400px] bg-white rounded-[2rem] border border-emerald-100 shadow-sm overflow-hidden relative">
              {/* Mock Map */}
              <div className="absolute inset-0 bg-emerald-50 flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin size={48} className="text-emerald-300 mx-auto mb-4" />
                  <p className="text-emerald-900/40 font-medium italic">ইন্টারেক্টিভ ম্যাপ ভিউ</p>
                  <p className="text-emerald-900/40 text-sm mt-2">প্রধান কার্যালয়ঃ রাজগঞ্জ, মনিরামপুর, যশোর।</p>
                </div>
              </div>
              {/* Overlay for "Open in New Tab" feel */}
              <div className="absolute inset-0 bg-emerald-900/5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ setView }: { setView: (v: 'home' | 'admin' | 'payment') => void }) => {
  return (
    <footer className="bg-emerald-950 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                <Heart size={24} fill="currentColor" />
              </div>
              <span className="font-bold text-2xl tracking-tight">সাউদাস</span>
            </div>
            <p className="text-emerald-100/60 max-w-md leading-relaxed mb-8">
              সামাজিক উন্নয়ন দাতব্য সংস্থা একটি অলাভজনক সংস্থা যা স্বাস্থ্যসেবা, শিক্ষা এবং দারিদ্র্য বিমোচনের মাধ্যমে একটি আরও ন্যায়সঙ্গত সমাজ গঠনের জন্য নিবেদিত।
            </p>
            <div className="flex gap-4">
              {[
                { name: 'Facebook', icon: <Facebook size={20} />, href: "https://www.facebook.com/share/1BHiaSMJHt/" },
                { name: 'Twitter', icon: <Twitter size={20} />, href: "#" },
                { name: 'Instagram', icon: <Instagram size={20} />, href: "#" },
                { name: 'LinkedIn', icon: <Linkedin size={20} />, href: "#" }
              ].map(social => (
                <a 
                  key={social.name} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 transition-all text-emerald-100/60 hover:text-white"
                >
                  <span className="sr-only">{social.name}</span>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">দ্রুত লিঙ্ক</h4>
            <ul className="space-y-4 text-emerald-100/60">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">হোম</a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">আমাদের সম্পর্কে</a></li>
              <li><a href="#services" className="hover:text-emerald-400 transition-colors">আমাদের সেবাসমূহ</a></li>
              <li><a href="#members" className="hover:text-emerald-400 transition-colors">সদস্যগণ</a></li>
              <li><button onClick={() => setView('payment')} className="hover:text-emerald-400 transition-colors">দান করুন</button></li>
              <li><a href="#join" className="hover:text-emerald-400 transition-colors">যুক্ত হোন</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">নিউজলেটার</h4>
            <p className="text-emerald-100/60 text-sm mb-4">আমাদের সর্বশেষ মিশন এবং প্রভাব রিপোর্ট সম্পর্কে আপডেট থাকুন।</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="ইমেইল"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
              />
              <button className="bg-emerald-500 p-2 rounded-lg hover:bg-emerald-400 transition-colors">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-emerald-100/40">
          <p>© ২০২৬ সাউদাস। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-emerald-100 transition-colors">গোপনীয়তা নীতি</a>
            <a href="#" className="hover:text-emerald-100 transition-colors">পরিষেবার শর্তাবলী</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const LoginModal = ({ onClose, showNotification }: { onClose: () => void, showNotification: (m: string, t: 'success' | 'error') => void }) => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let email = loginIdentifier;
      
      // Check for specific admin credentials
      if (loginIdentifier === 'admin' && loginPassword === 'admin123456') {
        email = 'admin@saudas.org';
        try {
          await signInWithEmailAndPassword(auth, email, loginPassword);
        } catch (error: any) {
          if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            // Try to create the admin user if it doesn't exist
            try {
              await createUserWithEmailAndPassword(auth, email, loginPassword);
            } catch (createError: any) {
              // If creation fails (e.g. user already exists but password was wrong), let the original error handle it
              throw error;
            }
          } else {
            throw error;
          }
        }
      } else {
        if (/^[\d+-\s]+$/.test(loginIdentifier)) {
          const q = query(collection(db, 'users'), where('phone', '==', loginIdentifier));
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) {
            throw new Error("এই ফোন নম্বর দিয়ে কোনো এডমিন অ্যাকাউন্ট পাওয়া যায়নি।");
          }
          email = querySnapshot.docs[0].data().email;
        }
        await signInWithEmailAndPassword(auth, email, loginPassword);
      }
      
      showNotification("সফলভাবে লগইন হয়েছে।", 'success');
      onClose();
    } catch (error: any) {
      console.error("Login failed:", error);
      let errorMessage = "লগইন ব্যর্থ হয়েছে।";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "ভুল ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ড।";
      }
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-emerald-900 border border-emerald-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-8 md:p-12"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-emerald-400 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-600/20">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">এডমিন লগইন</h2>
          <p className="text-emerald-400">আপনার একাউন্টে প্রবেশ করুন</p>
        </div>

        <form onSubmit={handleEmailPasswordLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-emerald-100/70 text-sm font-medium ml-1">ইমেইল অথবা ফোন নম্বর</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
              <input
                required
                type="text"
                className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="admin / 017XXXXXXXX"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-emerald-100/70 text-sm font-medium ml-1">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
              <input
                required
                type="password"
                className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? "প্রবেশ করা হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const AdminPanel = ({ user, showNotification, setConfirmConfig, setView }: { 
  user: User, 
  showNotification: (m: string, t: 'success' | 'error') => void,
  setConfirmConfig: (config: any) => void,
  setView: (v: 'home' | 'admin') => void
}) => {
  const [adminData, setAdminData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'services' | 'gallery' | 'active_members'>('approved');
  const [members, setMembers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editType, setEditType] = useState<'member' | 'service' | 'active_member' | null>(null);
  
  const isAdmin = user?.email === "md.munnahossain885@gmail.com" || user?.email === "admin@saudas.org" || adminData?.role === 'admin';

  const seedMembers = async () => {
    if (!db || !isAdmin) return;
    setLoading(true);
    try {
      // Clear existing members to prevent duplication
      const membersSnap = await getDocs(collection(db, 'members'));
      for (const docSnap of membersSnap.docs) {
        await deleteDoc(doc(db, 'members', docSnap.id));
      }
      
      const activeSnap = await getDocs(collection(db, 'active_members'));
      for (const docSnap of activeSnap.docs) {
        await deleteDoc(doc(db, 'active_members', docSnap.id));
      }

      // Seed approved members
      for (const m of INITIAL_MEMBERS) {
        await addDoc(collection(db, 'members'), {
          name: m.name,
          role: m.designation,
          address: m.address,
          phone: m.mobile,
          email: '',
          bloodGroup: 'A+',
          status: 'approved',
          joinedAt: m.id
        });
      }

      // Seed active members (first 5 from initial members)
      const activeSeed = INITIAL_MEMBERS.slice(0, 5);
      for (let i = 0; i < activeSeed.length; i++) {
        const m = activeSeed[i];
        await addDoc(collection(db, 'active_members'), {
          name: m.name,
          role: m.designation,
          address: m.address,
          phone: m.mobile,
          image: `https://i.pravatar.cc/150?u=${m.id}`,
          order: i
        });
      }

      showNotification("সদস্যদের তথ্য সফলভাবে ইমপোর্ট করা হয়েছে।", 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setAdminData(userDoc.data());
        } else if (user.email === "md.munnahossain885@gmail.com" || user.email === "admin@saudas.org") {
          // Bootstrap default admin
          const defaultAdmin = {
            uid: user.uid,
            email: user.email,
            role: 'admin',
            name: user.displayName || 'Default Admin'
          };
          await setDoc(doc(db, 'users', user.uid), defaultAdmin);
          setAdminData(defaultAdmin);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchAdminData();
  }, [user]);

  useEffect(() => {
    if (!isAdmin || !db) return;

    // Fetch members
    const qMembers = query(collection(db, 'members'), orderBy('joinedAt', 'asc'));
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'members');
    });

    // Fetch services
    const qServices = query(collection(db, 'services'));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'services');
    });

    // Fetch gallery
    const qGallery = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubGallery = onSnapshot(qGallery, (snapshot) => {
      setGallery(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'gallery');
    });

    // Fetch active members
    const qActiveMembers = query(collection(db, 'active_members'), orderBy('order', 'asc'));
    const unsubActiveMembers = onSnapshot(qActiveMembers, (snapshot) => {
      setActiveMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'active_members');
    });

    return () => {
      unsubMembers();
      unsubServices();
      unsubGallery();
      unsubActiveMembers();
    };
  }, [isAdmin]);

  const handleLogout = () => signOut(auth);

  if (!user) {
    return null;
  }

  const updateMemberStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!db) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'members', id), { status });
      showNotification(status === 'approved' ? "আবেদন অনুমোদন করা হয়েছে।" : "আবেদন বাতিল করা হয়েছে।", 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `members/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (collectionName: string, id: string) => {
    if (!db) return;
    
    setConfirmConfig({
      isOpen: true,
      title: "মুছে ফেলার নিশ্চিতকরণ",
      message: "আপনি কি নিশ্চিতভাবে এটি মুছে ফেলতে চান? এই কাজটি আর ফেরত নেওয়া যাবে না।",
      type: 'danger',
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteDoc(doc(db, collectionName, id));
          showNotification("সফলভাবে মুছে ফেলা হয়েছে।", 'success');
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !editingItem) return;
    setLoading(true);
    
    let targetCollection = '';
    if (editType === 'member') targetCollection = 'members';
    else if (editType === 'service') targetCollection = 'services';
    else if (editType === 'active_member') targetCollection = 'active_members';

    try {
      const { id, isStatic, ...data } = editingItem;
      
      if (id === 'new' || isStatic) {
        if (editType === 'member') {
          data.joinedAt = data.joinedAt || Date.now();
          data.status = 'approved';
        }
        await addDoc(collection(db, targetCollection), data);
        showNotification("সফলভাবে যোগ করা হয়েছে।", 'success');
      } else {
        await updateDoc(doc(db, targetCollection, String(id)), data);
        showNotification("সফলভাবে পরিবর্তন সেভ করা হয়েছে।", 'success');
      }
      
      setEditingItem(null);
      setEditType(null);
    } catch (error) {
      handleFirestoreError(error, (editingItem.id === 'new' || editingItem.isStatic) ? OperationType.CREATE : OperationType.UPDATE, `${targetCollection}/${editingItem.id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'member' | 'service' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!storage) {
      showNotification("Firebase Storage কনফিগার করা নেই। অনুগ্রহ করে সেটিংস চেক করুন।", 'error');
      return;
    }

    setUploading(true);
    try {
      const path = type === 'member' ? 'members' : type === 'service' ? 'services' : 'gallery';
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `${path}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      if (type === 'gallery') {
        await addDoc(collection(db, 'gallery'), {
          url,
          createdAt: Date.now()
        });
        showNotification("গ্যালারিতে ছবি যোগ করা হয়েছে।", 'success');
      } else if (editingItem) {
        if (editType === 'service') {
          const currentImages = editingItem.images || [];
          setEditingItem({ ...editingItem, images: [...currentImages, url] });
        } else {
          setEditingItem({ ...editingItem, image: url });
        }
        showNotification("ছবি আপলোড সম্পন্ন হয়েছে।", 'success');
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      let msg = "ছবি আপলোড করতে সমস্যা হয়েছে।";
      if (error.code === 'storage/unauthorized') {
        msg = "ছবি আপলোড করার অনুমতি নেই (Storage Rules)।";
      } else if (error.code === 'storage/canceled') {
        msg = "আপলোড বাতিল করা হয়েছে।";
      }
      showNotification(msg, 'error');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  if (!isAdmin) {
    return (
      <div className="py-12 bg-emerald-950 text-center text-white">
        <p className="mb-4">আপনার এডমিন এক্সেস নেই। ({user.email})</p>
        <button onClick={handleLogout} className="text-emerald-400 underline">লগআউট</button>
      </div>
    );
  }

  const pendingMembers = members.filter(m => m.status === 'pending');
  const dbApprovedMembers = members.filter(m => m.status === 'approved');
  
  // Combine with static members that aren't in the DB yet (matching by phone)
  const approvedMembers = [
    ...dbApprovedMembers,
    ...INITIAL_MEMBERS.filter(im => !dbApprovedMembers.some(am => am.phone === im.mobile)).map(im => ({
      id: `static-${im.id}`,
      name: im.name,
      role: im.designation,
      address: im.address,
      phone: im.mobile,
      email: '',
      bloodGroup: 'N/A',
      status: 'approved',
      isStatic: true,
      joinedAt: im.id
    }))
  ].sort((a, b) => {
    // Always keep the President at the top
    if (a.name === "মো: হুমায়ূন কবীর") return -1;
    if (b.name === "মো: হুমায়ূন কবীর") return 1;
    return (a.joinedAt || 0) - (b.joinedAt || 0);
  });

  return (
    <section id="admin" className="py-24 bg-emerald-950 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('home')}
              className="p-3 bg-emerald-900/50 text-emerald-400 rounded-2xl border border-emerald-800 hover:text-white transition-all"
              title="হোমে ফিরে যান"
            >
              <ArrowRight className="rotate-180" size={24} />
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-3">
                <LayoutDashboard className="text-emerald-500" /> এডমিন প্যানেল
              </h2>
              <p className="text-sm text-emerald-400">সাউদাস-এর কার্যক্রম ও সদস্য ব্যবস্থাপনা।</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center justify-around sm:justify-start gap-6 px-6 py-3 bg-emerald-900/50 rounded-2xl border border-emerald-800">
              <div className="text-center">
                <div className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider mb-1">মোট সদস্য</div>
                <div className="text-xl font-black text-white">{toBengaliNumber(members.length)}</div>
              </div>
              <div className="w-px h-8 bg-emerald-800" />
              <div className="text-center">
                <div className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider mb-1">নিবন্ধিত</div>
                <div className="text-xl font-black text-white">{toBengaliNumber(approvedMembers.length)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {activeTab === 'approved' && dbApprovedMembers.length < 10 && (
                <button 
                  onClick={seedMembers}
                  disabled={loading}
                  className="flex-grow sm:flex-none px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-all disabled:opacity-50"
                >
                  ইমপোর্ট
                </button>
              )}
              <button 
                onClick={() => {
                  if (activeTab === 'approved' || activeTab === 'pending') {
                    setEditType('member');
                    setEditingItem({ id: 'new', name: '', role: 'সদস্য', phone: '', email: '', bloodGroup: 'A+', address: '', status: 'approved' });
                  } else if (activeTab === 'services') {
                    setEditType('service');
                    setEditingItem({ id: 'new', title: '', description: '', images: [], icon: 'Heart', color: 'bg-emerald-50 text-emerald-600', accent: 'border-emerald-100' });
                  } else if (activeTab === 'active_members') {
                    setEditType('active_member');
                    setEditingItem({ id: 'new', name: '', role: '', image: '', address: '', phone: '', order: activeMembers.length });
                  } else if (activeTab === 'gallery') {
                    document.getElementById('gallery-upload')?.click();
                  }
                }}
                className="flex-grow sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg"
              >
                <Plus size={20} /> <span className="sm:hidden">নতুন</span>
              </button>
              <button onClick={handleLogout} className="p-3 bg-red-900/20 text-red-400 border border-red-900/30 rounded-xl hover:bg-red-900/40 transition-colors" title="লগআউট">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Scrollable Tabs */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex bg-emerald-900/50 p-1.5 rounded-2xl border border-emerald-800 min-w-max">
            {[
              { id: 'pending', label: `আবেদন (${pendingMembers.length})` },
              { id: 'approved', label: `সদস্য (${approvedMembers.length})` },
              { id: 'services', label: 'সেবা' },
              { id: 'gallery', label: 'গ্যালারি' },
              { id: 'active_members', label: 'সক্রিয় সদস্য' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap", 
                  activeTab === tab.id ? "bg-emerald-600 text-white shadow-lg" : "text-emerald-400 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-emerald-900/30 rounded-3xl border border-emerald-800/50 overflow-hidden backdrop-blur-sm">
          {activeTab === 'pending' && (
            <div className="p-4 md:p-0">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-emerald-800 bg-emerald-900/50">
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">আবেদনকারী</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">যোগাযোগ</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">রক্তের গ্রুপ</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-800">
                    {pendingMembers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-emerald-500 italic">কোনো পেন্ডিং আবেদন নেই।</td>
                      </tr>
                    ) : pendingMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-emerald-900/30 transition-colors">
                        <td className="px-6 py-6">
                          <div className="font-bold">{member.name}</div>
                          <div className="text-xs text-emerald-500">{member.address}</div>
                        </td>
                        <td className="px-6 py-6">
                          <a href={`tel:${member.phone}`} className="text-sm hover:text-emerald-400 transition-colors">{member.phone}</a>
                          <div className="text-xs text-emerald-500">{member.email}</div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs font-bold">{member.bloodGroup}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setEditingItem(member);
                                setEditType('member');
                              }}
                              className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
                              title="সম্পাদনা করুন"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              disabled={loading}
                              onClick={() => updateMemberStatus(member.id, 'approved')}
                              className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all"
                              title="অনুমোদন দিন"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              disabled={loading}
                              onClick={() => deleteItem('members', member.id)}
                              className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-all"
                              title="বাতিল করুন"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {pendingMembers.length === 0 ? (
                  <div className="py-12 text-center text-emerald-500 italic">কোনো পেন্ডিং আবেদন নেই।</div>
                ) : pendingMembers.map((member) => (
                  <div key={member.id} className="bg-emerald-900/40 border border-emerald-800 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-lg">{member.name}</div>
                        <div className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                          <MapPin size={12} /> {member.address}
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs font-bold">{member.bloodGroup}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-emerald-300">
                        <Phone size={14} /> {member.phone}
                      </a>
                      {member.email && (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <Mail size={14} /> {member.email}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => {
                          setEditingItem(member);
                          setEditType('member');
                        }}
                        className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
                      >
                        <Edit3 size={18} /> এডিট
                      </button>
                      <button 
                        disabled={loading}
                        onClick={() => updateMemberStatus(member.id, 'approved')}
                        className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm"
                      >
                        <Check size={18} /> অনুমোদন
                      </button>
                      <button 
                        disabled={loading}
                        onClick={() => deleteItem('members', member.id)}
                        className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm"
                      >
                        <X size={18} /> বাতিল
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'approved' && (
            <div className="p-4 md:p-0">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-emerald-800 bg-emerald-900/50">
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">সদস্য</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">যোগাযোগ</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">পদবি</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-800">
                    {approvedMembers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-emerald-500 italic">কোনো সদস্য নেই।</td>
                      </tr>
                    ) : approvedMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-emerald-900/30 transition-colors">
                        <td className="px-6 py-6">
                          <div className="font-bold flex items-center gap-2">
                            {member.name}
                            {member.isStatic && (
                              <span className="px-1.5 py-0.5 bg-emerald-900/50 text-emerald-500 border border-emerald-800 rounded text-[8px] font-bold uppercase">Static</span>
                            )}
                          </div>
                          <div className="text-xs text-emerald-500 flex items-center gap-1">
                            <MapPin size={10} /> {member.address}
                          </div>
                          <div className="mt-1">
                            <span className="px-2 py-0.5 bg-red-900/30 text-red-400 rounded text-[10px] font-bold">{member.bloodGroup}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <a href={`tel:${member.phone}`} className="text-sm hover:text-emerald-400 transition-colors">{member.phone}</a>
                          <div className="text-xs text-emerald-500">{member.email}</div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="px-2 py-1 bg-emerald-800 rounded text-xs">{member.role}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setEditingItem(member);
                                setEditType('member');
                              }}
                              className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
                              title="সম্পাদনা করুন"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              disabled={loading}
                              onClick={() => deleteItem('members', member.id)}
                              className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-all"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {approvedMembers.length === 0 ? (
                  <div className="py-12 text-center text-emerald-500 italic">কোনো সদস্য নেই।</div>
                ) : approvedMembers.map((member) => (
                  <div key={member.id} className="bg-emerald-900/40 border border-emerald-800 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-400 border border-emerald-700 overflow-hidden">
                          {member.image ? <img src={member.image} className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {member.name}
                            {member.isStatic && (
                              <span className="px-1.5 py-0.5 bg-emerald-900/50 text-emerald-500 border border-emerald-800 rounded text-[8px] font-bold uppercase">Static</span>
                            )}
                          </div>
                          <div className="text-[10px] text-emerald-500 uppercase tracking-wider">{member.role}</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-[10px] font-bold">{member.bloodGroup}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-emerald-300 bg-emerald-950/50 p-2 rounded-lg">
                        <Phone size={12} /> {member.phone}
                      </a>
                      <div className="flex items-center gap-2 text-emerald-500 bg-emerald-950/50 p-2 rounded-lg truncate">
                        <MapPin size={12} /> {member.address}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => {
                          setEditingItem(member);
                          setEditType('member');
                        }}
                        className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
                      >
                        <Edit3 size={16} /> এডিট
                      </button>
                      <button 
                        disabled={loading}
                        onClick={() => deleteItem('members', member.id)}
                        className="p-2.5 bg-red-600 text-white rounded-xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="p-4 md:p-6 grid md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-emerald-900/40 border border-emerald-800 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-24 h-48 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-emerald-950">
                    {service.images && service.images[0] ? (
                      <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-800">
                        <ImageIcon size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-lg mb-2">{service.title}</h4>
                    <p className="text-sm text-emerald-400 line-clamp-2 mb-4">{service.description}</p>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          setEditingItem(service);
                          setEditType('service');
                        }}
                        className="flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        <Edit3 size={16} /> এডিট করুন
                      </button>
                      <button 
                        onClick={() => deleteItem('services', service.id)}
                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} /> মুছুন
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'active_members' && (
            <div className="p-4 md:p-0">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-emerald-800 bg-emerald-900/50">
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">সদস্য</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">পদবি</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-800">
                    {activeMembers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-emerald-500 italic">কোনো সক্রিয় সদস্য যোগ করা হয়নি।</td>
                      </tr>
                    ) : activeMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-emerald-900/30 transition-colors">
                        <td className="px-6 py-6 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-400 border border-emerald-700 overflow-hidden">
                            {member.image ? (
                              <img src={member.image} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <UserCircle size={20} />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">{member.name}</div>
                            <div className="text-xs text-emerald-500">{member.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="px-2 py-1 bg-emerald-800 rounded text-xs">{member.role}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setEditingItem(member);
                                setEditType('active_member');
                              }}
                              className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => deleteItem('active_members', member.id)}
                              className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {activeMembers.length === 0 ? (
                  <div className="py-12 text-center text-emerald-500 italic">কোনো সক্রিয় সদস্য যোগ করা হয়নি।</div>
                ) : activeMembers.map((member) => (
                  <div key={member.id} className="bg-emerald-900/40 border border-emerald-800 rounded-2xl p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-800 flex items-center justify-center text-emerald-400 border border-emerald-700 overflow-hidden">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <UserCircle size={32} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-lg">{member.name}</div>
                          <div className="text-sm text-emerald-500">{member.role}</div>
                        </div>
                      </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingItem(member);
                          setEditType('active_member');
                        }}
                        className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
                      >
                        <Edit3 size={16} /> এডিট
                      </button>
                      <button 
                        onClick={() => deleteItem('active_members', member.id)}
                        className="p-2.5 bg-red-600 text-white rounded-xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="p-6">
              <input 
                id="gallery-upload"
                type="file" 
                accept="image/*" 
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => {
                    const fakeEvent = { target: { files: [file] } } as any;
                    handleImageUpload(fakeEvent, 'gallery');
                  });
                }}
                className="hidden"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {gallery.map((photo) => (
                  <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-emerald-800">
                    {photo.url ? (
                      <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-950 text-emerald-800">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <button 
                      onClick={() => deleteItem('gallery', photo.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => document.getElementById('gallery-upload')?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-emerald-800 flex flex-col items-center justify-center text-emerald-500 hover:border-emerald-500 hover:text-emerald-400 transition-all gap-2"
                >
                  <Plus size={24} />
                  <span className="text-xs font-bold">ছবি যোগ করুন</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-emerald-900 border border-emerald-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold">
                    {editingItem.id === 'new' ? 'নতুন যোগ করুন' : (
                      editType === 'member' ? 'সদস্য তথ্য পরিবর্তন' : 
                      editType === 'active_member' ? 'সক্রিয় সদস্য তথ্য পরিবর্তন' : 
                      'সেবা তথ্য পরিবর্তন'
                    )}
                  </h3>
                  <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-emerald-800 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-6">
                  {editType === 'member' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">নাম</label>
                          <input 
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">পদবি</label>
                          <input 
                            value={editingItem.role}
                            onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">মোবাইল নম্বর</label>
                          <input 
                            value={editingItem.phone}
                            onChange={(e) => setEditingItem({...editingItem, phone: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">ইমেইল</label>
                          <input 
                            type="email"
                            value={editingItem.email || ''}
                            onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">রক্তের গ্রুপ</label>
                          <select 
                            value={editingItem.bloodGroup}
                            onChange={(e) => setEditingItem({...editingItem, bloodGroup: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="N/A">N/A</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">ঠিকানা</label>
                          <input 
                            value={editingItem.address}
                            onChange={(e) => setEditingItem({...editingItem, address: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-500 uppercase">প্রোফাইল ছবি</label>
                        <div className="flex items-center gap-4">
                          <label className="flex-grow cursor-pointer bg-emerald-950 border border-emerald-800 border-dashed rounded-xl p-4 hover:border-emerald-500 transition-all text-center">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, 'member')}
                              className="hidden"
                              disabled={uploading}
                            />
                            <div className="flex flex-col items-center gap-2">
                              <ImageIcon className={cn("text-emerald-500", uploading && "animate-pulse")} size={24} />
                              <span className="text-sm text-emerald-400">
                                {uploading ? "আপলোড হচ্ছে..." : "ছবি সিলেক্ট করুন"}
                              </span>
                            </div>
                          </label>
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-emerald-800 bg-emerald-950">
                            {editingItem.image ? (
                              <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-emerald-800">
                                <UserCircle size={32} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : editType === 'active_member' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">নাম</label>
                          <input 
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">পদবি</label>
                          <input 
                            value={editingItem.role}
                            onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">ফোন</label>
                          <input 
                            value={editingItem.phone}
                            onChange={(e) => setEditingItem({...editingItem, phone: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">ক্রম (Order)</label>
                          <input 
                            type="number"
                            value={editingItem.order}
                            onChange={(e) => setEditingItem({...editingItem, order: parseInt(e.target.value)})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-500 uppercase">ঠিকানা</label>
                        <input 
                          value={editingItem.address}
                          onChange={(e) => setEditingItem({...editingItem, address: e.target.value})}
                          className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-500 uppercase">ছবি</label>
                        <div className="flex items-center gap-4">
                          <label className="flex-grow cursor-pointer bg-emerald-950 border border-emerald-800 border-dashed rounded-xl p-4 hover:border-emerald-500 transition-all text-center">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, 'member')}
                              className="hidden"
                              disabled={uploading}
                            />
                            <div className="flex flex-col items-center gap-2">
                              <ImageIcon className={cn("text-emerald-500", uploading && "animate-pulse")} size={24} />
                              <span className="text-sm text-emerald-400">
                                {uploading ? "আপলোড হচ্ছে..." : "ছবি সিলেক্ট করুন"}
                              </span>
                            </div>
                          </label>
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-emerald-800 bg-emerald-950">
                            {editingItem.image ? (
                              <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-emerald-800">
                                <UserCircle size={32} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-500 uppercase">শিরোনাম</label>
                        <input 
                          value={editingItem.title}
                          onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                          className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-500 uppercase">বর্ণনা</label>
                        <textarea 
                          value={editingItem.description}
                          onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                          className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32 resize-none"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">আইকন</label>
                          <select 
                            value={editingItem.icon || 'Heart'}
                            onChange={(e) => setEditingItem({...editingItem, icon: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            {['Heart', 'Droplets', 'Stethoscope', 'HandHelping', 'Activity'].map(icon => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">রঙ (Tailwind Class)</label>
                          <input 
                            value={editingItem.color || 'bg-emerald-50 text-emerald-600'}
                            onChange={(e) => setEditingItem({...editingItem, color: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="bg-emerald-50 text-emerald-600"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-emerald-500 uppercase block">ছবিসমূহ (Slider Images)</label>
                        <div className="grid grid-cols-3 gap-4">
                          {(editingItem.images || []).map((img: string, idx: number) => (
                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-emerald-800 group">
                              <img src={img} alt="Service" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newImages = [...editingItem.images];
                                  newImages.splice(idx, 1);
                                  setEditingItem({...editingItem, images: newImages});
                                }}
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          <label className="aspect-video rounded-lg border-2 border-dashed border-emerald-800 flex flex-col items-center justify-center text-emerald-500 hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer">
                            <Plus size={20} />
                            <span className="text-[10px] font-bold">ছবি যোগ করুন</span>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'service')} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="submit"
                      disabled={loading || uploading}
                      className="flex-grow bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {loading ? "সেভ করা হচ্ছে..." : (editingItem.id === 'new' ? 'যোগ করুন' : 'পরিবর্তন সেভ করুন')}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-8 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                    >
                      বাতিল
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: any }> {
  public state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
      try {
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error) {
          errorMessage = `ত্রুটি: ${parsedError.error}`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-emerald-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <X size={32} />
            </div>
            <h2 className="text-2xl font-bold text-emerald-950 mb-4">ওহ না!</h2>
            <p className="text-emerald-900/60 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition-all"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const PaymentPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-500 mb-4">আপনার সহযোগিতা প্রয়োজন</h1>
          <p className="text-xl text-gray-800 mb-6">স্বাস্থ্যসেবা, শিক্ষা ও দারিদ্র্য বিমোচন</p>
          <div className="max-w-xl mx-auto">
            <p className="text-gray-600 leading-relaxed">
              সাউদাস (সামাজিক উন্নয়ন দাতব্য সংস্থা) একটি অলাভজনক প্রতিষ্ঠান যা সমাজের অবহেলিত ও সুবিধাবঞ্চিত মানুষের কল্যাণে কাজ করে। আমাদের মূল লক্ষ্য হলো মানসম্মত স্বাস্থ্যসেবা নিশ্চিত করা, শিক্ষার আলো ছড়িয়ে দেওয়া এবং টেকসই উন্নয়ন প্রকল্পের মাধ্যমে দারিদ্র্য বিমোচন করা। আপনার সামান্য দান একজন মানুষের জীবন বদলে দিতে পারে।
            </p>
          </div>
        </div>

        {/* Payment Box */}
        <div className="bg-gray-50 rounded-[2rem] p-8 md:p-12 border border-gray-100 mb-12">
          <div className="space-y-8">
            {/* bKash */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200 last:border-0 last:pb-0">
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800">বিকাশ (পার্সোনাল)</h3>
                <p className="text-lg text-gray-500 font-mono">০১৭XXXXXXXX</p>
              </div>
              <span className="text-emerald-500 font-bold text-lg">সেন্ড মানি করুন</span>
            </div>

            {/* Nagad */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200 last:border-0 last:pb-0">
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800">নগদ (পার্সোনাল)</h3>
                <p className="text-lg text-gray-500 font-mono">০১৭XXXXXXXX</p>
              </div>
              <span className="text-emerald-500 font-bold text-lg">সেন্ড মানি করুন</span>
            </div>

            {/* Rocket */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200 last:border-0 last:pb-0">
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800">রকেট (পার্সোনাল)</h3>
                <p className="text-lg text-gray-500 font-mono">০১৭XXXXXXXX</p>
              </div>
              <span className="text-emerald-500 font-bold text-lg">সেন্ড মানি করুন</span>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-700 mb-8">ধন্যবাদ</p>
          <button 
            onClick={onBack}
            className="text-gray-500 hover:text-emerald-600 transition-colors flex items-center gap-2 mx-auto font-medium"
          >
            <ChevronLeft size={20} />
            হোম পেজে ফিরে যান
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  const [view, setView] = useState<'home' | 'admin' | 'payment'>('home');

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setIsLoginModalOpen(false);
        setView('admin');
      } else {
        setView('home');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
        {view === 'home' ? (
          <>
            <Navbar onLoginClick={() => setIsLoginModalOpen(true)} user={user} setView={setView} />
            <main>
              <Hero setView={setView} />
              <About />
              <Services />
              <ActiveMembers />
              <MemberDirectory />
              <RegistrationForm showNotification={showNotification} />
              <Contact />
            </main>
            <Footer setView={setView} />
          </>
        ) : view === 'payment' ? (
          <PaymentPage onBack={() => setView('home')} />
        ) : (
          user && <AdminPanel user={user} showNotification={showNotification} setConfirmConfig={setConfirmConfig} setView={setView} />
        )}
        
        <AnimatePresence>
          {isLoginModalOpen && !user && (
            <LoginModal 
              onClose={() => setIsLoginModalOpen(false)} 
              showNotification={showNotification}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {notification && (
            <Notification 
              message={notification.message} 
              type={notification.type} 
              onClose={() => setNotification(null)} 
            />
          )}
        </AnimatePresence>

        <ConfirmModal 
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          type={confirmConfig.type}
        />
      </div>
    </ErrorBoundary>
  );
}
