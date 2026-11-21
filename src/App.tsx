import { useCallback, useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { ANDROID_PROJECT_FILES } from './androidProject/androidFiles';
import { AndroidProjectViewer } from './components/AndroidProjectViewer';
import { MusicPlayApp } from './components/MusicPlayApp';
import {
  AppLanguage,
  AppTheme,
  Playlist,
  Song,
  TRANSLATIONS,
} from './types/music';
import {
  buildZipBlob,
  deleteAudioBlob,
  discoverAdditionalDeviceTrack,
  extractAudioDuration,
  getAudioBlob,
  provisionInitialDeviceTracks,
  saveAudioBlob,
  sortSongsAlphabetically,
  synthesizeOfflineWavBlob,
} from './utils/audioStorage';

const STORAGE_KEYS = {
  SONGS: 'musicplay_songs_v1',
  PLAYLISTS: 'musicplay_playlists_v1',
  THEME: 'musicplay_theme_v1',
  LANGUAGE: 'musicplay_language_v1',
  VOLUME: 'musicplay_volume_v1',
  INITIALIZED: 'musicplay_initialized_v1',
};

const SUPPORTED_EXTENSIONS = new Set([
  'mp3',
  'm4a',
  'wav',
  'ogg',
  'flac',
  'aac',
  'opus',
]);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = readJson<Song[]>(STORAGE_KEYS.SONGS, []);
    return sortSongsAlphabetically(saved);
  });
  const [playlists, setPlaylists] = useState<Playlist[]>(() =>
    readJson<Playlist[]>(STORAGE_KEYS.PLAYLISTS, [])
  );
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'amoled' ? 'amoled' : 'light';
  });
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return saved === 'ar' ? 'ar' : 'en';
  });
  const [volume, setVolume] = useState<number>(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEYS.VOLUME));
    return Number.isFinite(saved) && saved >= 0 && saved <= 200 ? saved : 75;
  });

  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [activeQueueIds, setActiveQueueIds] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [headphonesConnected, setHeadphonesConnected] = useState(true);
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [mobileTab, setMobileTab] = useState<'app' | 'code'>('app');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceConnectedRef = useRef<boolean>(false);
  const objectUrlRef = useRef<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const prevAudioOutputCountRef = useRef<number | null>(null);

  const t = TRANSLATIONS[language];

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // Sync Tailwind dark class with AMOLED mode
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'amoled') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  }, [playlists]);

  const ensureAudioBoostGraph = useCallback((audio: HTMLAudioElement, volPercent: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        audio.volume = Math.min(1, volPercent / 100);
        return;
      }
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (!sourceConnectedRef.current) {
        const source = ctx.createMediaElementSource(audio);
        const gainNode = ctx.createGain();
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -6;
        compressor.knee.value = 12;
        compressor.ratio.value = 4;
        source.connect(gainNode);
        gainNode.connect(compressor);
        compressor.connect(ctx.destination);
        gainNodeRef.current = gainNode;
        sourceConnectedRef.current = true;
        audio.volume = 1;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(volPercent / 100, ctx.currentTime, 0.015);
      }
    } catch {
      audio.volume = Math.min(1, volPercent / 100);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOLUME, String(volume));
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        volume / 100,
        audioCtxRef.current.currentTime,
        0.015
      );
    } else if (audioRef.current) {
      audioRef.current.volume = Math.min(1, volume / 100);
    }
  }, [volume]);

  // Auto-scan on app launch (populates offline playable WAV tracks on first visit)
  useEffect(() => {
    const alreadyInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
    if (!alreadyInit) {
      provisionInitialDeviceTracks().then((initialSongs) => {
        const sorted = sortSongsAlphabetically(initialSongs);
        setSongs(sorted);
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      });
    }
  }, []);

  // Cleanup audio element on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentSongId(null);
  }, []);

  const pausePlaybackWithReason = useCallback(
    (reasonToast: string) => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      showToast(reasonToast);
    },
    [showToast]
  );

  // Real browser audio output device disconnection listener (wired/Bluetooth)
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return;
    }
    const inspectDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter((d) => d.kind === 'audiooutput').length;
        if (
          prevAudioOutputCountRef.current !== null &&
          outputs < prevAudioOutputCountRef.current &&
          isPlaying
        ) {
          pausePlaybackWithReason(t.stoppedHeadphones);
        }
        prevAudioOutputCountRef.current = outputs;
      } catch {
        // Permission or sandbox restriction; simulated hardware buttons still work
      }
    };
    inspectDevices();
    navigator.mediaDevices.addEventListener('devicechange', inspectDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', inspectDevices);
    };
  }, [isPlaying, pausePlaybackWithReason, t.stoppedHeadphones]);

  const loadAndPlaySong = useCallback(
    async (song: Song, queue: Song[]) => {
      setActiveQueueIds(queue.map((s) => s.id));
      setCurrentSongId(song.id);

      let blob = await getAudioBlob(song.id);
      if (!blob && song.isBuiltInSample) {
        blob = synthesizeOfflineWavBlob(song.sampleSeed ?? 0, song.durationSec || 22);
        await saveAudioBlob(song.id, blob);
      }
      if (!blob) {
        showToast(t.scanToastNone);
        return;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      audio.src = url;
      ensureAudioBoostGraph(audio, volume);
      setCurrentTime(0);
      setDuration(song.durationSec);

      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
        }
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        const idx = queue.findIndex((s) => s.id === song.id);
        if (idx >= 0 && idx + 1 < queue.length) {
          loadAndPlaySong(queue[idx + 1], queue);
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      };

      if (volume === 0) {
        setIsPlaying(false);
        showToast(t.stoppedVolumeZero);
        return;
      }

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    },
    [ensureAudioBoostGraph, showToast, t.scanToastNone, t.stoppedVolumeZero, volume]
  );

  const handleTogglePlaySong = (song: Song, queue: Song[] = songs) => {
    if (currentSongId === song.id && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (volume === 0) {
          showToast(t.stoppedVolumeZero);
          return;
        }
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      return;
    }
    loadAndPlaySong(song, queue);
  };

  const handlePlayQueue = (queue: Song[]) => {
    if (queue.length === 0) return;
    loadAndPlaySong(queue[0], queue);
  };

  const handleTogglePlayPause = () => {
    if (!audioRef.current || !currentSongId) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (volume === 0) {
        showToast(t.stoppedVolumeZero);
        return;
      }
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const getActiveQueue = (): Song[] => {
    if (activeQueueIds.length > 0) {
      const map = new Map(songs.map((s) => [s.id, s]));
      const resolved = activeQueueIds
        .map((id) => map.get(id))
        .filter((s): s is Song => Boolean(s));
      if (resolved.length > 0) return resolved;
    }
    return songs;
  };

  const handleSkipNext = () => {
    const queue = getActiveQueue();
    if (queue.length === 0 || !currentSongId) return;
    const idx = queue.findIndex((s) => s.id === currentSongId);
    const nextIdx = idx >= 0 ? (idx + 1) % queue.length : 0;
    loadAndPlaySong(queue[nextIdx], queue);
  };

  const handleSkipPrevious = () => {
    const queue = getActiveQueue();
    if (queue.length === 0 || !currentSongId) return;
    const idx = queue.findIndex((s) => s.id === currentSongId);
    const prevIdx = idx >= 0 ? (idx - 1 + queue.length) % queue.length : 0;
    loadAndPlaySong(queue[prevIdx], queue);
  };

  const handleSeek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  // Auto-stop at 0% and boost 150% -> 200% when maximized past 100%
  const handleChangeVolume = (percent: number) => {
    const clamped = Math.max(0, Math.min(200, percent));
    const prev = volume;
    setVolume(clamped);
    if (audioRef.current) {
      ensureAudioBoostGraph(audioRef.current, clamped);
    }
    if (clamped === 0 && isPlaying) {
      pausePlaybackWithReason(t.stoppedVolumeZero);
    } else if ((clamped === 150 || clamped === 200) && clamped !== prev) {
      showToast(t.volumeBoostToast(clamped));
    }
  };

  // Scan device storage for new songs (circular search / refresh)
  const handleScanStorage = async () => {
    const existingIds = new Set(songs.map((s) => s.id));
    const discovered = await discoverAdditionalDeviceTrack(existingIds);
    if (discovered.length > 0) {
      setSongs((prev) => sortSongsAlphabetically([...prev, ...discovered]));
      showToast(t.scanToastAdded(discovered.length));
    } else {
      showToast(t.scanToastNone);
    }
  };

  const handleImportFiles = async (fileList: FileList) => {
    const added: Song[] = [];
    for (const file of Array.from(fileList)) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!SUPPORTED_EXTENSIONS.has(ext) && !file.type.startsWith('audio/')) {
        continue;
      }
      const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const durationSec = await extractAudioDuration(file);
      await saveAudioBlob(id, file);
      added.push({
        id,
        name: cleanName,
        path: `/storage/emulated/0/Music/${file.name}`,
        sizeBytes: file.size,
        durationSec,
        format: (ext || 'AUDIO').toUpperCase(),
      });
    }

    if (added.length > 0) {
      setSongs((prev) => sortSongsAlphabetically([...prev, ...added]));
      showToast(t.scanToastAdded(added.length));
    } else {
      showToast(t.scanToastNone);
    }
  };

  const handleSortAZ = () => {
    setSongs((prev) => sortSongsAlphabetically(prev));
    showToast(t.sortedToast);
  };

  const handleRenameSong = (songId: string, newName: string) => {
    setSongs((prev) =>
      sortSongsAlphabetically(
        prev.map((s) => (s.id === songId ? { ...s, name: newName } : s))
      )
    );
  };

  const handleDeleteSongs = async (songIds: string[]) => {
    const targetSet = new Set(songIds);
    if (currentSongId && targetSet.has(currentSongId)) {
      stopPlayback();
    }
    for (const id of songIds) {
      await deleteAudioBlob(id);
    }
    setSongs((prev) => prev.filter((s) => !targetSet.has(s.id)));
    setPlaylists((prev) =>
      prev.map((pl) => ({
        ...pl,
        songIds: pl.songIds.filter((id) => !targetSet.has(id)),
      }))
    );
  };

  const handleCreatePlaylist = (name: string, songIds: string[]) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      songIds,
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setActivePlaylistId(newPlaylist.id);
  };

  const handleAddSongsToPlaylist = (playlistId: string, songIds: string[]) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        const merged = Array.from(new Set([...pl.songIds, ...songIds]));
        return { ...pl, songIds: merged };
      })
    );
  };

  const handleToggleHeadphones = () => {
    const next = !headphonesConnected;
    setHeadphonesConnected(next);
    if (!next && isPlaying) {
      pausePlaybackWithReason(t.stoppedHeadphones);
    }
  };

  const handleToggleBluetooth = () => {
    const next = !bluetoothConnected;
    setBluetoothConnected(next);
    if (!next && isPlaying) {
      pausePlaybackWithReason(t.stoppedBluetooth);
    }
  };

  const handleDownloadZip = () => {
    const zipBlob = buildZipBlob(
      ANDROID_PROJECT_FILES.map((f) => ({ path: f.path, content: f.content }))
    );
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MusicPlay-Android-Kotlin.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      {/* Desktop Top Bar (3-zone contract) */}
      <header className="hidden lg:flex items-center justify-between gap-8 px-6 h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shrink-0">
        <a
          href="#top"
          className="text-base font-bold tracking-tight whitespace-nowrap shrink-0"
        >
          MusicPlay
        </a>

        <nav className="flex items-center gap-6 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <a
            href="#player"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Player Preview
          </a>
          <a
            href="#android-code"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Kotlin &amp; Compose Source
          </a>
          <span className="text-neutral-400 dark:text-neutral-500 whitespace-nowrap shrink-0">
            Snapdragon 662 · Adreno 610 · Media3 ExoPlayer
          </span>
        </nav>

        <button
          type="button"
          onClick={handleDownloadZip}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Android Project</span>
        </button>
      </header>

      {/* Mobile View Switcher (keeps mobile sticky height well under 15%) */}
      <div className="flex lg:hidden items-center justify-between px-4 h-11 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileTab('app')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              mobileTab === 'app'
                ? 'bg-red-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            MusicPlay App
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('code')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              mobileTab === 'code'
                ? 'bg-red-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Kotlin Code
          </button>
        </div>
        <button
          type="button"
          onClick={handleDownloadZip}
          className="text-xs font-medium text-red-600 whitespace-nowrap"
        >
          Download .zip
        </button>
      </div>

      {/* Main Responsive Content */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto lg:px-6 lg:py-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] lg:gap-6 items-start">
        {/* Left Column: MusicPlay Android App Viewport */}
        <div
          id="player"
          className={`${
            mobileTab === 'app' ? 'flex' : 'hidden lg:flex'
          } flex-col w-full h-[calc(100vh-44px)] lg:h-[760px] lg:rounded-2xl overflow-hidden lg:border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black`}
        >
          <MusicPlayApp
            songs={songs}
            playlists={playlists}
            activePlaylistId={activePlaylistId}
            onSelectPlaylist={setActivePlaylistId}
            currentSongId={currentSongId}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            theme={theme}
            language={language}
            toastMessage={toastMessage}
            onTogglePlaySong={handleTogglePlaySong}
            onPlayQueue={handlePlayQueue}
            onTogglePlayPause={handleTogglePlayPause}
            onSkipNext={handleSkipNext}
            onSkipPrevious={handleSkipPrevious}
            onStopPlayback={stopPlayback}
            onSeek={handleSeek}
            onChangeVolume={handleChangeVolume}
            onSearchScan={handleScanStorage}
            onRefreshScan={handleScanStorage}
            onImportFiles={handleImportFiles}
            onSortAZ={handleSortAZ}
            onRenameSong={handleRenameSong}
            onDeleteSongs={handleDeleteSongs}
            onCreatePlaylist={handleCreatePlaylist}
            onAddSongsToPlaylist={handleAddSongsToPlaylist}
            onChangeTheme={setTheme}
            onChangeLanguage={setLanguage}
          />
        </div>

        {/* Right Column: Hardware Triggers + Complete Kotlin & Jetpack Compose Project */}
        <div
          id="android-code"
          className={`${
            mobileTab === 'code' ? 'block p-4' : 'hidden lg:block'
          } min-w-0`}
        >
          <AndroidProjectViewer
            headphonesConnected={headphonesConnected}
            bluetoothConnected={bluetoothConnected}
            onToggleHeadphones={handleToggleHeadphones}
            onToggleBluetooth={handleToggleBluetooth}
            onImportFiles={handleImportFiles}
          />
        </div>
      </div>
    </div>
  );
}
