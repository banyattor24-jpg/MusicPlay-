import { ZipEntryInput } from '../utils/audioStorage';

export interface AndroidProjectFile extends ZipEntryInput {
  language: 'kotlin' | 'xml' | 'gradle';
  summary: string;
}

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  {
    path: 'settings.gradle.kts',
    language: 'gradle',
    summary: 'Gradle project settings and repositories',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MusicPlay"
include(":app")
`,
  },
  {
    path: 'build.gradle.kts',
    language: 'gradle',
    summary: 'Root Gradle build plugins',
    content: `plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.20" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.20" apply false
}
`,
  },
  {
    path: 'app/build.gradle.kts',
    language: 'gradle',
    summary: 'App module config: SDK 24-34, Compose, Media3 ExoPlayer, DataStore',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.musicplay.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.musicplay.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.09.03")
    implementation(composeBom)

    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.6")

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Lightweight offline audio engine (Media3 ExoPlayer + MediaSession)
    implementation("androidx.media3:media3-exoplayer:1.4.1")
    implementation("androidx.media3:media3-session:1.4.1")
    implementation("androidx.media:media:1.7.0")

    // Persistent preferences & playlists
    implementation("androidx.datastore:datastore-preferences:1.1.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    summary: 'Offline audio permissions, RTL support, Adaptive Icon, Media3 PlaybackService',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Android 13+ local audio access -->
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <!-- Android 12 and below local storage access -->
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />

    <!-- Foreground playback & notification -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Bluetooth earphone disconnect detection -->
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".player.PlaybackService"
            android:exported="true"
            android:foregroundServiceType="mediaPlayback">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaSessionService" />
            </intent-filter>
        </service>
    </application>
</manifest>
`,
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    language: 'xml',
    summary: 'Adaptive launcher icon definition',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`,
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
    language: 'xml',
    summary: 'Adaptive round launcher icon definition',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`,
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_background.xml',
    language: 'xml',
    summary: 'Pure white adaptive icon background',
    content: `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#FFFFFF" />
</shape>
`,
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
    language: 'xml',
    summary: 'Centered red music note vector for adaptive icon',
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#DC2626"
        android:pathData="M56,30v31.1c-1.7,-1.0 -3.8,-1.6 -6,-1.6c-6.1,0 -11,4.5 -11,10s4.9,10 11,10s11,-4.5 11,-10V42h12V30H56z" />
</vector>
`,
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    language: 'xml',
    summary: 'English localization strings',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">MusicPlay</string>
    <string name="all_songs">All Songs</string>
    <string name="no_songs">No local songs found</string>
    <string name="scan_storage">Scan Storage</string>
    <string name="select">Select</string>
    <string name="create_playlist">Create Playlist</string>
    <string name="sort_songs">Sort songs (A–Z)</string>
    <string name="play_selected">Play selected</string>
    <string name="add_to_playlist">Add to playlist</string>
    <string name="delete">Delete</string>
    <string name="cancel">Cancel</string>
    <string name="rename">Rename</string>
    <string name="info">Info</string>
    <string name="delete_confirm_title">Delete song</string>
    <string name="delete_confirm_message">Remove selected audio from device list?</string>
    <string name="settings">Settings</string>
    <string name="language">Language</string>
    <string name="theme">Theme</string>
    <string name="light">Light</string>
    <string name="amoled_dark">AMOLED Dark</string>
    <string name="close">Close</string>
    <string name="save">Save</string>
    <string name="volume">Volume</string>
    <string name="songs_added_format">%1$d new songs added</string>
    <string name="no_new_songs">No new songs found</string>
    <string name="stopped_volume_zero">Music stopped: volume reached 0%</string>
    <string name="stopped_headphones">Music stopped: headphones disconnected</string>
    <string name="stopped_bluetooth">Music stopped: Bluetooth earphones disconnected</string>
    <string name="volume_boost_format">Volume boosted to %1$d%%</string>
</resources>
`,
  },
  {
    path: 'app/src/main/res/values-ar/strings.xml',
    language: 'xml',
    summary: 'Arabic RTL localization strings',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">MusicPlay</string>
    <string name="all_songs">كل الأغاني</string>
    <string name="no_songs">لا توجد أغاني محلية</string>
    <string name="scan_storage">فحص التخزين</string>
    <string name="select">تحديد</string>
    <string name="create_playlist">إنشاء قائمة تشغيل</string>
    <string name="sort_songs">ترتيب الأغاني (أ–ي)</string>
    <string name="play_selected">تشغيل المحدد</string>
    <string name="add_to_playlist">إضافة إلى قائمة</string>
    <string name="delete">حذف</string>
    <string name="cancel">إلغاء</string>
    <string name="rename">إعادة تسمية</string>
    <string name="info">معلومات</string>
    <string name="delete_confirm_title">حذف الأغنية</string>
    <string name="delete_confirm_message">هل تريد إزالة الملف الصوتي المحدد؟</string>
    <string name="settings">الإعدادات</string>
    <string name="language">اللغة</string>
    <string name="theme">المظهر</string>
    <string name="light">فاتح</string>
    <string name="amoled_dark">داكن AMOLED</string>
    <string name="close">إغلاق</string>
    <string name="save">حفظ</string>
    <string name="volume">مستوى الصوت</string>
    <string name="songs_added_format">تمت إضافة %1$d أغاني جديدة</string>
    <string name="no_new_songs">لم يتم العثور على أغاني جديدة</string>
    <string name="stopped_volume_zero">توقفت الموسيقى: وصل الصوت إلى 0%</string>
    <string name="stopped_headphones">توقفت الموسيقى: تم فصل سماعات الرأس</string>
    <string name="stopped_bluetooth">توقفت الموسيقى: تم فصل سماعة البلوتوث</string>
    <string name="volume_boost_format">تم تعزيز الصوت إلى %1$d%%</string>
</resources>
`,
  },
  {
    path: 'app/src/main/java/com/musicplay/app/data/Song.kt',
    language: 'kotlin',
    summary: 'Lightweight immutable data models for Song, Playlist, Theme, and Language',
    content: `package com.musicplay.app.data

import android.net.Uri
import androidx.compose.runtime.Immutable

@Immutable
data class Song(
    val id: Long,
    val name: String,
    val uri: Uri,
    val path: String,
    val sizeBytes: Long,
    val durationMs: Long,
    val format: String
)

@Immutable
data class Playlist(
    val id: String,
    val name: String,
    val songIds: List<Long>
)

enum class AppThemeMode {
    LIGHT,
    AMOLED_DARK
}

enum class AppLanguage(val code: String) {
    ENGLISH("en"),
    ARABIC("ar")
}

enum class SortOrder {
    NAME_AZ
}
`,
  },
  {
    path: 'app/src/main/java/com/musicplay/app/data/PreferencesManager.kt',
    language: 'kotlin',
    summary: 'DataStore Preferences persistence for Theme, Language, SortOrder, and Playlists',
    content: `package com.musicplay.app.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.json.JSONArray
import org.json.JSONObject

private val Context.dataStore by preferencesDataStore(name = "musicplay_prefs")

class PreferencesManager(private val context: Context) {

    private object Keys {
        val THEME_MODE = stringPreferencesKey("theme_mode")
        val LANGUAGE = stringPreferencesKey("language")
        val SORT_ORDER = stringPreferencesKey("sort_order")
        val PLAYLISTS_JSON = stringPreferencesKey("playlists_json")
    }

    val themeMode: Flow<AppThemeMode> = context.dataStore.data.map { prefs ->
        when (prefs[Keys.THEME_MODE]) {
            AppThemeMode.AMOLED_DARK.name -> AppThemeMode.AMOLED_DARK
            else -> AppThemeMode.LIGHT
        }
    }

    val language: Flow<AppLanguage> = context.dataStore.data.map { prefs ->
        when (prefs[Keys.LANGUAGE]) {
            AppLanguage.ARABIC.code -> AppLanguage.ARABIC
            else -> AppLanguage.ENGLISH
        }
    }

    val sortOrder: Flow<SortOrder> = context.dataStore.data.map { prefs ->
        when (prefs[Keys.SORT_ORDER]) {
            SortOrder.NAME_AZ.name -> SortOrder.NAME_AZ
            else -> SortOrder.NAME_AZ
        }
    }

    val playlists: Flow<List<Playlist>> = context.dataStore.data.map { prefs ->
        val raw = prefs[Keys.PLAYLISTS_JSON] ?: "[]"
        parsePlaylists(raw)
    }

    suspend fun setThemeMode(mode: AppThemeMode) {
        context.dataStore.edit { it[Keys.THEME_MODE] = mode.name }
    }

    suspend fun setLanguage(lang: AppLanguage) {
        context.dataStore.edit { it[Keys.LANGUAGE] = lang.code }
    }

    suspend fun setSortOrder(order: SortOrder) {
        context.dataStore.edit { it[Keys.SORT_ORDER] = order.name }
    }

    suspend fun savePlaylists(playlists: List<Playlist>) {
        val array = JSONArray()
        playlists.forEach { playlist ->
            val obj = JSONObject()
            obj.put("id", playlist.id)
            obj.put("name", playlist.name)
            val ids = JSONArray()
            playlist.songIds.forEach { ids.put(it) }
            obj.put("songIds", ids)
            array.put(obj)
        }
        context.dataStore.edit { it[Keys.PLAYLISTS_JSON] = array.toString() }
    }

    private fun parsePlaylists(json: String): List<Playlist> {
        return try {
            val array = JSONArray(json)
            buildList {
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    val idsArr = obj.getJSONArray("songIds")
                    val songIds = buildList {
                        for (j in 0 until idsArr.length()) {
                            add(idsArr.getLong(j))
                        }
                    }
                    add(
                        Playlist(
                            id = obj.getString("id"),
                            name = obj.getString("name"),
                            songIds = songIds
                        )
                    )
                }
            }
        } catch (_: Exception) {
            emptyList()
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/musicplay/app/data/MediaStoreScanner.kt',
    language: 'kotlin',
    summary: 'Zero-overhead offline MediaStore scanner with Rename & Delete support',
    content: `package com.musicplay.app.data

import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.os.Build
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class MediaStoreScanner(private val context: Context) {

    private val supportedExtensions = setOf("mp3", "m4a", "wav", "ogg", "flac", "aac", "opus")

    suspend fun scanLocalAudio(sortAlphabetically: Boolean = true): List<Song> =
        withContext(Dispatchers.IO) {
            val results = mutableListOf<Song>()
            val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
            } else {
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
            }

            // Minimal projection: excludes album art, album, and artist metadata to keep RAM/CPU low
            val projection = arrayOf(
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.DISPLAY_NAME,
                MediaStore.Audio.Media.DATA,
                MediaStore.Audio.Media.SIZE,
                MediaStore.Audio.Media.DURATION
            )

            val selection = "\${MediaStore.Audio.Media.IS_MUSIC} != 0 OR \${MediaStore.Audio.Media.MIME_TYPE} LIKE 'audio/%'"
            val sortOrder = if (sortAlphabetically) {
                "\${MediaStore.Audio.Media.DISPLAY_NAME} COLLATE NOCASE ASC"
            } else {
                null
            }

            context.contentResolver.query(
                collection,
                projection,
                selection,
                null,
                sortOrder
            )?.use { cursor ->
                val idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                val nameCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME)
                val dataCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
                val sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)
                val durCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)

                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idCol)
                    val displayName = cursor.getString(nameCol) ?: continue
                    val filePath = cursor.getString(dataCol) ?: ""
                    val ext = displayName.substringAfterLast('.', "").lowercase()
                    if (ext !in supportedExtensions) continue

                    val sizeBytes = cursor.getLong(sizeCol)
                    val durationMs = cursor.getLong(durCol)
                    if (durationMs <= 0L) continue

                    val cleanName = displayName.substringBeforeLast('.')
                    val contentUri = ContentUris.withAppendedId(collection, id)

                    results.add(
                        Song(
                            id = id,
                            name = cleanName,
                            uri = contentUri,
                            path = filePath,
                            sizeBytes = sizeBytes,
                            durationMs = durationMs,
                            format = ext.uppercase()
                        )
                    )
                }
            }

            if (sortAlphabetically) {
                results.sortedBy { it.name.lowercase() }
            } else {
                results
            }
        }

    suspend fun renameSong(song: Song, newName: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val trimmed = newName.trim()
            if (trimmed.isEmpty()) return@withContext false
            val newDisplayName = "\$trimmed.\${song.format.lowercase()}"
            val values = ContentValues().apply {
                put(MediaStore.Audio.Media.DISPLAY_NAME, newDisplayName)
            }
            context.contentResolver.update(song.uri, values, null, null) > 0
        } catch (_: SecurityException) {
            false
        }
    }

    suspend fun deleteSong(song: Song): Boolean = withContext(Dispatchers.IO) {
        try {
            context.contentResolver.delete(song.uri, null, null) > 0
        } catch (_: SecurityException) {
            false
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/musicplay/app/player/PlaybackService.kt',
    language: 'kotlin',
    summary: 'Media3 ExoPlayer service with Dark AMOLED notification and headphone/Bluetooth/0%-volume auto-stop',
    content: `package com.musicplay.app.player

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.bluetooth.BluetoothA2dp
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothHeadset
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.database.ContentObserver
import android.graphics.Color
import android.media.AudioManager
import android.media.audiofx.LoudnessEnhancer
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import androidx.core.app.NotificationCompat
import androidx.media.app.NotificationCompat.MediaStyle
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.musicplay.app.MainActivity
import com.musicplay.app.R

class PlaybackService : MediaSessionService() {

    private lateinit var player: ExoPlayer
    private var mediaSession: MediaSession? = null
    private var loudnessEnhancer: LoudnessEnhancer? = null
    private lateinit var audioManager: AudioManager
    private lateinit var notificationManager: NotificationManager

    companion object {
        const val CHANNEL_ID = "musicplay_playback_amoled"
        const val NOTIFICATION_ID = 1001
        const val ACTION_PREV = "com.musicplay.app.ACTION_PREV"
        const val ACTION_TOGGLE = "com.musicplay.app.ACTION_TOGGLE"
        const val ACTION_NEXT = "com.musicplay.app.ACTION_NEXT"
        const val ACTION_STOP = "com.musicplay.app.ACTION_STOP"
        const val ACTION_SET_BOOST = "com.musicplay.app.ACTION_SET_BOOST"
        const val EXTRA_VOLUME_PERCENT = "extra_volume_percent"
    }

    // Stops playback on wired headphone unplug or Bluetooth earphone disconnection
    private val hardwareDisconnectReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                AudioManager.ACTION_AUDIO_BECOMING_NOISY,
                BluetoothDevice.ACTION_ACL_DISCONNECTED -> {
                    stopPlaybackImmediately()
                }
                BluetoothA2dp.ACTION_CONNECTION_STATE_CHANGED,
                BluetoothHeadset.ACTION_CONNECTION_STATE_CHANGED -> {
                    val state = intent.getIntExtra(
                        android.bluetooth.BluetoothProfile.EXTRA_STATE,
                        android.bluetooth.BluetoothProfile.STATE_CONNECTED
                    )
                    if (state == android.bluetooth.BluetoothProfile.STATE_DISCONNECTED ||
                        state == android.bluetooth.BluetoothProfile.STATE_DISCONNECTING
                    ) {
                        stopPlaybackImmediately()
                    }
                }
            }
        }
    }

    // Stops playback immediately if system media volume drops to 0%
    private val volumeObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
        override fun onChange(selfChange: Boolean) {
            super.onChange(selfChange)
            val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
            if (currentVolume <= 0 && ::player.isInitialized && player.isPlaying) {
                stopPlaybackImmediately()
            }
        }
    }

    private fun stopPlaybackImmediately() {
        if (::player.isInitialized && player.isPlaying) {
            player.pause()
            updateAmoledNotification()
        }
    }

    override fun onCreate() {
        super.onCreate()
        audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        createNotificationChannel()

        val audioAttrs = AudioAttributes.Builder()
            .setUsage(C.USAGE_MEDIA)
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .build()

        player = ExoPlayer.Builder(this)
            .setAudioAttributes(audioAttrs, true)
            .setHandleAudioBecomingNoisy(true)
            .build()

        player.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                updateAmoledNotification()
            }

            override fun onMediaItemTransition(
                mediaItem: androidx.media3.common.MediaItem?,
                reason: Int
            ) {
                updateAmoledNotification()
            }
        })

        // Attach LoudnessEnhancer for 150% (+350 mB) and 200% (+600 mB) volume boost
        if (player.audioSessionId != C.AUDIO_SESSION_ID_UNSET) {
            loudnessEnhancer = runCatching {
                LoudnessEnhancer(player.audioSessionId).apply { enabled = false }
            }.getOrNull()
        }

        mediaSession = MediaSession.Builder(this, player).build()

        val filter = IntentFilter().apply {
            addAction(AudioManager.ACTION_AUDIO_BECOMING_NOISY)
            addAction(BluetoothDevice.ACTION_ACL_DISCONNECTED)
            addAction(BluetoothA2dp.ACTION_CONNECTION_STATE_CHANGED)
            addAction(BluetoothHeadset.ACTION_CONNECTION_STATE_CHANGED)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(hardwareDisconnectReceiver, filter, RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(hardwareDisconnectReceiver, filter)
        }

        contentResolver.registerContentObserver(
            Settings.System.CONTENT_URI,
            true,
            volumeObserver
        )
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_PREV -> if (player.hasPreviousMediaItem()) player.seekToPreviousMediaItem()
            ACTION_TOGGLE -> if (player.isPlaying) player.pause() else player.play()
            ACTION_NEXT -> if (player.hasNextMediaItem()) player.seekToNextMediaItem()
            ACTION_SET_BOOST -> {
                val volPercent = intent.getIntExtra(EXTRA_VOLUME_PERCENT, 100)
                applyBoostLevel(volPercent)
            }
            ACTION_STOP -> {
                player.stop()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
        return super.onStartCommand(intent, flags, startId)
    }

    private fun applyBoostLevel(volumePercent: Int) {
        val enhancer = loudnessEnhancer ?: return
        when {
            volumePercent >= 200 -> {
                enhancer.setTargetGain(600) // +6.0 dB (~200%)
                enhancer.enabled = true
            }
            volumePercent >= 150 -> {
                enhancer.setTargetGain(350) // +3.5 dB (~150%)
                enhancer.enabled = true
            }
            else -> {
                enhancer.setTargetGain(0)
                enhancer.enabled = false
            }
        }
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "MusicPlay Playback",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                setShowBadge(false)
                enableLights(false)
                enableVibration(false)
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun updateAmoledNotification() {
        val title = player.currentMediaItem?.mediaMetadata?.title?.toString()
            ?: getString(R.string.app_name)

        val openAppIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val prevPending = servicePendingIntent(ACTION_PREV, 1)
        val togglePending = servicePendingIntent(ACTION_TOGGLE, 2)
        val nextPending = servicePendingIntent(ACTION_NEXT, 3)

        val toggleIcon = if (player.isPlaying) {
            android.R.drawable.ic_media_pause
        } else {
            android.R.drawable.ic_media_play
        }

        // Pure AMOLED Black (#000000) background notification with track title & controls
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(title)
            .setContentText(getString(R.string.app_name))
            .setContentIntent(openAppIntent)
            .setColor(Color.BLACK)
            .setColorized(true)
            .setOngoing(player.isPlaying)
            .setSilent(true)
            .addAction(android.R.drawable.ic_media_previous, "Previous", prevPending)
            .addAction(toggleIcon, if (player.isPlaying) "Pause" else "Play", togglePending)
            .addAction(android.R.drawable.ic_media_next, "Next", nextPending)
            .setStyle(
                MediaStyle()
                    .setShowActionsInCompactView(0, 1, 2)
            )
            .build()

        if (player.isPlaying) {
            startForeground(NOTIFICATION_ID, notification)
        } else {
            notificationManager.notify(NOTIFICATION_ID, notification)
        }
    }

    private fun servicePendingIntent(action: String, requestCode: Int): PendingIntent {
        val intent = Intent(this, PlaybackService::class.java).apply { this.action = action }
        return PendingIntent.getService(
            this,
            requestCode,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
    }

    override fun onDestroy() {
        unregisterReceiver(hardwareDisconnectReceiver)
        contentResolver.unregisterContentObserver(volumeObserver)
        loudnessEnhancer?.release()
        loudnessEnhancer = null
        mediaSession?.run {
            player.release()
            release()
            mediaSession = null
        }
        super.onDestroy()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/musicplay/app/ui/theme/Theme.kt',
    language: 'kotlin',
    summary: 'Flat, zero-blur Light and pure #000000 AMOLED Dark Material3 theme',
    content: `package com.musicplay.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import com.musicplay.app.data.AppThemeMode

private val LightColors = lightColorScheme(
    primary = Color(0xFFDC2626),
    onPrimary = Color.White,
    background = Color(0xFFFFFFFF),
    onBackground = Color(0xFF111827),
    surface = Color(0xFFF8FAFC),
    onSurface = Color(0xFF111827),
    surfaceVariant = Color(0xFFF1F5F9),
    onSurfaceVariant = Color(0xFF475569),
    outline = Color(0xFFE2E8F0)
)

// True AMOLED pure #000000 black background for OLED battery savings on Adreno 610
private val AmoledDarkColors = darkColorScheme(
    primary = Color(0xFFEF4444),
    onPrimary = Color.White,
    background = Color(0xFF000000),
    onBackground = Color(0xFFF9FAFB),
    surface = Color(0xFF000000),
    onSurface = Color(0xFFF9FAFB),
    surfaceVariant = Color(0xFF121212),
    onSurfaceVariant = Color(0xFF9CA3AF),
    outline = Color(0xFF222222)
)

@Composable
fun MusicPlayTheme(
    themeMode: AppThemeMode,
    content: @Composable () -> Unit
) {
    val colors = when (themeMode) {
        AppThemeMode.LIGHT -> LightColors
        AppThemeMode.AMOLED_DARK -> AmoledDarkColors
    }

    MaterialTheme(
        colorScheme = colors,
        content = content
    )
}
`,
  },
  {
    path: 'app/src/main/java/com/musicplay/app/ui/MusicPlayViewModel.kt',
    language: 'kotlin',
    summary: 'Lightweight MVVM ViewModel managing scan, playback, volume, selection, playlists, and DataStore',
    content: `package com.musicplay.app.ui

import android.app.Application
import android.content.ComponentName
import android.content.Context
import android.media.AudioManager
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.musicplay.app.data.AppLanguage
import com.musicplay.app.data.AppThemeMode
import com.musicplay.app.data.MediaStoreScanner
import com.musicplay.app.data.Playlist
import com.musicplay.app.data.PreferencesManager
import com.musicplay.app.data.Song
import com.musicplay.app.data.SortOrder
import com.musicplay.app.player.PlaybackService
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MusicPlayViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = PreferencesManager(application)
    private val scanner = MediaStoreScanner(application)
    private val audioManager = application.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    private var mediaController: MediaController? = null

    val themeMode: StateFlow<AppThemeMode> = prefs.themeMode
        .stateIn(viewModelScope, SharingStarted.Eagerly, AppThemeMode.LIGHT)

    val language: StateFlow<AppLanguage> = prefs.language
        .stateIn(viewModelScope, SharingStarted.Eagerly, AppLanguage.ENGLISH)

    val playlists: StateFlow<List<Playlist>> = prefs.playlists
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    private val _songs = MutableStateFlow<List<Song>>(emptyList())
    val songs: StateFlow<List<Song>> = _songs.asStateFlow()

    private val _currentSongId = MutableStateFlow<Long?>(null)
    val currentSongId: StateFlow<Long?> = _currentSongId.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _positionMs = MutableStateFlow(0L)
    val positionMs: StateFlow<Long> = _positionMs.asStateFlow()

    private val _durationMs = MutableStateFlow(0L)
    val durationMs: StateFlow<Long> = _durationMs.asStateFlow()

    private val _volumePercent = MutableStateFlow(readCurrentVolumePercent())
    val volumePercent: StateFlow<Int> = _volumePercent.asStateFlow()

    private val _isSelectionMode = MutableStateFlow(false)
    val isSelectionMode: StateFlow<Boolean> = _isSelectionMode.asStateFlow()

    private val _selectedSongIds = MutableStateFlow<Set<Long>>(emptySet())
    val selectedSongIds: StateFlow<Set<Long>> = _selectedSongIds.asStateFlow()

    init {
        connectMediaController()
        startProgressTicker()
    }

    private fun connectMediaController() {
        val context = getApplication<Application>()
        val token = SessionToken(context, ComponentName(context, PlaybackService::class.java))
        val future = MediaController.Builder(context, token).buildAsync()
        future.addListener({
            val controller = future.get()
            mediaController = controller
            controller.addListener(object : Player.Listener {
                override fun onIsPlayingChanged(isPlaying: Boolean) {
                    _isPlaying.value = isPlaying
                }

                override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                    _currentSongId.value = mediaItem?.mediaId?.toLongOrNull()
                    _durationMs.value = controller.duration.coerceAtLeast(0L)
                }
            })
        }, { it.run() })
    }

    private fun startProgressTicker() {
        viewModelScope.launch {
            while (true) {
                mediaController?.let { controller ->
                    if (controller.isPlaying) {
                        _positionMs.value = controller.currentPosition.coerceAtLeast(0L)
                        _durationMs.value = controller.duration.coerceAtLeast(0L)
                    }
                }
                delay(500L)
            }
        }
    }

    fun scanOnLaunch() {
        viewModelScope.launch {
            val sortOrder = prefs.sortOrder.first()
            _songs.value = scanner.scanLocalAudio(sortOrder == SortOrder.NAME_AZ)
        }
    }

    fun manualRescan(onCompleted: (addedCount: Int) -> Unit) {
        viewModelScope.launch {
            val previousIds = _songs.value.map { it.id }.toSet()
            val scanned = scanner.scanLocalAudio(sortAlphabetically = true)
            _songs.value = scanned
            val addedCount = scanned.count { it.id !in previousIds }
            onCompleted(addedCount)
        }
    }

    fun sortSongsAZ() {
        viewModelScope.launch {
            prefs.setSortOrder(SortOrder.NAME_AZ)
            _songs.value = _songs.value.sortedBy { it.name.lowercase() }
        }
    }

    fun togglePlaySong(song: Song, queue: List<Song> = _songs.value) {
        val controller = mediaController ?: return
        if (_currentSongId.value == song.id) {
            if (controller.isPlaying) {
                controller.pause()
            } else {
                if (_volumePercent.value == 0) return
                controller.play()
            }
            return
        }
        playQueue(queue, startIndex = queue.indexOfFirst { it.id == song.id }.coerceAtLeast(0))
    }

    fun playQueue(queue: List<Song>, startIndex: Int = 0) {
        val controller = mediaController ?: return
        if (queue.isEmpty()) return
        val mediaItems = queue.map { song ->
            MediaItem.Builder()
                .setMediaId(song.id.toString())
                .setUri(song.uri)
                .setMediaMetadata(MediaMetadata.Builder().setTitle(song.name).build())
                .build()
        }
        controller.setMediaItems(mediaItems, startIndex, 0L)
        controller.prepare()
        if (_volumePercent.value > 0) {
            controller.play()
        }
        _currentSongId.value = queue[startIndex].id
    }

    fun togglePlayPause() {
        val controller = mediaController ?: return
        if (controller.isPlaying) {
            controller.pause()
        } else if (_volumePercent.value > 0) {
            controller.play()
        }
    }

    fun skipNext() {
        mediaController?.seekToNextMediaItem()
    }

    fun skipPrevious() {
        mediaController?.seekToPreviousMediaItem()
    }

    fun seekTo(positionMs: Long) {
        mediaController?.seekTo(positionMs)
        _positionMs.value = positionMs
    }

    fun setVolumePercent(percent: Int) {
        val clamped = percent.coerceIn(0, 200)
        _volumePercent.value = clamped
        val maxVol = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
        val systemRatio = clamped.coerceAtMost(100) / 100f
        val targetVol = (systemRatio * maxVol).toInt()
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, targetVol, 0)

        // Apply hardware LoudnessEnhancer boost (150% -> 200%) inside PlaybackService
        val context = getApplication<Application>()
        val boostIntent = android.content.Intent(context, PlaybackService::class.java).apply {
            action = PlaybackService.ACTION_SET_BOOST
            putExtra(PlaybackService.EXTRA_VOLUME_PERCENT, clamped)
        }
        context.startService(boostIntent)

        if (clamped == 0) {
            mediaController?.pause()
        }
    }

    fun enterSelectionMode(initialId: Long? = null) {
        _isSelectionMode.value = true
        if (initialId != null) {
            _selectedSongIds.value = setOf(initialId)
        }
    }

    fun exitSelectionMode() {
        _isSelectionMode.value = false
        _selectedSongIds.value = emptySet()
    }

    fun toggleSongSelection(songId: Long) {
        val current = _selectedSongIds.value.toMutableSet()
        if (songId in current) current.remove(songId) else current.add(songId)
        _selectedSongIds.value = current
    }

    fun createPlaylist(name: String, songIds: List<Long>) {
        val trimmed = name.trim()
        if (trimmed.isEmpty()) return
        viewModelScope.launch {
            val updated = playlists.value + Playlist(
                id = System.currentTimeMillis().toString(),
                name = trimmed,
                songIds = songIds
            )
            prefs.savePlaylists(updated)
            exitSelectionMode()
        }
    }

    fun renameSong(song: Song, newName: String) {
        viewModelScope.launch {
            if (scanner.renameSong(song, newName)) {
                _songs.value = scanner.scanLocalAudio(sortAlphabetically = true)
            }
        }
    }

    fun deleteSongs(targets: List<Song>) {
        viewModelScope.launch {
            targets.forEach { scanner.deleteSong(it) }
            val deletedIds = targets.map { it.id }.toSet()
            _songs.value = _songs.value.filterNot { it.id in deletedIds }
            exitSelectionMode()
        }
    }

    fun setThemeMode(mode: AppThemeMode) {
        viewModelScope.launch { prefs.setThemeMode(mode) }
    }

    fun setLanguage(lang: AppLanguage) {
        viewModelScope.launch { prefs.setLanguage(lang) }
    }

    private fun readCurrentVolumePercent(): Int {
        val current = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
        val max = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC).coerceAtLeast(1)
        return ((current.toFloat() / max.toFloat()) * 100f).toInt()
    }

    override fun onCleared() {
        mediaController?.release()
        super.onCleared()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/musicplay/app/ui/MusicPlayScreen.kt',
    language: 'kotlin',
    summary: 'Single-screen Jetpack Compose UI optimized for Snapdragon 662 + Adreno 610',
    content: `package com.musicplay.app.ui

import android.widget.Toast
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.musicplay.app.R
import com.musicplay.app.data.AppLanguage
import com.musicplay.app.data.AppThemeMode
import com.musicplay.app.data.Song

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun MusicPlayScreen(viewModel: MusicPlayViewModel) {
    val context = LocalContext.current
    val songs by viewModel.songs.collectAsState()
    val currentSongId by viewModel.currentSongId.collectAsState()
    val isPlaying by viewModel.isPlaying.collectAsState()
    val positionMs by viewModel.positionMs.collectAsState()
    val durationMs by viewModel.durationMs.collectAsState()
    val volumePercent by viewModel.volumePercent.collectAsState()
    val isSelectionMode by viewModel.isSelectionMode.collectAsState()
    val selectedIds by viewModel.selectedSongIds.collectAsState()
    val themeMode by viewModel.themeMode.collectAsState()
    val language by viewModel.language.collectAsState()

    var showOverflowMenu by remember { mutableStateOf(false) }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var showPlaylistDialog by remember { mutableStateOf(false) }
    var sheetSong by remember { mutableStateOf<Song?>(null) }
    var renameTarget by remember { mutableStateOf<Song?>(null) }
    var infoTarget by remember { mutableStateOf<Song?>(null) }
    var deleteTargets by remember { mutableStateOf<List<Song>>(emptyList()) }

    val currentSong = songs.firstOrNull { it.id == currentSongId }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                ),
                title = {
                    Text(
                        text = if (isSelectionMode) {
                            "\${selectedIds.size}"
                        } else {
                            stringResource(R.string.app_name)
                        },
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                },
                actions = {
                    // Ordered right-to-left: Settings (far right), Circular Search, Refresh, Three-dots
                    Box {
                        IconButton(onClick = { showOverflowMenu = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "More")
                        }
                        DropdownMenu(
                            expanded = showOverflowMenu,
                            onDismissRequest = { showOverflowMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text(stringResource(R.string.select)) },
                                onClick = {
                                    showOverflowMenu = false
                                    viewModel.enterSelectionMode()
                                }
                            )
                            DropdownMenuItem(
                                text = { Text(stringResource(R.string.create_playlist)) },
                                onClick = {
                                    showOverflowMenu = false
                                    showPlaylistDialog = true
                                }
                            )
                            DropdownMenuItem(
                                text = { Text(stringResource(R.string.sort_songs)) },
                                onClick = {
                                    showOverflowMenu = false
                                    viewModel.sortSongsAZ()
                                }
                            )
                        }
                    }

                    IconButton(onClick = {
                        viewModel.manualRescan { added ->
                            val msg = if (added > 0) {
                                context.getString(R.string.songs_added_format, added)
                            } else {
                                context.getString(R.string.no_new_songs)
                            }
                            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                        }
                    }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }

                    IconButton(
                        onClick = {
                            viewModel.manualRescan { added ->
                                val msg = if (added > 0) {
                                    context.getString(R.string.songs_added_format, added)
                                } else {
                                    context.getString(R.string.no_new_songs)
                                }
                                Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                            }
                        },
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .border(1.dp, MaterialTheme.colorScheme.outline, CircleShape)
                    ) {
                        Icon(Icons.Default.Search, contentDescription = "Scan")
                    }

                    IconButton(onClick = { showSettingsDialog = true }) {
                        Icon(Icons.Default.Settings, contentDescription = stringResource(R.string.settings))
                    }
                }
            )
        },
        bottomBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                HorizontalDivider(color = MaterialTheme.colorScheme.outline)
                if (currentSong != null) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = currentSong.name,
                            modifier = Modifier.weight(1f),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            style = MaterialTheme.typography.bodyMedium
                        )
                        IconButton(onClick = { viewModel.skipPrevious() }) {
                            Icon(Icons.Default.SkipPrevious, contentDescription = "Previous")
                        }
                        IconButton(onClick = { viewModel.togglePlayPause() }) {
                            Icon(
                                if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = "Play/Pause"
                            )
                        }
                        IconButton(onClick = { viewModel.skipNext() }) {
                            Icon(Icons.Default.SkipNext, contentDescription = "Next")
                        }
                    }

                    // Track progress bar
                    Slider(
                        value = if (durationMs > 0) positionMs.toFloat() / durationMs.toFloat() else 0f,
                        onValueChange = { ratio ->
                            viewModel.seekTo((ratio * durationMs).toLong())
                        },
                        modifier = Modifier.padding(horizontal = 12.dp)
                    )
                }

                // Bottom Volume Control Bar (0% stops music; past 100% boosts 150% -> 200%)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        if (volumePercent == 0) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                        contentDescription = stringResource(R.string.volume),
                        tint = if (volumePercent > 100) {
                            MaterialTheme.colorScheme.primary
                        } else {
                            MaterialTheme.colorScheme.onSurface
                        },
                        modifier = Modifier.size(20.dp)
                    )
                    Slider(
                        value = volumePercent.toFloat(),
                        onValueChange = { raw ->
                            val v = raw.toInt()
                            val normalized = when {
                                v <= 100 -> v
                                v <= 150 -> 150
                                else -> 200
                            }
                            viewModel.setVolumePercent(normalized)
                        },
                        valueRange = 0f..200f,
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 8.dp)
                    )
                    TextButton(
                        onClick = {
                            val next = when {
                                volumePercent < 100 -> 100
                                volumePercent == 100 -> 150
                                volumePercent == 150 -> 200
                                else -> 100
                            }
                            viewModel.setVolumePercent(next)
                            if (next > 100) {
                                Toast.makeText(
                                    context,
                                    context.getString(R.string.volume_boost_format, next),
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                        }
                    ) {
                        Text(
                            text = "$volumePercent%",
                            color = if (volumePercent > 100) {
                                MaterialTheme.colorScheme.primary
                            } else {
                                MaterialTheme.colorScheme.onSurface
                            },
                            style = MaterialTheme.typography.labelMedium
                        )
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (isSelectionMode) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = {
                        val chosen = songs.filter { it.id in selectedIds }
                        viewModel.playQueue(chosen)
                        viewModel.exitSelectionMode()
                    }) {
                        Text(stringResource(R.string.play_selected))
                    }
                    TextButton(onClick = { showPlaylistDialog = true }) {
                        Text(stringResource(R.string.add_to_playlist))
                    }
                    TextButton(onClick = {
                        deleteTargets = songs.filter { it.id in selectedIds }
                    }) {
                        Text(stringResource(R.string.delete))
                    }
                    IconButton(onClick = { viewModel.exitSelectionMode() }) {
                        Icon(Icons.Default.Close, contentDescription = stringResource(R.string.cancel))
                    }
                }
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize()
            ) {
                items(songs, key = { it.id }) { song ->
                    val isCurrent = song.id == currentSongId
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .combinedClickable(
                                onClick = {
                                    if (isSelectionMode) {
                                        viewModel.toggleSongSelection(song.id)
                                    } else {
                                        viewModel.togglePlaySong(song)
                                    }
                                },
                                onLongClick = { sheetSong = song }
                            )
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (isSelectionMode) {
                            Checkbox(
                                checked = song.id in selectedIds,
                                onCheckedChange = { viewModel.toggleSongSelection(song.id) }
                            )
                            Spacer(Modifier.width(8.dp))
                        }

                        // Song name ONLY (no album, no artist, no images)
                        Text(
                            text = song.name,
                            modifier = Modifier.weight(1f),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            color = if (isCurrent) {
                                MaterialTheme.colorScheme.primary
                            } else {
                                MaterialTheme.colorScheme.onBackground
                            }
                        )

                        IconButton(
                            onClick = { viewModel.togglePlaySong(song) },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = if (isCurrent && isPlaying) {
                                    Icons.Default.Pause
                                } else {
                                    Icons.Default.PlayArrow
                                },
                                contentDescription = null
                            )
                        }
                    }
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline)
                }
            }
        }
    }

    // Long-press BottomSheet: Rename, Info, Delete
    sheetSong?.let { target ->
        ModalBottomSheet(onDismissRequest = { sheetSong = null }) {
            Column(modifier = Modifier.padding(bottom = 24.dp)) {
                ListItem(
                    headlineContent = { Text(stringResource(R.string.rename)) },
                    modifier = Modifier.combinedClickable(onClick = {
                        renameTarget = target
                        sheetSong = null
                    })
                )
                ListItem(
                    headlineContent = { Text(stringResource(R.string.info)) },
                    modifier = Modifier.combinedClickable(onClick = {
                        infoTarget = target
                        sheetSong = null
                    })
                )
                ListItem(
                    headlineContent = { Text(stringResource(R.string.delete)) },
                    modifier = Modifier.combinedClickable(onClick = {
                        deleteTargets = listOf(target)
                        sheetSong = null
                    })
                )
            }
        }
    }

    // Rename Dialog
    renameTarget?.let { target ->
        var text by remember(target) { mutableStateOf(target.name) }
        AlertDialog(
            onDismissRequest = { renameTarget = null },
            title = { Text(stringResource(R.string.rename)) },
            text = {
                OutlinedTextField(value = text, onValueChange = { text = it }, singleLine = true)
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.renameSong(target, text)
                    renameTarget = null
                }) { Text(stringResource(R.string.save)) }
            },
            dismissButton = {
                TextButton(onClick = { renameTarget = null }) {
                    Text(stringResource(R.string.cancel))
                }
            }
        )
    }

    // Info Dialog (Path, Size, Duration, Format)
    infoTarget?.let { target ->
        AlertDialog(
            onDismissRequest = { infoTarget = null },
            title = { Text(target.name) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Path: \${target.path}")
                    Text("Size: \${target.sizeBytes / 1024} KB")
                    Text("Duration: \${target.durationMs / 1000}s")
                    Text("Format: \${target.format}")
                }
            },
            confirmButton = {
                TextButton(onClick = { infoTarget = null }) {
                    Text(stringResource(R.string.close))
                }
            }
        )
    }

    // Delete Confirmation Dialog
    if (deleteTargets.isNotEmpty()) {
        AlertDialog(
            onDismissRequest = { deleteTargets = emptyList() },
            title = { Text(stringResource(R.string.delete_confirm_title)) },
            text = { Text(stringResource(R.string.delete_confirm_message)) },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteSongs(deleteTargets)
                    deleteTargets = emptyList()
                }) { Text(stringResource(R.string.delete)) }
            },
            dismissButton = {
                TextButton(onClick = { deleteTargets = emptyList() }) {
                    Text(stringResource(R.string.cancel))
                }
            }
        )
    }

    // Create Playlist Dialog
    if (showPlaylistDialog) {
        var playlistName by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showPlaylistDialog = false },
            title = { Text(stringResource(R.string.create_playlist)) },
            text = {
                OutlinedTextField(
                    value = playlistName,
                    onValueChange = { playlistName = it },
                    singleLine = true
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.createPlaylist(playlistName, selectedIds.toList())
                    showPlaylistDialog = false
                }) { Text(stringResource(R.string.save)) }
            },
            dismissButton = {
                TextButton(onClick = { showPlaylistDialog = false }) {
                    Text(stringResource(R.string.cancel))
                }
            }
        )
    }

    // Settings Dialog (Language Arabic/English + Theme Light/AMOLED Dark)
    if (showSettingsDialog) {
        AlertDialog(
            onDismissRequest = { showSettingsDialog = false },
            title = { Text(stringResource(R.string.settings)) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(stringResource(R.string.language))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = language == AppLanguage.ENGLISH,
                            onClick = { viewModel.setLanguage(AppLanguage.ENGLISH) },
                            label = { Text("English") }
                        )
                        FilterChip(
                            selected = language == AppLanguage.ARABIC,
                            onClick = { viewModel.setLanguage(AppLanguage.ARABIC) },
                            label = { Text("العربية") }
                        )
                    }
                    Text(stringResource(R.string.theme))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = themeMode == AppThemeMode.LIGHT,
                            onClick = { viewModel.setThemeMode(AppThemeMode.LIGHT) },
                            label = { Text(stringResource(R.string.light)) }
                        )
                        FilterChip(
                            selected = themeMode == AppThemeMode.AMOLED_DARK,
                            onClick = { viewModel.setThemeMode(AppThemeMode.AMOLED_DARK) },
                            label = { Text(stringResource(R.string.amoled_dark)) }
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showSettingsDialog = false }) {
                    Text(stringResource(R.string.close))
                }
            }
        )
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/musicplay/app/MainActivity.kt',
    language: 'kotlin',
    summary: 'Activity handling audio permissions, auto-scan on launch, and instant RTL/LTR switching',
    content: `package com.musicplay.app

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.core.content.ContextCompat
import com.musicplay.app.data.AppLanguage
import com.musicplay.app.ui.MusicPlayScreen
import com.musicplay.app.ui.MusicPlayViewModel
import com.musicplay.app.ui.theme.MusicPlayTheme
import java.util.Locale

class MainActivity : ComponentActivity() {

    private val viewModel: MusicPlayViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            val themeMode by viewModel.themeMode.collectAsState()
            val language by viewModel.language.collectAsState()

            val audioPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                Manifest.permission.READ_MEDIA_AUDIO
            } else {
                Manifest.permission.READ_EXTERNAL_STORAGE
            }

            val permissionLauncher = rememberLauncherForActivityResult(
                ActivityResultContracts.RequestPermission()
            ) { granted ->
                if (granted) {
                    viewModel.scanOnLaunch()
                }
            }

            LaunchedEffect(Unit) {
                val hasPermission = ContextCompat.checkSelfPermission(
                    this@MainActivity,
                    audioPermission
                ) == PackageManager.PERMISSION_GRANTED

                if (hasPermission) {
                    viewModel.scanOnLaunch()
                } else {
                    permissionLauncher.launch(audioPermission)
                }
            }

            val localizedContext = remember(language) {
                updateLocale(this@MainActivity, language)
            }
            val layoutDirection = if (language == AppLanguage.ARABIC) {
                LayoutDirection.Rtl
            } else {
                LayoutDirection.Ltr
            }

            CompositionLocalProvider(
                LocalContext provides localizedContext,
                LocalLayoutDirection provides layoutDirection
            ) {
                MusicPlayTheme(themeMode = themeMode) {
                    MusicPlayScreen(viewModel = viewModel)
                }
            }
        }
    }

    private fun updateLocale(base: Context, language: AppLanguage): Context {
        val locale = Locale(language.code)
        Locale.setDefault(locale)
        val config = Configuration(base.resources.configuration)
        config.setLocale(locale)
        return base.createConfigurationContext(config)
    }
}
`,
  },
];
