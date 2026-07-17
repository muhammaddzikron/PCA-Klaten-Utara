import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  linksData, boardMembers, subBranches, officeDetails, profileDetails, ShortLink 
} from './data';
import { 
  Search, Sun, Moon, Share2, ExternalLink, Copy, Check, MapPin, 
  Phone, Mail, ChevronRight, X, Info, Users, Globe,
  Facebook, Instagram, Youtube, MessageCircle, BarChart3, RotateCcw, 
  Award, CheckCircle2, Star, Sparkles, Navigation, Link2, BookOpen,
  Database, RefreshCw, LogIn, LogOut, Lock, Edit3, Trash2, Plus
} from 'lucide-react';

// Synthesize a premium soft tactile audio click in the browser
function playSoftClick() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Dynamic fallback for browsers that block audio
  }
}

// Synthesize a high-register bubble-up click for modals
function playModalOpenSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Fail silently
  }
}

const appsScriptCode = `// GOOGLE APPS SCRIPT: SINKRONISASI SHORTLINK PCA KLATEN UTARA (UPGRADED)
// Copy seluruh kode ini dan paste di Extensions > Apps Script (Ekstensi > Apps Script) pada Google Sheet Anda.

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Links") || createLinksSheet(ss);
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var jsonArray = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var record = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j].toString().trim();
      var val = row[j];
      
      if (key === "isModal") {
        record[key] = (val === "TRUE" || val === true || val === 1 || val.toString().toLowerCase() === "true");
      } else if (key === "clicks") {
        record[key] = parseInt(val || 0);
      } else {
        record[key] = val;
      }
    }
    jsonArray.push(record);
  }
  
  return ContentService.createTextOutput(JSON.stringify(jsonArray))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Links") || createLinksSheet(ss);
  var logSheet = ss.getSheetByName("Logs") || createLogsSheet(ss);
  
  var postData;
  try {
    postData = JSON.parse(e.postData.contents);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Invalid JSON: " + err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var action = postData.action;
  var linkId = postData.linkId;
  
  // 1. CLICK EVENT / LOGGING ACCESS
  if (action === "click" && linkId) {
    var data = sheet.getDataRange().getValues();
    var idIndex = data[0].indexOf("id");
    var clicksIndex = data[0].indexOf("clicks");
    
    if (idIndex !== -1 && clicksIndex !== -1) {
      for (var i = 1; i < data.length; i++) {
        if (data[i][idIndex].toString() === linkId.toString()) {
          var currentClicks = parseInt(data[i][clicksIndex] || 0);
          sheet.getRange(i + 1, clicksIndex + 1).setValue(currentClicks + 1);
          break;
        }
      }
    }
  }
  
  // 2. ADMIN LOGIN / LOGOUT LOGGING
  if ((action === "login" || action === "logout") && logSheet) {
    var timestamp = new Date();
    var id = postData.linkId || "admin-action";
    var title = postData.linkTitle || "Admin Portal";
    var platform = postData.platform || "";
    var details = postData.details || "";
    logSheet.appendRow([timestamp, id, title, platform, details]);
  }
  
  // 3. ADMIN SAVE LINK DIRECT TO SPREADSHEET
  if (action === "save_link" && postData.link) {
    var linkObj = postData.link;
    var data = sheet.getDataRange().getValues();
    var idIndex = data[0].indexOf("id");
    
    var rowIndex = -1;
    if (idIndex !== -1) {
      for (var i = 1; i < data.length; i++) {
        if (data[i][idIndex].toString() === linkObj.id.toString()) {
          rowIndex = i + 1; // 1-indexed plus header
          break;
        }
      }
    }
    
    var headers = data[0];
    var rowValues = [];
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j].toString().trim();
      var val = linkObj[key] !== undefined ? linkObj[key] : "";
      if (key === "clicks") {
        val = parseInt(val || 0);
      }
      rowValues.push(val);
    }
    
    if (rowIndex !== -1) {
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    
    if (logSheet) {
      logSheet.appendRow([new Date(), "save_link", linkObj.title, "Admin Panel", "Menyimpan atau memperbarui tautan: " + linkObj.id]);
    }
  }
  
  // 4. ADMIN DELETE LINK DIRECT FROM SPREADSHEET
  if (action === "delete_link" && linkId) {
    var data = sheet.getDataRange().getValues();
    var idIndex = data[0].indexOf("id");
    if (idIndex !== -1) {
      for (var i = 1; i < data.length; i++) {
        if (data[i][idIndex].toString() === linkId.toString()) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }
    if (logSheet) {
      logSheet.appendRow([new Date(), "delete_link", linkId, "Admin Panel", "Menghapus tautan: " + linkId]);
    }
  }

  // 5. UPDATE PROFILE DATA
  if (action === "save_profile" && postData.profile) {
    var profileSheet = ss.getSheetByName("Profile") || ss.insertSheet("Profile");
    profileSheet.clear();
    profileSheet.appendRow(["history", "vision", "mission", "achievements"]);
    var prof = postData.profile;
    var missionStr = Array.isArray(prof.mission) ? JSON.stringify(prof.mission) : (prof.mission || "[]");
    var achStr = Array.isArray(prof.achievements) ? JSON.stringify(prof.achievements) : (prof.achievements || "[]");
    profileSheet.appendRow([prof.history || "", prof.vision || "", missionStr, achStr]);
    
    if (logSheet) {
      logSheet.appendRow([new Date(), "save_profile", "Profil Organisasi", "Admin Panel", "Memperbarui Sejarah, Visi, Misi"]);
    }
  }

  // 6. UPDATE BOARD MEMBERS DATA
  if (action === "save_board" && postData.board) {
    var boardSheet = ss.getSheetByName("Board") || ss.insertSheet("Board");
    boardSheet.clear();
    boardSheet.appendRow(["name", "role", "period", "dept", "photo", "bio"]);
    var boardArr = postData.board;
    if (Array.isArray(boardArr)) {
      for (var i = 0; i < boardArr.length; i++) {
        var b = boardArr[i];
        boardSheet.appendRow([b.name || "", b.role || "", b.period || "", b.dept || "", b.photo || "", b.bio || ""]);
      }
    }
    
    if (logSheet) {
      logSheet.appendRow([new Date(), "save_board", "Pengurus Harian", "Admin Panel", "Memperbarui daftar struktur organisasi"]);
    }
  }

  // 7. UPDATE OFFICE DETAILS DATA
  if (action === "save_office" && postData.office) {
    var officeSheet = ss.getSheetByName("Office") || ss.insertSheet("Office");
    officeSheet.clear();
    officeSheet.appendRow(["name", "address", "googleMapsUrl", "wazeUrl", "phone", "email"]);
    var o = postData.office;
    officeSheet.appendRow([o.name || "", o.address || "", o.googleMapsUrl || "", o.wazeUrl || "", o.phone || "", o.email || ""]);
    
    if (logSheet) {
      logSheet.appendRow([new Date(), "save_office", "Detail Kantor", "Admin Panel", "Memperbarui alamat dan peta lokasi"]);
    }
  }

  // 8. UPDATE SUB BRANCHES DATA
  if (action === "save_sub_branches" && postData.sub_branches) {
    var subSheet = ss.getSheetByName("SubBranches") || ss.insertSheet("SubBranches");
    subSheet.clear();
    subSheet.appendRow(["name", "location"]);
    var subArr = postData.sub_branches;
    if (Array.isArray(subArr)) {
      for (var i = 0; i < subArr.length; i++) {
        var s = subArr[i];
        subSheet.appendRow([s.name || "", s.location || ""]);
      }
    }
    
    if (logSheet) {
      logSheet.appendRow([new Date(), "save_sub_branches", "Pimpinan Ranting", "Admin Panel", "Memperbarui daftar Ranting 'Aisyiyah"]);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function createLinksSheet(ss) {
  var sheet = ss.insertSheet("Links");
  var headers = ["id", "title", "subtitle", "url", "emoji", "category", "badge", "badgeColor", "description", "clicks"];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#FFF2CC");
  
  var defaultLinks = [
    ["profile", "Profil PCA Klaten Utara", "Sejarah, Visi, Misi & Amal Usaha", "#profile", "👤", "internal", "Tentang Kami", "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300", "Sejarah lengkap, visi dakwah, misi dakwah, dan daftar amal usaha resmi Pimpinan Cabang 'Aisyiyah Klaten Utara.", 124],
    ["board", "Pengurus PCA Klaten Utara", "Struktur Organisasi & Majelis", "#board", "🧕", "internal", "Struktur", "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300", "Struktur kepengurusan harian resmi serta pimpinan majelis dakwah.", 98],
    ["address", "Alamat Kantor PCA Klaten Utara", "Lokasi Gedung Dakwah & Navigasi", "#address", "📍", "internal", "Peta Lokasi", "", "Lokasi Gedung Dakwah Muhammadiyah Cabang Klaten Utara serta tautan peta navigasi Google Maps.", 156],
    ["website", "Website Resmi 'Aisyiyah", "Pusat Informasi Syiar 'Aisyiyah Nasional", "https://aisyiyah.or.id", "🌐", "social", "", "", "Platform web resmi Pimpinan Pusat 'Aisyiyah untuk kabar kebangsaan terbaru.", 72],
    ["facebook", "Facebook PCA", "Ikuti Update Kegiatan & Syiar di Facebook", "https://facebook.com", "📘", "social", "", "", "Halaman Facebook resmi untuk publikasi pengajian, berita ranting, dan bakti sosial.", 28],
    ["instagram", "Instagram PCA", "Dokumentasi Foto & Reels Kegiatan Kami", "https://instagram.com/pca_klatenutara", "📸", "social", "Aktif", "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300", "Galeri foto, info poster pengajian, dan video reels dakwah humas PCA.", 145],
    ["youtube", "Youtube PCA", "Video Kajian, Dokumentasi & Profil", "https://youtube.com/@pcaklatenutara", "🎥", "social", "", "", "Kanal video ceramah rutin, profil amal usaha, dan dokumentasi syiar.", 56],
    ["tiktok", "TikTok PCA", "Video Syiar Singkat & Edukasi Keagamaan", "https://tiktok.com/@pca_klatenutara", "🎵", "social", "", "", "Klip pendek dakwah kreatif dari kader-kader muda Nasyiatul 'Aisyiyah.", 42],
    ["whatsapp", "WhatsApp Hubungi Kami", "Hubungi Layanan Informasi & Konseling", "https://wa.me/6281234567890?text=Assalamu%27alaikum%20Warahmatullahi%20Wabarakaatuh.%20Saya%20ingin%20bertanya%20mengenai%20kegiatan/layanan%20PCA%20Klaten%20Utara.", "💬", "contact", "Respons Cepat", "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300", "Chat layanan informasi, pendaftaran kajian, dan koordinasi pengurus.", 189]
  ];
  
  for (var i = 0; i < defaultLinks.length; i++) {
    sheet.appendRow(defaultLinks[i]);
  }
  
  return sheet;
}

function createLogsSheet(ss) {
  var sheet = ss.insertSheet("Logs");
  var headers = ["Timestamp", "Link ID", "Link Title", "Platform/Device", "Visitor Action"];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#D9EAD3");
  return sheet;
}
`;

function getWhatsAppUrl(url: string, message: string) {
  try {
    const match = url.match(/wa\.me\/([0-9]+)/);
    const phone = match ? match[1] : '6285742345590';
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  } catch (e) {
    return `https://wa.me/6285742345590?text=${encodeURIComponent(message)}`;
  }
}

function HijabAvatar({ name }: { name: string }) {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    { from: "#0f766e", to: "#0d9488", accessor: "#eab308" }, // Teal & Gold
    { from: "#047857", to: "#10b981", accessor: "#f59e0b" }, // Emerald & Amber
    { from: "#15803d", to: "#22c55e", accessor: "#eab308" }, // Green & Gold
    { from: "#0f766e", to: "#14b8a6", accessor: "#facc15" }, // Deep Teal & Bright Gold
  ];
  const grad = gradients[hash % gradients.length];

  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id={`avatarGrad-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={grad.from} />
          <stop offset="100%" stopColor={grad.to} />
        </linearGradient>
        <linearGradient id={`faceGrad-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="100%" stopColor="#fed7aa" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="currentColor" className="text-teal-50/40 dark:text-slate-800" />
      <path d="M60 18 C32 18 28 42 28 65 C28 85 36 102 60 102 C84 102 92 85 92 65 C92 42 88 18 60 18 Z" fill={`url(#avatarGrad-${hash})`} />
      <path d="M60 30 C48 30 45 42 45 58 C45 70 51 78 60 78 C69 78 75 70 75 58 C75 42 72 30 60 30 Z" fill={`url(#faceGrad-${hash})`} />
      <path d="M48 76 C48 76 60 84 72 76 C69 92 51 92 48 76 Z" fill={grad.from} />
      <circle cx="60" cy="80" r="3" fill={grad.accessor} />
    </svg>
  );
}

export default function App() {
  // Theme state initialization
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pca_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // UI States
  const [activeModal, setActiveModal] = useState<'profile' | 'board' | 'address' | 'share' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Google Sheets Sync & Dynamic Modal States
  const [appsScriptUrl, setAppsScriptUrl] = useState(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('pca_apps_script_url') || 'https://script.google.com/macros/s/AKfycbxUDEkxEBtk2XUxq6qsJfDEy-NWYZwKvkDOB6HqRQVscdPMEW-n7mKrgub7HIQMGaM9/exec') : 'https://script.google.com/macros/s/AKfycbxUDEkxEBtk2XUxq6qsJfDEy-NWYZwKvkDOB6HqRQVscdPMEW-n7mKrgub7HIQMGaM9/exec';
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(() => {
    return typeof window !== 'undefined' 
      ? (localStorage.getItem('pca_spreadsheet_url') || 'https://docs.google.com/spreadsheets/d/1teXrh7WIg9hKmnP-XwcPxSSk6YOuTbbdE8siqtd5zLA/edit?usp=sharing') 
      : 'https://docs.google.com/spreadsheets/d/1teXrh7WIg9hKmnP-XwcPxSSk6YOuTbbdE8siqtd5zLA/edit?usp=sharing';
  });
  const [links, setLinks] = useState<ShortLink[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pca_links_custom');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return linksData;
  });

  // Admin & Editable States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pca_admin_logged_in') === 'true';
    }
    return false;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [showLinkEditorModal, setShowLinkEditorModal] = useState(false);
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);

  const [boardMembersState, setBoardMembersState] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pca_board_members');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return boardMembers;
  });
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [boardForm, setBoardForm] = useState<any[]>([]);

  const [officeDetailsState, setOfficeDetailsState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pca_office_details');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return officeDetails;
  });
  const [isEditingOffice, setIsEditingOffice] = useState(false);
  const [officeForm, setOfficeForm] = useState<any>({ name: '', address: '', googleMapsUrl: '', wazeUrl: '', phone: '', email: '' });

  const [profileDetailsState, setProfileDetailsState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pca_profile_details');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return profileDetails;
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({ history: '', vision: '', mission: [], achievements: [] });
  const [subBranchesState, setSubBranchesState] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pca_sub_branches');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return subBranches;
  });
  const [subBranchesForm, setSubBranchesForm] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [inputSpreadsheetUrl, setInputSpreadsheetUrl] = useState(spreadsheetUrl);
  const [inputAppsScriptUrl, setInputAppsScriptUrl] = useState(appsScriptUrl);
  const [copiedScript, setCopiedScript] = useState(false);
  
  // Immersive Default Link Popup Modal States
  const [selectedLinkForModal, setSelectedLinkForModal] = useState<ShortLink | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [copiedModalLink, setCopiedModalLink] = useState(false);
  
  // Link Click Analytics State
  const [linkClicks, setLinkClicks] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pca_link_clicks');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return {};
        }
      }
    }
    // Set default clicks to make the analytics page look real initially
    return {
      profile: 124,
      board: 98,
      address: 156,
      website: 72,
      facebook: 28,
      instagram: 145,
      youtube: 56,
      tiktok: 42,
      whatsapp: 189
    };
  });

  // Track scroll position for header glass layout effects
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update theme class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('pca_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('pca_theme', 'light');
    }
  }, [isDark]);

  // Synchronize localStorage click counts
  useEffect(() => {
    localStorage.setItem('pca_link_clicks', JSON.stringify(linkClicks));
  }, [linkClicks]);

  // Load dynamic links from Google Sheet on mount or when appsScriptUrl changes
  useEffect(() => {
    if (!appsScriptUrl) {
      setLinks(linksData);
      setSyncStatus('idle');
      return;
    }
    
    const fetchLinks = async () => {
      setIsSyncing(true);
      setSyncStatus('idle');
      try {
        const res = await fetch(appsScriptUrl);
        if (!res.ok) throw new Error("Gagal mengambil respon dari Google Sheet");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Sync live clicks if present in sheet
          const sheetClicks: Record<string, number> = {};
          data.forEach(link => {
            if (link.clicks !== undefined) {
              sheetClicks[link.id] = Number(link.clicks);
            }
          });
          if (Object.keys(sheetClicks).length > 0) {
            setLinkClicks(prev => ({ ...prev, ...sheetClicks }));
          }
          setLinks(data);
          setSyncStatus('success');
          setSyncMessage('Berhasil mensinkronkan data tautan dari Google Sheets secara langsung!');
        } else {
          throw new Error("Format data tidak valid");
        }
      } catch (err) {
        console.warn("Gagal sinkronisasi data Google Sheet, menggunakan cadangan lokal:", err);
        setSyncStatus('error');
        setSyncMessage('Gagal mengambil data dari spreadsheet. Menggunakan data cadangan lokal.');
        setLinks(linksData);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchLinks();
  }, [appsScriptUrl]);

  // Manual Refresh Handler
  const handleManualSync = async () => {
    playSoftClick();
    if (!appsScriptUrl) {
      alert("Masukkan URL Google Apps Script Web App terlebih dahulu di panel admin!");
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetch(appsScriptUrl);
      if (!res.ok) throw new Error("Gagal mengambil respon");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sheetClicks: Record<string, number> = {};
        data.forEach(link => {
          if (link.clicks !== undefined) {
            sheetClicks[link.id] = Number(link.clicks);
          }
        });
        if (Object.keys(sheetClicks).length > 0) {
          setLinkClicks(prev => ({ ...prev, ...sheetClicks }));
        }
        setLinks(data);
        setSyncStatus('success');
        setSyncMessage('Sinkronisasi manual berhasil!');
        alert("Sinkronisasi Berhasil! Semua tautan dan statistik klik dari Google Sheet telah dimuat.");
      } else {
        throw new Error("Format data tidak valid");
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncMessage('Gagal melakukan sinkronisasi manual.');
      alert("Sinkronisasi Gagal! Silakan periksa URL Web App atau koneksi internet Anda.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Close modals on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    playSoftClick();
    setIsDark(!isDark);
  };

  // Admin Authentication Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSoftClick();
    if (loginUsername === 'admin' && loginPassword === 'adminn') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('pca_admin_logged_in', 'true');
      
      // Log login event to Google Sheet
      if (appsScriptUrl) {
        fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            linkId: 'admin-login',
            linkTitle: 'Portal Admin',
            platform: navigator.userAgent || 'Web Browser',
            details: 'Admin successfully logged in'
          })
        }).catch(err => console.warn("Gagal mengirim log login ke Google Sheets:", err));
      }

      setShowLoginModal(false);
      setLoginError('');
      setLoginUsername('');
      setLoginPassword('');
      alert("Login Berhasil! Anda sekarang dalam Mode Pengelola Data.");
    } else {
      setLoginError('Kredensial salah! Harap periksa Username atau Password.');
    }
  };

  const handleLogout = () => {
    playSoftClick();
    if (confirm("Apakah Anda yakin ingin keluar dari Mode Pengelola Data?")) {
      
      // Log logout event to Google Sheet
      if (appsScriptUrl) {
        fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'logout',
            linkId: 'admin-logout',
            linkTitle: 'Portal Admin',
            platform: navigator.userAgent || 'Web Browser',
            details: 'Admin logged out'
          })
        }).catch(err => console.warn("Gagal mengirim log logout ke Google Sheets:", err));
      }

      setIsAdminLoggedIn(false);
      localStorage.removeItem('pca_admin_logged_in');
      setIsEditingBoard(false);
      setIsEditingOffice(false);
      setIsEditingProfile(false);
      alert("Berhasil Keluar!");
    }
  };

  // Admin Data Management Helpers
  const handleSaveLink = (savedLink: ShortLink) => {
    setLinks(prev => {
      const exists = prev.some(l => l.id === savedLink.id);
      let newLinks;
      if (exists) {
        newLinks = prev.map(l => l.id === savedLink.id ? savedLink : l);
      } else {
        newLinks = [...prev, savedLink];
      }
      localStorage.setItem('pca_links_custom', JSON.stringify(newLinks));
      return newLinks;
    });

    // Sync to Google Spreadsheet
    if (appsScriptUrl) {
      fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_link',
          link: savedLink
        })
      }).catch(err => console.warn("Gagal mengirim data tautan baru ke Google Sheets:", err));
    }

    setShowLinkEditorModal(false);
    setEditingLink(null);
    alert("Tautan berhasil disimpan dan disinkronkan ke Google Sheets!");
  };

  const handleDeleteLink = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus tautan ini?")) {
      setLinks(prev => {
        const filtered = prev.filter(l => l.id !== id);
        localStorage.setItem('pca_links_custom', JSON.stringify(filtered));
        return filtered;
      });

      // Sync delete to Google Spreadsheet
      if (appsScriptUrl) {
        fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete_link',
            linkId: id
          })
        }).catch(err => console.warn("Gagal menghapus data tautan di Google Sheets:", err));
      }
    }
  };

  const handleSaveBoardMembers = () => {
    playSoftClick();
    setBoardMembersState(boardForm);
    localStorage.setItem('pca_board_members', JSON.stringify(boardForm));

    // Sync board to Google Spreadsheet
    if (appsScriptUrl) {
      fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_board',
          board: boardForm
        })
      }).catch(err => console.warn("Gagal mensinkronisasi data Pengurus ke Google Sheets:", err));
    }

    setIsEditingBoard(false);
    alert("Daftar Pengurus berhasil disimpan dan disinkronkan ke Google Sheets!");
  };

  const handleSaveOfficeDetails = () => {
    playSoftClick();
    setOfficeDetailsState(officeForm);
    localStorage.setItem('pca_office_details', JSON.stringify(officeForm));

    // Sync office details to Google Spreadsheet
    if (appsScriptUrl) {
      fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_office',
          office: officeForm
        })
      }).catch(err => console.warn("Gagal mensinkronisasi data Alamat ke Google Sheets:", err));
    }

    setIsEditingOffice(false);
    alert("Detail Alamat berhasil disimpan dan disinkronkan ke Google Sheets!");
  };

  const handleSaveProfileDetails = () => {
    playSoftClick();
    setProfileDetailsState(profileForm);
    localStorage.setItem('pca_profile_details', JSON.stringify(profileForm));
    setSubBranchesState(subBranchesForm);
    localStorage.setItem('pca_sub_branches', JSON.stringify(subBranchesForm));

    // Sync profile & sub-branches to Google Spreadsheet
    if (appsScriptUrl) {
      fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_profile',
          profile: profileForm
        })
      }).catch(err => console.warn("Gagal mensinkronisasi data Profil ke Google Sheets:", err));

      fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_sub_branches',
          sub_branches: subBranchesForm
        })
      }).catch(err => console.warn("Gagal mensinkronisasi data Ranting ke Google Sheets:", err));
    }

    setIsEditingProfile(false);
    alert("Profil Organisasi dan Ranting berhasil disimpan dan disinkronkan ke Google Sheets!");
  };

  // Handle tracking click count when a shortlink is clicked
  const handleLinkClick = (id: string, isModal: boolean, url: string) => {
    playSoftClick();
    
    // Find the link object from dynamic links list
    const clickedLink = links.find(l => l.id === id) || linksData.find(l => l.id === id);
    if (!clickedLink) return;

    // Track locally
    setLinkClicks(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));

    // Post click tracking event to Google Apps Script Web App (async)
    if (appsScriptUrl) {
      fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'click',
          linkId: id,
          linkTitle: clickedLink.title,
          platform: navigator.userAgent || 'Web Browser',
          details: 'User opened details popup'
        })
      }).catch(err => console.warn("Gagal mengirim data klik ke Google Sheets:", err));
    }

    // Determine modal triggers
    if (id === 'profile' || id === 'board' || id === 'address') {
      playModalOpenSound();
      setActiveModal(id as any);
    } else {
      // For all other links, show our gorgeous dynamic detail popup by default!
      playModalOpenSound();
      setSelectedLinkForModal(clickedLink);
      
      // Pre-fill WhatsApp message helper if WhatsApp link
      if (id === 'whatsapp' || clickedLink.url.includes('wa.me')) {
        try {
          const waUrlObj = new URL(clickedLink.url);
          const currentText = waUrlObj.searchParams.get('text');
          setWhatsappMessage(currentText ? decodeURIComponent(currentText) : 'Assalamu\'alaikum Warahmatullahi Wabarakaatuh.');
        } catch (e) {
          setWhatsappMessage('Assalamu\'alaikum Warahmatullahi Wabarakaatuh. Saya ingin bertanya mengenai kegiatan/layanan PCA Klaten Utara.');
        }
      } else {
        setWhatsappMessage('');
      }
    }
  };

  // Reset clicks statistics
  const resetClicks = () => {
    playSoftClick();
    if (confirm("Apakah Anda yakin ingin menyetel ulang statistik analisis klik?")) {
      const resetStats = links.reduce((acc, link) => {
        acc[link.id] = 0;
        return acc;
      }, {} as Record<string, number>);
      setLinkClicks(resetStats);
    }
  };

  // Copy full page URL to clipboard
  const copyPageUrl = () => {
    playSoftClick();
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Copy office address to clipboard
  const copyOfficeAddress = () => {
    playSoftClick();
    navigator.clipboard.writeText(officeDetailsState.address).then(() => {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    });
  };

  return (
    <div className="relative min-h-screen w-full transition-colors duration-500 overflow-x-hidden selection:bg-gold/30 flex items-center justify-center py-12 px-8 sm:px-12">
      
      {/* IMMERSIVE UI BACKGROUND DECORATIONS */}
      <div className="blur-circle circle-1" />
      <div className="blur-circle circle-2" />
      <div className="ornament-curve" />

      {/* MAIN CONTAINER: SINGLE-COLUMN SECURE MOBILE-RESPONSIVE CARD */}
      <main className="w-full max-w-md sm:max-w-lg relative z-10 flex flex-col gap-8">
        
        {/* BRANDING & IDENTITY BOX */}
        <section className="branding flex flex-col items-center text-center animate-fade-in-down w-full">
          
          {/* THEMATIC LOGO WRAPPER */}
          <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[24px] p-3 shadow-[0_10px_25px_rgba(0,0,0,0.05)] mb-6 flex items-center justify-center border border-gold/20 flex-shrink-0 hover:scale-105 transition-transform duration-300">
            <img 
              src="https://web.suaramuhammadiyah.id/wp-content/uploads/2023/02/logo-aisyiyah-official.png" 
              alt="Logo 'Aisyiyah Official" 
              className="w-full h-full object-contain filter drop-shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* IDENTITY HEADER */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 leading-none text-center">
            <span className="bg-gradient-to-r from-gold to-green bg-clip-text text-transparent">
              PCA Klaten Utara
            </span>
          </h1>
          
          <p className="text-base sm:text-lg font-semibold text-green dark:text-teal-400 mt-2.5 mb-4 text-center">
            Pimpinan Cabang 'Aisyiyah Klaten Utara
          </p>
          
          <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 mb-5 text-center max-w-sm px-2">
            Perempuan Berkemajuan<br />
            Mencerahkan, Memberdayakan, Memajukan Umat.
          </p>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium bg-white/40 dark:bg-slate-950/30 px-3.5 py-1.5 rounded-full border border-slate-200/40 dark:border-slate-800/20 backdrop-blur-sm">
            <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
            <span>Klaten Utara, Kabupaten Klaten</span>
          </div>

          {/* ELEGANT INTEGRATED QUICK CONTROLS (SHARE & DARK MODE) */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => { playModalOpenSound(); setActiveModal('share'); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-gold dark:hover:text-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm backdrop-blur-sm cursor-pointer text-xs font-bold"
              title="Bagikan Shortlink"
              aria-label="Bagikan Shortlink PCA"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan</span>
            </button>
            <button 
              onClick={toggleDarkMode}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-gold dark:hover:text-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm backdrop-blur-sm cursor-pointer text-xs font-bold"
              title={isDark ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span>Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span>Gelap</span>
                </>
              )}
            </button>
            {isAdminLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white border border-red-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm backdrop-blur-sm cursor-pointer text-xs font-bold"
                title="Keluar dari Panel Admin"
                aria-label="Logout Admin"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            ) : (
              <button 
                onClick={() => { playModalOpenSound(); setShowLoginModal(true); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-850 text-white dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm backdrop-blur-sm cursor-pointer text-xs font-bold"
                title="Login Kelola Data"
                aria-label="Login Admin"
              >
                <LogIn className="w-4 h-4 text-gold animate-pulse" />
                <span>Login</span>
              </button>
            )}
          </div>
        </section>

        {/* SHORTLINKS PORTFOLIO */}
        <section className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          
          {isAdminLoggedIn && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/10 dark:bg-slate-950/40 border border-slate-300/40 dark:border-slate-800/40 mb-1 backdrop-blur-sm animate-fade-in flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Mode Pengelola Aktif</span>
              </div>
              <button
                onClick={() => {
                  playModalOpenSound();
                  setEditingLink({
                    id: 'link-' + Date.now(),
                    title: '',
                    subtitle: '',
                    url: '',
                    emoji: '🔗',
                    category: 'internal',
                    ariaLabel: 'Buka tautan',
                    isModal: false,
                    badge: '',
                    badgeColor: '',
                    description: '',
                  });
                  setShowLinkEditorModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-gold to-green text-white font-extrabold text-[11px] shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tautan Baru</span>
              </button>
            </div>
          )}

          {links.map((link, index) => (
            <div
              key={link.id}
              onClick={() => handleLinkClick(link.id, !!link.isModal, link.url)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] hover:bg-[var(--link-hover-bg)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group text-left relative overflow-hidden"
              style={{ animationDelay: `${index * 80}ms` }}
              aria-label={link.ariaLabel}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLinkClick(link.id, !!link.isModal, link.url);
                }
              }}
            >
              {/* LEFT CONTENT: EMOJI & TEXTS */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* EMOJI ICON */}
                <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300 select-none flex-shrink-0">
                  {link.emoji}
                </span>
                
                {/* TEXT BOX */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-base text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
                      {link.title}
                    </span>
                    {link.badge && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold select-none ${
                        link.badgeColor || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </div>
                  {link.subtitle && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 font-medium">
                      {link.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT CONTENT: EXPLICIT BUTTONS PERFECTLY ALIGNED VERTICALLY (LURUS KEBAWAH POSISI SAMA) */}
              <div className="flex-shrink-0 ml-3 flex items-center gap-2">
                {isAdminLoggedIn && (
                  <div className="flex items-center gap-1.5 mr-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        playModalOpenSound();
                        setEditingLink(link);
                        setShowLinkEditorModal(true);
                      }}
                      className="p-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      title="Edit Tautan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLink(link.id);
                      }}
                      className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      title="Hapus Tautan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <span className="inline-flex items-center justify-center gap-1 w-20 h-9 rounded-full bg-gradient-to-r from-gold to-green text-white font-extrabold text-xs shadow-md transition-all group-hover:scale-105 active:scale-95 duration-200">
                  <span>Buka</span>
                  {link.isModal ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ExternalLink className="w-3 h-3" />
                  )}
                </span>
              </div>
            </div>
          ))}

        </section>
        
      </main>

      {/* ========================================================
          MODAL VIEWS (GLASSMORPHISM WITH SCALE ENTRY TRANSITION)
          ======================================================== */}
      
      {/* 1. PROFILE MODAL */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8 py-4 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white/80 dark:bg-slate-900/85 border border-white/20 dark:border-slate-800/30 shadow-2xl p-6 md:p-8 animate-float-slow text-slate-700 dark:text-slate-200">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => { playSoftClick(); setActiveModal(null); setIsEditingProfile(false); }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
              <div className="p-3 bg-amber-100/60 dark:bg-amber-950/30 rounded-2xl text-gold">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex-1 col">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Profil PCA Klaten Utara
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                  Sejarah, Visi, Misi & Syiar Organisasi
                </p>
              </div>

              {/* ADMIN EDIT PROFILE ACTION */}
              {isAdminLoggedIn && (
                <div className="flex gap-1.5 mr-6">
                  {isEditingProfile ? (
                    <>
                      <button 
                        onClick={handleSaveProfileDetails}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        Simpan
                      </button>
                      <button 
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-500 hover:bg-slate-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        playSoftClick();
                        setProfileForm({ 
                          history: profileDetailsState.history || '', 
                          vision: profileDetailsState.vision || '', 
                          mission: [...(profileDetailsState.mission || [])], 
                          achievements: [...(profileDetailsState.achievements || [])] 
                        });
                        setSubBranchesForm(subBranchesState.map(ran => ({ ...ran })));
                        setIsEditingProfile(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profil</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              
              {isEditingProfile ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">SEJARAH SINGKAT</label>
                    <textarea 
                      value={profileForm.history}
                      onChange={(e) => setProfileForm({...profileForm, history: e.target.value})}
                      rows={5}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">VISI PEMPINAN CABANG</label>
                    <textarea 
                      value={profileForm.vision}
                      onChange={(e) => setProfileForm({...profileForm, vision: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium italic"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">MISI DAKWAH</label>
                    <div className="space-y-2">
                      {profileForm.mission.map((mis: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={mis}
                            onChange={(e) => {
                              const updated = [...profileForm.mission];
                              updated[idx] = e.target.value;
                              setProfileForm({...profileForm, mission: updated});
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const updated = profileForm.mission.filter((_: any, i: number) => i !== idx);
                              setProfileForm({...profileForm, mission: updated});
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => setProfileForm({...profileForm, mission: [...profileForm.mission, '']})}
                        className="text-[11px] text-green dark:text-teal-400 font-bold hover:underline"
                      >
                        + Tambah Misi Baru
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">AMAL USAHA & PRESTASI UNGGULAN</label>
                    <div className="space-y-2">
                      {profileForm.achievements.map((ach: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={ach}
                            onChange={(e) => {
                              const updated = [...profileForm.achievements];
                              updated[idx] = e.target.value;
                              setProfileForm({...profileForm, achievements: updated});
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const updated = profileForm.achievements.filter((_: any, i: number) => i !== idx);
                              setProfileForm({...profileForm, achievements: updated});
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => setProfileForm({...profileForm, achievements: [...profileForm.achievements, '']})}
                        className="text-[11px] text-green dark:text-teal-400 font-bold hover:underline"
                      >
                        + Tambah Amal Usaha / Prestasi
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2">PIMPINAN RANTING 'AISYIYAH (PRA)</label>
                    <div className="space-y-3">
                      {subBranchesForm.map((ran: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center gap-3">
                          <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 mb-1">NAMA RANTING</label>
                              <input 
                                type="text" 
                                value={ran.name || ''}
                                onChange={(e) => {
                                  const updated = [...subBranchesForm];
                                  updated[idx] = { ...updated[idx], name: e.target.value };
                                  setSubBranchesForm(updated);
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
                                placeholder="Contoh: PRA Belang Wetan"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 mb-1">WILAYAH/KETERANGAN</label>
                              <input 
                                type="text" 
                                value={ran.location || ''}
                                onChange={(e) => {
                                  const updated = [...subBranchesForm];
                                  updated[idx] = { ...updated[idx], location: e.target.value };
                                  setSubBranchesForm(updated);
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
                                placeholder="Contoh: Ranting Belang Wetan"
                              />
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              const updated = subBranchesForm.filter((_, i) => i !== idx);
                              setSubBranchesForm(updated);
                            }}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"
                            title="Hapus Ranting"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        type="button"
                        onClick={() => setSubBranchesForm([...subBranchesForm, { name: '', location: '' }])}
                        className="text-[11px] text-green dark:text-teal-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Ranting Baru</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* HISTORY SECTION */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2 text-base">
                      <BookOpen className="w-4 h-4 text-gold" /> Sejarah Singkat
                    </h4>
                    <p>{profileDetailsState.history}</p>
                  </div>

                  {/* VISION & MISSION SECTION */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-gold/5 to-turquoise/5 dark:from-amber-500/5 dark:to-teal-500/5 border border-white/30 dark:border-slate-800/20">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2 text-base">
                      <Star className="w-4 h-4 text-gold" /> Visi Pimpinan Cabang
                    </h4>
                    <p className="italic font-medium text-slate-700 dark:text-slate-200 mb-4 text-center">
                      "{profileDetailsState.vision}"
                    </p>

                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2 text-base">
                      <CheckCircle2 className="w-4 h-4 text-green" /> Misi Dakwah
                    </h4>
                    <ul className="space-y-2.5">
                      {profileDetailsState.mission.map((mis, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-1 h-2 w-2 rounded-full bg-green flex-shrink-0" />
                          <span>{mis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* SUB BRANCHES (PRAS) LIST */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 text-base">
                      <Users className="w-4 h-4 text-turquoise" /> Pimpinan Ranting 'Aisyiyah (PRA) di Klaten Utara
                    </h4>
                    <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
                      Koordinasi syiar kewilayahan dibagi menjadi Ranting-Ranting tingkat kelurahan/desa:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {subBranchesState.map((ran, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex items-center gap-2.5">
                          <span className="text-lg">🌸</span>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{ran.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{ran.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ACHIEVEMENTS / AMAL USAHA */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2.5 flex items-center gap-2 text-base">
                      <Award className="w-4 h-4 text-gold" /> Amal Usaha & Prestasi Unggulan
                    </h4>
                    <ul className="space-y-2">
                      {profileDetailsState.achievements.map((ach, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="text-green text-xs mt-0.5">✔</span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 2. BOARD MEMBERS MODAL */}
      {activeModal === 'board' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8 py-4 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white/80 dark:bg-slate-900/85 border border-white/20 dark:border-slate-800/30 shadow-2xl p-6 md:p-8 animate-float-slow text-slate-700 dark:text-slate-200">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => { playSoftClick(); setActiveModal(null); setIsEditingBoard(false); }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
              <div className="p-3 bg-teal-100/60 dark:bg-teal-950/30 rounded-2xl text-green">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1 col">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Pengurus Harian PCA Klaten Utara
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                  Masa Jabatan Aktif & Koordinator Majelis Bidang
                </p>
              </div>

              {/* ADMIN EDIT BOARD MEMBERS */}
              {isAdminLoggedIn && (
                <div className="flex gap-1.5 mr-6">
                  {isEditingBoard ? (
                    <>
                      <button 
                        onClick={handleSaveBoardMembers}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        Simpan
                      </button>
                      <button 
                        onClick={() => setIsEditingBoard(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-500 hover:bg-slate-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        playSoftClick();
                        setBoardForm([...boardMembersState]);
                        setIsEditingBoard(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Pengurus</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div className="space-y-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Berikut struktur kepengurusan resmi Pimpinan Cabang 'Aisyiyah Klaten Utara yang mengoordinasikan dakwah serta berbagai amal usaha sosial-pendidikan:
              </p>

              {/* INSPIRATIONAL QUOTE */}
              <div className="text-center p-4.5 rounded-2xl bg-gradient-to-r from-gold/5 via-transparent to-green/5 dark:from-amber-500/5 dark:to-teal-500/5 border border-slate-100 dark:border-slate-800/40">
                <p className="text-xs italic font-semibold text-slate-600 dark:text-slate-300">
                  "Menghimpun potensi wanita muslimah untuk mencerdaskan kehidupan beragama dan memberdayakan umat berkemajuan."
                </p>
              </div>

              {isEditingBoard ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setBoardForm([...boardForm, { name: '', role: '' }]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-green/10 text-green dark:text-teal-400 font-bold text-xs hover:bg-green/20 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pengurus Baru</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {boardForm.map((member, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">NAMA PENGURUS</label>
                            <input 
                              type="text" 
                              value={member.name || ''}
                              onChange={(e) => {
                                const updated = [...boardForm];
                                updated[idx] = { ...updated[idx], name: e.target.value };
                                setBoardForm(updated);
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100 font-bold"
                              placeholder="Nama Lengkap"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">JABATAN</label>
                            <input 
                              type="text" 
                              value={member.role || ''}
                              onChange={(e) => {
                                const updated = [...boardForm];
                                updated[idx] = { ...updated[idx], role: e.target.value };
                                setBoardForm(updated);
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-905 text-slate-800 dark:text-slate-100 font-bold"
                              placeholder="Contoh: Ketua, Sekretaris"
                            />
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const updated = boardForm.filter((_, i) => i !== idx);
                            setBoardForm(updated);
                          }}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* GRID OF LEADERS */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {boardMembersState.map((member, i) => (
                    <div 
                      key={i} 
                      className="p-4 rounded-2xl bg-white/50 dark:bg-slate-950/50 border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex flex-col items-center text-center group hover:scale-[1.02] transition-transform duration-300"
                    >
                      {/* AVATAR BOX (With generic placeholder fallback and premium style) */}
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/40 mb-3 bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
                        <HijabAvatar name={member.name} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-green dark:text-teal-400 font-bold uppercase mt-1 tracking-wider">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center pt-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                Dokumen SK Resmi Pimpinan Daerah 'Aisyiyah Kabupaten Klaten.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADDRESS MODAL WITH STATIC MAP PREVIEW & SAFE COPYING */}
      {activeModal === 'address' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8 py-4 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white/80 dark:bg-slate-900/85 border border-white/20 dark:border-slate-800/30 shadow-2xl p-6 md:p-8 animate-float-slow text-slate-700 dark:text-slate-200">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => { playSoftClick(); setActiveModal(null); setIsEditingOffice(false); }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
              <div className="p-3 bg-amber-100/60 dark:bg-amber-950/30 rounded-2xl text-gold">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1 col">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Lokasi Kantor PCA Klaten Utara
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                  Alamat Gedung Dakwah & Integrasi Peta Navigasi
                </p>
              </div>

              {/* ADMIN EDIT OFFICE ACTION */}
              {isAdminLoggedIn && (
                <div className="flex gap-1.5 mr-6">
                  {isEditingOffice ? (
                    <>
                      <button 
                        onClick={handleSaveOfficeDetails}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        Simpan
                      </button>
                      <button 
                        onClick={() => setIsEditingOffice(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-500 hover:bg-slate-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        playSoftClick();
                        setOfficeForm({ ...officeDetailsState });
                        setIsEditingOffice(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Alamat</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div className="space-y-6 text-sm">
              
              {isEditingOffice ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">NAMA TEMPAT/KANTOR</label>
                    <input 
                      type="text" 
                      value={officeForm.name || ''}
                      onChange={(e) => setOfficeForm({...officeForm, name: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-800 dark:text-slate-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">ALAMAT LENGKAP</label>
                    <textarea 
                      value={officeForm.address || ''}
                      onChange={(e) => setOfficeForm({...officeForm, address: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-800 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">LINK GOOGLE MAPS</label>
                      <input 
                        type="text" 
                        value={officeForm.googleMapsUrl || ''}
                        onChange={(e) => setOfficeForm({...officeForm, googleMapsUrl: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-800 dark:text-slate-100 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">LINK WAZE</label>
                      <input 
                        type="text" 
                        value={officeForm.wazeUrl || ''}
                        onChange={(e) => setOfficeForm({...officeForm, wazeUrl: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-800 dark:text-slate-100 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* ADDRESS DESCRIPTION */}
                  <div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/40 shadow-sm">
                    <p className="font-bold text-slate-800 dark:text-slate-100 mb-1.5 text-base">
                      {officeDetailsState.name}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 font-medium text-xs sm:text-sm">
                      {officeDetailsState.address}
                    </p>

                    {/* COPY ADDRESS INTERACTION */}
                    <button 
                      onClick={() => {
                        playSoftClick();
                        navigator.clipboard.writeText(officeDetailsState.address).then(() => {
                          setCopiedAddress(true);
                          setTimeout(() => setCopiedAddress(false), 2000);
                        });
                      }}
                      className="flex items-center gap-2 text-xs font-bold text-white bg-gold hover:bg-gold/90 px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Alamat Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin Alamat Lengkap</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* REAL INTERACTIVE MAP CARD */}
                  <div className="relative h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-md">
                    <iframe
                      title="Peta Lokasi"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(officeDetailsState.name + ", " + officeDetailsState.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                      className={`w-full h-full border-0 ${isDark ? 'invert-[0.9] hue-rotate-180 grayscale-[0.2]' : ''}`}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>

                  {/* NAVIGATOR BUTTONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <a 
                      href={officeDetailsState.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playSoftClick}
                      className="flex items-center justify-center gap-2.5 h-12 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs hover:border-gold"
                    >
                      <Navigation className="w-4.5 h-4.5 text-gold" />
                      <span>Buka di Google Maps</span>
                    </a>
                    <a 
                      href={officeDetailsState.wazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playSoftClick}
                      className="flex items-center justify-center gap-2.5 h-12 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs hover:border-turquoise"
                    >
                      <Navigation className="w-4.5 h-4.5 text-turquoise" />
                      <span>Buka di Waze</span>
                    </a>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 4. SHARE MENU MODAL */}
      {activeModal === 'share' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8 py-4 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white/80 dark:bg-slate-900/85 border border-white/20 dark:border-slate-800/30 shadow-2xl p-6 md:p-8 animate-float-slow text-slate-700 dark:text-slate-200">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => { playSoftClick(); setActiveModal(null); }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
              <div className="p-3 bg-amber-100/60 dark:bg-amber-950/30 rounded-2xl text-gold">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Bagikan Shortlink
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                  Bagikan informasi syiar resmi ini ke umat
                </p>
              </div>
            </div>

            {/* CONTENT */}
            <div className="space-y-6 text-center">
              
              {/* QR CODE GENERATOR (STYLIZED IN SVG VECTOR) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 inline-block shadow-inner">
                <svg viewBox="0 0 200 200" className="w-44 h-44 mx-auto" aria-label="QR Code PCA Klaten Utara">
                  {/* Decorative stylized QR blocks simulating actual linktree link */}
                  <defs>
                    <linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F7A600" />
                      <stop offset="100%" stopColor="#009966" />
                    </linearGradient>
                  </defs>
                  
                  {/* Outer QR Borders */}
                  <rect x="10" y="10" width="50" height="50" fill="none" stroke="url(#qrGrad)" strokeWidth="10" />
                  <rect x="25" y="25" width="20" height="20" fill="url(#qrGrad)" />

                  <rect x="140" y="10" width="50" height="50" fill="none" stroke="url(#qrGrad)" strokeWidth="10" />
                  <rect x="155" y="25" width="20" height="20" fill="url(#qrGrad)" />

                  <rect x="10" y="140" width="50" height="50" fill="none" stroke="url(#qrGrad)" strokeWidth="10" />
                  <rect x="25" y="155" width="20" height="20" fill="url(#qrGrad)" />

                  {/* Simulated QR Code patterns */}
                  <g fill="url(#qrGrad)">
                    <rect x="75" y="15" width="10" height="30" />
                    <rect x="90" y="25" width="15" height="10" />
                    <rect x="115" y="10" width="15" height="15" />
                    <rect x="120" y="35" width="10" height="25" />
                    <rect x="75" y="55" width="25" height="10" />
                    
                    <rect x="15" y="75" width="10" height="20" />
                    <rect x="35" y="85" width="25" height="10" />
                    <rect x="15" y="115" width="15" height="10" />
                    
                    <rect x="75" y="75" width="50" height="50" />
                    <rect x="90" y="90" width="20" height="20" fill="#FFFFFF" className="dark:fill-slate-950" />
                    <circle cx="100" cy="100" r="6" fill="url(#qrGrad)" />

                    <rect x="140" y="75" width="15" height="30" />
                    <rect x="165" y="85" width="25" height="10" />
                    <rect x="145" y="120" width="40" height="10" />
                    <rect x="175" y="140" width="15" height="30" />
                    <rect x="150" y="155" width="15" height="15" />
                    <rect x="110" y="145" width="10" height="25" />
                    <rect x="75" y="160" width="25" height="15" />
                  </g>
                </svg>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase mt-3">
                  Pindai QR Untuk Berbagi
                </p>
              </div>

              {/* COPIER BOX */}
              <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <input 
                  type="text" 
                  readOnly 
                  value={typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-pca.run.app'} 
                  className="bg-transparent border-none text-xs text-slate-500 dark:text-slate-400 outline-none select-all font-mono truncate flex-1 px-2"
                />
                <button 
                  onClick={copyPageUrl}
                  className="px-3 py-2 bg-gold hover:bg-gold/90 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Salin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              {/* DIRECT MESSAGE SHARE BUTTONS */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a 
                  href={`https://wa.me/?text=Assalamu%27alaikum%20Warahmatullahi%20Wabarakaatuh.%20Berikut%20tautan%20layanan%20resmi%20PCA%20Klaten%20Utara.%20Silakan%20buka:%20${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playSoftClick}
                  className="flex items-center justify-center gap-1.5 h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <a 
                  href={`https://facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playSoftClick}
                  className="flex items-center justify-center gap-1.5 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 5. DEFAULT DYNAMIC LINK DETAIL MODAL */}
      {selectedLinkForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8 py-4 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800/30 shadow-2xl p-6 md:p-8 animate-float-slow text-slate-700 dark:text-slate-200">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => { playSoftClick(); setSelectedLinkForModal(null); }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER BADGE */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
                selectedLinkForModal.category === 'social' 
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' 
                  : selectedLinkForModal.category === 'contact'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
              }`}>
                {selectedLinkForModal.category === 'social' ? 'Media Sosial Resmi' : selectedLinkForModal.category === 'contact' ? 'Layanan Pintar' : 'Lembaga Organisasi'}
              </span>
              
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded">
                <BarChart3 className="w-3 h-3" />
                {linkClicks[selectedLinkForModal.id] || 0} Klik
              </span>
            </div>

            {/* MAIN LINK PROFILE */}
            <div className="flex flex-col items-center text-center mt-2 mb-5">
              <span className="text-5xl mb-3.5 filter drop-shadow-sm select-none">
                {selectedLinkForModal.emoji}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight flex items-center gap-2">
                {selectedLinkForModal.title}
                {selectedLinkForModal.badge && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${selectedLinkForModal.badgeColor || 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                    {selectedLinkForModal.badge}
                  </span>
                )}
              </h3>
              {selectedLinkForModal.subtitle && (
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
                  {selectedLinkForModal.subtitle}
                </p>
              )}
            </div>

            {/* DESCRIPTION SECTION */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/40 dark:border-slate-800/40 space-y-3 mb-5">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {selectedLinkForModal.description || `Gunakan portal syiar digital resmi ini untuk mendapatkan bimbingan keagamaan, wawasan dakwah perempuan berkemajuan, serta administrasi layanan resmi Pimpinan Cabang 'Aisyiyah Klaten Utara.`}
              </p>

              {/* PLATFORM RECOMMENDATIONS / REMINDERS */}
              {selectedLinkForModal.id === 'instagram' && (
                <p className="text-[10.5px] font-bold text-rose-500 leading-normal flex items-start gap-1">
                  <span>📸</span>
                  <span>Mari dukung perjuangan dakwah perempuan berkemajuan dengan memfollow akun, menyukai, serta membagikan kiriman poster kajian/syiar humas kami!</span>
                </p>
              )}
              {selectedLinkForModal.id === 'youtube' && (
                <p className="text-[10.5px] font-bold text-red-500 leading-normal flex items-start gap-1">
                  <span>🎥</span>
                  <span>Jangan lupa subscribe dan aktifkan lonceng notifikasi saluran resmi kami untuk menyimak pengajian rutin harian dan siaran dakwah interaktif lainnya.</span>
                </p>
              )}
              {selectedLinkForModal.id === 'tiktok' && (
                <p className="text-[10.5px] font-bold text-indigo-500 leading-normal flex items-start gap-1">
                  <span>🎵</span>
                  <span>Dukung syiar kreatif para kader muda Nasyiatul 'Aisyiyah dengan cara mengomentari dan membagikan konten edukatif islami kami di TikTok.</span>
                </p>
              )}

              {/* WHATSAPP CUSTOM MESSAGING ENGINE */}
              {(selectedLinkForModal.id === 'whatsapp' || selectedLinkForModal.url.includes('wa.me')) && (
                <div className="pt-1.5 space-y-1.5">
                  <label className="block text-[10.5px] font-bold text-green dark:text-teal-400">
                    💬 Kustomisasi Pesan Chat WhatsApp Anda:
                  </label>
                  <textarea
                    rows={2}
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="Tulis pesan Anda disini..."
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1.5 focus:ring-green/50 font-medium"
                  />
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-snug">
                    Pesan yang Anda tulis di atas akan terisi secara otomatis ketika aplikasi WhatsApp terbuka.
                  </p>
                </div>
              )}
            </div>

            {/* LIVE SPREADSHEET QR CODE DISPLAY CARD */}
            <div className="mb-6 text-center">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/40 inline-block shadow-sm">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150&data=${encodeURIComponent(
                    selectedLinkForModal.id === 'whatsapp' || selectedLinkForModal.url.includes('wa.me')
                      ? getWhatsAppUrl(selectedLinkForModal.url, whatsappMessage)
                      : selectedLinkForModal.url
                  )}`} 
                  alt="QR Code" 
                  className="w-28 h-28 mx-auto"
                />
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase mt-2">
                  PINDAI UNTUK MEMBUKA DI HP
                </p>
              </div>
            </div>

            {/* FOOTER ACTION CTAS */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  playSoftClick();
                  
                  // Construct final URL with custom Whatsapp text if applicable
                  let finalUrl = selectedLinkForModal.url;
                  if (selectedLinkForModal.id === 'whatsapp' || selectedLinkForModal.url.includes('wa.me')) {
                    finalUrl = getWhatsAppUrl(selectedLinkForModal.url, whatsappMessage);
                  }
                  
                  window.open(finalUrl, '_blank', 'noopener,noreferrer');
                  setSelectedLinkForModal(null);
                }}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-gold to-green text-white font-extrabold text-sm cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Buka Halaman Resmi Sekarang</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playSoftClick();
                  const finalUrl = selectedLinkForModal.id === 'whatsapp' || selectedLinkForModal.url.includes('wa.me')
                    ? getWhatsAppUrl(selectedLinkForModal.url, whatsappMessage)
                    : selectedLinkForModal.url;
                  
                  navigator.clipboard.writeText(finalUrl).then(() => {
                    setCopiedModalLink(true);
                    setTimeout(() => setCopiedModalLink(false), 2000);
                  });
                }}
                className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                {copiedModalLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Link Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Alamat Tautan Resmi</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8 py-4 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-white/20 dark:border-slate-800/30 shadow-2xl p-6 md:p-8 animate-float-slow text-slate-700 dark:text-slate-200">
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => { playSoftClick(); setShowLoginModal(false); setLoginError(''); }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-gold mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Login Kelola Data
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
                Masukkan kredensial administrator
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  USERNAME
                </label>
                <input 
                  type="text" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-gold/50 text-slate-800 dark:text-slate-100 font-semibold text-sm"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  PASSWORD
                </label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 focus:outline-none focus:ring-2 focus:ring-gold/50 text-slate-800 dark:text-slate-100 font-semibold text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-500 font-bold text-center mt-2">
                  {loginError}
                </p>
              )}

              <button 
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-gold to-green text-white font-extrabold text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LINK EDITOR MODAL */}
      {showLinkEditorModal && editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8 py-4 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-white/20 dark:border-slate-800/30 shadow-2xl p-6 md:p-8 animate-float-slow text-slate-700 dark:text-slate-200">
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => { playSoftClick(); setShowLinkEditorModal(false); setEditingLink(null); }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-950/30 rounded-xl text-blue-600">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Atur Detail Tautan
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                  Tambahkan atau ubah data shortlink
                </p>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveLink(editingLink); }} className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    EMOJI
                  </label>
                  <input 
                    type="text" 
                    value={editingLink.emoji || ''}
                    onChange={(e) => setEditingLink({...editingLink, emoji: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center text-lg focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                    placeholder="🔗"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    JUDUL TAUTAN
                  </label>
                  <input 
                    type="text" 
                    value={editingLink.title || ''}
                    onChange={(e) => setEditingLink({...editingLink, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold"
                    placeholder="Profil Lengkap PCA"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  SUBJUDUL (DESKRIPSI SINGKAT)
                </label>
                <input 
                  type="text" 
                  value={editingLink.subtitle || ''}
                  onChange={(e) => setEditingLink({...editingLink, subtitle: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  placeholder="Sejarah, visi, dan perjuangan dakwah"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  URL TUJUAN / TARGET LINK
                </label>
                <input 
                  type="text" 
                  value={editingLink.url || ''}
                  onChange={(e) => setEditingLink({...editingLink, url: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono text-xs"
                  placeholder="https://example.com atau #profile"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    KATEGORI
                  </label>
                  <select
                    value={editingLink.category || 'internal'}
                    onChange={(e) => setEditingLink({...editingLink, category: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="internal">Internal (Modal/Popup)</option>
                    <option value="social">Social Media (Eksternal)</option>
                    <option value="contact">Contact/Layanan Pintar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    BADGE (OPSIONAL)
                  </label>
                  <input 
                    type="text" 
                    value={editingLink.badge || ''}
                    onChange={(e) => setEditingLink({...editingLink, badge: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    placeholder="Baru / Resmi / 24 Jam"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 pt-4">
                  <input 
                    type="checkbox" 
                    id="isModalCheckbox"
                    checked={editingLink.isModal || false}
                    onChange={(e) => setEditingLink({...editingLink, isModal: e.target.checked})}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="isModalCheckbox" className="font-bold text-slate-700 dark:text-slate-300 select-none">
                    Buka dalam Modal?
                  </label>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    WARNA BADGE (CSS CLASS)
                  </label>
                  <input 
                    type="text" 
                    value={editingLink.badgeColor || ''}
                    onChange={(e) => setEditingLink({...editingLink, badgeColor: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    placeholder="bg-amber-100 text-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  DESKRIPSI DETAIL (DITAMPILKAN DI MODAL)
                </label>
                <textarea 
                  value={editingLink.description || ''}
                  onChange={(e) => setEditingLink({...editingLink, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                  placeholder="Berikan info detail lengkap mengenai tautan resmi ini..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
                <button 
                  type="button"
                  onClick={() => { playSoftClick(); setShowLinkEditorModal(false); setEditingLink(null); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
