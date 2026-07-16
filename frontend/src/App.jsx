import './App.css';
import { useState } from 'react';
import { 
  Download, Link as LinkIcon, AlertCircle, Loader2, 
  Film, Music, ChevronDown, Clipboard, History, Trash2, 
  HelpCircle, Sparkles, Clock, ShieldCheck, ArrowRight, VolumeX, Image
} from 'lucide-react';



export default function App() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4'); 
  const [quality, setQuality] = useState('1080p'); 
  const [fps, setFps] = useState('60fps'); 
  const [audioBitrate, setAudioBitrate] = useState('320kbps'); 
  const [muteAudio, setMuteAudio] = useState(false);
  const [includeAlbumArt, setIncludeAlbumArt] = useState(true);
  
  // Download State Engine
  const [downloadState, setDownloadState] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('download'); 
  const [historyList, setHistoryList] = useState([
    {
      id: 1,
      title: 'Trending Dance Compilation',
      platform: 'TikTok',
      format: 'MP4',
      quality: '1080p (60fps)',
      date: 'Just now'
    },
   
  ]);

  // Auto Platform Detection
  const getPlatformDetails = (inputUrl) => {
    const lowerUrl = inputUrl.toLowerCase();
    if (lowerUrl.includes('tiktok.com')) return { name: 'TikTok', colorClass: 'color-tiktok', icon: 'TT' };
    if (lowerUrl.includes('instagram.com')) return { name: 'Instagram', colorClass: 'color-instagram', icon: 'IG' };
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return { name: 'YouTube', colorClass: 'color-youtube', icon: 'YT' };
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return { name: 'Twitter/X', colorClass: 'color-twitter', icon: 'X' };
    if (lowerUrl.includes('facebook.com')) return { name: 'Facebook', colorClass: 'color-facebook', icon: 'FB' };
    if (lowerUrl.includes('reddit.com')) return { name: 'Reddit', colorClass: 'color-reddit', icon: 'RD' };
    return null;
  };

  const detectedPlatform = getPlatformDetails(url);
  const showOptions = url.trim().startsWith('http://') || url.trim().startsWith('https://');

  // Clipboard Paste Helper
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      setError('Please allow clipboard access to use the paste feature.');
    }
  };

  const triggerDownload = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please input a valid URL first.');
      return;
    }

    setError('');
    setProgress(0);

    try {
      // Stage 1: Analyzing (Talking to your Python Backend)
      setDownloadState('analyzing');
      setStatusMessage('Connecting to Python extractor backend...');
      setProgress(15);

      const response = await fetch('http://localhost:8000/api/get-video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          format, 
          quality, 
          fps, 
          audioBitrate, 
          muteAudio,
          includeAlbumArt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Backend extraction failed.');
      }

      const data = await response.json();

      // Stage 2: Extracting
      setDownloadState('extracting');
      setStatusMessage(`Extracting direct streams for ${format.toUpperCase()}...`);
      setProgress(60);
      await new Promise(r => setTimeout(r, 600)); 

      // Stage 3: Packaging
      setDownloadState('packaging');
      setStatusMessage(format === 'mp4' ? 'Structuring container video...' : 'Encoding metadata...');
      setProgress(90);
      await new Promise(r => setTimeout(r, 400));

      // Trigger the actual file download in browser using direct backend stream url
      const finalFileName = `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
      const link = document.createElement('a');
      link.href = data.download_url;
      link.setAttribute('download', finalFileName);
      link.setAttribute('target', '_blank'); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Add to local history list dynamically
      const newHistoryItem = {
        id: Date.now(),
        title: data.title || 'Extracted Media Clip',
        platform: detectedPlatform ? detectedPlatform.name : (data.platform || 'Media Source'),
        format: format.toUpperCase(),
        quality: format === 'mp4' ? `${quality} (${fps})` : audioBitrate,
        date: 'Just now'
      };
      setHistoryList(prev => [newHistoryItem, ...prev]);

      setProgress(100);
      setDownloadState('success');
      setStatusMessage('Download initialized successfully!');
      setUrl('');

      setTimeout(() => setDownloadState('idle'), 4000);
    } catch (err) {
      setDownloadState('error');
      setError(err.message || 'Failed to process streams. Make sure your Python server is running on localhost:8000.');
    }
  };

  const clearHistory = () => {
    setHistoryList([]);
  };

  const platformIcons = {
    TikTok: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="platform-icon-svg">
        <path d="M14.5 3h2.4a4.7 4.7 0 0 0 4.7 4.7v2.7a7.3 7.3 0 0 1-4.7-1.5v6.9a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v2.7a2.8 2.8 0 1 0 2.8 2.8V3Z" fill="currentColor"/>
      </svg>
    ),
    Instagram: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="platform-icon-svg">
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor"/>
      </svg>
    ),
    YouTube: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="platform-icon-svg">
        <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18.1 4.7 12 4.7 12 4.7s-6.1 0-7.7.6A2.7 2.7 0 0 0 2.4 7.2 28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9c1.6.6 7.7.6 7.7.6s6.1 0 7.7-.6a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" fill="currentColor"/>
      </svg>
    ),
    'X / Twitter': (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="platform-icon-svg">
        <path d="M18.9 3H22l-6.7 7.7L23.3 21h-5.9l-4.6-6-5.2 6H2l7.2-8.2L.7 3h6l4.2 5.5L18.9 3Zm-1 16.2h1.1L6.2 4.7H5l12.9 14.5Z" fill="currentColor"/>
      </svg>
    ),
    Facebook: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="platform-icon-svg">
        <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V3.8c0-.9.3-1.6 1.6-1.6h1.7V.1C16.3.1 15.2 0 14 0c-2.6 0-4.4 1.6-4.4 4.4v2.4H7v3.2h2.6v8h3.9Z" fill="currentColor"/>
      </svg>
    ),
  };

  const platformMeta = [
    { name: 'TikTok', color: '#ff0050', accent: '#00f2fe' },
    { name: 'Instagram', color: '#e1306c', accent: '#f77737' },
    { name: 'YouTube', color: '#ff0000', accent: '#ff5252' },
    { name: 'X / Twitter', color: '#0f172a', accent: '#64748b' },
    { name: 'Facebook', color: '#1877f2', accent: '#42a5f5' },
  ];

  const AdSlot = ({ compact = false }) => (
    <div className={`ad-slot ${compact ? 'ad-slot-compact' : ''}`}>
      <div className="ad-top-row">
        <span className="ad-pill">Sponsored</span>
        <Sparkles size={12} />
      </div>
      <div className="ad-copy">
        <strong>Grow your audience</strong>
        <p>Premium ad space for offers, downloads, or app promotions.</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="browser-shell">
        <aside className="browser-ad-panel">
          // eslint-disable-next-line react-hooks/static-components
          <AdSlot />
          <AdSlot compact />
        </aside>

        <div className="phone-frame">

        {/* Inner Content Area */}
        <div className="content-area">
          <div className="content-ad-banner">
            <AdSlot />
          </div>
          
          {activeTab === 'download' && (
            <div className="inner-padding animate-fade-in">
              
              {/* Premium Heading */}
              <div className="header-brand">
                <div className="header-icon-container">
                  <Download size={28} color="#fff" />
                </div>
                <h1 className="brand-title">
                  Social Saver Pro
                </h1>
                <p className="brand-subtitle">
                  Download your social media feeds.
                </p>
              </div>

              {/* Downloader Form */}
              <form onSubmit={triggerDownload} className="downloader-form">
                
                {/* Input Container */}
                <div className="input-wrapper">
                  <LinkIcon size={16} />
                  <input
                    type="text"
                    className="url-input"
                    placeholder="Paste sharing link here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="paste-btn"
                  >
                    <Clipboard size={12} />
                    Paste
                  </button>
                </div>

                {/* Auto-detected Platform Banner */}
                {detectedPlatform && (
                  <div className={`platform-detected-banner ${detectedPlatform.colorClass} animate-fade-in`}>
                    <span className="platform-inner">
                      <span className="platform-icon-square">
                        {detectedPlatform.icon}
                      </span>
                      Source Detected: {detectedPlatform.name}
                    </span>
                    <Sparkles size={16} className="sparkle-pulse" />
                  </div>
                )}

                {/* Options Panel Drawer */}
                {showOptions && downloadState === 'idle' && (
                  <div className="options-drawer animate-fade-in">

                    {/* Format Toggle */}
                    <div className="control-group">
                      <label className="control-label">Format</label>
                      <div className="tab-grid">
                        <button
                          type="button"
                          onClick={() => setFormat('mp4')}
                          className={`tab-button ${format === 'mp4' ? 'active' : ''}`}
                        >
                          <Film size={16} />
                          MP4 Video
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormat('mp3')}
                          className={`tab-button ${format === 'mp3' ? 'active' : ''}`}
                        >
                          <Music size={16} />
                          MP3 Audio
                        </button>
                      </div>
                    </div>

                    {format === 'mp4' ? (
                      <div className="control-group animate-fade-in control-group-large-gap">
                        <div className="control-group">
                          <label className="control-label">Quality</label>
                          <div className="dropdown-container">
                            <select
                              value={quality}
                              onChange={(e) => setQuality(e.target.value)}
                              className="custom-select"
                            >
                              <option value="1080p">High Definition (1080p Ultra)</option>
                              <option value="720p">Standard HD (720p Balanced)</option>
                              <option value="480p">Mobile Compact (480p Low)</option>
                            </select>
                            <ChevronDown className="select-arrow" size={16} />
                          </div>
                        </div>

                        {/* Video Framerate Toggle */}
                        <div className="control-group">
                          <label className="control-label">Framerate Target</label>
                          <div className="tab-grid">
                            {['60fps', '30fps'].map(f => (
                              <button
                                key={f}
                                type="button"
                                onClick={() => setFps(f)}
                                className={`tab-button ${fps === f ? 'fps-active' : ''}`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Mute Video Option */}
                        <label className="checkbox-wrapper">
                          <div className="checkbox-inner">
                            <VolumeX size={16} className="icon-slate-400" />
                            <span className="checkbox-title">Download without sound</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={muteAudio} 
                            onChange={(e) => setMuteAudio(e.target.checked)}
                            className="native-checkbox"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="control-group animate-fade-in control-group-large-gap">
                        {/* Audio Bitrate Selector */}
                        <div className="control-group">
                          <label className="control-label">Bitrate (kbps)</label>
                          <div className="dropdown-container">
                            <select
                              value={audioBitrate}
                              onChange={(e) => setAudioBitrate(e.target.value)}
                              className="custom-select"
                            >
                              <option value="320kbps">320kbps Studio Quality (Lossless HQ)</option>
                              <option value="192kbps">192kbps Standard MP3 (Balanced)</option>
                              <option value="128kbps">128kbps Lightweight (Small file)</option>
                            </select>
                            <ChevronDown className="select-arrow" size={16} />
                          </div>
                        </div>

                        {/* Album Art Toggle */}
                        <label className="checkbox-wrapper">
                          <div className="checkbox-inner">
                            <Image size={16} className="icon-slate-400" />
                            <span className="checkbox-title">Embed Original Thumbnail Art</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={includeAlbumArt} 
                            onChange={(e) => setIncludeAlbumArt(e.target.checked)}
                            className="native-checkbox"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Simulated Download Progress State */}
                {downloadState !== 'idle' && (
                  <div className="progress-card animate-fade-in">
                    <div className="progress-header">
                      <span className="progress-stage">{downloadState}</span>
                      <span className="progress-percent">{progress}%</span>
                    </div>
                    
                    {/* Linear Progress Bar */}
                    <div className="progress-track">
                      <div 
                        className="progress-fill"
                        style={{width: `${progress}%`}}
                      ></div>
                    </div>

                    <div className="progress-status-row">
                      <Loader2 className="loader-spin" size={14} />
                      <span>{statusMessage}</span>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="feedback-banner feedback-error animate-fade-in">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <p className="error-msg">{error}</p>
                  </div>
                )}

                {/* Call-to-Action Submit Button */}
                {downloadState === 'idle' && (
                  <button
                    type="submit"
                    className="submit-btn"
                  >
                    <Download size={16} className="submit-icon" />
                    {showOptions ? `Download ${format.toUpperCase()}` : 'Verify & Extract Link'}
                  </button>
                )}
              </form>

              {/* Supported Tech Logotypes list */}
              <div className="ecosystems-section">
                <p className="ecosystems-title">
                  Compatible Ecosystems
                </p>
                <div className="ecosystems-grid">
                  {platformMeta.map((item, idx) => (
                    <div 
                      key={item.name} 
                      className={`ecosystem-badge ${idx < 3 ? 'badge-large' : 'badge-small'}`}
                    >
                      <span
                        className="ecosystem-icon-wrap"
                        style={{
                          background: `linear-gradient(135deg, ${item.color}22, ${item.accent}22)`,
                          color: item.color,
                        }}
                      >
                        {platformIcons[item.name]}
                      </span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {}
          {activeTab === 'history' && (
            <div className="inner-padding animate-fade-in">
              <div className="history-header-row">
                <div>
                  <h2 className="history-heading">
                    <History size={16} className="icon-indigo-400" />
                    Downloaded History
                  </h2>
                  <p className="history-subtitle">Offline history of extracted links</p>
                </div>
                {historyList.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="clear-history-btn"
                  >
                    <Trash2 size={14} />
                    Clear
                  </button>
                )}
              </div>

              {historyList.length === 0 ? (
                <div className="empty-history-box">
                  <Clock size={32} className="icon-slate-600" />
                  <p className="empty-history-text">Your downloads library is empty</p>
                  <button 
                    onClick={() => setActiveTab('download')} 
                    className="empty-history-action"
                  >
                    Go back to home <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                <div className="history-list">
                  {historyList.map((item) => (
                    <div key={item.id} className="history-item">
                      <div className="history-info">
                        <span className="history-title">{item.title}</span>
                        <div className="history-meta-row">
                          <span className="history-platform-pill">
                            {item.platform}
                          </span>
                          <span>•</span>
                          <span>{item.quality}</span>
                        </div>
                      </div>
                      
                      <div className="history-actions-col">
                        <span className="history-time-stamp">{item.date}</span>
                        <div className="history-dl-circle">
                          <Download size={14} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {}
          {activeTab === 'help' && (
            <div className="inner-padding animate-fade-in">
              <div className="help-section">
                <h2 className="history-heading">
                  <HelpCircle size={16} className="icon-indigo-400" />
                  How to Download
                </h2>
                <p className="history-subtitle">Simple guidelines to retrieve raw source feeds</p>
              </div>

              <div className="help-content">
                <div className="guide-step-card">
                  <div className="guide-step-num">1</div>
                  <div className="guide-content">
                    <span className="guide-title">Copy Link</span>
                    <span className="guide-desc">Open any supported social media app, tap share/options and select "Copy Link".</span>
                  </div>
                </div>

                <div className="guide-step-card">
                  <div className="guide-step-num">2</div>
                  <div className="guide-content">
                    <span className="guide-title">Paste & Pick Format</span>
                    <span className="guide-desc">Paste the URL into Social Saver Pro. Choose MP4 (Video) or convert to MP3 (Audio).</span>
                  </div>
                </div>

                <div className="guide-step-card">
                  <div className="guide-step-num">3</div>
                  <div className="guide-content">
                    <span className="guide-title">Download Direct</span>
                    <span className="guide-desc">Our backend parses the link with `yt-dlp` and directly retrieves the high-speed download link.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Floating Custom Bottom Bar */}
        <div className="app-bottom-nav">
          <button 
            onClick={() => setActiveTab('download')}
            className={`nav-item-btn ${activeTab === 'download' ? 'active' : ''}`}
          >
            <Download size={20} />
            <span className="nav-item-text">Downloader</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`nav-item-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            <History size={20} />
            <span className="nav-item-text">History</span>
          </button>

          <button 
            onClick={() => setActiveTab('help')}
            className={`nav-item-btn ${activeTab === 'help' ? 'active' : ''}`}
          >
            <HelpCircle size={20} />
            <span className="nav-item-text">How-To</span>
          </button>
        </div>

        {/* Simulated device navigation indicator */}
        <div className="home-indicator"></div>

        </div>
      </div>
    </div>
  );
}