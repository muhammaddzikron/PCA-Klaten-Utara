export interface ShortLink {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  emoji: string;
  ariaLabel: string;
  category: 'internal' | 'social' | 'contact';
  badge?: string;
  badgeColor?: string;
  isModal?: boolean;
  modalId?: 'profile' | 'board' | 'address';
  description?: string;
  clicks?: number;
}

export interface BoardMember {
  name: string;
  role: string;
}

export interface SubBranch {
  name: string;
  location: string;
  established?: string;
}

export const officeDetails = {
  name: "Gedung Dakwah Muhammadiyah Cabang Klaten Utara",
  address: "Jl. Ki Ageng Gribig Barenglor - Klaten Utara No.10, Tegal, Gergunung, Kec. Klaten Utara, Kabupaten Klaten, Jawa Tengah 57434",
  googleMapsUrl: "https://maps.app.goo.gl/wpmR4Cu1Sfbk59W96",
  wazeUrl: "https://waze.com/ul?ll=-7.687427,110.612803&navigate=yes",
  phone: "+6281234567890",
  email: "pca.klatenutara@gmail.com",
};

export const profileDetails = {
  history: "Pimpinan Cabang 'Aisyiyah (PCA) Klaten Utara merupakan pilar gerakan dakwah perempuan Islam berkemajuan di bawah naungan Pimpinan Daerah 'Aisyiyah Kabupaten Klaten. Berdiri sejak puluhan tahun lalu, PCA Klaten Utara aktif dalam menyelenggarakan berbagai amal usaha di bidang keagamaan, pendidikan anak usia dini (TK ABA), pelayanan kesehatan sosial, pemberdayaan ekonomi perempuan, dan pembinaan moral umat.",
  vision: "Mewujudkan kehidupan perempuan Islam berkemajuan yang cerdas, mandiri, sehat, dan berakhlak mulia di wilayah Klaten Utara serta berkontribusi nyata bagi umat dan bangsa.",
  mission: [
    "Menyelenggarakan dakwah Islamiyah yang mencerahkan secara inklusif and berkelanjutan.",
    "Meningkatkan mutu pendidikan dasar dan menengah, khususnya pengelolaan TK ABA.",
    "Memberdayakan ekonomi keluarga melalui program UMKM Bina Usaha 'Aisyiyah.",
    "Menyediakan bimbingan sosial, konseling keluarga sakinah, dan posyandu lansia secara berkala.",
    "Membina kader-kader perempuan tangguh dan berkemajuan sebagai penggerak persyarikatan."
  ],
  achievements: [
    "Akreditasi A untuk seluruh lembaga PAUD dan TK 'Aisyiyah Bustanul Athfal di Klaten Utara.",
    "Pelopor gerakan 'Sadaqah Sampah' untuk kemandirian finansial dakwah sosial.",
    "Penyelenggaraan kajian rutin mingguan dan pengajian akbar berkala se-Klaten Utara.",
    "Pembinaan aktif Kelompok Usaha Bersama (KUB) kerajinan dan kuliner khas Klaten."
  ]
};

export const subBranches: SubBranch[] = [
  { name: "PRA Belang Wetan", location: "Ranting Belang Wetan" },
  { name: "PRA Gergunung", location: "Ranting Gergunung" },
  { name: "PRA Jitung", location: "Ranting Jitung" },
  { name: "PRA Karanganom", location: "Ranting Karanganom" },
  { name: "PRA Ketandan", location: "Ranting Ketandan" },
  { name: "PRA Mayungan", location: "Ranting Mayungan" },
  { name: "PRA Sekarsuli", location: "Ranting Sekarsuli" }
];

export const boardMembers: BoardMember[] = [
  {
    name: "Hj. Siti Aminah, S.Ag.",
    role: "Ketua PCA Klaten Utara"
  },
  {
    name: "Hj. Humairoh",
    role: "Wakil Ketua / Pengurus Harian"
  },
  {
    name: "Dra. Hidayah Fitriani",
    role: "Sekretaris I"
  },
  {
    name: "Ibu Sri Mulyani, S.Pd.",
    role: "Sekretaris II"
  },
  {
    name: "Hj. Nurul Latifah",
    role: "Bendahara I"
  },
  {
    name: "Ibu Rahmawati, S.E.",
    role: "Bendahara II"
  },
  {
    name: "Ustazah Salamah, M.Pd.I.",
    role: "Ketua Majelis Tabligh"
  },
  {
    name: "Ibu Sri Rahayu, S.Pd.",
    role: "Ketua Majelis Dikdasmen"
  },
  {
    name: "Dr. Hj. Retno Woelandari",
    role: "Ketua Majelis Kesehatan"
  },
  {
    name: "Ibu Aminah Zuhri",
    role: "Ketua Majelis Ekonomi & Ketenagakerjaan"
  },
  {
    name: "Ibu Siti Maryam",
    role: "Ketua Majelis Kesejahteraan Sosial"
  },
  {
    name: "Ibu Tri Astuti, S.E.",
    role: "Ketua Majelis Pembinaan Kader"
  },
  {
    name: "Adv. Fitriani, S.H., M.H.",
    role: "Ketua Majelis Hukum & HAM"
  },
  {
    name: "Ibu Khairunnisa, S.I.Kom.",
    role: "Ketua Majelis Tabligh & Medkom"
  }
];

export const linksData: ShortLink[] = [
  {
    id: "profile",
    title: "Profil PCA Klaten Utara",
    subtitle: "Sejarah, Visi, Misi & Amal Usaha",
    url: "#profile",
    emoji: "👤",
    ariaLabel: "Buka profil lengkap PCA Klaten Utara",
    category: "internal",
    isModal: true,
    modalId: "profile",
    badge: "Tentang Kami",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
  },
  {
    id: "board",
    title: "Pengurus PCA Klaten Utara",
    subtitle: "Struktur Organisasi & Majelis",
    url: "#board",
    emoji: "🧕",
    ariaLabel: "Buka struktur pengurus lengkap",
    category: "internal",
    isModal: true,
    modalId: "board",
    badge: "Struktur",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
  },
  {
    id: "address",
    title: "Alamat Kantor PCA Klaten Utara",
    subtitle: "Lokasi Gedung Dakwah & Navigasi",
    url: "#address",
    emoji: "📍",
    ariaLabel: "Buka alamat kantor dan navigasi peta",
    category: "internal",
    isModal: true,
    modalId: "address",
    badge: "Peta Lokasi"
  },
  {
    id: "website",
    title: "Website Resmi 'Aisyiyah",
    subtitle: "Pusat Informasi Syiar 'Aisyiyah Nasional",
    url: "https://aisyiyah.or.id",
    emoji: "🌐",
    ariaLabel: "Buka Website Resmi 'Aisyiyah Pusat",
    category: "social"
  },
  {
    id: "facebook",
    title: "Facebook PCA",
    subtitle: "Ikuti Update Kegiatan & Syiar di Facebook",
    url: "https://facebook.com",
    emoji: "📘",
    ariaLabel: "Ikuti kami di Facebook",
    category: "social"
  },
  {
    id: "instagram",
    title: "Instagram PCA",
    subtitle: "Dokumentasi Foto & Reels Kegiatan Kami",
    url: "https://instagram.com/pca_klatenutara",
    emoji: "📸",
    ariaLabel: "Ikuti kami di Instagram",
    category: "social",
    badge: "Aktif",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
  },
  {
    id: "youtube",
    title: "Youtube PCA",
    subtitle: "Video Kajian, Dokumentasi & Profil",
    url: "https://youtube.com/@pcaklatenutara",
    emoji: "🎥",
    ariaLabel: "Tonton video kami di Youtube",
    category: "social"
  },
  {
    id: "tiktok",
    title: "TikTok PCA",
    subtitle: "Video Syiar Singkat & Edukasi Keagamaan",
    url: "https://tiktok.com/@pca_klatenutara",
    emoji: "🎵",
    ariaLabel: "Ikuti kami di TikTok",
    category: "social"
  },
  {
    id: "whatsapp",
    title: "Hubungi Kami",
    subtitle: "Hubungi Layanan Informasi & Konseling",
    url: "https://wa.me/6285742345590?text=Assalamu%27alaikum%20Warahmatullahi%20Wabarakaatuh.%20Saya%20ingin%20bertanya%20mengenai%20kegiatan/layanan%20PCA%20Klaten%20Utara.",
    emoji: "💬",
    ariaLabel: "Hubungi kami via WhatsApp",
    category: "contact",
    badge: "Respons Cepat",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
  }
];
