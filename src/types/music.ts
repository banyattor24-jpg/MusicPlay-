export type AppTheme = 'light' | 'amoled';
export type AppLanguage = 'en' | 'ar';
export type SortMode = 'az' | 'custom';

export interface Song {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  durationSec: number;
  format: string;
  isBuiltInSample?: boolean;
  sampleSeed?: number;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
}

export interface TranslationStrings {
  appName: string;
  allSongs: string;
  playlists: string;
  noSongsTitle: string;
  noSongsSubtitle: string;
  scanNow: string;
  select: string;
  createPlaylist: string;
  sortSongsAZ: string;
  selectedCount: (count: number) => string;
  playSelected: string;
  addToPlaylist: string;
  deleteAction: string;
  cancel: string;
  rename: string;
  info: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: (count: number) => string;
  confirmDelete: string;
  renameTitle: string;
  save: string;
  songNameLabel: string;
  pathLabel: string;
  sizeLabel: string;
  durationLabel: string;
  formatLabel: string;
  settings: string;
  languageLabel: string;
  english: string;
  arabic: string;
  themeLabel: string;
  lightTheme: string;
  amoledTheme: string;
  close: string;
  playlistNameTitle: string;
  playlistNamePlaceholder: string;
  create: string;
  choosePlaylist: string;
  noPlaylistsYet: string;
  scanToastAdded: (count: number) => string;
  scanToastNone: string;
  sortedToast: string;
  stoppedVolumeZero: string;
  stoppedHeadphones: string;
  stoppedBluetooth: string;
  volumeBoostToast: (percent: number) => string;
  notificationPlaying: string;
  notificationPaused: string;
  volumeLabel: string;
  searchScanTooltip: string;
  refreshTooltip: string;
  settingsTooltip: string;
  moreTooltip: string;
  addDeviceFiles: string;
  viewAllSongs: string;
}

export const TRANSLATIONS: Record<AppLanguage, TranslationStrings> = {
  en: {
    appName: 'MusicPlay',
    allSongs: 'All Songs',
    playlists: 'Playlists',
    noSongsTitle: 'No local songs found',
    noSongsSubtitle: 'Tap the search or refresh button to scan device storage.',
    scanNow: 'Scan Storage',
    select: 'Select',
    createPlaylist: 'Create Playlist',
    sortSongsAZ: 'Sort songs (A–Z)',
    selectedCount: (count: number) => `${count} selected`,
    playSelected: 'Play selected',
    addToPlaylist: 'Add to playlist',
    deleteAction: 'Delete',
    cancel: 'Cancel',
    rename: 'Rename',
    info: 'Info',
    deleteConfirmTitle: 'Delete song',
    deleteConfirmMessage: (count: number) =>
      count === 1
        ? 'Remove this song from the library?'
        : `Remove ${count} selected songs from the library?`,
    confirmDelete: 'Delete',
    renameTitle: 'Rename song',
    save: 'Save',
    songNameLabel: 'Song name',
    pathLabel: 'Path',
    sizeLabel: 'Size',
    durationLabel: 'Duration',
    formatLabel: 'Format',
    settings: 'Settings',
    languageLabel: 'Language',
    english: 'English',
    arabic: 'العربية',
    themeLabel: 'Theme',
    lightTheme: 'Light',
    amoledTheme: 'AMOLED Dark',
    close: 'Close',
    playlistNameTitle: 'Create Playlist',
    playlistNamePlaceholder: 'Playlist name',
    create: 'Create',
    choosePlaylist: 'Add to playlist',
    noPlaylistsYet: 'No playlists yet. Create one first.',
    scanToastAdded: (count: number) =>
      count === 1 ? '1 new song added' : `${count} new songs added`,
    scanToastNone: 'No new songs found',
    sortedToast: 'Sorted alphabetically (A–Z)',
    stoppedVolumeZero: 'Music stopped: volume reached 0%',
    stoppedHeadphones: 'Music stopped: headphones disconnected',
    stoppedBluetooth: 'Music stopped: Bluetooth earphones disconnected',
    volumeBoostToast: (percent: number) => `Volume boosted to ${percent}%`,
    notificationPlaying: 'Playing',
    notificationPaused: 'Paused',
    volumeLabel: 'Volume',
    searchScanTooltip: 'Scan for new songs',
    refreshTooltip: 'Refresh song list',
    settingsTooltip: 'Settings',
    moreTooltip: 'More options',
    addDeviceFiles: 'Import local audio files',
    viewAllSongs: 'All Songs',
  },
  ar: {
    appName: 'MusicPlay',
    allSongs: 'كل الأغاني',
    playlists: 'قوائم التشغيل',
    noSongsTitle: 'لا توجد أغاني محلية',
    noSongsSubtitle: 'اضغط على زر البحث أو التحديث لفحص ذاكرة الجهاز.',
    scanNow: 'فحص التخزين',
    select: 'تحديد',
    createPlaylist: 'إنشاء قائمة تشغيل',
    sortSongsAZ: 'ترتيب الأغاني (أ–ي)',
    selectedCount: (count: number) => `تم تحديد ${count}`,
    playSelected: 'تشغيل المحدد',
    addToPlaylist: 'إضافة إلى قائمة',
    deleteAction: 'حذف',
    cancel: 'إلغاء',
    rename: 'إعادة تسمية',
    info: 'معلومات',
    deleteConfirmTitle: 'حذف الأغنية',
    deleteConfirmMessage: (count: number) =>
      count === 1
        ? 'هل تريد إزالة هذه الأغنية من القائمة؟'
        : `هل تريد إزالة ${count} أغاني محددة من القائمة؟`,
    confirmDelete: 'حذف',
    renameTitle: 'إعادة تسمية الأغنية',
    save: 'حفظ',
    songNameLabel: 'اسم الأغنية',
    pathLabel: 'المسار',
    sizeLabel: 'الحجم',
    durationLabel: 'المدة',
    formatLabel: 'الصيغة',
    settings: 'الإعدادات',
    languageLabel: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    themeLabel: 'المظهر',
    lightTheme: 'فاتح',
    amoledTheme: 'داكن AMOLED',
    close: 'إغلاق',
    playlistNameTitle: 'إنشاء قائمة تشغيل',
    playlistNamePlaceholder: 'اسم قائمة التشغيل',
    create: 'إنشاء',
    choosePlaylist: 'إضافة إلى قائمة تشغيل',
    noPlaylistsYet: 'لا توجد قوائم تشغيل بعد.',
    scanToastAdded: (count: number) =>
      count === 1 ? 'تمت إضافة أغنية جديدة واحدة' : `تمت إضافة ${count} أغاني جديدة`,
    scanToastNone: 'لم يتم العثور على أغاني جديدة',
    sortedToast: 'تم الترتيب أبجدياً',
    stoppedVolumeZero: 'توقفت الموسيقى: وصل الصوت إلى 0%',
    stoppedHeadphones: 'توقفت الموسيقى: تم فصل سماعات الرأس',
    stoppedBluetooth: 'توقفت الموسيقى: تم فصل سماعة البلوتوث',
    volumeBoostToast: (percent: number) => `تم تعزيز الصوت إلى ${percent}%`,
    notificationPlaying: 'قيد التشغيل',
    notificationPaused: 'متوقف مؤقتاً',
    volumeLabel: 'مستوى الصوت',
    searchScanTooltip: 'بحث عن أغاني جديدة',
    refreshTooltip: 'تحديث قائمة الأغاني',
    settingsTooltip: 'الإعدادات',
    moreTooltip: 'خيارات إضافية',
    addDeviceFiles: 'استيراد ملفات صوتية من الجهاز',
    viewAllSongs: 'كل الأغاني',
  },
};
