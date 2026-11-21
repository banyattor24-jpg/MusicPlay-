import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  FolderPlus,
  ListMusic,
  MoreVertical,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings,
  SkipBack,
  SkipForward,
  Square,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  AppLanguage,
  AppTheme,
  Playlist,
  Song,
  TRANSLATIONS,
} from '../types/music';
import { formatBytes, formatDuration } from '../utils/audioStorage';

interface MusicPlayAppProps {
  songs: Song[];
  playlists: Playlist[];
  activePlaylistId: string | null;
  onSelectPlaylist: (id: string | null) => void;
  currentSongId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  theme: AppTheme;
  language: AppLanguage;
  toastMessage: string | null;
  onTogglePlaySong: (song: Song, queue?: Song[]) => void;
  onPlayQueue: (queue: Song[]) => void;
  onTogglePlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onStopPlayback: () => void;
  onSeek: (seconds: number) => void;
  onChangeVolume: (percent: number) => void;
  onSearchScan: () => void;
  onRefreshScan: () => void;
  onImportFiles: (files: FileList) => void;
  onSortAZ: () => void;
  onRenameSong: (songId: string, newName: string) => void;
  onDeleteSongs: (songIds: string[]) => void;
  onCreatePlaylist: (name: string, songIds: string[]) => void;
  onAddSongsToPlaylist: (playlistId: string, songIds: string[]) => void;
  onChangeTheme: (theme: AppTheme) => void;
  onChangeLanguage: (language: AppLanguage) => void;
}

export function MusicPlayLogo({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-[62%] h-[62%] text-red-600"
        fill="currentColor"
      >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
    </div>
  );
}

export const MusicPlayApp: React.FC<MusicPlayAppProps> = ({
  songs,
  playlists,
  activePlaylistId,
  onSelectPlaylist,
  currentSongId,
  isPlaying,
  currentTime,
  duration,
  volume,
  theme,
  language,
  toastMessage,
  onTogglePlaySong,
  onPlayQueue,
  onTogglePlayPause,
  onSkipNext,
  onSkipPrevious,
  onStopPlayback,
  onSeek,
  onChangeVolume,
  onSearchScan,
  onRefreshScan,
  onImportFiles,
  onSortAZ,
  onRenameSong,
  onDeleteSongs,
  onCreatePlaylist,
  onAddSongsToPlaylist,
  onChangeTheme,
  onChangeLanguage,
}) => {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';
  const isAmoled = theme === 'amoled';

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sheetSong, setSheetSong] = useState<Song | null>(null);
  const [renameTarget, setRenameTarget] = useState<Song | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [infoTarget, setInfoTarget] = useState<Song | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<Song[]>([]);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) || null;
  const visibleSongs = activePlaylist
    ? songs.filter((s) => activePlaylist.songIds.includes(s.id))
    : songs;

  const currentSong = songs.find((s) => s.id === currentSongId) || null;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showMoreMenu]);

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const exitSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handlePointerDown = (song: Song) => {
    longPressTriggeredRef.current = false;
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      setSheetSong(song);
    }, 480);
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const bgMain = isAmoled ? 'bg-black text-neutral-100' : 'bg-white text-neutral-900';
  const bgSurface = isAmoled ? 'bg-[#0a0a0a]' : 'bg-neutral-50';
  const borderColor = isAmoled ? 'border-neutral-800' : 'border-neutral-200';
  const mutedText = isAmoled ? 'text-neutral-400' : 'text-neutral-500';
  const hoverRow = isAmoled ? 'hover:bg-neutral-900/70' : 'hover:bg-neutral-100/80';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`relative flex flex-col h-full w-full overflow-hidden select-none ${bgMain}`}
    >
      {/* Hidden local file input for importing real .mp3/.m4a/.wav/.ogg/.flac files */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".mp3,.m4a,.wav,.ogg,.flac,.aac,.opus,audio/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onImportFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Dark AMOLED Media Notification Bar (appears when a song is playing or paused in session) */}
      {currentSong && (
        <div
          className="bg-black text-white border-b border-neutral-800 px-3 py-2 flex items-center justify-between gap-2 shrink-0"
          role="region"
          aria-label="Media notification bar"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <MusicPlayLogo size={22} />
            <div className="min-w-0">
              <div className="text-[11px] text-neutral-400 leading-tight">
                {t.appName} · {isPlaying ? t.notificationPlaying : t.notificationPaused}
              </div>
              <div className="text-xs font-medium text-white truncate">
                {currentSong.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0" dir="ltr">
            <button
              type="button"
              onClick={onSkipPrevious}
              aria-label="Notification Previous"
              className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-200 hover:bg-neutral-900 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onTogglePlayPause}
              aria-label="Notification Play or Pause"
              className="w-8 h-8 flex items-center justify-center rounded-md text-white hover:bg-neutral-900 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onSkipNext}
              aria-label="Notification Next"
              className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-200 hover:bg-neutral-900 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onStopPlayback}
              aria-label="Stop Notification"
              className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TopAppBar: Left = MusicPlay, Right (right-to-left order) = Settings, Circular Search, Refresh, Three-dots */}
      <header
        className={`flex items-center justify-between px-3.5 h-14 border-b shrink-0 ${bgMain} ${borderColor}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <MusicPlayLogo size={28} />
          <h1 className="text-base font-bold tracking-tight truncate">
            {activePlaylist ? activePlaylist.name : t.appName}
          </h1>
        </div>

        {/* Ordered right-to-left: Settings (far right), Circular Search, Refresh, Three-dots */}
        <div className="flex flex-row-reverse items-center gap-1 shrink-0">
          {/* 1. Settings button */}
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            title={t.settingsTooltip}
            aria-label={t.settingsTooltip}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${hoverRow}`}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* 2. Circular search button to scan phone for new song files */}
          <button
            type="button"
            onClick={onSearchScan}
            title={t.searchScanTooltip}
            aria-label={t.searchScanTooltip}
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${borderColor} ${hoverRow}`}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Refresh button on top bar */}
          <button
            type="button"
            onClick={onRefreshScan}
            title={t.refreshTooltip}
            aria-label={t.refreshTooltip}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${hoverRow}`}
          >
            <RefreshCw className="w-[18px] h-[18px]" />
          </button>

          {/* 3. Three-dots menu button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMoreMenu((prev) => !prev)}
              title={t.moreTooltip}
              aria-label={t.moreTooltip}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${hoverRow}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMoreMenu && (
              <div
                className={`absolute top-11 ${
                  isRtl ? 'left-0' : 'right-0'
                } w-52 border rounded-xl py-1.5 z-40 shadow-lg ${
                  isAmoled
                    ? 'bg-[#111111] border-neutral-800 text-neutral-100'
                    : 'bg-white border-neutral-200 text-neutral-900'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setIsSelectionMode(true);
                  }}
                  className={`w-full text-start px-3.5 py-2.5 text-sm flex items-center gap-2.5 ${hoverRow}`}
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t.select}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowCreatePlaylist(true);
                  }}
                  className={`w-full text-start px-3.5 py-2.5 text-sm flex items-center gap-2.5 ${hoverRow}`}
                >
                  <ListMusic className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t.createPlaylist}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onSortAZ();
                  }}
                  className={`w-full text-start px-3.5 py-2.5 text-sm flex items-center gap-2.5 ${hoverRow}`}
                >
                  <span className="w-4 text-center text-xs font-mono shrink-0">A-Z</span>
                  <span className="truncate">{t.sortSongsAZ}</span>
                </button>
                <div className={`my-1 border-t ${borderColor}`} />
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className={`w-full text-start px-3.5 py-2.5 text-sm flex items-center gap-2.5 ${hoverRow}`}
                >
                  <FolderPlus className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t.addDeviceFiles}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Optional compact playlist filter strip only when user has created playlists */}
      {playlists.length > 0 && !isSelectionMode && (
        <div
          className={`flex items-center gap-1.5 px-3 py-2 border-b overflow-x-auto shrink-0 ${bgSurface} ${borderColor}`}
        >
          <button
            type="button"
            onClick={() => onSelectPlaylist(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              activePlaylistId === null
                ? 'bg-red-600 text-white'
                : `${mutedText} ${hoverRow}`
            }`}
          >
            {t.viewAllSongs}
          </button>
          {playlists.map((pl) => (
            <button
              key={pl.id}
              type="button"
              onClick={() => onSelectPlaylist(pl.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                activePlaylistId === pl.id
                  ? 'bg-red-600 text-white'
                  : `${mutedText} ${hoverRow}`
              }`}
            >
              {pl.name} ({pl.songIds.length})
            </button>
          ))}
        </div>
      )}

      {/* Selection Mode Action Bar */}
      {isSelectionMode && (
        <div
          className={`flex items-center justify-between gap-2 px-3 py-2 border-b shrink-0 ${
            isAmoled ? 'bg-[#121212] border-neutral-800' : 'bg-neutral-100 border-neutral-200'
          }`}
        >
          <span className="text-xs font-semibold tabular-nums whitespace-nowrap">
            {t.selectedCount(selectedIds.length)}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() => {
                const chosen = visibleSongs.filter((s) => selectedIds.includes(s.id));
                if (chosen.length > 0) {
                  onPlayQueue(chosen);
                  exitSelection();
                }
              }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white disabled:opacity-40 whitespace-nowrap"
            >
              {t.playSelected}
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() => {
                if (playlists.length > 0) {
                  setShowAddToPlaylist(true);
                } else {
                  setShowCreatePlaylist(true);
                }
              }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border disabled:opacity-40 whitespace-nowrap ${borderColor}`}
            >
              {t.addToPlaylist}
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() => {
                const targets = visibleSongs.filter((s) => selectedIds.includes(s.id));
                if (targets.length > 0) setDeleteTargets(targets);
              }}
              className="p-1.5 rounded-lg text-red-600 disabled:opacity-40"
              aria-label={t.deleteAction}
              title={t.deleteAction}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={exitSelection}
              aria-label={t.cancel}
              className="p-1.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Song List: Song name ONLY + small Play/Pause button (zero images, zero album/artist text) */}
      <main className="flex-1 overflow-y-auto">
        {visibleSongs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center gap-3">
            <p className="text-sm font-semibold">{t.noSongsTitle}</p>
            <p className={`text-xs max-w-xs ${mutedText}`}>{t.noSongsSubtitle}</p>
            <button
              type="button"
              onClick={onSearchScan}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-red-600 text-white"
            >
              {t.scanNow}
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-transparent">
            {visibleSongs.map((song) => {
              const isCurrent = song.id === currentSongId;
              const isSelected = selectedIds.includes(song.id);

              return (
                <li
                  key={song.id}
                  onPointerDown={() => handlePointerDown(song)}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSheetSong(song);
                  }}
                  onClick={() => {
                    if (longPressTriggeredRef.current) return;
                    if (isSelectionMode) {
                      toggleSelectId(song.id);
                    } else {
                      onTogglePlaySong(song, visibleSongs);
                    }
                  }}
                  className={`flex items-center justify-between gap-3 px-4 min-h-[54px] border-b cursor-pointer transition-colors ${borderColor} ${hoverRow}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isSelectionMode && (
                      <span
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-red-600 border-red-600 text-white'
                            : borderColor
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </span>
                    )}
                    <span
                      className={`text-sm font-medium truncate ${
                        isCurrent ? 'text-red-600 font-semibold' : ''
                      }`}
                    >
                      {song.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePlaySong(song, visibleSongs);
                    }}
                    aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
                    className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 transition-colors ${
                      isCurrent
                        ? 'text-red-600'
                        : isAmoled
                        ? 'text-neutral-300 hover:bg-neutral-800'
                        : 'text-neutral-700 hover:bg-neutral-200/70'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="w-[18px] h-[18px]" />
                    ) : (
                      <Play className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Bottom Mini Player + Track Progress & Volume Control Bar */}
      <footer className={`border-t px-3.5 py-2.5 shrink-0 ${bgSurface} ${borderColor}`}>
        {currentSong && (
          <div className="mb-2">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-sm font-semibold truncate flex-1">
                {currentSong.name}
              </span>
              <div className="flex items-center gap-0.5 shrink-0" dir="ltr">
                <button
                  type="button"
                  onClick={onSkipPrevious}
                  aria-label="Previous track"
                  className={`w-9 h-9 flex items-center justify-center rounded-lg ${hoverRow}`}
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onTogglePlayPause}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-600 text-white"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onSkipNext}
                  aria-label="Next track"
                  className={`w-9 h-9 flex items-center justify-center rounded-lg ${hoverRow}`}
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Track Progress Bar */}
            <div className="flex items-center gap-2" dir="ltr">
              <span className={`text-[11px] font-mono tabular-nums w-9 ${mutedText}`}>
                {formatDuration(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || currentSong.durationSec || 1}
                step={0.1}
                value={Math.min(currentTime, duration || currentSong.durationSec || 1)}
                onChange={(e) => onSeek(Number(e.target.value))}
                aria-label="Track progress"
                className="musicplay-slider flex-1"
                style={{
                  background: isAmoled ? '#262626' : '#e5e7eb',
                  borderRadius: '9999px',
                }}
              />
              <span
                className={`text-[11px] font-mono tabular-nums w-9 text-right ${mutedText}`}
              >
                {formatDuration(duration || currentSong.durationSec)}
              </span>
            </div>
          </div>
        )}

        {/* Volume Control Bar at bottom of screen (0% stops music; past 100% boosts 150% -> 200%) */}
        <div className="flex items-center gap-2.5" dir="ltr">
          <button
            type="button"
            onClick={() => onChangeVolume(volume === 0 ? 75 : 0)}
            aria-label={t.volumeLabel}
            className={`w-7 h-7 flex items-center justify-center rounded ${mutedText}`}
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-600" />
            ) : (
              <Volume2 className={`w-4 h-4 ${volume > 100 ? 'text-red-600' : ''}`} />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={200}
            step={1}
            value={volume}
            onChange={(e) => {
              const raw = Number(e.target.value);
              const normalized =
                raw <= 100 ? raw : raw <= 150 ? 150 : 200;
              onChangeVolume(normalized);
            }}
            aria-label={t.volumeLabel}
            className="musicplay-slider flex-1"
            style={{
              background: isAmoled ? '#262626' : '#e5e7eb',
              borderRadius: '9999px',
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (volume < 100) {
                onChangeVolume(100);
              } else if (volume === 100) {
                onChangeVolume(150);
              } else if (volume === 150) {
                onChangeVolume(200);
              } else {
                onChangeVolume(100);
              }
            }}
            title="Maximize / Boost volume (100% -> 150% -> 200%)"
            className={`text-[11px] font-mono tabular-nums min-w-[44px] text-end px-1.5 py-0.5 rounded transition-colors ${
              volume > 100
                ? 'text-red-600 font-semibold'
                : mutedText
            }`}
          >
            {volume}%
          </button>
        </div>
      </footer>

      {/* Short Android Toast */}
      {toastMessage && (
        <div className="pointer-events-none absolute bottom-28 inset-x-4 flex justify-center z-50">
          <div
            className={`px-4 py-2 rounded-full text-xs font-medium border ${
              isAmoled
                ? 'bg-neutral-900 text-white border-neutral-700'
                : 'bg-neutral-900 text-white border-neutral-800'
            }`}
          >
            {toastMessage}
          </div>
        </div>
      )}

      {/* Long-press BottomSheet: Rename / Info / Delete */}
      {sheetSong && (
        <div
          className="absolute inset-0 z-50 bg-black/60 flex items-end"
          onClick={() => setSheetSong(null)}
        >
          <div
            className={`w-full rounded-t-2xl border-t p-3 pb-5 ${
              isAmoled
                ? 'bg-[#0e0e0e] border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-neutral-400/50 mx-auto mb-3" />
            <p className="text-sm font-semibold px-3 pb-2 truncate border-b mb-1 border-neutral-500/20">
              {sheetSong.name}
            </p>
            <button
              type="button"
              onClick={() => {
                setRenameTarget(sheetSong);
                setRenameValue(sheetSong.name);
                setSheetSong(null);
              }}
              className={`w-full text-start px-3 py-3 text-sm rounded-lg ${hoverRow}`}
            >
              {t.rename}
            </button>
            <button
              type="button"
              onClick={() => {
                setInfoTarget(sheetSong);
                setSheetSong(null);
              }}
              className={`w-full text-start px-3 py-3 text-sm rounded-lg ${hoverRow}`}
            >
              {t.info}
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteTargets([sheetSong]);
                setSheetSong(null);
              }}
              className={`w-full text-start px-3 py-3 text-sm rounded-lg text-red-600 ${hoverRow}`}
            >
              {t.deleteAction}
            </button>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div
          className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setRenameTarget(null)}
        >
          <div
            className={`w-full max-w-xs rounded-2xl border p-4 ${
              isAmoled
                ? 'bg-[#0e0e0e] border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold mb-3">{t.renameTitle}</h2>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder={t.songNameLabel}
              className={`w-full px-3 py-2 text-sm rounded-lg border mb-4 bg-transparent focus:outline-none focus:border-red-600 ${borderColor}`}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (renameValue.trim()) {
                    onRenameSong(renameTarget.id, renameValue.trim());
                    setRenameTarget(null);
                  }
                }}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal (path, size, duration, format) */}
      {infoTarget && (
        <div
          className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setInfoTarget(null)}
        >
          <div
            className={`w-full max-w-xs rounded-2xl border p-4 ${
              isAmoled
                ? 'bg-[#0e0e0e] border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold mb-3 truncate">{infoTarget.name}</h2>
            <dl className="space-y-2 text-xs mb-4">
              <div>
                <dt className={mutedText}>{t.pathLabel}</dt>
                <dd className="font-mono break-all mt-0.5">{infoTarget.path}</dd>
              </div>
              <div className="flex justify-between">
                <dt className={mutedText}>{t.sizeLabel}</dt>
                <dd className="font-mono tabular-nums">
                  {formatBytes(infoTarget.sizeBytes)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className={mutedText}>{t.durationLabel}</dt>
                <dd className="font-mono tabular-nums">
                  {formatDuration(infoTarget.durationSec)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className={mutedText}>{t.formatLabel}</dt>
                <dd className="font-mono">{infoTarget.format}</dd>
              </div>
            </dl>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setInfoTarget(null)}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargets.length > 0 && (
        <div
          className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setDeleteTargets([])}
        >
          <div
            className={`w-full max-w-xs rounded-2xl border p-4 ${
              isAmoled
                ? 'bg-[#0e0e0e] border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold mb-2">{t.deleteConfirmTitle}</h2>
            <p className={`text-xs mb-4 ${mutedText}`}>
              {t.deleteConfirmMessage(deleteTargets.length)}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargets([])}
                className="px-3 py-1.5 text-xs font-medium rounded-lg"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSongs(deleteTargets.map((s) => s.id));
                  setDeleteTargets([]);
                  exitSelection();
                }}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white"
              >
                {t.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <div
          className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowCreatePlaylist(false)}
        >
          <div
            className={`w-full max-w-xs rounded-2xl border p-4 ${
              isAmoled
                ? 'bg-[#0e0e0e] border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold mb-3">{t.playlistNameTitle}</h2>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder={t.playlistNamePlaceholder}
              className={`w-full px-3 py-2 text-sm rounded-lg border mb-4 bg-transparent focus:outline-none focus:border-red-600 ${borderColor}`}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreatePlaylist(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newPlaylistName.trim()) {
                    onCreatePlaylist(newPlaylistName.trim(), selectedIds);
                    setNewPlaylistName('');
                    setShowCreatePlaylist(false);
                    exitSelection();
                  }
                }}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white"
              >
                {t.create}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Existing Playlist Modal */}
      {showAddToPlaylist && (
        <div
          className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowAddToPlaylist(false)}
        >
          <div
            className={`w-full max-w-xs rounded-2xl border p-4 ${
              isAmoled
                ? 'bg-[#0e0e0e] border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold mb-3">{t.choosePlaylist}</h2>
            <div className="space-y-1 max-h-48 overflow-y-auto mb-3">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => {
                    onAddSongsToPlaylist(pl.id, selectedIds);
                    setShowAddToPlaylist(false);
                    exitSelection();
                  }}
                  className={`w-full text-start px-3 py-2 text-sm rounded-lg ${hoverRow}`}
                >
                  {pl.name}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowAddToPlaylist(false);
                  setShowCreatePlaylist(true);
                }}
                className="px-3 py-1.5 text-xs font-medium text-red-600"
              >
                + {t.createPlaylist}
              </button>
              <button
                type="button"
                onClick={() => setShowAddToPlaylist(false)}
                className="px-3 py-1.5 text-xs font-medium"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog: Arabic/English (RTL/LTR) + Light/AMOLED Dark */}
      {showSettings && (
        <div
          className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            className={`w-full max-w-xs rounded-2xl border p-4 ${
              isAmoled
                ? 'bg-[#0e0e0e] border-neutral-800 text-neutral-100'
                : 'bg-white border-neutral-200 text-neutral-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold mb-4">{t.settings}</h2>

            <div className="mb-4">
              <p className={`text-xs font-medium mb-2 ${mutedText}`}>{t.languageLabel}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeLanguage('en')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    language === 'en'
                      ? 'bg-red-600 text-white border-red-600'
                      : `${borderColor} ${hoverRow}`
                  }`}
                >
                  {t.english}
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLanguage('ar')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    language === 'ar'
                      ? 'bg-red-600 text-white border-red-600'
                      : `${borderColor} ${hoverRow}`
                  }`}
                >
                  {t.arabic}
                </button>
              </div>
            </div>

            <div className="mb-5">
              <p className={`text-xs font-medium mb-2 ${mutedText}`}>{t.themeLabel}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeTheme('light')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    theme === 'light'
                      ? 'bg-red-600 text-white border-red-600'
                      : `${borderColor} ${hoverRow}`
                  }`}
                >
                  {t.lightTheme}
                </button>
                <button
                  type="button"
                  onClick={() => onChangeTheme('amoled')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    theme === 'amoled'
                      ? 'bg-red-600 text-white border-red-600'
                      : `${borderColor} ${hoverRow}`
                  }`}
                >
                  {t.amoledTheme}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
