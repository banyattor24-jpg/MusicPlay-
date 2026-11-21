import React, { useRef, useState } from 'react';
import { Bluetooth, Check, Copy, Download, FolderOpen, Headphones } from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../androidProject/androidFiles';
import { buildZipBlob } from '../utils/audioStorage';

interface AndroidProjectViewerProps {
  headphonesConnected: boolean;
  bluetoothConnected: boolean;
  onToggleHeadphones: () => void;
  onToggleBluetooth: () => void;
  onImportFiles: (files: FileList) => void;
}

export const AndroidProjectViewer: React.FC<AndroidProjectViewerProps> = ({
  headphonesConnected,
  bluetoothConnected,
  onToggleHeadphones,
  onToggleBluetooth,
  onImportFiles,
}) => {
  const [selectedPath, setSelectedPath] = useState<string>(
    'app/src/main/java/com/musicplay/app/player/PlaybackService.kt'
  );
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeFile =
    ANDROID_PROJECT_FILES.find((f) => f.path === selectedPath) ||
    ANDROID_PROJECT_FILES[0];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
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
    <section className="flex flex-col gap-6 min-w-0">
      {/* Hardware & Local File Controls */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Audio Output &amp; Local Storage Triggers
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Test headphone or Bluetooth disconnection auto-stop and import local audio tracks (.mp3, .m4a, .wav, .ogg, .flac).
            </p>
          </div>

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

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Import Local Audio</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onToggleHeadphones}
            className={`flex items-center justify-between px-4 py-3 rounded-lg border text-start transition-colors ${
              headphonesConnected
                ? 'border-neutral-900 dark:border-neutral-200 bg-neutral-50 dark:bg-neutral-900'
                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Headphones className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Wired Headphones
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {headphonesConnected
                    ? 'Connected · Click to unplug'
                    : 'Disconnected · Click to plug in'}
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-red-600 whitespace-nowrap shrink-0">
              {headphonesConnected ? 'Unplug' : 'Connect'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleBluetooth}
            className={`flex items-center justify-between px-4 py-3 rounded-lg border text-start transition-colors ${
              bluetoothConnected
                ? 'border-neutral-900 dark:border-neutral-200 bg-neutral-50 dark:bg-neutral-900'
                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Bluetooth className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Bluetooth Earphones
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {bluetoothConnected
                    ? 'Connected · Click to disconnect'
                    : 'Disconnected · Click to connect'}
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-red-600 whitespace-nowrap shrink-0">
              {bluetoothConnected ? 'Disconnect' : 'Connect'}
            </span>
          </button>
        </div>
      </div>

      {/* Android Kotlin + Jetpack Compose Project Explorer */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Kotlin &amp; Jetpack Compose Source Code
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Target SDK 34 · Min SDK 24 · Media3 ExoPlayer · DataStore Preferences · Snapdragon 662 Optimized
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadZip}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Android Project (.zip)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[270px_1fr] min-h-[540px] max-h-[640px]">
          {/* File Tree */}
          <aside className="border-b xl:border-b-0 xl:border-e border-neutral-200 dark:border-neutral-800 overflow-y-auto p-2 bg-neutral-50/70 dark:bg-neutral-900/40">
            <ul className="space-y-0.5">
              {ANDROID_PROJECT_FILES.map((file) => {
                const fileName = file.path.split('/').pop() || file.path;
                const folderPath = file.path.split('/').slice(-3, -1).join('/');
                const isActive = file.path === activeFile.path;

                return (
                  <li key={file.path}>
                    <button
                      type="button"
                      onClick={() => setSelectedPath(file.path)}
                      className={`w-full text-start px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="text-xs font-medium truncate">{fileName}</div>
                      {folderPath && (
                        <div
                          className={`text-[11px] font-mono truncate ${
                            isActive
                              ? 'text-neutral-300 dark:text-neutral-600'
                              : 'text-neutral-400 dark:text-neutral-500'
                          }`}
                        >
                          {folderPath}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Code Viewer */}
          <div className="flex flex-col min-w-0 overflow-hidden bg-neutral-950 text-neutral-100">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/80">
              <div className="min-w-0">
                <div className="text-xs font-mono text-neutral-200 truncate">
                  {activeFile.path}
                </div>
                <div className="text-[11px] text-neutral-400 truncate">
                  {activeFile.summary}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-700 text-neutral-200 hover:bg-neutral-800 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-xs leading-relaxed font-mono text-neutral-200">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
