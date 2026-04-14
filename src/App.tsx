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
  Camera,
  CheckCircle2,
  Calendar,
  Clock,
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
  Eye,
  EyeOff,
  Trash2,
  Check,
  Edit3,
  Plus,
  PlusCircle,
  UserPlus,
  Image as ImageIcon,
  LayoutDashboard,
  Settings,
  UserCog,
  LogIn,
  LogOut,
  User as UserIcon,
  UserCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Bell,
  ArrowLeft,
  Download,
  Share2,
  Printer
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  getDocFromServer,
  serverTimestamp,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

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
  sendPasswordResetEmail,
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

interface SiteConfig {
  hero: {
    title: string;
    subtitle: string;
    bgImage: string;
    stats: { label: string; value: string; icon: string }[];
  };
  about: {
    title: string;
    subtitle: string;
    storyTitle: string;
    storyContent: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    socials?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  payment: {
    treasurerName: string;
    treasurerRole: string;
    bkash: string;
    nagad: string;
    rocket: string;
  };
}

const DEFAULT_CONFIG: SiteConfig = {
  hero: {
    title: "মানবতার সেবায় আমরা পাশে আছি",
    subtitle: "সামাজিক উন্নয়ন দাতব্য সংস্থা (সাউদাস) দারিদ্র্য বিমোচন, চিকিৎসা সহায়তা এবং টেকসই সামাজিক উন্নয়নে নিবেদিত।",
    bgImage: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop",
    stats: [
      { label: "রক্তদাতা", value: "১.২k+", icon: "Droplets" }
    ]
  },
  about: {
    title: "আমাদের সম্পর্কে",
    subtitle: "মানবতার সেবায় আমরা - সাউদাস (SAUDAS)",
    storyTitle: "আমাদের গল্প",
    storyContent: "২০২৪ সাল থেকে আমরা একদল উদ্যমী মানুষ একত্রিত হয়েছি সমাজের পিছিয়ে পড়া মানুষদের জন্য কিছু করার তাগিদে। সাউদাস শুধু একটি নাম নয়, এটি একটি আস্থার প্রতীক।"
  },
  contact: {
    phone: "+৮৮ ০১৯২৪-৪৬৫৪৫৪",
    email: "sdoo07072025@gmail.com",
    address: "প্রধান কার্যালয়ঃ রাজগঞ্জ, মনিরামপুর, যশোর।"
  },
  payment: {
    treasurerName: "মোঃ আবু সাইদ",
    treasurerRole: "কোষাধ্যক্ষ, সাউদাস",
    bkash: "01797315660",
    nagad: "01797315660",
    rocket: "017973156603"
  }
};

const Navbar = ({ 
  onLoginClick, 
  onLogoutClick,
  user, 
  setView,
  toggleTheme,
  theme
}: { 
  onLoginClick: () => void, 
  onLogoutClick: () => void,
  user: User | null, 
  setView: (v: any) => void,
  toggleTheme: () => void,
  theme: 'light' | 'dark'
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'হোম', view: 'home' },
    { label: 'সদস্য তালিকা', view: 'directory' },
    { label: 'ইভেন্ট', view: 'events' },
    { label: 'রক্তদান', view: 'blood' },
    { label: 'চ্যাট', view: 'chat' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-2 flex justify-center",
      isScrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg" : "bg-transparent"
    )}>
      <div className="w-full max-w-7xl flex items-center justify-between py-2">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('home'); setIsMobileMenuOpen(false); }}>
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <Heart size={24} fill="currentColor" />
          </div>
          <span className={cn(
            "font-bold text-xl tracking-tight",
            isScrolled ? "text-emerald-950 dark:text-white" : "text-white"
          )}>
            সাউদাস
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => setView(link.view)}
              className={cn(
                "text-sm font-bold transition-all hover:text-emerald-500",
                isScrolled ? "text-emerald-900 dark:text-emerald-100" : "text-white/90"
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => setView('profile')}
                className={cn(
                  "p-2 rounded-full transition-all flex items-center gap-2",
                  isScrolled ? "text-emerald-600 hover:bg-emerald-50" : "text-white/80 hover:bg-white/10"
                )}
                title="প্রোফাইল"
              >
                <UserIcon size={20} />
                <span className="hidden lg:inline text-sm font-bold">প্রোফাইল</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    const el = document.getElementById('join');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else setView('home');
                  }}
                  className={cn(
                    "hidden sm:inline text-sm font-bold transition-all",
                    isScrolled ? "text-emerald-900 dark:text-emerald-100 hover:text-emerald-600" : "text-white/90 hover:text-white"
                  )}
                >
                  নিবন্ধন
                </button>
                <button
                  onClick={onLoginClick}
                  className={cn(
                    "px-5 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all",
                    isScrolled 
                      ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                      : "bg-white text-emerald-600 hover:bg-emerald-50"
                  )}
                >
                  লগইন
                </button>
              </>
            )}
          </div>

          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-all hover:bg-emerald-50 dark:hover:bg-slate-800",
              isScrolled ? "text-emerald-900 dark:text-white" : "text-white"
            )}
          >
            {theme === 'light' ? <Settings size={20} /> : <Activity size={20} />}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "lg:hidden p-2 rounded-full transition-all",
              isScrolled ? "text-emerald-900 dark:text-white" : "text-white"
            )}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 shadow-2xl border-t border-emerald-100 dark:border-slate-800 lg:hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => { setView(link.view); setIsMobileMenuOpen(false); }}
                  className="text-left py-3 text-emerald-950 dark:text-white font-bold border-b border-emerald-50 dark:border-slate-800 last:border-0"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-3 pt-4">
                {user ? (
                  <>
                    <button
                      onClick={() => { setView('admin'); setIsMobileMenuOpen(false); }}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard size={20} />
                      ড্যাশবোর্ড
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { 
                        setIsMobileMenuOpen(false);
                        const el = document.getElementById('join');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold"
                    >
                      নিবন্ধন করুন
                    </button>
                    <button
                      onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold"
                    >
                      লগইন করুন
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
const NoticeSection = ({ isAdmin }: { isAdmin: boolean }) => {
  const [notices, setNotices] = useState<any[]>([]);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleAddNotice = async () => {
    if (!newNotice.title || !newNotice.content) return;
    try {
      await addDoc(collection(db, 'notices'), {
        ...newNotice,
        createdAt: Date.now(),
        authorName: 'Admin'
      });
      setNewNotice({ title: '', content: '' });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notices');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'notices');
    }
  };

  return (
    <div className="pt-24 pb-32 px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-emerald-950">নোটিশ বোর্ড</h2>
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-emerald-600 text-white p-3 rounded-full shadow-lg"
          >
            {isAdding ? <X size={24} /> : <Plus size={24} />}
          </button>
        )}
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl border border-emerald-100 mb-8"
        >
          <input 
            type="text" 
            placeholder="নোটিশের শিরোনাম"
            className="w-full p-4 rounded-2xl border border-emerald-100 mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={newNotice.title}
            onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
          />
          <textarea 
            placeholder="বিস্তারিত লিখুন..."
            className="w-full p-4 rounded-2xl border border-emerald-100 mb-4 h-32 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={newNotice.content}
            onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
          />
          <button 
            onClick={handleAddNotice}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold"
          >
            নোটিশ পাবলিশ করুন
          </button>
        </motion.div>
      )}

      <div className="space-y-6">
        {notices.map((notice) => (
          <motion.div 
            key={notice.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-3xl shadow-md border border-emerald-50 relative group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950">{notice.title}</h3>
                <p className="text-xs text-emerald-900/40">
                  {new Date(notice.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-emerald-900/70 leading-relaxed whitespace-pre-wrap">
              {notice.content}
            </p>
            {isAdmin && (
              <button 
                onClick={() => handleDeleteNotice(notice.id)}
                className="absolute top-4 right-4 p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const BloodSection = ({ user, isAdmin }: { user: any, isAdmin: boolean }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<{[key: string]: any[]}>({});
  const [newPost, setNewPost] = useState({ bloodGroup: '', location: '', phone: '', urgency: 'normal', description: '' });
  const [isPosting, setIsPosting] = useState(false);
  const [commentTexts, setCommentTexts] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const q = query(collection(db, 'blood_posts'), orderBy('createdAt', 'desc'));
    const unsubPosts = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubComments = onSnapshot(collection(db, 'blood_comments'), (snapshot) => {
      const grouped: {[key: string]: any[]} = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!grouped[data.postId]) grouped[data.postId] = [];
        grouped[data.postId].push({ id: doc.id, ...data });
      });
      // Sort comments by date
      Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) => a.createdAt - b.createdAt);
      });
      setComments(grouped);
    });

    return () => {
      unsubPosts();
      unsubComments();
    };
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.bloodGroup || !newPost.location || !newPost.phone) return;
    try {
      await addDoc(collection(db, 'blood_posts'), {
        ...newPost,
        createdAt: Date.now(),
        authorName: user?.displayName || 'Admin',
        authorId: user?.uid
      });
      setNewPost({ bloodGroup: '', location: '', phone: '', urgency: 'normal', description: '' });
      setIsPosting(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'blood_posts');
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentTexts[postId];
    if (!text || !user) return;
    try {
      await addDoc(collection(db, 'blood_comments'), {
        postId,
        text,
        authorName: user.displayName || 'Anonymous',
        authorId: user.uid,
        createdAt: Date.now()
      });
      setCommentTexts({ ...commentTexts, [postId]: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'blood_comments');
    }
  };

  return (
    <div className="pt-24 pb-32 px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-emerald-950">রক্তদান পোস্ট</h2>
        {isAdmin && (
          <button 
            onClick={() => setIsPosting(!isPosting)}
            className="bg-red-600 text-white p-3 rounded-full shadow-lg"
          >
            {isPosting ? <X size={24} /> : <Plus size={24} />}
          </button>
        )}
      </div>

      {isPosting && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-xl border border-red-100 mb-8"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <select 
              className="p-4 rounded-2xl border border-red-50 focus:ring-2 focus:ring-red-500 outline-none bg-white"
              value={newPost.bloodGroup}
              onChange={(e) => setNewPost({ ...newPost, bloodGroup: e.target.value })}
            >
              <option value="">রক্তের গ্রুপ</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
            <select 
              className="p-4 rounded-2xl border border-red-50 focus:ring-2 focus:ring-red-500 outline-none bg-white"
              value={newPost.urgency}
              onChange={(e) => setNewPost({ ...newPost, urgency: e.target.value })}
            >
              <option value="normal">সাধারণ</option>
              <option value="urgent">জরুরী</option>
              <option value="emergency">অত্যন্ত জরুরী</option>
            </select>
          </div>
          <input 
            type="text" 
            placeholder="লোকেশন"
            className="w-full p-4 rounded-2xl border border-red-50 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
            value={newPost.location}
            onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
          />
          <input 
            type="text" 
            placeholder="মোবাইল নম্বর"
            className="w-full p-4 rounded-2xl border border-red-50 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
            value={newPost.phone}
            onChange={(e) => setNewPost({ ...newPost, phone: e.target.value })}
          />
          <textarea 
            placeholder="বিস্তারিত..."
            className="w-full p-4 rounded-2xl border border-red-50 mb-4 h-24 focus:ring-2 focus:ring-red-500 outline-none"
            value={newPost.description}
            onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
          />
          <button 
            onClick={handleCreatePost}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold"
          >
            পোস্ট করুন
          </button>
        </motion.div>
      )}

      <div className="space-y-8">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-3xl shadow-lg border border-red-50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl font-bold">
                    {post.bloodGroup}
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-950">রক্ত প্রয়োজন</h3>
                    <p className="text-xs text-emerald-900/40">{new Date(post.createdAt).toLocaleString('bn-BD')}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold",
                  post.urgency === 'emergency' ? "bg-red-600 text-white" : 
                  post.urgency === 'urgent' ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                )}>
                  {post.urgency === 'emergency' ? 'অত্যন্ত জরুরী' : post.urgency === 'urgent' ? 'জরুরী' : 'সাধারণ'}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-emerald-900/70">
                  <MapPin size={18} className="text-red-400" />
                  <span>{post.location}</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-900/70">
                  <Phone size={18} className="text-red-400" />
                  <span>{post.phone}</span>
                </div>
                {post.description && (
                  <p className="text-emerald-900/60 bg-emerald-50/30 p-4 rounded-2xl italic">
                    "{post.description}"
                  </p>
                )}
              </div>

              <div className="border-t border-emerald-50 pt-6">
                <h4 className="font-bold text-emerald-950 mb-4 flex items-center gap-2">
                  <MessageCircle size={18} /> মতামত ({comments[post.id]?.length || 0})
                </h4>
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {comments[post.id]?.map((comment) => (
                    <div key={comment.id} className="bg-emerald-50/50 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-emerald-900">{comment.authorName}</span>
                        <span className="text-[10px] text-emerald-900/40">{new Date(comment.createdAt).toLocaleTimeString('bn-BD')}</span>
                      </div>
                      <p className="text-sm text-emerald-900/70">{comment.text}</p>
                    </div>
                  ))}
                </div>
                {user && (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="আপনার মতামত লিখুন..."
                      className="flex-1 p-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      value={commentTexts[post.id] || ''}
                      onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <button 
                      onClick={() => handleAddComment(post.id)}
                      className="bg-emerald-600 text-white p-3 rounded-xl"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatSection = ({ user }: { user: any }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'chat_messages'), orderBy('createdAt', 'asc'), limit(100));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      await addDoc(collection(db, 'chat_messages'), {
        text: newMessage,
        authorName: user.displayName || 'Anonymous',
        authorId: user.uid,
        authorPhoto: user.photoURL || '',
        createdAt: Date.now()
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chat_messages');
    }
  };

  if (!user) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-bold text-emerald-950 mb-4">চ্যাট করতে লগইন করুন</h2>
        <p className="text-emerald-900/60 mb-8">কমিউনিটির সবার সাথে কথা বলতে আপনাকে অবশ্যই লগইন করতে হবে।</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pt-20 pb-20 bg-emerald-50/30 flex flex-col">
      <div className="bg-white p-4 border-b border-emerald-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center">
          <Users size={20} />
        </div>
        <div>
          <h2 className="font-bold text-emerald-950">সাউদাস কমিউনিটি চ্যাট</h2>
          <p className="text-[10px] text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> সবার জন্য উন্মুক্ত
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.authorId === user.uid;
          const showName = idx === 0 || messages[idx-1].authorId !== msg.authorId;

          return (
            <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
              {showName && !isMe && (
                <span className="text-[10px] font-bold text-emerald-900/40 ml-10 mb-1">{msg.authorName}</span>
              )}
              <div className={cn("flex items-end gap-2 max-w-[80%]", isMe && "flex-row-reverse")}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-emerald-200 flex-shrink-0 overflow-hidden border border-white shadow-sm">
                    {msg.authorPhoto ? <img src={msg.authorPhoto} alt="" className="w-full h-full object-cover" /> : <UserIcon size={16} className="m-2 text-emerald-600" />}
                  </div>
                )}
                <div className={cn(
                  "p-3 rounded-2xl text-sm shadow-sm",
                  isMe ? "bg-emerald-600 text-white rounded-tr-none" : "bg-white text-emerald-950 rounded-tl-none border border-emerald-50"
                )}>
                  {msg.text}
                  <div className={cn("text-[8px] mt-1 opacity-50 text-right", isMe ? "text-white" : "text-emerald-900/40")}>
                    {new Date(msg.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white border-t border-emerald-100 flex gap-2">
        <input 
          type="text" 
          placeholder="মেসেজ লিখুন..."
          className="flex-1 p-4 rounded-2xl bg-emerald-50/50 border-none focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button 
          onClick={handleSendMessage}
          className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

const QuickLinks = ({ setView }: { setView: (v: any) => void }) => {
  const links = [
    { title: 'নোটিশ বোর্ড', icon: Bell, color: 'bg-blue-50 text-blue-600', view: 'notice' },
    { title: 'সদস্য তালিকা', icon: Users, color: 'bg-purple-50 text-purple-600', view: 'directory' },
    { title: 'ইভেন্টসমূহ', icon: Calendar, color: 'bg-orange-50 text-orange-600', view: 'events' },
    { title: 'রক্তদান পোস্ট', icon: Droplets, color: 'bg-red-50 text-red-600', view: 'blood' },
    { title: 'কমিউনিটি চ্যাট', icon: MessageCircle, color: 'bg-emerald-50 text-emerald-600', view: 'chat' },
    { title: 'অনুদান দিন', icon: Heart, color: 'bg-pink-50 text-pink-600', view: 'payment' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
      {links.map((link) => (
        <button
          key={link.title}
          onClick={() => setView(link.view)}
          className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 flex flex-col items-center gap-3 hover:shadow-md transition-all active:scale-95 group"
        >
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", link.color)}>
            <link.icon size={24} />
          </div>
          <span className="font-bold text-emerald-950 text-sm">{link.title}</span>
        </button>
      ))}
    </div>
  );
};

const Hero = ({ setView, config }: { setView: (v: any) => void, config: SiteConfig }) => {
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

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return <Droplets size={24} />;
      case 'Activity': return <Activity size={24} />;
      case 'Heart': return <Heart size={24} />;
      case 'Users': return <Users size={24} />;
      default: return <Activity size={24} />;
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={config.hero.bgImage}
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
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
            {config.hero.title.split(' ').map((word, i) => (
              <React.Fragment key={i}>
                {word === 'আমরা' ? <span className="text-emerald-400">{word}</span> : word}{' '}
              </React.Fragment>
            ))}
          </h1>
          <p className="text-base sm:text-lg text-emerald-50/80 mb-10 max-w-lg leading-relaxed">
            {config.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.a
              href="#join"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 8px 10px -6px rgba(16, 185, 129, 0.1)",
                  "0 20px 25px -5px rgba(16, 185, 129, 0.3), 0 8px 10px -6px rgba(16, 185, 129, 0.3)",
                  "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 8px 10px -6px rgba(16, 185, 129, 0.1)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 group shadow-xl"
            >
              সদস্য হন
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </motion.a>
            <motion.button
              onClick={() => setView('payment')}
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 10px 15px -3px rgba(37, 99, 235, 0.2), 0 4px 6px -2px rgba(37, 99, 235, 0.2)",
                  "0 20px 25px -5px rgba(37, 99, 235, 0.5), 0 10px 10px -5px rgba(37, 99, 235, 0.5)",
                  "0 10px 15px -3px rgba(37, 99, 235, 0.2), 0 4px 6px -2px rgba(37, 99, 235, 0.2)"
                ]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition-all shadow-xl"
            >
              দান করুন
            </motion.button>
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
              crossOrigin="anonymous"
            />
          </div>
          {/* Floating Stats */}
          <div className="absolute -bottom-6 -left-6 flex flex-col gap-4 z-20">
            {config.hero.stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  {getIcon(stat.icon)}
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-900">{stat.value}</div>
                  <div className="text-xs text-emerald-600 font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const About = ({ config }: { config: SiteConfig }) => {
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
            <h2 className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-4">{config.about.title}</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-8 leading-tight">
              {config.about.subtitle.split('-').map((part, i) => (
                <React.Fragment key={i}>
                  {i === 1 ? <span className="text-emerald-600">{part}</span> : part}
                </React.Fragment>
              ))}
            </h3>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                    <Calendar size={18} />
                  </div>
                  {config.about.storyTitle}
                </h4>
                <p className="text-emerald-900/70 leading-relaxed">
                  {config.about.storyContent}
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
                    crossOrigin="anonymous"
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
      [serviceId]: ((prev[serviceId] || 0) + 1) % imagesCount
    }));
  };

  const prevImage = (serviceId: string, imagesCount: number) => {
    setActiveImageIndices(prev => ({
      ...prev,
      [serviceId]: ((prev[serviceId] || 0) - 1 + imagesCount) % imagesCount
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
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

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
                className="w-[280px] bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-900/5 hover:shadow-emerald-900/10 transition-all group relative overflow-hidden flex-shrink-0 cursor-pointer"
                onClick={() => setSelectedMember(leader)}
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

        <AnimatePresence>
          {selectedMember && (
            <MemberProfileModal 
              member={selectedMember} 
              onClose={() => setSelectedMember(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const MemberProfileModal = ({ member, onClose }: { member: any, onClose: () => void }) => {
  if (!member) return null;

  const isDark = member.photoURL || member.image;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px]"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="relative bg-white w-full max-w-[300px] rounded-[1.5rem] overflow-hidden shadow-2xl border border-emerald-100"
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 z-20 p-1 bg-white/80 hover:bg-white text-emerald-900 rounded-full shadow-sm transition-all border border-emerald-50"
        >
          <X size={16} />
        </button>

        <div className="h-20 bg-emerald-600 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700" />
          <div className="relative z-10 translate-y-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-emerald-500">
              <img 
                src={member.photoURL || member.image || `https://picsum.photos/seed/${member.name}/200/200`} 
                alt={member.name} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
          </div>
        </div>

        <div className="pt-8 pb-4 px-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-emerald-950 leading-tight">{member.name}</h3>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
              {member.role || member.designation || 'সদস্য'}
            </p>
            <p className="text-[9px] font-mono text-emerald-900/30 mt-1 uppercase">
              ID: {member.id.toUpperCase()}
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <a 
              href={`tel:${member.phone || member.mobile}`}
              className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
            >
              <Phone size={14} />
              কল করুন
            </a>

            <div className="grid grid-cols-1 gap-1.5">
              <div className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <MapPin size={12} className="text-emerald-600 flex-shrink-0" />
                <span className="text-emerald-950 text-[10px] font-medium truncate">{member.address || 'ঠিকানা নেই'}</span>
              </div>

              {member.bloodGroup && member.bloodGroup !== 'N/A' && (
                <div className="flex items-center gap-2 p-2 bg-red-50/50 rounded-lg border border-red-100">
                  <Droplets size={12} className="text-red-600 flex-shrink-0" />
                  <span className="text-red-600 text-[10px] font-bold">{member.bloodGroup}</span>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-1.5 text-[10px] font-bold text-emerald-900/40 hover:text-emerald-900/60 transition-colors uppercase tracking-widest"
          >
            বন্ধ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MemberDirectory = ({ onBack }: { onBack?: () => void }) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("সব");
  const [dbMembers, setDbMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const PAGE_SIZE = 20;

  // Unified MemberProfileModal is now defined globally above


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
      bloodGroup: (m as any).bloodGroup || 'N/A',
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
    <section id="directory" className={cn("py-24 bg-emerald-50/50 min-h-screen", onBack && "pt-32")}>
      <div className="max-w-7xl mx-auto px-6">
        {onBack && (
          <button 
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft size={20} />
            ফিরে যান
          </button>
        )}
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
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
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
                    className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedMember(member)}
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

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden p-4 space-y-4 bg-emerald-50/30">
            {loading && dbMembers.length === 0 ? (
              <div className="py-12 text-center text-emerald-900/40">
                সদস্য তালিকা লোড হচ্ছে...
              </div>
            ) : filteredMembers.map((member, idx) => (
              <motion.div
                key={member.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.01 }}
                onClick={() => setSelectedMember(member)}
                className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-100 border border-emerald-200">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-300">
                        <UserCircle size={28} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-emerald-950">{member.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border",
                        member.isStatic ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        {member.role}
                      </span>
                      {member.bloodGroup && member.bloodGroup !== 'N/A' && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-100">
                          {member.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-emerald-900/20 font-mono text-xs">
                    #{toBengaliNumber(idx + 1)}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-emerald-900/60">
                    <MapPin size={14} />
                    <span>{member.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-900/70 font-bold">
                    <Phone size={14} />
                    <a href={`tel:${member.phone}`} className="hover:text-emerald-600">{member.phone}</a>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredMembers.length === 0 && (
              <div className="py-12 text-center text-emerald-900/40 italic">
                আপনার অনুসন্ধানের সাথে মেলে এমন কোনো সদস্য পাওয়া যায়নি।
              </div>
            )}
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

        <AnimatePresence>
          {selectedMember && (
            <MemberProfileModal 
              member={selectedMember} 
              onClose={() => setSelectedMember(null)} 
            />
          )}
        </AnimatePresence>
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
        phone: normalizePhone(formData.phone),
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

const Contact = ({ config }: { config: SiteConfig }) => {
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
                { icon: <Phone />, title: "ফোন", value: config.contact.phone, href: `tel:${config.contact.phone}` },
                { icon: <Mail />, title: "ইমেইল", value: config.contact.email, href: `mailto:${config.contact.email}` },
                { icon: <MapPin />, title: "অফিস", value: config.contact.address }
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

const Footer = ({ setView, config }: { setView: (v: 'home' | 'admin' | 'payment') => void, config: SiteConfig }) => {
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
                { name: 'Facebook', icon: <Facebook size={20} />, href: config.contact.socials?.facebook || "https://www.facebook.com/share/1BHiaSMJHt/" },
                { name: 'Twitter', icon: <Twitter size={20} />, href: config.contact.socials?.twitter || "#" },
                { name: 'Instagram', icon: <Instagram size={20} />, href: config.contact.socials?.instagram || "#" },
                { name: 'LinkedIn', icon: <Linkedin size={20} />, href: config.contact.socials?.linkedin || "#" }
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

const normalizePhone = (phone: string) => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // If it's 11 digits and starts with 0, it's a standard BD number
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits;
  }
  // If it's 13 digits and starts with 880, it's a BD number with country code
  if (digits.length === 13 && digits.startsWith('880')) {
    return digits.substring(2);
  }
  // If it's 10 digits and doesn't start with 0, add a leading 0
  if (digits.length === 10 && !digits.startsWith('0')) {
    return '0' + digits;
  }
  return digits;
};

const LoginModal = ({ onClose, showNotification }: { onClose: () => void, showNotification: (m: string, t: 'success' | 'error') => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerData, setRegisterData] = useState({ name: '', phone: '', email: '', password: '', bloodGroup: 'A+', address: '' });
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      showNotification("অনুগ্রহ করে আপনার ইমেইল প্রদান করুন।", 'error');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      showNotification("পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে।", 'success');
      setIsForgotPassword(false);
    } catch (error: any) {
      console.error("Password reset failed:", error);
      showNotification("পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে। ইমেইলটি সঠিক কিনা যাচাই করুন।", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const identifier = loginIdentifier.trim().toLowerCase();
    const password = loginPassword.trim();

    try {
      let emailToSignIn = identifier;
      
      // Handle 'admin' alias
      if (identifier === 'admin') {
        emailToSignIn = 'admin@saudas.org';
      }

      // Check if it looks like a phone number
      if (/^(\+)?[\d\s-]{10,}$/.test(identifier) && !identifier.includes('@')) {
        try {
          const normalized = normalizePhone(identifier);
          const q = query(collection(db, 'users'), where('phone', '==', normalized));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            // Check if they are in 'members' but not 'users'
            const mq = query(collection(db, 'members'), where('phone', '==', normalized));
            const mSnapshot = await getDocs(mq);
            if (!mSnapshot.empty) {
              throw new Error("আপনি সদস্য পদের জন্য আবেদন করেছেন, কিন্তু এখনো একাউন্ট তৈরি করেননি। অনুগ্রহ করে 'রেজিস্ট্রেশন' ট্যাবে গিয়ে নতুন একাউন্ট তৈরি করুন।");
            }
            throw new Error("আপনি নিবন্ধিত নয়, অনুগ্রহ করে আগে নিবন্ধন করুন।");
          }
          emailToSignIn = querySnapshot.docs[0].data().email;
        } catch (err: any) {
          if (err.message.includes("নিবন্ধিত নয়") || err.message.includes("একাউন্ট তৈরি করেননি")) throw err;
          console.error("Firestore query error in LoginModal:", err);
          throw new Error("সার্ভার ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।");
        }
      }

      // Special case for initial admin setup
      if (emailToSignIn === 'admin@saudas.org' && password === 'admin123456') {
        try {
          await signInWithEmailAndPassword(auth, emailToSignIn, password);
        } catch (error: any) {
          if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
              await createUserWithEmailAndPassword(auth, emailToSignIn, password);
              // Also create user doc for admin
              await setDoc(doc(db, 'users', auth.currentUser!.uid), {
                uid: auth.currentUser!.uid,
                name: 'Admin',
                email: emailToSignIn,
                role: 'admin',
                createdAt: serverTimestamp()
              });
            } catch (createError: any) {
              throw error;
            }
          } else {
            throw error;
          }
        }
      } else {
        await signInWithEmailAndPassword(auth, emailToSignIn, password);
      }
      
      showNotification("সফলভাবে লগইন হয়েছে।", 'success');
      onClose();
    } catch (error: any) {
      console.error("Login failed:", error);
      let errorMessage = "লগইন ব্যর্থ হয়েছে।";
      
      // Handle Firebase Auth errors specifically
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMessage = "ভুল ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ড। আপনি নিবন্ধিত কিনা নিশ্চিত হয়ে নিন।";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "ভুল পাসওয়ার্ড। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন অথবা 'পাসওয়ার্ড ভুলে গেছেন?' লিঙ্কটি ব্যবহার করুন।";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "ভুল ইমেইল ফরম্যাট।";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "অনেকবার ভুল চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
      } else if (error.message && !error.message.includes('auth/')) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: registerData.name,
        phone: normalizePhone(registerData.phone),
        email: registerData.email,
        bloodGroup: registerData.bloodGroup,
        address: registerData.address,
        role: 'user',
        createdAt: serverTimestamp()
      });

      showNotification("সফলভাবে রেজিস্ট্রেশন সম্পন্ন হয়েছে।", 'success');
      onClose();
    } catch (error: any) {
      console.error("Registration failed:", error);
      showNotification(error.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।", 'error');
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
        className="relative bg-emerald-900 border border-emerald-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-8 md:p-12 max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-emerald-400 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-600/20">
            {isForgotPassword ? <Lock size={32} /> : isRegister ? <UserPlus size={32} /> : <Lock size={32} />}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isForgotPassword ? 'পাসওয়ার্ড রিসেট' : isRegister ? 'রেজিস্ট্রেশন' : 'লগইন'}
          </h2>
          <p className="text-emerald-400">
            {isForgotPassword ? 'আপনার ইমেইল প্রদান করুন' : isRegister ? 'নতুন একাউন্ট তৈরি করুন' : 'আপনার একাউন্টে প্রবেশ করুন'}
          </p>
        </div>

        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-emerald-100/70 text-sm font-medium ml-1">ইমেইল</label>
              <input
                required
                type="email"
                className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="your@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিঙ্ক পাঠান"}
            </button>
            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="w-full text-emerald-400 text-sm hover:text-white transition-colors"
            >
              লগইন পেজে ফিরে যান
            </button>
          </form>
        ) : isRegister ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="bg-emerald-800/30 border border-emerald-700/50 rounded-xl p-3 mb-2">
              <p className="text-xs text-emerald-200 leading-relaxed">
                <span className="font-bold text-emerald-400">বিঃদ্রঃ:</span> আপনি যদি আগে "সদস্য হওয়ার আবেদন" করে থাকেন, তবে লগইন করার জন্য আপনাকে এখানে অবশ্যই একটি নতুন একাউন্ট তৈরি করতে হবে।
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/70 text-xs font-medium ml-1">পূর্ণ নাম</label>
              <input
                required
                type="text"
                className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-emerald-100/70 text-xs font-medium ml-1">মোবাইল নম্বর</label>
                <input
                  required
                  type="text"
                  className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-emerald-100/70 text-xs font-medium ml-1">রক্তের গ্রুপ</label>
                <select
                  className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  value={registerData.bloodGroup}
                  onChange={(e) => setRegisterData({...registerData, bloodGroup: e.target.value})}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/70 text-xs font-medium ml-1">ইমেইল</label>
              <input
                required
                type="email"
                className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/70 text-xs font-medium ml-1">পাসওয়ার্ড</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-emerald-100/70 text-xs font-medium ml-1">ঠিকানা</label>
              <input
                required
                type="text"
                className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                value={registerData.address}
                onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 mt-4"
            >
              {loading ? "প্রসেসিং..." : "রেজিস্ট্রেশন করুন"}
            </button>
          </form>
        ) : (
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
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl pl-12 pr-12 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-emerald-400 text-xs hover:text-white transition-colors"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </button>
          </form>
        )}

        {!isForgotPassword && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
            >
              {isRegister ? 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন' : 'নতুন একাউন্ট তৈরি করতে চান? রেজিস্ট্রেশন করুন'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ProfileSection = ({ user, showNotification, onLogout, onBack }: { user: any, showNotification: (m: string, t: 'success' | 'error') => void, onLogout: () => void, onBack: () => void }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', bloodGroup: '', address: '' });

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setEditData({
          name: data.name || '',
          phone: data.phone || '',
          bloodGroup: data.bloodGroup || '',
          address: data.address || ''
        });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...editData,
        updatedAt: serverTimestamp()
      });
      showNotification("প্রোফাইল সফলভাবে আপডেট করা হয়েছে।", 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      showNotification("আপডেট ব্যর্থ হয়েছে।", 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950">
      <Activity className="text-emerald-500 animate-spin" size={48} />
    </div>
  );

  return (
    <section className="min-h-screen pt-20 pb-20 bg-emerald-950 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-800/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Back Button */}
        <div className="flex justify-start mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-emerald-400 hover:text-white transition-colors font-bold group"
          >
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all">
              <ArrowLeft size={20} />
            </div>
            ফিরে যান
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Member Card Preview */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-700/50 rounded-[2rem] p-6 shadow-2xl overflow-hidden aspect-[1.6/1] flex flex-col justify-between">
                {/* Card Pattern */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                      <Heart size={16} className="text-emerald-400" fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="text-white font-black tracking-tighter text-sm">SAUDAS</h4>
                      <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Member</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-bold border border-emerald-500/30 uppercase">ACTIVE</span>
                  </div>
                </div>

                <div className="flex items-end gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-emerald-900 border-2 border-emerald-700/50 overflow-hidden shadow-xl flex-shrink-0">
                    {userData?.photoURL ? (
                      <img src={userData.photoURL} alt={userData.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-950 text-emerald-800">
                        <UserIcon size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow pb-1">
                    <h3 className="text-xl font-bold text-white mb-0.5 leading-tight">{userData?.name}</h3>
                    <p className="text-emerald-400/80 font-medium text-xs">{userData?.phone || 'নম্বর নেই'}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-emerald-800/50 relative z-10">
                  <div>
                    <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest mb-0.5">Blood</p>
                    <p className="text-white font-bold text-xs">{userData?.bloodGroup || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest mb-0.5">ID</p>
                    <p className="text-white font-mono text-[10px]">#{user.uid.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-2xl p-6 space-y-4">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" /> সিকিউরিটি
              </h4>
              <p className="text-emerald-100/60 text-xs leading-relaxed">
                আপনার তথ্য সুরক্ষিত আছে। ব্যক্তিগত গোপনীয়তা রক্ষা করা আমাদের দায়িত্ব।
              </p>
              <div className="pt-2">
                <button
                  onClick={onLogout}
                  className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 group"
                >
                  <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                  লগআউট করুন
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-3">প্রোফাইল এডিট</h2>
                <div className="h-1 w-12 bg-emerald-500 rounded-full" />
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">পূর্ণ নাম</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700" size={18} />
                      <input
                        type="text"
                        className="w-full bg-emerald-950/50 border border-emerald-800/50 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        placeholder="আপনার নাম"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">মোবাইল নম্বর</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700" size={18} />
                      <input
                        type="text"
                        className="w-full bg-emerald-950/50 border border-emerald-800/50 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        placeholder="মোবাইল নম্বর"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">রক্তের গ্রুপ</label>
                    <div className="relative">
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700" size={18} />
                      <select
                        className="w-full bg-emerald-950/50 border border-emerald-800/50 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none"
                        value={editData.bloodGroup}
                        onChange={(e) => setEditData({...editData, bloodGroup: e.target.value})}
                      >
                        <option value="" className="bg-emerald-950">নির্বাচন করুন</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg} className="bg-emerald-950">{bg}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-700 pointer-events-none" size={18} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">ঠিকানা</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700" size={18} />
                      <input
                        type="text"
                        className="w-full bg-emerald-950/50 border border-emerald-800/50 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        value={editData.address}
                        onChange={(e) => setEditData({...editData, address: e.target.value})}
                        placeholder="বর্তমান ঠিকানা"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-base hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 group"
                  >
                    {saving ? (
                      <Activity className="animate-spin" size={20} />
                    ) : (
                      <>
                        <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                        তথ্য আপডেট করুন
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AdminPanel = ({ user, showNotification, setConfirmConfig, setView, siteConfig }: { 
  user: User, 
  showNotification: (m: string, t: 'success' | 'error') => void,
  setConfirmConfig: (config: any) => void,
  setView: (v: 'home' | 'admin' | 'directory' | 'payment' | 'blood' | 'chat' | 'notice' | 'events') => void,
  siteConfig: SiteConfig
}) => {
  const [adminData, setAdminData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'services' | 'gallery' | 'active_members' | 'donations' | 'site_config' | 'events'>('approved');
  const [members, setMembers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [localConfig, setLocalConfig] = useState<SiteConfig>(siteConfig);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', description: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editType, setEditType] = useState<'member' | 'service' | 'active_member' | 'event' | null>(null);
  
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

    // Fetch donations
    const qDonations = query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
    const unsubDonations = onSnapshot(qDonations, (snapshot) => {
      setDonations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'donations');
    });

    // Fetch events
    const qEvents = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'events');
    });

    return () => {
      unsubMembers();
      unsubServices();
      unsubGallery();
      unsubActiveMembers();
      unsubDonations();
      unsubEvents();
    };
  }, [isAdmin, db, adminData]);

  const handleLogout = () => signOut(auth);

  if (!user) {
    return null;
  }

  useEffect(() => {
    setLocalConfig(siteConfig);
  }, [siteConfig]);

  const handleSaveConfig = async () => {
    if (!db) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'site_config', 'main'), localConfig);
      showNotification("সাইট কন্টেন্ট সফলভাবে আপডেট করা হয়েছে।", 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'site_config/main');
    } finally {
      setLoading(false);
    }
  };

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
    else if (editType === 'event') targetCollection = 'events';

    try {
      const { id, isStatic, ...data } = editingItem;
      
      if (id === 'new' || isStatic) {
        if (editType === 'member') {
          data.joinedAt = data.joinedAt || Date.now();
          data.status = 'approved';
        }
        if (editType === 'event') {
          data.createdAt = Date.now();
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'member' | 'service' | 'gallery' | 'event' | 'site_config') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (!storage) {
      console.error("Firebase Storage is not initialized");
      showNotification("Firebase Storage কনফিগার করা নেই। অনুগ্রহ করে সেটিংস চেক করুন।", 'error');
      return;
    }

    if (!auth.currentUser) {
      showNotification("লগইন করা নেই। অনুগ্রহ করে আবার লগইন করুন।", 'error');
      return;
    }

    setUploading(true);
    try {
      const path = type === 'member' ? 'members' : type === 'service' ? 'services' : type === 'event' ? 'events' : type === 'site_config' ? 'site_config' : 'gallery';
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size === 0) {
          showNotification(`ফাইল "${file.name}" খালি।`, 'error');
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showNotification(`ফাইল "${file.name}" অনেক বড় (সর্বোচ্চ ৫MB)।`, 'error');
          continue;
        }

        const fileName = `${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, `${path}/${fileName}`);
        
        console.log(`Uploading ${file.name} to bucket: ${storage.app.options.storageBucket} at path: ${path}/${fileName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
            }, 
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            }, 
            () => {
              resolve();
            }
          );
        });

        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
        console.log(`Uploaded ${file.name} successfully: ${url}`);
      }
      
      if (uploadedUrls.length === 0) {
        setUploading(false);
        return;
      }

      if (type === 'gallery') {
        for (const url of uploadedUrls) {
          await addDoc(collection(db, 'gallery'), {
            url,
            createdAt: Date.now()
          });
        }
        showNotification(`${uploadedUrls.length}টি ছবি গ্যালারিতে যোগ করা হয়েছে।`, 'success');
      } else if (type === 'site_config') {
        setLocalConfig(prev => ({
          ...prev,
          hero: { ...prev.hero, bgImage: uploadedUrls[0] }
        }));
        showNotification("হিরো ইমেজ আপলোড সম্পন্ন হয়েছে।", 'success');
      } else {
        setEditingItem((prev: any) => {
          if (!prev) return null;
          if (type === 'service') {
            const currentImages = prev.images || [];
            return { ...prev, images: [...currentImages, ...uploadedUrls] };
          } else {
            return { ...prev, image: uploadedUrls[0] };
          }
        });
        showNotification("ছবি আপলোড সম্পন্ন হয়েছে।", 'success');
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      let msg = "ছবি আপলোড করতে সমস্যা হয়েছে।";
      if (error.code === 'storage/unauthorized') {
        msg = "ছবি আপলোড করার অনুমতি নেই (Storage Rules চেক করুন)।";
      } else if (error.code === 'storage/canceled') {
        msg = "আপলোড বাতিল করা হয়েছে।";
      } else if (error.message) {
        msg = `ত্রুটি: ${error.message}`;
      }
      showNotification(msg, 'error');
    } finally {
      setUploading(false);
      // Reset input value to allow re-uploading same file if needed
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
                  } else if (activeTab === 'events') {
                    setEditType('event');
                    setEditingItem({ id: 'new', title: '', date: '', time: '', location: '', description: '', image: '', createdAt: Date.now() });
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
              { id: 'active_members', label: 'সক্রিয় সদস্য' },
              { id: 'donations', label: 'অনুদান' },
              { id: 'site_config', label: 'সাইট কন্টেন্ট' },
              { id: 'events', label: 'ইভেন্ট' }
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
          {activeTab === 'site_config' && (
            <div className="p-6 space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Hero Section Edit */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-emerald-400 border-b border-emerald-800 pb-2 flex items-center gap-2">
                    <Home size={20} /> Hero Section
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Title</label>
                      <input 
                        type="text" 
                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={localConfig.hero.title}
                        onChange={(e) => setLocalConfig({ ...localConfig, hero: { ...localConfig.hero, title: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Subtitle</label>
                      <textarea 
                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white h-24 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={localConfig.hero.subtitle}
                        onChange={(e) => setLocalConfig({ ...localConfig, hero: { ...localConfig.hero, subtitle: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Background Image</label>
                      <div className="flex gap-4 items-start">
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-emerald-950 border border-emerald-800 flex-shrink-0">
                          <img src={localConfig.hero.bgImage} alt="Hero BG" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-grow space-y-2">
                          <input 
                            type="text" 
                            className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={localConfig.hero.bgImage}
                            onChange={(e) => setLocalConfig({ ...localConfig, hero: { ...localConfig.hero, bgImage: e.target.value } })}
                            placeholder="Image URL"
                          />
                          <button 
                            onClick={() => document.getElementById('hero-upload')?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <Camera size={14} /> {uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}
                          </button>
                          <input 
                            id="hero-upload"
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'site_config')}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-3">Hero Stats</label>
                      <div className="space-y-3">
                        {localConfig.hero.stats.map((stat, idx) => (
                          <div key={idx} className="flex gap-2 items-center bg-emerald-800/30 p-3 rounded-xl border border-emerald-700/50">
                            <input 
                              type="text" 
                              className="w-20 bg-emerald-900/50 border border-emerald-700 rounded-lg px-2 py-1 text-xs text-white"
                              value={stat.value}
                              onChange={(e) => {
                                const newStats = [...localConfig.hero.stats];
                                newStats[idx].value = e.target.value;
                                setLocalConfig({ ...localConfig, hero: { ...localConfig.hero, stats: newStats } });
                              }}
                              placeholder="Value"
                            />
                            <input 
                              type="text" 
                              className="flex-grow bg-emerald-900/50 border border-emerald-700 rounded-lg px-2 py-1 text-xs text-white"
                              value={stat.label}
                              onChange={(e) => {
                                const newStats = [...localConfig.hero.stats];
                                newStats[idx].label = e.target.value;
                                setLocalConfig({ ...localConfig, hero: { ...localConfig.hero, stats: newStats } });
                              }}
                              placeholder="Label"
                            />
                            <select 
                              className="bg-emerald-900/50 border border-emerald-700 rounded-lg px-2 py-1 text-xs text-white"
                              value={stat.icon}
                              onChange={(e) => {
                                const newStats = [...localConfig.hero.stats];
                                newStats[idx].icon = e.target.value;
                                setLocalConfig({ ...localConfig, hero: { ...localConfig.hero, stats: newStats } });
                              }}
                            >
                              <option value="Droplets">Droplets</option>
                              <option value="Activity">Activity</option>
                              <option value="Heart">Heart</option>
                              <option value="Users">Users</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Section Edit */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-emerald-400 border-b border-emerald-800 pb-2 flex items-center gap-2">
                    <Users size={20} /> About Section
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Title</label>
                      <input 
                        type="text" 
                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={localConfig.about.title}
                        onChange={(e) => setLocalConfig({ ...localConfig, about: { ...localConfig.about, title: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Subtitle</label>
                      <input 
                        type="text" 
                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={localConfig.about.subtitle}
                        onChange={(e) => setLocalConfig({ ...localConfig, about: { ...localConfig.about, subtitle: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Story Title</label>
                      <input 
                        type="text" 
                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={localConfig.about.storyTitle}
                        onChange={(e) => setLocalConfig({ ...localConfig, about: { ...localConfig.about, storyTitle: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Story Content</label>
                      <textarea 
                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white h-32 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={localConfig.about.storyContent}
                        onChange={(e) => setLocalConfig({ ...localConfig, about: { ...localConfig.about, storyContent: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Section Edit */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-emerald-400 border-b border-emerald-800 pb-2 flex items-center gap-2">
                    <Phone size={20} /> Contact Info
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Phone</label>
                      <input 
                        type="text" 
                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={localConfig.contact.phone}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, phone: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Email</label>
                      <input 
                        type="text" 
                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={localConfig.contact.email}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, email: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Address</label>
                      <input 
                        type="text" 
                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={localConfig.contact.address}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, address: e.target.value } })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-100/70 mb-1">Facebook</label>
                        <input 
                          type="text" 
                          className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={localConfig.contact.socials?.facebook || ''}
                          onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, socials: { ...localConfig.contact.socials, facebook: e.target.value } } })}
                          placeholder="URL"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-100/70 mb-1">Twitter</label>
                        <input 
                          type="text" 
                          className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={localConfig.contact.socials?.twitter || ''}
                          onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, socials: { ...localConfig.contact.socials, twitter: e.target.value } } })}
                          placeholder="URL"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-100/70 mb-1">Instagram</label>
                        <input 
                          type="text" 
                          className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={localConfig.contact.socials?.instagram || ''}
                          onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, socials: { ...localConfig.contact.socials, instagram: e.target.value } } })}
                          placeholder="URL"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-100/70 mb-1">LinkedIn</label>
                        <input 
                          type="text" 
                          className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={localConfig.contact.socials?.linkedin || ''}
                          onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, socials: { ...localConfig.contact.socials, linkedin: e.target.value } } })}
                          placeholder="URL"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Section Edit */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-emerald-400 border-b border-emerald-800 pb-2 flex items-center gap-2">
                    <Droplets size={20} /> Payment Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Treasurer Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={localConfig.payment.treasurerName}
                        onChange={(e) => setLocalConfig({ ...localConfig, payment: { ...localConfig.payment, treasurerName: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-100/70 mb-1">Treasurer Role</label>
                      <input 
                        type="text" 
                        className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={localConfig.payment.treasurerRole}
                        onChange={(e) => setLocalConfig({ ...localConfig, payment: { ...localConfig.payment, treasurerRole: e.target.value } })}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-100/70 mb-1">Bkash</label>
                        <input 
                          type="text" 
                          className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={localConfig.payment.bkash}
                          onChange={(e) => setLocalConfig({ ...localConfig, payment: { ...localConfig.payment, bkash: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-100/70 mb-1">Nagad</label>
                        <input 
                          type="text" 
                          className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={localConfig.payment.nagad}
                          onChange={(e) => setLocalConfig({ ...localConfig, payment: { ...localConfig.payment, nagad: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-100/70 mb-1">Rocket</label>
                        <input 
                          type="text" 
                          className="w-full bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={localConfig.payment.rocket}
                          onChange={(e) => setLocalConfig({ ...localConfig, payment: { ...localConfig.payment, rocket: e.target.value } })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t border-emerald-800 flex justify-center">
                <button 
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-3"
                >
                  {loading ? <Activity className="animate-spin" /> : <CheckCircle2 />}
                  পরিবর্তনগুলো সেভ করুন
                </button>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="p-4 md:p-6 space-y-8">
              {/* Create Event Form */}
              <div className="bg-emerald-800/20 border border-emerald-700/50 rounded-3xl p-6">
                <h4 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2">
                  <PlusCircle size={20} /> নতুন ইভেন্ট যোগ করুন
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-emerald-500 uppercase mb-1">ইভেন্ট শিরোনাম</label>
                      <input 
                        type="text"
                        placeholder="যেমন: ফ্রি মেডিক্যাল ক্যাম্প"
                        className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-emerald-500 uppercase mb-1">তারিখ</label>
                        <input 
                          type="text"
                          placeholder="১৫ মে, ২০২৪"
                          className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-emerald-500 uppercase mb-1">সময়</label>
                        <input 
                          type="text"
                          placeholder="সকাল ১০:০০ টা"
                          className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-500 uppercase mb-1">স্থান</label>
                      <input 
                        type="text"
                        placeholder="সাউদাস অফিস প্রাঙ্গণ"
                        className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-emerald-500 uppercase mb-1">বিবরণ</label>
                      <textarea 
                        placeholder="ইভেন্ট সম্পর্কে বিস্তারিত লিখুন..."
                        className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-2.5 text-white h-32 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        if (!newEvent.title || !newEvent.date || !newEvent.location) {
                          showNotification("অনুগ্রহ করে প্রয়োজনীয় তথ্যগুলো পূরণ করুন।", 'error');
                          return;
                        }
                        try {
                          setLoading(true);
                          await addDoc(collection(db, 'events'), {
                            ...newEvent,
                            createdAt: Date.now()
                          });
                          showNotification("ইভেন্ট সফলভাবে যোগ করা হয়েছে।", 'success');
                          setNewEvent({ title: '', date: '', time: '', location: '', description: '', image: '' });
                        } catch (error) {
                          handleFirestoreError(error, OperationType.CREATE, 'events');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                      ইভেন্ট যোগ করুন
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-emerald-900/40 border border-emerald-800 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-24 h-48 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-emerald-950">
                      {event.image ? (
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-800">
                          <Calendar size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <Calendar size={12} /> {event.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <MapPin size={12} /> {event.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => {
                            setEditingItem(event);
                            setEditType('event');
                          }}
                          className="flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                          <Edit3 size={16} /> এডিট করুন
                        </button>
                        <button 
                          onClick={() => deleteItem('events', event.id)}
                          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} /> মুছে ফেলুন
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                onChange={(e) => handleImageUpload(e, 'gallery')}
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

          {activeTab === 'donations' && (
            <div className="p-4 md:p-0">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-emerald-800 bg-emerald-900/50">
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">দাতা</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">টাকার পরিমাণ</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">লেনদেনের তথ্য</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">তারিখ</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-800">
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-emerald-500 italic">কোনো অনুদানের তথ্য পাওয়া যায়নি।</td>
                      </tr>
                    ) : donations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-emerald-800/20 transition-colors">
                        <td className="px-6 py-6">
                          <div className="font-bold">{donation.name}</div>
                          <div className="text-xs text-emerald-500">{donation.phone}</div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-emerald-400 font-bold">৳ {toBengaliNumber(donation.amount)}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-sm">শেষ ৪ ডিজিট: <span className="font-mono text-emerald-400">{donation.lastFour}</span></div>
                          <div className="text-[10px] text-emerald-500 uppercase mt-1">{donation.status === 'pending' ? 'যাচাই করা হয়নি' : 'যাচাইকৃত'}</div>
                        </td>
                        <td className="px-6 py-6 text-sm text-emerald-400">
                          {new Date(donation.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            {donation.status === 'pending' && (
                              <button 
                                onClick={async () => {
                                  try {
                                    await updateDoc(doc(db, 'donations', donation.id), { status: 'verified' });
                                    showNotification("অনুদান যাচাই করা হয়েছে।", 'success');
                                  } catch (error) {
                                    handleFirestoreError(error, OperationType.UPDATE, 'donations');
                                  }
                                }}
                                className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all"
                                title="যাচাই করুন"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => deleteItem('donations', donation.id)}
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
              <div className="md:hidden space-y-4 p-4">
                {donations.length === 0 ? (
                  <div className="py-12 text-center text-emerald-500 italic">কোনো অনুদানের তথ্য পাওয়া যায়নি।</div>
                ) : donations.map((donation) => (
                  <div key={donation.id} className="bg-emerald-900/40 border border-emerald-800 rounded-2xl p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-lg">{donation.name}</div>
                        <div className="text-sm text-emerald-500">{donation.phone}</div>
                      </div>
                      <div className="text-emerald-400 font-bold text-xl">৳ {toBengaliNumber(donation.amount)}</div>
                    </div>
                    <div className="bg-emerald-950/50 rounded-xl p-3 mb-4 border border-emerald-800/50">
                      <div className="text-sm text-emerald-300">লেনদেনের শেষ ৪ ডিজিট: <span className="font-mono font-bold">{donation.lastFour}</span></div>
                      <div className="text-xs text-emerald-500 mt-1">তারিখ: {new Date(donation.createdAt).toLocaleDateString('bn-BD')}</div>
                    </div>
                    <div className="flex gap-2">
                      {donation.status === 'pending' && (
                        <button 
                          onClick={async () => {
                            try {
                              await updateDoc(doc(db, 'donations', donation.id), { status: 'verified' });
                              showNotification("অনুদান যাচাই করা হয়েছে।", 'success');
                            } catch (error) {
                              handleFirestoreError(error, OperationType.UPDATE, 'donations');
                            }
                          }}
                          className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm"
                        >
                          <CheckCircle2 size={16} /> যাচাই করুন
                        </button>
                      )}
                      <button 
                        onClick={() => deleteItem('donations', donation.id)}
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
                      editType === 'event' ? 'ইভেন্ট তথ্য পরিবর্তন' :
                      'সেবা তথ্য পরিবর্তন'
                    )}
                  </h3>
                  <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-emerald-800 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-6">
                  {editType === 'event' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-500 uppercase">ইভেন্ট শিরোনাম</label>
                        <input 
                          value={editingItem.title}
                          onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                          className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">তারিখ</label>
                          <input 
                            value={editingItem.date}
                            onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="যেমন: ১৫ মে, ২০২৪"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-emerald-500 uppercase">সময়</label>
                          <input 
                            value={editingItem.time}
                            onChange={(e) => setEditingItem({...editingItem, time: e.target.value})}
                            className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="যেমন: সকাল ১০:০০ টা"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-500 uppercase">স্থান</label>
                        <input 
                          value={editingItem.location}
                          onChange={(e) => setEditingItem({...editingItem, location: e.target.value})}
                          className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-500 uppercase">বিবরণ</label>
                        <textarea 
                          value={editingItem.description}
                          onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                          className="w-full bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-500 uppercase">ইভেন্ট ছবি</label>
                        <div className="flex items-center gap-4">
                          <label className="flex-grow cursor-pointer bg-emerald-950 border border-emerald-800 border-dashed rounded-xl p-4 hover:border-emerald-500 transition-all text-center">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, 'event')}
                              className="hidden"
                              disabled={uploading}
                            />
                            <div className="flex flex-col items-center gap-2">
                              <Camera className={cn("text-emerald-500", uploading && "animate-pulse")} size={24} />
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
                                <ImageIcon size={32} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : editType === 'member' ? (
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
                            <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, 'service')} className="hidden" />
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

const EventsPage = ({ onBack }: { onBack: () => void }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'events');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-emerald-50/30 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-emerald-950 mb-4">আমাদের ইভেন্টসমূহ</h1>
            <p className="text-lg text-emerald-800/70">সাউদাস-এর আসন্ন এবং বিগত কার্যক্রমসমূহ।</p>
          </div>
          <button 
            onClick={onBack}
            className="p-3 bg-white text-emerald-600 rounded-2xl border border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"
          >
            <ArrowRight className="rotate-180" size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-emerald-100">
            <Calendar size={48} className="mx-auto text-emerald-200 mb-4" />
            <p className="text-emerald-900/50 italic text-lg">বর্তমানে কোনো ইভেন্ট নেই।</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-emerald-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={event.image || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop"} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                    {event.date}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-emerald-950 mb-4 group-hover:text-emerald-600 transition-colors">{event.title}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-emerald-700 text-sm">
                      <Clock size={16} /> {event.time}
                    </div>
                    <div className="flex items-center gap-3 text-emerald-700 text-sm">
                      <MapPin size={16} /> {event.location}
                    </div>
                  </div>
                  <p className="text-emerald-900/60 text-sm leading-relaxed line-clamp-3 mb-6">
                    {event.description}
                  </p>
                  <button 
                    onClick={() => setSelectedEvent(event)}
                    className="w-full py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    বিস্তারিত পড়ুন <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Event Detail Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedEvent(null)}
                className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
              >
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-6 right-6 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all"
                >
                  <X size={24} />
                </button>

                <div className="overflow-y-auto">
                  <div className="aspect-video md:aspect-[21/9] relative">
                    <img 
                      src={selectedEvent.image || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop"} 
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-4">
                        <Calendar size={14} /> {selectedEvent.date}
                      </div>
                      <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">{selectedEvent.title}</h2>
                    </div>
                  </div>

                  <div className="p-8 md:p-12">
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                      <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                          <Clock size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">সময়</p>
                          <p className="text-emerald-950 font-bold">{selectedEvent.time || "নির্ধারিত নয়"}</p>
                        </div>
                      </div>
                      <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">স্থান</p>
                          <p className="text-emerald-950 font-bold">{selectedEvent.location}</p>
                        </div>
                      </div>
                      <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">তারিখ</p>
                          <p className="text-emerald-950 font-bold">{selectedEvent.date}</p>
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-emerald max-w-none">
                      <h4 className="text-xl font-bold text-emerald-950 mb-6 flex items-center gap-2">
                        <div className="w-2 h-8 bg-emerald-600 rounded-full" /> ইভেন্ট বিবরণ
                      </h4>
                      <p className="text-emerald-900/70 text-lg leading-relaxed whitespace-pre-wrap">
                        {selectedEvent.description}
                      </p>
                    </div>

                    <div className="mt-12 pt-12 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                          <Heart size={24} fill="currentColor" />
                        </div>
                        <div>
                          <p className="text-emerald-950 font-bold">সাউদাস-এর সাথে থাকুন</p>
                          <p className="text-sm text-emerald-700">মানবতার সেবায় আমরা আপনার পাশে।</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedEvent(null)}
                        className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        বন্ধ করুন
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const DonationReceipt = ({ data, onDownload, onPrint }: { data: any, onDownload: () => void, onPrint: () => void }) => {
  const receiptRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-[#f0fdf4] min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div 
          ref={receiptRef}
          id="donation-receipt"
          style={{ 
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '24px',
            border: '1px solid #d1fae5',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Decorative Elements */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', backgroundColor: '#10b981' }} />
          
          <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
            <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', overflow: 'hidden', borderRadius: '16px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src="https://storage.googleapis.com/static.antigravity.ai/projects/d1ac55c9-c597-4d96-a679-bc7e2363429a/attachments/4024f2b1-9f93-455b-801a-64219f7f4514.png" 
                alt="সাউদাস লোগো" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#059669', margin: '0 0 8px 0' }}>সামাজিক উন্নয়ন দাতব্য সংস্থা (সাউদাস)</h1>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#022c22', margin: 0 }}>অফিসিয়াল অনুদান রশিদ</h2>
            <p style={{ color: '#059669', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>সাউদাস ডিজিটাল অ্যাসিস্ট্যান্ট</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #ecfdf5' }}>
              <span style={{ color: '#065f46', opacity: 0.6, fontSize: '14px', fontWeight: '500' }}>দাতার নাম</span>
              <span style={{ color: '#022c22', fontWeight: '700' }}>{data.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #ecfdf5' }}>
              <span style={{ color: '#065f46', opacity: 0.6, fontSize: '14px', fontWeight: '500' }}>মোবাইল</span>
              <span style={{ color: '#022c22', fontWeight: '700' }}>{data.phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #ecfdf5' }}>
              <span style={{ color: '#065f46', opacity: 0.6, fontSize: '14px', fontWeight: '500' }}>পরিমাণ</span>
              <span style={{ color: '#059669', fontWeight: '900', fontSize: '20px' }}>৳ {data.amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #ecfdf5' }}>
              <span style={{ color: '#065f46', opacity: 0.6, fontSize: '14px', fontWeight: '500' }}>তারিখ</span>
              <span style={{ color: '#022c22', fontWeight: '700' }}>{new Date(data.createdAt).toLocaleDateString('bn-BD')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #ecfdf5' }}>
              <span style={{ color: '#065f46', opacity: 0.6, fontSize: '14px', fontWeight: '500' }}>ট্রানজেকশন আইডি (শেষ ৪)</span>
              <span style={{ color: '#022c22', fontWeight: '700', fontFamily: 'monospace' }}>****{data.lastFour}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #ecfdf5' }}>
              <span style={{ color: '#065f46', opacity: 0.6, fontSize: '14px', fontWeight: '500' }}>রশিদ নম্বর</span>
              <span style={{ color: '#022c22', fontWeight: '700', fontFamily: 'monospace', fontSize: '12px' }}>#{data.id.toUpperCase()}</span>
            </div>
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-block', padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '16px', border: '1px solid #d1fae5', marginBottom: '16px' }}>
              <ShieldCheck style={{ color: '#059669', margin: '0 auto 4px' }} size={24} />
              <p style={{ fontSize: '10px', color: '#047857', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Verified Digital Receipt</p>
            </div>
            <p style={{ fontSize: '12px', color: '#064e3b', fontWeight: '700', marginBottom: '4px' }}>
              সাউদাস-এর সাথে থাকুন
            </p>
            <p style={{ fontSize: '11px', color: '#059669', fontWeight: '600', marginBottom: '12px' }}>
              মানবতার সেবায় আমরা আপনার পাশে
            </p>
            <p style={{ fontSize: '10px', color: '#064e3b', opacity: 0.4, lineHeight: '1.5', fontStyle: 'italic', margin: 0 }}>
              এটি একটি সিস্টেম জেনারেটেড ডিজিটাল রশিদ। তথ্যের সত্যতা যাচাইয়ের জন্য আমাদের সাথে যোগাযোগ করুন।
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onDownload}
            className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 group"
          >
            <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
            ডাউনলোড করুন
          </button>
          <button 
            onClick={onPrint}
            className="flex-1 bg-white text-emerald-600 border border-emerald-200 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
          >
            <Printer size={20} />
            প্রিন্ট করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PaymentPage = ({ onBack, showNotification, config }: { onBack: () => void, showNotification: (m: string, t: 'success' | 'error') => void, config: SiteConfig }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    amount: '',
    lastFour: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.amount || !formData.lastFour) {
      showNotification("অনুগ্রহ করে সব তথ্য প্রদান করুন।", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'donations'), {
        ...formData,
        status: 'pending',
        createdAt: Date.now()
      });
      
      const newReceipt = {
        ...formData,
        id: docRef.id.slice(-8),
        createdAt: Date.now()
      };
      
      setReceiptData(newReceipt);
      showNotification("আপনার তথ্য সফলভাবে জমা হয়েছে। রশিদটি সংগ্রহ করুন।", 'success');
      setFormData({ name: '', phone: '', amount: '', lastFour: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'donations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    const element = document.getElementById('donation-receipt');
    if (!element) return;

    try {
      showNotification("রশিদ তৈরি হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...", 'success');
      
      // Wait a bit for images to be fully ready in the DOM
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: true,
        useCORS: true,
        allowTaint: false, // Changed to false to avoid security errors with CORS
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('donation-receipt');
          if (el) el.style.boxShadow = 'none';
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Donation_Receipt_${receiptData.id}.pdf`);
      showNotification("রশিদটি সফলভাবে ডাউনলোড করা হয়েছে।", 'success');
    } catch (error) {
      console.error('Download error:', error);
      showNotification("ডাউনলোড ব্যর্থ হয়েছে। অনুগ্রহ করে স্ক্রিনশট নিন।", 'error');
    }
  };

  const handlePrintReceipt = async () => {
    const element = document.getElementById('donation-receipt');
    if (!element) return;

    try {
      showNotification("প্রিন্ট প্রিভিউ তৈরি হচ্ছে...", 'success');
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000
      });
      
      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Donation Receipt - ${receiptData.id}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0fdf4; }
                img { max-width: 100%; height: auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border-radius: 24px; }
                @media print {
                  body { background: white; }
                  img { box-shadow: none; border-radius: 0; }
                }
              </style>
            </head>
            <body>
              <img src="${imgData}" />
              <script>
                window.onload = () => {
                  window.print();
                  setTimeout(() => window.close(), 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Fallback if popup blocked
        handleDownloadReceipt();
        showNotification("পপ-আপ ব্লক করা হয়েছে। অনুগ্রহ করে PDF টি ডাউনলোড করুন।", 'error');
      }
    } catch (error) {
      console.error('Print error:', error);
      showNotification("প্রিন্ট ব্যর্থ হয়েছে।", 'error');
    }
  };

  if (receiptData) {
    return (
      <div className="min-h-screen bg-emerald-50/30 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setReceiptData(null)}
            className="mb-8 flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-900 transition-colors"
          >
            <ArrowLeft size={20} /> ফিরে যান
          </button>
          
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-emerald-950 mb-4">ধন্যবাদ! আপনার অনুদান গৃহীত হয়েছে</h1>
            <p className="text-emerald-800/70 max-w-xl mx-auto">
              আপনার এই মহৎ উদ্যোগের জন্য আমরা কৃতজ্ঞ। আপনার ডিজিটাল রশিদটি নিচে দেওয়া হলো।
            </p>
          </div>

          <DonationReceipt 
            data={receiptData} 
            onDownload={handleDownloadReceipt} 
            onPrint={handlePrintReceipt}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/30 flex flex-col items-center py-12 px-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Heart size={16} fill="currentColor" /> ডিজিটাল অ্যাসিস্ট্যান্ট
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-emerald-950 mb-4">সাউদাস-এ অনুদান প্রদান</h1>
          <p className="text-lg text-emerald-800/70 max-w-2xl mx-auto">
            আপনার সামান্য দান একজন মানুষের জীবন বদলে দিতে পারে। নিচে দেওয়া নম্বরে পেমেন্ট করে আপনার তথ্য প্রদান করুন।
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Payment Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <UserIcon size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-950">{config.payment.treasurerName}</h3>
                  <p className="text-emerald-600 font-medium">{config.payment.treasurerRole}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-pink-100">
                      <img 
                        src="https://images.weserv.nl/?url=raw.githubusercontent.com/Sabbir-Hossain/BD-Payment-Gateway-Icons/master/bkash.png" 
                        alt="Bkash" 
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">বিকাশ (পার্সোনাল)</p>
                      <p className="text-lg font-bold text-emerald-950">{config.payment.bkash}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(config.payment.bkash);
                      showNotification("নম্বর কপি করা হয়েছে", 'success');
                    }}
                    className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-orange-100">
                      <img 
                        src="https://images.weserv.nl/?url=raw.githubusercontent.com/Sabbir-Hossain/BD-Payment-Gateway-Icons/master/nagad.png" 
                        alt="Nagad" 
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">নগদ (পার্সোনাল)</p>
                      <p className="text-lg font-bold text-emerald-950">{config.payment.nagad}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(config.payment.nagad);
                      showNotification("নম্বর কপি করা হয়েছে", 'success');
                    }}
                    className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-purple-100">
                      <img 
                        src="https://images.weserv.nl/?url=raw.githubusercontent.com/Sabbir-Hossain/BD-Payment-Gateway-Icons/master/rocket.png" 
                        alt="Rocket" 
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">রকেট</p>
                      <p className="text-lg font-bold text-emerald-950">{config.payment.rocket}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(config.payment.rocket);
                      showNotification("নম্বর কপি করা হয়েছে", 'success');
                    }}
                    className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-lg shadow-emerald-900/20">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" /> ডিজিটাল ভাউচার
              </h4>
              <p className="text-emerald-100/80 text-sm leading-relaxed">
                পেমেন্ট সম্পন্ন করার পর পাশের ফর্মে আপনার তথ্য প্রদান করুন। আমাদের কোষাধ্যক্ষ তথ্যটি যাচাই করার পর আপনার মোবাইল নম্বরে একটি ডিজিটাল ভাউচার পাঠিয়ে দেবেন।
              </p>
            </div>
          </div>

          {/* Submission Form */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100">
            <h3 className="text-xl font-bold text-emerald-950 mb-6">পেমেন্ট তথ্য প্রদান করুন</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-900 mb-1">আপনার নাম</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="পুরো নাম লিখুন"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-900 mb-1">মোবাইল নম্বর</label>
                <input 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="আপনার সচল মোবাইল নম্বর"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-900 mb-1">টাকার পরিমাণ</label>
                <input 
                  type="text"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="কত টাকা পাঠিয়েছেন?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-900 mb-1">লেনদেনের শেষ ৪টি ডিজিট</label>
                <input 
                  type="text"
                  maxLength={4}
                  value={formData.lastFour}
                  onChange={(e) => setFormData({...formData, lastFour: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Transaction ID-এর শেষ ৪টি সংখ্যা"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? "জমা হচ্ছে..." : "তথ্য জমা দিন"}
              </button>
            </form>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="mt-12 text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-2 mx-auto font-bold"
        >
          <ChevronLeft size={20} /> হোম পেজে ফিরে যান
        </button>
      </motion.div>
    </div>
  );
};

const BottomNav = ({ 
  user, 
  onLoginClick, 
  setView, 
  currentView 
}: { 
  user: any, 
  onLoginClick: () => void, 
  setView: (v: any) => void,
  currentView: string
}) => {
  const handleLogout = () => {
    signOut(auth);
  };

  const navItems = [
    { id: 'home', label: 'হোম', icon: Home, action: () => setView('home') },
    { id: 'events', label: 'ইভেন্ট', icon: Calendar, action: () => setView('events') },
    { id: 'blood', label: 'রক্ত', icon: Droplets, action: () => setView('blood') },
    { id: 'chat', label: 'চ্যাট', icon: MessageCircle, action: () => setView('chat') },
    { 
      id: 'profile', 
      label: 'প্রোফাইল', 
      icon: UserIcon, 
      action: user ? () => setView('profile') : onLoginClick 
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-emerald-100 dark:border-slate-800 px-4 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-90",
              currentView === item.id 
                ? "text-emerald-600" 
                : "text-emerald-900/40 dark:text-slate-400"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </div>
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

  const [view, setView] = useState<'home' | 'admin' | 'payment' | 'blood' | 'chat' | 'notice' | 'directory' | 'events' | 'profile'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_config', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setSiteConfig(snapshot.data() as SiteConfig);
      } else {
        // Seed initial config if it doesn't exist
        const isAdmin = user?.email === "md.munnahossain885@gmail.com" || user?.email === "admin@saudas.org";
        if (isAdmin) {
          setDoc(doc(db, 'site_config', 'main'), DEFAULT_CONFIG);
        }
      }
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setIsOffline(false);
      } catch (error: any) {
        if (error.message?.includes('offline')) {
          setIsOffline(true);
        }
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification("সফলভাবে লগআউট হয়েছে।", 'success');
      setView('home');
    } catch (error) {
      showNotification("লগআউট ব্যর্থ হয়েছে।", 'error');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20 md:pb-0 transition-colors duration-300">
        {isOffline && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center py-2 text-xs font-bold flex items-center justify-center gap-4">
            <span className="animate-pulse">সার্ভারের সাথে সংযোগ বিচ্ছিন্ন। অনুগ্রহ করে আপনার ইন্টারনেট কানেকশন চেক করুন।</span>
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-white text-red-600 rounded-lg text-[10px] hover:bg-red-50 transition-colors"
            >
              রিফ্রেশ করুন
            </button>
          </div>
        )}
        <Navbar 
          onLoginClick={() => setIsLoginModalOpen(true)} 
          onLogoutClick={handleLogout}
          user={user} 
          setView={setView} 
          toggleTheme={toggleTheme}
          theme={theme}
        />
        
        <main>
          {view === 'home' ? (
            <>
              <Hero setView={setView} config={siteConfig} />
              
              {/* Community Features Section */}
              <section id="community" className="py-24 bg-emerald-50/50">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-16">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold mb-6 border border-emerald-200"
                    >
                      <LayoutDashboard size={16} />
                      <span>কমিউনিটি হাব</span>
                    </motion.div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="text-4xl md:text-5xl font-black text-emerald-950 mb-6"
                    >
                      আমাদের <span className="text-emerald-600">কার্যক্রম</span>
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="text-emerald-900/60 text-lg max-w-2xl mx-auto"
                    >
                      নোটিশ বোর্ড, সদস্য তালিকা, রক্তদান এবং চ্যাট - সবকিছুই এখন আপনার হাতের নাগালে।
                    </motion.p>
                  </div>
                  <QuickLinks setView={setView} />
                </div>
              </section>

              <Services />
              <ActiveMembers />
              
              <section id="members" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                  <h2 className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-4">সদস্য তালিকা</h2>
                  <h3 className="text-4xl font-bold text-emerald-950 mb-6">আমাদের গর্বিত সদস্যবৃন্দ</h3>
                  <p className="text-emerald-900/60 mb-10 max-w-2xl mx-auto">
                    সাউদাস-এর সাথে যুক্ত সকল নিবেদিতপ্রাণ সদস্যদের তালিকা এবং তাদের কার্যক্রম সম্পর্কে জানতে নিচের বাটনে ক্লিক করুন।
                  </p>
                  <button 
                    onClick={() => setView('directory')}
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 group"
                  >
                    পূর্ণাঙ্গ সদস্য তালিকা দেখুন
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </button>
                </div>
              </section>

              <About config={siteConfig} />
              <RegistrationForm showNotification={showNotification} />
              <Contact config={siteConfig} />
              <Footer setView={setView} config={siteConfig} />
            </>
          ) : view === 'notice' ? (
            <NoticeSection isAdmin={user?.email === "md.munnahossain885@gmail.com" || user?.email === "admin@saudas.org"} />
          ) : view === 'directory' ? (
            <MemberDirectory onBack={() => setView('home')} />
          ) : view === 'events' ? (
            <EventsPage onBack={() => setView('home')} />
          ) : view === 'blood' ? (
            <BloodSection user={user} isAdmin={user?.email === "md.munnahossain885@gmail.com" || user?.email === "admin@saudas.org"} />
          ) : view === 'chat' ? (
            <ChatSection user={user} />
          ) : view === 'profile' ? (
            <ProfileSection user={user} showNotification={showNotification} onLogout={handleLogout} onBack={() => setView('home')} />
          ) : view === 'payment' ? (
            <PaymentPage onBack={() => setView('home')} showNotification={showNotification} config={siteConfig} />
          ) : (
            user && <AdminPanel user={user} showNotification={showNotification} setConfirmConfig={setConfirmConfig} setView={setView} siteConfig={siteConfig} />
          )}
        </main>

        <BottomNav 
          user={user} 
          onLoginClick={() => setIsLoginModalOpen(true)} 
          setView={setView} 
          currentView={view} 
        />
        
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
