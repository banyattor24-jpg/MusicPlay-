import { Song } from '../types/music';

const DB_NAME = 'musicplay_local_store';
const DB_VERSION = 1;
const BLOB_STORE = 'audio_blobs';

interface StoredAudioRecord {
  id: string;
  blob: Blob;
}

function openAudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudioBlob(id: string, blob: Blob): Promise<void> {
  const db = await openAudioDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOB_STORE, 'readwrite');
    tx.objectStore(BLOB_STORE).put({ id, blob } satisfies StoredAudioRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAudioBlob(id: string): Promise<Blob | null> {
  const db = await openAudioDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOB_STORE, 'readonly');
    const req = tx.objectStore(BLOB_STORE).get(id);
    req.onsuccess = () => {
      const record = req.result as StoredAudioRecord | undefined;
      resolve(record ? record.blob : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAudioBlob(id: string): Promise<void> {
  const db = await openAudioDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOB_STORE, 'readwrite');
    tx.objectStore(BLOB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Generates a real 16-bit PCM WAV file in memory with warm, musical harmonic chords
 * so offline auto-scan produces genuine playable local audio files with accurate duration and byte size.
 */
export function synthesizeOfflineWavBlob(seed: number, durationSec: number): Blob {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const progressions = [
    [220.0, 277.18, 329.63, 440.0], // A major
    [196.0, 246.94, 293.66, 392.0], // G major
    [174.61, 220.0, 261.63, 349.23], // F major
    [164.81, 196.0, 246.94, 329.63], // E minor
    [261.63, 329.63, 392.0, 493.88], // Cmaj7
  ];

  const baseChord = progressions[seed % progressions.length];
  const altChord = progressions[(seed + 2) % progressions.length];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const measurePos = (t % 4) / 4;
    const activeChord = Math.floor(t / 4) % 2 === 0 ? baseChord : altChord;
    const envelope = Math.sin(Math.PI * Math.min(1, t / 0.3)) *
      Math.sin(Math.PI * Math.min(1, (durationSec - t) / 0.4));
    const pulse = 0.65 + 0.35 * Math.sin(2 * Math.PI * measurePos);

    let sample = 0;
    for (let n = 0; n < activeChord.length; n++) {
      const freq = activeChord[n];
      sample += Math.sin(2 * Math.PI * freq * t) * (0.22 / (n + 1));
    }
    // Gentle arpeggio pluck every 0.5s
    const step = Math.floor(t * 2) % activeChord.length;
    const stepLocal = (t * 2) % 1;
    const pluckEnv = Math.exp(-stepLocal * 4.5);
    sample += Math.sin(2 * Math.PI * activeChord[step] * 2 * t) * 0.14 * pluckEnv;

    const clamped = Math.max(-0.95, Math.min(0.95, sample * envelope * pulse));
    view.setInt16(44 + i * 2, Math.floor(clamped * 32767), true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

interface BuiltInTrackSeed {
  id: string;
  name: string;
  fileName: string;
  durationSec: number;
  seed: number;
}

const INITIAL_DEVICE_TRACKS: BuiltInTrackSeed[] = [
  { id: 'local-1', name: 'Acoustic Morning', fileName: 'Acoustic_Morning.wav', durationSec: 22, seed: 0 },
  { id: 'local-2', name: 'Desert Breeze', fileName: 'Desert_Breeze.wav', durationSec: 24, seed: 1 },
  { id: 'local-3', name: 'Midnight Etude', fileName: 'Midnight_Etude.wav', durationSec: 26, seed: 2 },
  { id: 'local-4', name: 'Quiet Horizon', fileName: 'Quiet_Horizon.wav', durationSec: 20, seed: 3 },
  { id: 'local-5', name: 'Raindrop Study', fileName: 'Raindrop_Study.wav', durationSec: 25, seed: 4 },
];

const EXTRA_DISCOVERABLE_TRACKS: BuiltInTrackSeed[] = [
  { id: 'local-6', name: 'Cedar Echoes', fileName: 'Cedar_Echoes.wav', durationSec: 21, seed: 1 },
  { id: 'local-7', name: 'Dawn Prelude', fileName: 'Dawn_Prelude.wav', durationSec: 23, seed: 4 },
  { id: 'local-8', name: 'Warm Strings', fileName: 'Warm_Strings.wav', durationSec: 25, seed: 0 },
];

export async function provisionInitialDeviceTracks(): Promise<Song[]> {
  const songs: Song[] = [];
  for (const track of INITIAL_DEVICE_TRACKS) {
    const blob = synthesizeOfflineWavBlob(track.seed, track.durationSec);
    await saveAudioBlob(track.id, blob);
    songs.push({
      id: track.id,
      name: track.name,
      path: `/storage/emulated/0/Music/${track.fileName}`,
      sizeBytes: blob.size,
      durationSec: track.durationSec,
      format: 'WAV',
      isBuiltInSample: true,
      sampleSeed: track.seed,
    });
  }
  return songs;
}

export async function discoverAdditionalDeviceTrack(existingIds: Set<string>): Promise<Song[]> {
  const nextTrack = EXTRA_DISCOVERABLE_TRACKS.find((t) => !existingIds.has(t.id));
  if (!nextTrack) {
    return [];
  }
  const blob = synthesizeOfflineWavBlob(nextTrack.seed, nextTrack.durationSec);
  await saveAudioBlob(nextTrack.id, blob);
  return [
    {
      id: nextTrack.id,
      name: nextTrack.name,
      path: `/storage/emulated/0/Music/Downloads/${nextTrack.fileName}`,
      sizeBytes: blob.size,
      durationSec: nextTrack.durationSec,
      format: 'WAV',
      isBuiltInSample: true,
      sampleSeed: nextTrack.seed,
    },
  ];
}

export function extractAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const dur = Number.isFinite(audio.duration) ? Math.round(audio.duration) : 0;
      URL.revokeObjectURL(url);
      resolve(dur);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    audio.src = url;
  });
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function sortSongsAlphabetically(songs: Song[]): Song[] {
  return [...songs].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}

/**
 * Pure TypeScript ZIP builder (Store mode, CRC32 verified) for exporting the complete
 * Android Kotlin + Jetpack Compose project without external zip dependencies.
 */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipEntryInput {
  path: string;
  content: string;
}

export function buildZipBlob(entries: ZipEntryInput[]): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.path);
    const dataBytes = encoder.encode(entry.content);
    const crc = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lView = new DataView(localHeader.buffer);
    lView.setUint32(0, 0x04034b50, true);
    lView.setUint16(4, 20, true);
    lView.setUint16(6, 0x0800, true); // UTF-8
    lView.setUint16(8, 0, true); // Store
    lView.setUint16(10, 0, true);
    lView.setUint16(12, 0, true);
    lView.setUint32(14, crc, true);
    lView.setUint32(18, dataBytes.length, true);
    lView.setUint32(22, dataBytes.length, true);
    lView.setUint16(26, nameBytes.length, true);
    lView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cView = new DataView(centralHeader.buffer);
    cView.setUint32(0, 0x02014b50, true);
    cView.setUint16(4, 20, true);
    cView.setUint16(6, 20, true);
    cView.setUint16(8, 0x0800, true);
    cView.setUint16(10, 0, true);
    cView.setUint16(12, 0, true);
    cView.setUint16(14, 0, true);
    cView.setUint32(16, crc, true);
    cView.setUint32(20, dataBytes.length, true);
    cView.setUint32(24, dataBytes.length, true);
    cView.setUint16(28, nameBytes.length, true);
    cView.setUint16(30, 0, true);
    cView.setUint16(32, 0, true);
    cView.setUint16(34, 0, true);
    cView.setUint16(36, 0, true);
    cView.setUint32(38, 0, true);
    cView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  }

  let centralSize = 0;
  for (const part of centralParts) centralSize += part.length;

  const endRecord = new Uint8Array(22);
  const eView = new DataView(endRecord.buffer);
  eView.setUint32(0, 0x06054b50, true);
  eView.setUint16(4, 0, true);
  eView.setUint16(6, 0, true);
  eView.setUint16(8, entries.length, true);
  eView.setUint16(10, entries.length, true);
  eView.setUint32(12, centralSize, true);
  eView.setUint32(16, offset, true);
  eView.setUint16(20, 0, true);

  const blobParts: BlobPart[] = [
    ...localParts.map((u) => u.buffer as ArrayBuffer),
    ...centralParts.map((u) => u.buffer as ArrayBuffer),
    endRecord.buffer as ArrayBuffer,
  ];
  return new Blob(blobParts, { type: 'application/zip' });
}
