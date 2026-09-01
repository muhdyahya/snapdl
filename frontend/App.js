import { useCallback, useEffect, useMemo, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "@social_saver_history_v1";
const BACKEND_URL_KEY = "@social_saver_backend_url_v1";
const DEFAULT_API_BASE_URL = "http://192.168.0.23:8000";

const PLATFORM_META = [
  {
    name: "TikTok",
    key: "tiktok",
    short: "TT",
    matches: ["tiktok.com"],
    colors: ["#ff0050", "#00f2fe"],
  },
  {
    name: "Instagram",
    key: "instagram",
    short: "IG",
    matches: ["instagram.com"],
    colors: ["#833ab4", "#fd1d1d"],
  },
  {
    name: "YouTube",
    key: "youtube",
    short: "YT",
    matches: ["youtube.com", "youtu.be"],
    colors: ["#ff0033", "#ff6b6b"],
  },
  {
    name: "X / Twitter",
    key: "twitter",
    short: "X",
    matches: ["twitter.com", "x.com"],
    colors: ["#111827", "#64748b"],
  },
  {
    name: "Facebook",
    key: "facebook",
    short: "FB",
    matches: ["facebook.com", "fb.watch"],
    colors: ["#1877f2", "#42a5f5"],
  },
  {
    name: "Reddit",
    key: "reddit",
    short: "RD",
    matches: ["reddit.com"],
    colors: ["#ff4500", "#ff8a00"],
  },
];

const QUALITY_OPTIONS = [
  { value: "1080p", label: "1080p", detail: "Best detail" },
  { value: "720p", label: "720p", detail: "Balanced" },
  { value: "480p", label: "480p", detail: "Small file" },
];
const FPS_OPTIONS = [
  { value: "60fps", label: "60 FPS" },
  { value: "30fps", label: "30 FPS" },
];
const BITRATE_OPTIONS = [
  { value: "320kbps", label: "320 kbps", detail: "High quality" },
  { value: "192kbps", label: "192 kbps", detail: "Balanced" },
  { value: "128kbps", label: "128 kbps", detail: "Small file" },
];

function normalizeBaseUrl(value) {
  return (value || "").trim().replace(/\/+$/, "");
}
function isHttpUrl(value) {
  return /^https?:\/\//i.test((value || "").trim());
}
function detectPlatform(inputUrl) {
  const lowerUrl = (inputUrl || "").toLowerCase();
  return (
    PLATFORM_META.find((item) =>
      item.matches.some((domain) => lowerUrl.includes(domain)),
    ) || null
  );
}
function sanitizeFileName(value, fallback = "SocialSaver_Media") {
  const base = (value || fallback)
    .replace(/[^a-z0-9._-]+/gi, "_")
    .replace(/^_+|_+$/g, "");
  return base || fallback;
}
function parseJsonSafely(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function GradientIcon({ icon, colors = ["#6366f1", "#06b6d4"], size = 48 }) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientIcon, { width: size, height: size }]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={Math.round(size * 0.52)}
        color="#ffffff"
      />
    </LinearGradient>
  );
}

function PrimaryButton({ label, icon, onPress, disabled, loading }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryButtonWrap,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      <LinearGradient
        colors={disabled ? ["#334155", "#1e293b"] : ["#4f46e5", "#0891b2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.primaryButton}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <MaterialCommunityIcons name={icon} size={19} color="#ffffff" />
        )}
        <Text style={styles.primaryButtonText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function OptionButton({ active, label, detail, icon, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionButton,
        active && styles.optionButtonActive,
        pressed && styles.pressed,
      ]}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={active ? "#ffffff" : "#94a3b8"}
        />
      ) : null}
      <View style={styles.optionTextBlock}>
        <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
          {label}
        </Text>
        {detail ? (
          <Text
            style={[styles.optionDetail, active && styles.optionDetailActive]}
          >
            {detail}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function SectionTitle({ label }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}
function SettingSwitch({ icon, label, value, onChange }) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchLabelRow}>
        <MaterialCommunityIcons name={icon} size={18} color="#94a3b8" />
        <Text style={styles.switchLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? "#ffffff" : "#cbd5e1"}
        trackColor={{ false: "#334155", true: "#0891b2" }}
      />
    </View>
  );
}

function ProgressCard({ state, progress, message }) {
  if (state === "idle") return null;
  const isDone = state === "success";
  const isError = state === "error";
  return (
    <View style={[styles.progressCard, isError && styles.progressCardError]}>
      <View style={styles.progressHeader}>
        <Text
          style={[
            styles.progressStage,
            isDone && styles.successText,
            isError && styles.errorText,
          ]}
        >
          {state}
        </Text>
        <Text style={styles.progressPercent}>
          {Math.max(0, Math.min(100, progress))}%
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.max(0, Math.min(100, progress))}%` },
            isError && styles.progressFillError,
          ]}
        />
      </View>
      <View style={styles.progressStatusRow}>
        {isDone ? (
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={16}
            color="#34d399"
          />
        ) : isError ? (
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={16}
            color="#fb7185"
          />
        ) : (
          <ActivityIndicator color="#22d3ee" size="small" />
        )}
        <Text style={styles.progressMessage}>{message}</Text>
      </View>
    </View>
  );
}

function PlatformBanner({ platform }) {
  if (!platform) return null;
  return (
    <LinearGradient
      colors={platform.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.platformBanner}
    >
      <View style={styles.platformInner}>
        <View style={styles.platformShortBox}>
          <Text style={styles.platformShort}>{platform.short}</Text>
        </View>
        <Text style={styles.platformText}>
          Source detected: {platform.name}
        </Text>
      </View>
      <MaterialCommunityIcons name="auto-fix" size={18} color="#ffffff" />
    </LinearGradient>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "download", label: "Downloader", icon: "download" },
    { key: "history", label: "History", icon: "history" },
    { key: "backend", label: "Backend", icon: "server-network" },
    { key: "guide", label: "Guide", icon: "help-circle-outline" },
  ];
  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={({ pressed }) => [
              styles.navItem,
              active && styles.navItemActive,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={21}
              color={active ? "#ffffff" : "#94a3b8"}
            />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE_URL);
  const [backendState, setBackendState] = useState("unknown");
  const [backendInfo, setBackendInfo] = useState(null);
  const [backendError, setBackendError] = useState("");
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("mp4");
  const [quality, setQuality] = useState("1080p");
  const [fps, setFps] = useState("60fps");
  const [audioBitrate, setAudioBitrate] = useState("320kbps");
  const [muteAudio, setMuteAudio] = useState(false);
  const [includeAlbumArt, setIncludeAlbumArt] = useState(true);
  const [downloadState, setDownloadState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("download");
  const [historyList, setHistoryList] = useState([]);

  const detectedPlatform = useMemo(() => detectPlatform(url), [url]);
  const showOptions = isHttpUrl(url);
  const isBusy = !["idle", "success", "error"].includes(downloadState);

  const persistHistory = useCallback(async (items) => {
    setHistoryList(items);
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("History persistence failed", error);
    }
  }, []);

  const persistBackendUrl = useCallback(async (value) => {
    const trimmedValue = normalizeBaseUrl(value || "");
    try {
      await AsyncStorage.setItem(BACKEND_URL_KEY, trimmedValue);
    } catch (error) {
      console.warn("Backend URL persistence failed", error);
    }
    return trimmedValue;
  }, []);

  const checkBackend = useCallback(
    async (overrideBaseUrl) => {
      const baseUrl = normalizeBaseUrl(overrideBaseUrl || apiBaseUrl);
      if (!baseUrl) {
        setBackendState("offline");
        setBackendError("Backend URL is empty.");
        return false;
      }
      setBackendState("checking");
      setBackendError("");
      try {
        const response = await fetch(`${baseUrl}/api/health`);
        const text = await response.text();
        const data = parseJsonSafely(text) || {};
        if (!response.ok)
          throw new Error(data.detail || `Backend returned ${response.status}`);
        setBackendInfo(data);
        setBackendState("online");
        return true;
      } catch (err) {
        setBackendInfo(null);
        setBackendState("offline");
        setBackendError(err.message || "Cannot reach FastAPI backend.");
        return false;
      }
    },
    [apiBaseUrl],
  );

  const handleBackendCheck = useCallback(async () => {
    const storedUrl = await persistBackendUrl(apiBaseUrl);
    return checkBackend(storedUrl);
  }, [apiBaseUrl, checkBackend, persistBackendUrl]);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        const [savedHistory, savedBackendUrl] = await Promise.all([
          AsyncStorage.getItem(HISTORY_KEY),
          AsyncStorage.getItem(BACKEND_URL_KEY),
        ]);

        if (savedHistory && isMounted) {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) setHistoryList(parsed);
        }

        if (savedBackendUrl && isMounted) {
          setApiBaseUrl(savedBackendUrl);
        }

        if (isMounted) {
          // Don't wait for backend check - let it happen in background
          checkBackend(savedBackendUrl || DEFAULT_API_BASE_URL);
        }
      } catch {
        if (isMounted) setHistoryList([]);
      }

      if (isMounted) {
        try {
          await SplashScreen.hideAsync();
        } catch {
          // Splash screen may already be hidden.
        }
      }
    }

    void SplashScreen.preventAutoHideAsync().catch(() => undefined);
    void initialize();

    return () => {
      isMounted = false;
    };
  }, [checkBackend]);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setUrl(text.trim());
        setError("");
      } else {
        setError("Clipboard is empty. Copy a social media link first.");
      }
    } catch {
      setError("Clipboard permission failed. Paste the link manually.");
    }
  };

  const buildPayload = () => ({
    url: url.trim(),
    format,
    quality,
    fps,
    audioBitrate,
    muteAudio,
    includeAlbumArt,
  });

  const addHistoryItem = async (data, localUri) => {
    const historyItem = {
      id: `${Date.now()}`,
      title: data.title || "Downloaded media",
      platform: detectedPlatform
        ? detectedPlatform.name
        : data.platform || "Media source",
      format: format.toUpperCase(),
      quality: format === "mp4" ? `${quality} ${fps}` : audioBitrate,
      date: new Date().toLocaleString(),
      localUri,
    };
    await persistHistory([historyItem, ...historyList].slice(0, 40));
  };

  const saveOrShareFile = async (fileUri, fileName) => {
    let savedToLibrary = false;
    if (format === "mp4") {
      try {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          await MediaLibrary.createAlbumAsync("Social Saver Pro", asset, false);
          savedToLibrary = true;
        }
      } catch {
        savedToLibrary = false;
      }
    }
    if (!savedToLibrary) {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: `Save ${fileName}`,
          mimeType: format === "mp4" ? "video/mp4" : "audio/mpeg",
          UTI: format === "mp4" ? "public.mpeg-4" : "public.mp3",
        });
      } else {
        Alert.alert(
          "Download complete",
          `Saved inside the app files as ${fileName}.`,
        );
      }
    }
    return savedToLibrary;
  };

  const triggerDownload = async () => {
    if (!isHttpUrl(url)) {
      setError("Paste a valid http or https social media URL first.");
      return;
    }
    const baseUrl = normalizeBaseUrl(apiBaseUrl);
    setError("");
    setProgress(5);
    setDownloadState("analyzing");
    setStatusMessage("Checking backend and extracting media metadata...");
    try {
      const backendOnline = await checkBackend();
      if (!backendOnline)
        throw new Error(
          "FastAPI backend is offline. Start it and set the correct device-accessible API URL.",
        );
      const response = await fetch(`${baseUrl}/api/get-video-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const text = await response.text();
      const data = parseJsonSafely(text) || {};
      if (!response.ok)
        throw new Error(data.detail || "Backend extraction failed.");
      if (!data.download_id && !data.download_url)
        throw new Error("Backend did not return a downloadable media job.");

      setProgress(30);
      setDownloadState("preparing");
      setStatusMessage("Backend prepared a real yt-dlp download job...");
      await delay(250);

      const extension = format === "mp4" ? "mp4" : "mp3";
      const fileName = sanitizeFileName(
        data.filename || `${data.title || "SocialSaver_Media"}.${extension}`,
      );
      const targetDirectory =
        FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const targetUri = `${targetDirectory}${fileName}`;
      const downloadUrl = data.download_id
        ? `${baseUrl}/api/download/${data.download_id}`
        : data.download_url;

      setDownloadState("downloading");
      setStatusMessage("Downloading the media file to this device...");
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        targetUri,
        {},
        (downloadProgress) => {
          const total = downloadProgress.totalBytesExpectedToWrite || 0;
          const written = downloadProgress.totalBytesWritten || 0;
          if (total > 0)
            setProgress(Math.min(94, 35 + Math.round((written / total) * 58)));
          else setProgress((current) => Math.min(88, current + 1));
        },
      );
      const result = await downloadResumable.downloadAsync();
      if (!result?.uri) throw new Error("Native file download failed.");

      setProgress(96);
      setDownloadState("saving");
      setStatusMessage(
        "Saving to the device or opening the native save sheet...",
      );
      const savedToLibrary = await saveOrShareFile(result.uri, fileName);
      await addHistoryItem(data, result.uri);
      setProgress(100);
      setDownloadState("success");
      setStatusMessage(
        savedToLibrary
          ? "Video saved to your media library."
          : "File downloaded and sent to the native save sheet.",
      );
      setUrl("");
      setActiveTab("history");
    } catch (err) {
      setProgress(100);
      setDownloadState("error");
      setStatusMessage("Download failed.");
      setError(err.message || "Failed to process this media link.");
    }
  };

  const clearHistory = async () => {
    await persistHistory([]);
  };

  const renderDownloader = () => (
    <View style={styles.screenStack}>
      <View style={styles.heroBlock}>
        <GradientIcon icon="download-lock" size={62} />
        <Text style={styles.title}>Social Saver Pro</Text>
        <Text style={styles.subtitle}>
          Paste a social link, select format, and save real media through your
          FastAPI backend.
        </Text>
      </View>
      <View style={styles.panel}>
        <View style={styles.inputRow}>
          <MaterialCommunityIcons
            name="link-variant"
            size={20}
            color="#94a3b8"
          />
          <TextInput
            value={url}
            onChangeText={(value) => {
              setUrl(value);
              if (error) setError("");
            }}
            placeholder="Paste video sharing link here"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.urlInput}
          />
          <Pressable
            onPress={handlePaste}
            style={({ pressed }) => [
              styles.pasteButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={16}
              color="#ffffff"
            />
          </Pressable>
        </View>
        <PlatformBanner platform={detectedPlatform} />
        {showOptions ? (
          <View style={styles.optionsStack}>
            <View>
              <SectionTitle label="Format" />
              <View style={styles.twoColumnGrid}>
                <OptionButton
                  active={format === "mp4"}
                  label="MP4 Video"
                  detail="Save video"
                  icon="filmstrip"
                  onPress={() => setFormat("mp4")}
                />
                <OptionButton
                  active={format === "mp3"}
                  label="MP3 Audio"
                  detail="Extract audio"
                  icon="music"
                  onPress={() => setFormat("mp3")}
                />
              </View>
            </View>
            {format === "mp4" ? (
              <>
                <View>
                  <SectionTitle label="Quality" />
                  <View style={styles.threeColumnGrid}>
                    {QUALITY_OPTIONS.map((item) => (
                      <OptionButton
                        key={item.value}
                        active={quality === item.value}
                        label={item.label}
                        detail={item.detail}
                        onPress={() => setQuality(item.value)}
                      />
                    ))}
                  </View>
                </View>
                <View>
                  <SectionTitle label="Frame Rate" />
                  <View style={styles.twoColumnGrid}>
                    {FPS_OPTIONS.map((item) => (
                      <OptionButton
                        key={item.value}
                        active={fps === item.value}
                        label={item.label}
                        onPress={() => setFps(item.value)}
                      />
                    ))}
                  </View>
                </View>
                <SettingSwitch
                  icon="volume-off"
                  label="Download without sound"
                  value={muteAudio}
                  onChange={setMuteAudio}
                />
              </>
            ) : (
              <>
                <View>
                  <SectionTitle label="Audio Bitrate" />
                  <View style={styles.threeColumnGrid}>
                    {BITRATE_OPTIONS.map((item) => (
                      <OptionButton
                        key={item.value}
                        active={audioBitrate === item.value}
                        label={item.label}
                        detail={item.detail}
                        onPress={() => setAudioBitrate(item.value)}
                      />
                    ))}
                  </View>
                </View>
                <SettingSwitch
                  icon="image-outline"
                  label="Embed original thumbnail art"
                  value={includeAlbumArt}
                  onChange={setIncludeAlbumArt}
                />
              </>
            )}
          </View>
        ) : null}
        <ProgressCard
          state={downloadState}
          progress={progress}
          message={statusMessage}
        />
        {error ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={18}
              color="#fb7185"
            />
            <Text style={styles.errorTextBlock}>{error}</Text>
          </View>
        ) : null}
        <PrimaryButton
          label={
            showOptions ? `Download ${format.toUpperCase()}` : "Verify Link"
          }
          icon="download"
          onPress={triggerDownload}
          loading={isBusy}
          disabled={!url.trim()}
        />
      </View>
      <View style={styles.supportedBlock}>
        <Text style={styles.supportedTitle}>Supported sources</Text>
        <View style={styles.platformGrid}>
          {PLATFORM_META.slice(0, 6).map((item) => (
            <View key={item.key} style={styles.platformChip}>
              <LinearGradient
                colors={item.colors}
                style={styles.platformChipIcon}
              >
                <Text style={styles.platformShort}>{item.short}</Text>
              </LinearGradient>
              <Text style={styles.platformChipText}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderHistory = () => (
    <View style={styles.screenStack}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.screenTitle}>Download History</Text>
          <Text style={styles.screenSubtitle}>
            Saved locally on this device.
          </Text>
        </View>
        {historyList.length > 0 ? (
          <Pressable
            onPress={clearHistory}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={16}
              color="#fb7185"
            />
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
      {historyList.length === 0 ? (
        <View style={styles.emptyState}>
          <GradientIcon
            icon="history"
            colors={["#334155", "#475569"]}
            size={58}
          />
          <Text style={styles.emptyTitle}>No downloads yet</Text>
          <Text style={styles.emptyText}>
            Completed downloads appear here after the backend creates the media
            file.
          </Text>
          <PrimaryButton
            label="Start Download"
            icon="arrow-left"
            onPress={() => setActiveTab("download")}
          />
        </View>
      ) : (
        <View style={styles.historyList}>
          {historyList.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyIconWrap}>
                <MaterialCommunityIcons
                  name={item.format === "MP4" ? "video-outline" : "music"}
                  size={20}
                  color="#22d3ee"
                />
              </View>
              <View style={styles.historyContent}>
                <Text numberOfLines={1} style={styles.historyTitle}>
                  {item.title}
                </Text>
                <Text style={styles.historyMeta}>
                  {item.platform} - {item.format} - {item.quality}
                </Text>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={22}
                color="#34d399"
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderBackend = () => {
    const statusColor =
      backendState === "online"
        ? "#34d399"
        : backendState === "checking"
          ? "#facc15"
          : "#fb7185";
    const statusText =
      backendState === "online"
        ? "Online"
        : backendState === "checking"
          ? "Checking"
          : "Offline";
    return (
      <View style={styles.screenStack}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.screenTitle}>Backend Check</Text>
            <Text style={styles.screenSubtitle}>
              Point the app to your FastAPI server.
            </Text>
          </View>
          <View style={[styles.statusPill, { borderColor: statusColor }]}>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>
        <View style={styles.panel}>
          <SectionTitle label="API Base URL" />
          <View style={styles.apiInputBox}>
            <MaterialCommunityIcons
              name="server-network"
              size={20}
              color="#94a3b8"
            />
            <TextInput
              value={apiBaseUrl}
              onChangeText={setApiBaseUrl}
              placeholder="http://192.168.1.10:8000"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={styles.apiInput}
            />
          </View>
          <Text style={styles.backendHint}>
            Android emulator default: 10.0.2.2. iOS simulator default:
            localhost. A real phone needs your computer LAN IP.
          </Text>
          <PrimaryButton
            label="Check Backend"
            icon="server"
            onPress={checkBackend}
            loading={backendState === "checking"}
          />
        </View>
        <View style={styles.panel}>
          <SectionTitle label="Backend Details" />
          {backendInfo ? (
            <View style={styles.detailsList}>
              <Text style={styles.detailLine}>
                Service: {backendInfo.service || "Social Saver Pro API"}
              </Text>
              <Text style={styles.detailLine}>
                yt-dlp: {backendInfo.yt_dlp || "available"}
              </Text>
              <Text style={styles.detailLine}>
                FFmpeg: {backendInfo.ffmpeg || "check server path"}
              </Text>
              <Text style={styles.detailLine}>
                Downloads:{" "}
                {backendInfo.download_mode || "backend generated files"}
              </Text>
            </View>
          ) : (
            <Text style={styles.backendError}>
              {backendError || "Run a backend check to see server details."}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderGuide = () => (
    <View style={styles.screenStack}>
      <Text style={styles.screenTitle}>How To Download</Text>
      <View style={styles.guideList}>
        {[
          [
            "content-copy",
            "Copy a link",
            "Open TikTok, Instagram, YouTube, X, Facebook, or Reddit and copy the share URL.",
          ],
          [
            "server-network",
            "Start backend",
            "Run the FastAPI server on your computer and set the phone app API URL to that machine.",
          ],
          [
            "tune-variant",
            "Choose format",
            "Pick MP4 video or MP3 audio, then select quality, frame rate, or bitrate.",
          ],
          [
            "download",
            "Save real media",
            "The backend uses yt-dlp and FFmpeg, then the app saves the downloaded file or opens the save sheet.",
          ],
        ].map(([icon, title, body], index) => (
          <View key={title} style={styles.guideCard}>
            <View style={styles.guideStepNumber}>
              <Text style={styles.guideStepText}>{index + 1}</Text>
            </View>
            <MaterialCommunityIcons name={icon} size={22} color="#22d3ee" />
            <View style={styles.guideCopy}>
              <Text style={styles.guideTitle}>{title}</Text>
              <Text style={styles.guideBody}>{body}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topBar}>
          <View style={styles.topTitleBlock}>
            <Text style={styles.topEyebrow}>Mobile Downloader</Text>
            <Text style={styles.topTitle}>Social Saver Pro</Text>
          </View>
          <Pressable
            onPress={() => setActiveTab("backend")}
            style={({ pressed }) => [
              styles.backendMini,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.backendMiniDot,
                backendState === "online"
                  ? styles.dotOnline
                  : styles.dotOffline,
              ]}
            />
            <Text style={styles.backendMiniText}>
              {backendState === "online" ? "API Online" : "API Check"}
            </Text>
          </Pressable>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === "download" && renderDownloader()}
          {activeTab === "history" && renderHistory()}
          {activeTab === "backend" && renderBackend()}
          {activeTab === "guide" && renderGuide()}
        </ScrollView>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#080a0f" },
  root: { flex: 1, backgroundColor: "#080a0f" },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitleBlock: { flex: 1 },
  topEyebrow: {
    color: "#22d3ee",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  topTitle: { color: "#f8fafc", fontSize: 19, fontWeight: "900", marginTop: 2 },
  backendMini: {
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  backendMiniDot: { width: 8, height: 8, borderRadius: 4 },
  dotOnline: { backgroundColor: "#34d399" },
  dotOffline: { backgroundColor: "#fb7185" },
  backendMiniText: { color: "#cbd5e1", fontSize: 11, fontWeight: "800" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 112 },
  screenStack: { gap: 16 },
  heroBlock: { alignItems: "center", paddingTop: 6, paddingBottom: 4 },
  gradientIcon: {
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#06b6d4",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 6,
  },
  title: {
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    textAlign: "center",
    maxWidth: 330,
  },
  panel: {
    backgroundColor: "#10141d",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
    padding: 14,
    gap: 14,
  },
  inputRow: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#253044",
    backgroundColor: "#090d14",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  urlInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
    minHeight: 48,
  },
  pasteButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  platformBanner: {
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  platformInner: { flexDirection: "row", alignItems: "center", gap: 9 },
  platformShortBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  platformShort: { color: "#ffffff", fontSize: 10, fontWeight: "900" },
  platformText: { color: "#ffffff", fontSize: 13, fontWeight: "800" },
  optionsStack: { gap: 14 },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  twoColumnGrid: { flexDirection: "row", gap: 10 },
  threeColumnGrid: { flexDirection: "row", gap: 8 },
  optionButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#253044",
    backgroundColor: "#0b0f17",
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  optionButtonActive: { backgroundColor: "#4f46e5", borderColor: "#7c3aed" },
  optionTextBlock: { alignItems: "center", gap: 2 },
  optionLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  optionLabelActive: { color: "#ffffff" },
  optionDetail: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  optionDetailActive: { color: "#e0f2fe" },
  switchRow: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#253044",
    backgroundColor: "#0b0f17",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 1,
  },
  switchLabel: { color: "#cbd5e1", fontSize: 12, fontWeight: "800" },
  progressCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.24)",
    backgroundColor: "#0c1520",
    padding: 13,
    gap: 10,
  },
  progressCardError: {
    borderColor: "rgba(251, 113, 133, 0.28)",
    backgroundColor: "#1e1117",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressStage: {
    color: "#22d3ee",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  successText: { color: "#34d399" },
  errorText: { color: "#fb7185" },
  progressPercent: { color: "#e2e8f0", fontSize: 12, fontWeight: "900" },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#1f2937",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22d3ee",
    borderRadius: 999,
  },
  progressFillError: { backgroundColor: "#fb7185" },
  progressStatusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressMessage: {
    flex: 1,
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  errorBox: {
    borderRadius: 8,
    backgroundColor: "rgba(127, 29, 29, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(251, 113, 133, 0.28)",
    padding: 12,
    flexDirection: "row",
    gap: 8,
  },
  errorTextBlock: {
    flex: 1,
    color: "#fecdd3",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  primaryButtonWrap: { borderRadius: 8, overflow: "hidden" },
  primaryButton: {
    minHeight: 54,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  primaryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "900" },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  supportedBlock: { gap: 11 },
  supportedTitle: {
    color: "#64748b",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  platformGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  platformChip: {
    width: "30.8%",
    minHeight: 76,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
    backgroundColor: "#10141d",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 8,
  },
  platformChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  platformChipText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  screenTitle: { color: "#ffffff", fontSize: 22, fontWeight: "900" },
  screenSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  clearButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(251, 113, 133, 0.32)",
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clearButtonText: { color: "#fb7185", fontSize: 12, fontWeight: "900" },
  emptyState: {
    minHeight: 360,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
    backgroundColor: "#10141d",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  emptyTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "900" },
  emptyText: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  historyList: { gap: 10 },
  historyCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
    backgroundColor: "#10141d",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#0b0f17",
    alignItems: "center",
    justifyContent: "center",
  },
  historyContent: { flex: 1, gap: 3 },
  historyTitle: { color: "#f8fafc", fontSize: 13, fontWeight: "900" },
  historyMeta: { color: "#94a3b8", fontSize: 11, fontWeight: "700" },
  historyDate: { color: "#64748b", fontSize: 10, fontWeight: "700" },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "900" },
  apiInputBox: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#253044",
    backgroundColor: "#090d14",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  apiInput: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
    minHeight: 48,
  },
  backendHint: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  detailsList: { gap: 8 },
  detailLine: { color: "#cbd5e1", fontSize: 13, fontWeight: "700" },
  backendError: {
    color: "#fecdd3",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  guideList: { gap: 10 },
  guideCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
    backgroundColor: "#10141d",
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },
  guideStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#312e81",
    alignItems: "center",
    justifyContent: "center",
  },
  guideStepText: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  guideCopy: { flex: 1, gap: 4 },
  guideTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "900" },
  guideBody: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  bottomNav: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
    backgroundColor: "rgba(10, 13, 20, 0.96)",
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  navItem: {
    flex: 1,
    minHeight: 54,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  navItemActive: { backgroundColor: "#4f46e5" },
  navLabel: { color: "#94a3b8", fontSize: 10, fontWeight: "900" },
  navLabelActive: { color: "#ffffff" },
});
