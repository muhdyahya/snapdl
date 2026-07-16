import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Link as LinkIcon, AlertCircle, Loader2, 
  Film, Music, ChevronDown, Clipboard, History, Trash2, 
  HelpCircle, Sparkles, Clock, ShieldCheck, ArrowRight, VolumeX, Image,
  ChevronRight, ArrowLeft, Heart, MessageSquare, Share2, Info, Plus, Play,
  Copy, ExternalLink, Moon, Check, Smartphone, HelpCircle as HelpIcon, Settings, Search
} from 'lucide-react';

const customStyles = `
  :root {
    --bg-slate-900: #0f172a;
    --bg-slate-950: #020617;
    --slate-100: #f1f5f9;
    --slate-200: #e2e8f0;
    --slate-300: #cbd5e1;
    --slate-400: #94a3b8;
    --slate-500: #64748b;
    --slate-700: #334155;
    --slate-800: #1e293b;
    --slate-900: #0f172a;
    --indigo-500: #6366f1;
    --indigo-600: #4f46e5;
    --indigo-900: #312e81;
    --blue-500: #3b82f6;
    --blue-600: #2563eb;
    --cyan-500: #06b6d4;
    --emerald-400: #34d399;
    --rose-400: #f87171;
    --rose-600: #e11d48;
    --rose-900: #7f1d1d;
    --yellow-primary: #ffcc00;
    --tiktok-pink: #fe2c55;
    --transition-all: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  body {
    background-color: var(--bg-slate-950);
    color: var(--slate-100);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  /* Responsive layout grids */
  .app-dashboard-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    min-height: 100vh;
    background: radial-gradient(circle at top left, #1e1b4b 0%, #050309 100%);
  }

  @media (min-width: 1024px) {
    .app-dashboard-wrapper {
      grid-template-columns: 320px 1fr 390px;
    }
  }

  /* Control sidebar layout */
  .control-sidebar-left {
    background-color: rgba(15, 23, 42, 0.6);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    backdrop-filter: blur(16px);
  }

  /* Main work panel */
  .main-work-console {
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: 100vh;
    box-sizing: border-box;
  }

  @media (min-width: 768px) {
    .main-work-console {
      padding: 40px;
    }
  }

  /* Simulated Mobile interactive visual feed column */
  .interactive-preview-column {
    background-color: rgba(2, 6, 23, 0.4);
    border-left: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: sticky;
    top: 0;
    height: 100vh;
    box-sizing: border-box;
  }

  .standalone-phone-container {
    background-color: #000;
    width: 100%;
    max-width: 350px;
    height: 720px;
    border-radius: 44px;
    border: 10px solid #222;
    box-shadow: 0 25px 50px rgba(0,0,0,0.8);
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  /* Screen layouts & styling inside the phone container */
  .notch-area {
    height: 28px;
    background-color: #000000;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 4px;
    z-index: 50;
    position: relative;
  }

  .notch-bar {
    width: 110px;
    height: 15px;
    background-color: #1a1a1a;
    border-radius: 0 0 14px 14px;
    position: absolute;
    top: 0;
  }

  .status-bar-phone {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    color: #ffffff;
    padding: 4px 20px 2px 20px;
    background-color: #000000;
    z-index: 49;
    position: relative;
  }

  .status-icons-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .screen-port {
    flex: 1;
    position: relative;
    overflow: hidden;
    background-color: #000000;
    display: flex;
    flex-direction: column;
  }

  /* Simulated Social TikTok Player Screen */
  .social-player-screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #000;
    color: #fff;
  }

  .social-header-overlay {
    position: absolute;
    top: 8px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    z-index: 20;
    background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
  }

  .social-header-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    padding: 6px 10px;
    border-radius: 12px;
    backdrop-filter: blur(6px);
  }

  .social-video-backdrop {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #111;
    background-size: cover;
    background-position: center;
  }

  .social-video-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.4) 100%);
    z-index: 10;
  }

  .play-center-btn {
    position: absolute;
    z-index: 15;
    background-color: rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-all);
    cursor: pointer;
  }

  .play-center-btn:hover {
    transform: scale(1.1);
    background-color: var(--tiktok-pink);
    border-color: #fff;
  }

  /* Sidebar interactions within social simulation */
  .social-sidebar-actions {
    position: absolute;
    right: 10px;
    bottom: 110px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    z-index: 15;
  }

  .sidebar-user-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    position: relative;
    margin-bottom: 6px;
  }

  .sidebar-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .sidebar-follow-plus {
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--tiktok-pink);
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #000;
  }

  .sidebar-action-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
  }

  .sidebar-action-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background-color: rgba(30, 30, 30, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-all);
    backdrop-filter: blur(4px);
  }

  .sidebar-action-button:hover .sidebar-action-circle {
    background-color: var(--tiktok-pink);
    transform: translateY(-2px);
  }

  .sidebar-number-label {
    font-size: 10px;
    font-weight: 700;
    color: #e2e8f0;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  }

  /* Video overlays details */
  .social-bottom-meta {
    position: absolute;
    bottom: 10px;
    left: 12px;
    right: 70px;
    z-index: 15;
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.9);
  }

  .social-author-tag {
    font-weight: 700;
    font-size: 14px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .social-desc-text {
    font-size: 12px;
    color: #f1f5f9;
    line-height: 1.4;
  }

  /* Localized replication: Urdu Comment Widget Overlay from Screenshot 1 */
  .urdu-comment-overlay {
    background-color: rgba(20, 20, 20, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 8px 10px;
    margin: 0 10px 10px 10px;
    z-index: 15;
    position: absolute;
    bottom: 64px;
    left: 0;
    right: 0;
    backdrop-filter: blur(8px);
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .comment-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  .comment-content-block {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .comment-meta-header {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .comment-username {
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
  }

  .comment-translated-pashto {
    direction: rtl;
    text-align: right;
    font-size: 11px;
    line-height: 1.4;
    color: #e2e8f0;
    font-family: sans-serif;
  }

  .comment-sub-links {
    display: flex;
    gap: 8px;
    font-size: 9px;
    color: #64748b;
    margin-top: 2px;
  }

  /* Replica Sponsor Widget: 666D ad replica from Screenshot 1 */
  .replica-sponsor-strip {
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
    background-color: #111111;
    border: 1px solid #222;
    border-radius: 10px;
    padding: 6px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 15;
  }

  .sponsor-left-branding {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sponsor-box-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background-color: #000;
    border: 1px solid #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #10b981;
    font-weight: 900;
    font-size: 11px;
  }

  .sponsor-headline-rtl {
    font-size: 10px;
    font-weight: 600;
    color: #fff;
    text-align: right;
    direction: rtl;
  }

  .sponsor-action-register {
    background-color: transparent;
    border: 1px solid #2563eb;
    color: #2563eb;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    cursor: pointer;
  }

  /* Floating Dual Actions Overlay Capsule matching Screenshot 1 */
  .social-floating-capsule {
    position: absolute;
    bottom: 136px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    display: flex;
    align-items: center;
    background-color: rgba(26, 26, 26, 0.95);
    border-radius: 30px;
    padding: 4px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 90%;
    width: max-content;
    backdrop-filter: blur(8px);
  }

  .pill-action-tiktok {
    background-color: var(--tiktok-pink);
    color: white;
    font-size: 10px;
    font-weight: 800;
    padding: 8px 12px;
    border-radius: 26px;
    display: flex;
    align-items: center;
    gap: 4px;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    text-transform: uppercase;
  }

  .pill-action-download {
    background-color: var(--yellow-primary);
    color: #000000;
    font-size: 10px;
    font-weight: 800;
    padding: 8px 16px;
    border-radius: 26px;
    display: flex;
    align-items: center;
    gap: 4px;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    transition: var(--transition-all);
  }

  .pill-action-download:hover {
    background-color: #ffd633;
    transform: scale(1.02);
  }

  /* SYSTEM SHARE DRAWER SIMULATOR */
  .share-overlay-mask {
    position: absolute;
    inset: 0;
    background-color: rgba(0,0,0,0.6);
    z-index: 40;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .share-options-box {
    background-color: #1c1c1e;
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    padding: 16px 14px 28px 14px;
    box-shadow: 0 -10px 25px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .share-target-apps {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 8px 2px;
    scrollbar-width: none;
  }

  .share-app-icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 60px;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
  }

  .share-app-logo-box {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* FORMAT PICKER BOTTOM SHEET (SCREENSHOT 2 REPLICATION) */
  .picker-backdrop {
    position: absolute;
    inset: 0;
    background-color: rgba(0,0,0,0.75);
    z-index: 45;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .picker-bottom-sheet {
    background-color: #121212;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    padding: 14px 18px 28px 18px;
    display: flex;
    flex-direction: column;
    max-height: 82%;
    overflow-y: auto;
    color: #fff;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.8);
    animation: slideSheetUp 0.25s ease-out;
  }

  @keyframes slideSheetUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .sheet-header-line {
    width: 32px;
    height: 4px;
    background-color: #3a3a3c;
    border-radius: 99px;
    margin: 0 auto 12px auto;
  }

  .sheet-title-text {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
    text-align: left;
    color: #fff;
  }

  .sheet-section-title {
    font-size: 11px;
    font-weight: 700;
    color: #555558;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
    text-align: left;
  }

  .sheet-format-row {
    background-color: #1c1c1e;
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: var(--transition-all);
  }

  .sheet-format-row.selected {
    background-color: rgba(255, 204, 0, 0.06);
    border-color: var(--yellow-primary);
  }

  .sheet-row-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .format-main-label {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    text-align: left;
  }

  .sheet-row-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .format-size-label {
    font-size: 12px;
    font-weight: 600;
    color: #8e8e93;
  }

  .format-size-label.selected-color {
    color: var(--yellow-primary);
  }

  .radio-check-ring {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid #48484a;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-all);
  }

  .radio-check-ring.selected {
    border-color: var(--yellow-primary);
    background-color: var(--yellow-primary);
  }

  .radio-inner-core {
    width: 7px;
    height: 7px;
    background-color: #000;
    border-radius: 50%;
  }

  .more-formats-toggle-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background-color: #1c1c1e;
    border-radius: 10px;
    cursor: pointer;
    margin-top: 8px;
    margin-bottom: 16px;
    transition: var(--transition-all);
  }

  .more-formats-toggle-link:hover {
    background-color: #2c2c2e;
  }

  .sheet-download-action-btn {
    width: 100%;
    background-color: var(--yellow-primary);
    color: #000000;
    border: none;
    border-radius: 24px;
    padding: 14px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: var(--transition-all);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .sheet-download-action-btn:hover {
    background-color: #ffd633;
    transform: scale(1.02);
  }

  /* MORE FORMATS DETAILED LIST (SCREENSHOT 3 REPLICATION) */
  .formats-full-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #0a0a0a;
    color: white;
    padding-bottom: 20px;
    position: relative;
    overflow-y: auto;
  }

  .formats-page-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border-bottom: 1px solid #1c1c1e;
    position: sticky;
    top: 0;
    background-color: rgba(10,10,10,0.9);
    backdrop-filter: blur(8px);
    z-index: 20;
  }

  .back-arrow-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 2px;
  }

  .formats-page-content {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
  }

  /* Switch Toggle Styling */
  .switch-row-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background-color: #121212;
    border-radius: 10px;
    border: 1px solid #1c1c1e;
    margin-top: 8px;
    margin-bottom: 16px;
  }

  .slider-box {
    width: 44px;
    height: 22px;
    background-color: #2c2c2e;
    border-radius: 99px;
    position: relative;
    cursor: pointer;
    transition: var(--transition-all);
  }

  .slider-box.active {
    background-color: var(--yellow-primary);
  }

  .slider-dot {
    width: 16px;
    height: 16px;
    background-color: white;
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: var(--transition-all);
  }

  .slider-box.active .slider-dot {
    transform: translateX(22px);
    background-color: #000;
  }

  /* Core active view layouts */
  .active-app-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background: linear-gradient(180deg, var(--bg-slate-950) 0%, var(--bg-slate-900) 100%);
    padding-bottom: 74px;
  }

  .main-panel-inner {
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .brand-header-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .brand-circle-logo {
    background: linear-gradient(135deg, var(--indigo-600) 0%, var(--blue-600) 50%, var(--cyan-500) 100%);
    padding: 14px;
    border-radius: 18px;
    box-shadow: 0 8px 20px -5px rgba(99, 102, 241, 0.4);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-title-text {
    font-size: 22px;
    font-weight: 900;
    background: linear-gradient(to right, #ffffff, var(--slate-100), var(--indigo-500));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .brand-desc-tag {
    color: var(--slate-400);
    font-size: 11px;
    margin-top: 4px;
    max-width: 240px;
    line-height: 1.4;
  }

  .input-group-relative {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-group-relative svg {
    position: absolute;
    left: 12px;
    color: var(--slate-500);
  }

  .custom-url-field {
    width: 100%;
    padding: 14px 90px 14px 38px;
    border: 1px solid var(--slate-800);
    border-radius: 14px;
    background-color: rgba(15, 23, 42, 0.9);
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    outline: none;
    transition: var(--transition-all);
    box-sizing: border-box;
  }

  .custom-url-field:focus {
    border-color: var(--indigo-500);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  .embedded-paste-btn {
    position: absolute;
    right: 6px;
    padding: 7px 12px;
    background-color: var(--slate-800);
    border: 1px solid rgba(100, 116, 139, 0.2);
    color: var(--slate-300);
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: var(--transition-all);
  }

  .embedded-paste-btn:hover {
    background-color: var(--slate-700);
    color: #fff;
  }

  .pill-platform-tag {
    padding: 10px 14px;
    border-radius: 12px;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 8px 12px -3px rgba(0, 0, 0, 0.3);
  }

  /* SYSTEM TOAST: Copied Link Quick Action Alert Banner */
  .system-toast-banner {
    position: absolute;
    top: 56px;
    left: 16px;
    right: 16px;
    background: linear-gradient(135deg, #241d3b 0%, #17112a 100%);
    border: 1px solid rgba(255, 204, 0, 0.35);
    border-radius: 16px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: 0 16px 30px rgba(0,0,0,0.6);
    z-index: 100;
    animation: toastDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes toastDown {
    from { transform: translateY(-40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .toast-link-line {
    font-size: 10px;
    color: var(--slate-300);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: left;
  }

  .toast-actions-row {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }

  .toast-btn-ignore {
    background: none;
    border: none;
    color: var(--slate-400);
    font-size: 10px;
    font-weight: 600;
    padding: 4px 10px;
    cursor: pointer;
  }

  .toast-btn-apply {
    background-color: var(--yellow-primary);
    color: #000;
    border: none;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 12px;
    display: flex;
    align-items: center;
    gap: 3px;
    cursor: pointer;
  }

  /* History list items elements */
  .history-item-row {
    background-color: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(30, 41, 59, 0.8);
    padding: 12px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .history-left-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    max-width: 180px;
  }

  .history-video-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--slate-200);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    text-align: left;
  }

  .history-sub-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 9px;
    color: var(--slate-400);
    font-weight: 500;
  }

  .history-platform-badge {
    padding: 1px 4px;
    border-radius: 3px;
    background-color: var(--slate-800);
    color: var(--slate-300);
    font-weight: 700;
    font-size: 8px;
  }

  .history-circle-check-btn {
    padding: 6px;
    background-color: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(51, 65, 85, 0.4);
    color: var(--yellow-primary);
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-all);
  }

  /* Core bottom nav system inside phone */
  .phone-bottom-navigation {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background-color: rgba(2, 6, 23, 0.95);
    backdrop-filter: blur(16px);
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 35;
  }

  .bottom-nav-tab-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: none;
    border: none;
    cursor: pointer;
    transition: var(--transition-all);
    color: var(--slate-500);
  }

  .bottom-nav-tab-btn.active {
    color: var(--yellow-primary);
    transform: scale(1.04);
  }

  .bottom-nav-label {
    font-size: 9px;
    font-weight: 700;
  }

  .screen-home-indicator {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 32%;
    height: 3px;
    background-color: #3a3a3c;
    border-radius: 999px;
    z-index: 38;
    pointer-events: none;
  }

  /* Interactive Simulator Hub styles */
  .control-headline-sim {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--slate-400);
    letter-spacing: 0.05em;
    margin: 0 0 4px 0;
    text-align: left;
  }

  .sim-action-btn-blue {
    background: linear-gradient(135deg, var(--indigo-600) 0%, var(--blue-600) 100%);
    color: white;
    font-size: 12px;
    font-weight: 700;
    padding: 10px 14px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    transition: var(--transition-all);
    margin-bottom: 10px;
  }

  .sim-action-btn-blue:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(99, 102, 241, 0.3);
  }

  .sim-action-btn-border {
    background-color: transparent;
    border: 1px solid var(--slate-700);
    color: var(--slate-300);
    font-size: 12px;
    font-weight: 600;
    padding: 9px 14px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    transition: var(--transition-all);
    margin-bottom: 10px;
  }

  .sim-action-btn-border:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: #fff;
  }

  .sim-helper-card-info {
    background-color: rgba(255, 204, 0, 0.04);
    border: 1px dashed var(--yellow-primary);
    border-radius: 10px;
    padding: 10px;
    font-size: 10px;
    line-height: 1.4;
    color: var(--slate-300);
    margin-top: 10px;
  }

  @keyframes rotateSpinner {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animate-spin-loader {
    animation: rotateSpinner 1s linear infinite;
  }

  .entry-fade-in {
    animation: executeFade 0.2s ease-out forwards;
  }

  @keyframes executeFade {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default function App() {
  // Mobile Frame Router States
  const [activeScreen, setActiveScreen] = useState('app_home'); // 'app_home' | 'social_tiktok_feed' | 'more_formats'
  const [copiedNotificationUrl, setCopiedNotificationUrl] = useState('');
  const [showNotificationAlert, setShowNotificationAlert] = useState(false);
  const [isShareOverlayOpen, setIsShareOverlayOpen] = useState(false);
  const [isFormatSelectorOpen, setIsFormatSelectorOpen] = useState(false);
  
  // Custom formats chosen defaults
  const [isChoiceRemembered, setIsChoiceRemembered] = useState(false);
  const [musicSelection, setMusicSelection] = useState('classic_mp3'); // 'fast_m4a' | 'classic_mp3'
  const [videoSelection, setVideoSelection] = useState('720p'); // '72p' | '108p' | '144p' | '180p' | '240p' | '270p' | '360p' | '480p' | '720p'

  // Form states and details
  const [url, setUrl] = useState('');
  const [innerActiveTab, setInnerActiveTab] = useState('download'); // 'download' | 'history' | 'guide'
  const [processingState, setProcessingState] = useState('idle'); // 'idle' | 'analyzing' | 'extracting' | 'packaging' | 'success' | 'error'
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [activeStatusString, setActiveStatusString] = useState('');

  // Local storage download history simulations
  const [downloadLogs, setDownloadLogs] = useState([
    {
      id: 1,
      title: 'Trending compilation edit.mp4',
      platform: 'TikTok',
      format: 'MP4',
      quality: 'High quality (720p)',
      date: 'Just now'
    },
    {
      id: 2,
      title: 'Acoustic Cover Instrumental.mp3',
      platform: 'Instagram',
      format: 'MP3',
      quality: 'Classic MP3',
      date: '3 hours ago'
    }
  ]);

  // Demo variables
  const sampleTikTokLink = 'https://www.tiktok.com/@ÈļħạmJáñ/video/721245678912';

  const mockTikTokDetails = {
    url: sampleTikTokLink,
    author: '@Èļħạm Jáñ',
    descText: 'بیبہ کڑے گیلے چہ پہ نظر دے کڑم اوباسہ تاویز پہ ملا سترګو تہ 🇦🇫 original sound repost like',
    musicTrack: 'original sound - Èļħạm Jáñ',
    likesCount: '10.2K',
    commentsCount: '825',
    sharesCount: '867',
    topComment: {
      profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      userHandle: 'user5137300590600',
      textPashto: 'بيا بہ کڑے گيلے چہ پہ نظر دے کڑم اوباسہ تاويز پہ ملا سترګو تہ',
      timeLabel: '1h ago'
    }
  };

  const audioStreams = [
    { id: 'fast_m4a', label: 'Fast', subtitle: 'M4A, best choice for mobile phone', size: '58.7 KB' },
    { id: 'classic_mp3', label: 'Classic MP3', subtitle: 'Support Bluetooth speaker, mobile phone, car, watch etc.', size: '≈141.0 KB' }
  ];

  const videoStreams = [
    { id: '72p', label: 'Fast (72p)', subtitle: 'Poor video quality', size: '95.0 KB', badge: 'Low' },
    { id: '108p', label: 'Fast (108p)', subtitle: 'Poor video quality', size: '132.7 KB', badge: 'Low' },
    { id: '144p', label: 'Fast (144p)', subtitle: 'Poor video quality', size: '160.1 KB', badge: 'Low' },
    { id: '180p', label: 'Fast (180p)', subtitle: 'Poor video quality', size: '198.6 KB', badge: 'Low' },
    { id: '240p', label: 'Fast (240p)', subtitle: 'Low quality for quick play', size: '257.9 KB', badge: '' },
    { id: '270p', label: 'Fast (270p)', subtitle: 'Low quality for quick play', size: '354.5 KB', badge: '' },
    { id: '360p', label: 'Fast (360p)', subtitle: 'Normal quality for quick play', size: '518.8 KB', badge: '' },
    { id: '480p', label: 'Fast (480p)', subtitle: 'Normal quality for quick play', size: '677.8 KB', badge: '' },
    { id: '720p', label: 'High quality (720p)', subtitle: 'Clear view and quick play', size: '1.4 MB', badge: '' }
  ];

  // Auto detect platform based on pasted text
  const computePlatformMetadata = (inputUrl) => {
    const rawUrl = inputUrl.toLowerCase();
    if (rawUrl.includes('tiktok.com')) return { name: 'TikTok', colorClass: 'color-tiktok', icon: 'TT' };
    if (rawUrl.includes('instagram.com')) return { name: 'Instagram', colorClass: 'color-instagram', icon: 'IG' };
    if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) return { name: 'YouTube', colorClass: 'color-youtube', icon: 'YT' };
    if (rawUrl.includes('facebook.com')) return { name: 'Facebook', colorClass: 'color-facebook', icon: 'FB' };
    return null;
  };

  const detectedPlatform = computePlatformMetadata(url);
  const isInputUrlPresent = url.trim().startsWith('http://') || url.trim().startsWith('https://');

  // Simulated clipboard background task
  const runSimulatedClipboardCopy = (link) => {
    setCopiedNotificationUrl(link);
    setShowNotificationAlert(true);
    // Auto-dismiss alert banner after a few seconds
    setTimeout(() => {
      setShowNotificationAlert(false);
    }, 10000);
  };

  const handleApplyToastLink = () => {
    setUrl(copiedNotificationUrl);
    setShowNotificationAlert(false);
    setActiveScreen('app_home');
    setInnerActiveTab('download');
    setIsFormatSelectorOpen(true);
  };

  const triggerMobileShareChain = () => {
    setActiveScreen('social_tiktok_feed');
    setIsShareOverlayOpen(true);
  };

  const executeShareTargetClick = () => {
    setIsShareOverlayOpen(false);
    setUrl(mockTikTokDetails.url);
    setActiveScreen('app_home');
    setInnerActiveTab('download');
    setIsFormatSelectorOpen(true);
  };

  const handleManualPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // Fallback fallback if clipboard read is denied
      setUrl(mockTikTokDetails.url);
    }
  };

  // Perform safe downland emulation workflow
  const runEmulatedDownload = async () => {
    setIsFormatSelectorOpen(false);
    setProcessingState('analyzing');
    setActiveStatusString('Fetching media stream headers...');
    setExtractionProgress(10);

    setTimeout(() => {
      setExtractionProgress(45);
      setProcessingState('extracting');
      setActiveStatusString('Downloading high-fidelity data nodes...');
    }, 1000);

    setTimeout(() => {
      setExtractionProgress(85);
      setProcessingState('packaging');
      setActiveStatusString('Multiplexing audio and video containers...');
    }, 2200);

    setTimeout(() => {
      setExtractionProgress(100);
      setProcessingState('success');
      setActiveStatusString('Successfully saved to device storage!');

      // Push final result to logs
      const calculatedLabel = videoStreams.find(s => s.id === videoSelection)?.label || 'High quality (720p)';
      const calculatedTitle = url.includes('tiktok.com') ? 'TikTok Video by @Èļħạm Jáñ' : 'Extracted Media Stream';
      
      const newLog = {
        id: Date.now(),
        title: calculatedTitle,
        platform: detectedPlatform ? detectedPlatform.name : 'Web Direct',
        format: 'MP4',
        quality: calculatedLabel,
        date: 'Just now'
      };

      setDownloadLogs(prev => [newLog, ...prev]);

      // Synthesize safe dummy object binary download link so browser actually performs download
      const fakeContent = `Social Saver Pro - Standalone Extracted Output\nSource Link: ${url}\nResolution choice: ${videoSelection}\nStatus: Client Sync Complete`;
      const blob = new Blob([fakeContent], { type: 'text/plain' });
      const objectUrl = window.URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = objectUrl;
      downloadAnchor.download = `SaverPro_${detectedPlatform ? detectedPlatform.name : 'Direct'}_${Date.now()}.mp4`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      window.URL.revokeObjectURL(objectUrl);
      downloadAnchor.remove();

    }, 3400);

    setTimeout(() => {
      setProcessingState('idle');
      setUrl('');
    }, 6500);
  };

  return (
    <div className="app-dashboard-wrapper">
      <style>{customStyles}</style>
      {/* LEFT COLUMN: INTERACTIVE CONTROL & SIMULATOR CONTROLLER PANEL */}
      <div className="control-sidebar-left hidden lg:flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: 'rgba(255, 204, 0, 0.1)', padding: '10px', borderRadius: '12px' }}>
            <Sparkles size={24} color="var(--yellow-primary)" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Simulation Hub</h2>
            <p style={{ fontSize: '11px', color: 'var(--slate-400)', margin: '2px 0 0 0' }}>Trigger and test real mobile interactions</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          <div className="control-headline-sim">1. App "Share To" Interaction</div>
          <button className="sim-action-btn-blue" onClick={triggerMobileShareChain}>
            <Share2 size={16} />
            Simulate "Share Video"
          </button>
          <p style={{ fontSize: '11px', color: 'var(--slate-400)', margin: '0 0 10px 0', textAlign: 'left', lineHeight: '1.4' }}>
            Launches simulated TikTok player feed. Clicking "Share" in the video sidebar shows Social Saver Pro, passing content directly into the tool.
          </p>

          <div className="control-headline-sim">2. Background Clipboard Sync</div>
          <button className="sim-action-btn-border" onClick={() => runSimulatedClipboardCopy(sampleTikTokLink)}>
            <Copy size={16} color="var(--yellow-primary)" />
            Simulate Copy Link
          </button>
          <p style={{ fontSize: '11px', color: 'var(--slate-400)', margin: '0 0 10px 0', textAlign: 'left', lineHeight: '1.4' }}>
            Triggers system background copied link alert. Displays instant floating quick action banner inside phone container immediately.
          </p>
        </div>

        <div className="sim-helper-card-info">
          <div style={{ display: 'flex', gap: '6px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
            <Info size={12} color="var(--yellow-primary)" />
            <span>Interactive Live Simulation</span>
          </div>
          You can interact with all components on the right simulated phone panel. Explore the multi-resolution menu items or checkout history logs tabs.
        </div>
      </div>

      {/* CENTER WORK CONSOLE AREA */}
      <div className="main-work-console">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={24} color="var(--yellow-primary)" />
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>Social Saver Pro</span>
          </div>

          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              onClick={() => { setActiveScreen('app_home'); setInnerActiveTab('download'); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeScreen === 'app_home' && innerActiveTab === 'download' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              Downloader
            </button>
            <button 
              onClick={() => { setActiveScreen('app_home'); setInnerActiveTab('history'); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeScreen === 'app_home' && innerActiveTab === 'history' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              History ({downloadLogs.length})
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 14px 0' }}>Active Workspace Settings</h2>
          <p style={{ fontSize: '13px', color: 'var(--slate-400)', lineHeight: '1.6', margin: '0 0 20px 0' }}>
            Social Saver Pro extracts raw visual and auditory streams directly from system endpoints. In this simulator mode, you can toggle configurations and test system workflows.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Smartphone size={16} color="var(--yellow-primary)" />
                <span style={{ fontSize: '12px', fontWeight: '700' }}>Platform Mode</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--slate-400)', margin: 0 }}>
                Simulating a high-performance native iOS / Android media extraction overlay.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={16} color="#34d399" />
                <span style={{ fontSize: '12px', fontWeight: '700' }}>Extractor Node status</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--slate-400)', margin: 0 }}>
                Active and Secure. Client-side sandbox fallback ready for standalone deployments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: SIMULATED MOBILE DEVICE PREVIEW */}
      <div className="interactive-preview-column">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', maxWidth: '350px', marginBottom: '12px', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Smartphone size={14} color="var(--yellow-primary)" />
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Interactive Device Viewport</span>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--slate-400)', margin: 0 }}>
            Interact directly inside this container window to test flows.
          </p>
        </div>

        <div className="standalone-phone-container">
          {/* Top Camera Notch */}
          <div className="notch-area">
            <div className="notch-bar"></div>
          </div>

          {/* Status Bar */}
          <div className="status-bar-phone">
            <span style={{ fontWeight: '600' }}>1:36 AM</span>
            <div className="status-icons-row">
              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '700' }}>4G</span>
              <ShieldCheck size={12} color="#10b981" />
              <span>43%</span>
            </div>
          </div>

          {/* Device Screen Area */}
          <div className="screen-port">
            
            {/* IN-APP TOAST SYSTEM BANNER DETECTOR */}
            {showNotificationAlert && (
              <div className="system-toast-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--yellow-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clipboard size={12} />
                    Copied Link Detected
                  </span>
                  <span style={{ fontSize: '8px', backgroundColor: '#eab308', color: '#000', padding: '1px 5px', borderRadius: '3px', fontWeight: '900' }}>NEW</span>
                </div>
                <div className="toast-link-line">{copiedNotificationUrl}</div>
                <div className="toast-actions-row">
                  <button className="toast-btn-ignore" onClick={() => setShowNotificationAlert(false)}>Ignore</button>
                  <button className="toast-btn-apply" onClick={handleApplyToastLink}>
                    <Download size={10} />
                    Fetch Stream
                  </button>
                </div>
              </div>
            )}

            {/* SOCIAL VIDEO FEED VIEW SCREEN (SCREENSHOT 1 REPLICATION) */}
            {activeScreen === 'social_tiktok_feed' && (
              <div className="social-player-screen">
                
                {/* Simulated TikTok Top Header Banner */}
                <div className="social-header-overlay">
                  <div className="social-header-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#444', overflow: 'hidden' }}>
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700' }}>リムんリム ﾑｷﾑんﾑ刀</span>
                        <span style={{ fontSize: '8px', color: '#a1a1aa' }}>Join me on TikTok!</span>
                      </div>
                    </div>
                    <button style={{ backgroundColor: '#fe2c55', color: '#fff', fontSize: '10px', fontWeight: '800', border: 'none', borderRadius: '6px', padding: '5px 10px' }}>
                      Open app
                    </button>
                  </div>
                </div>

                {/* Video canvas backdrop */}
                <div className="social-video-backdrop" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80')` }}>
                  <div className="social-video-gradient"></div>

                  <div className="play-center-btn">
                    <Play size={20} fill="#fff" color="#fff" />
                  </div>

                  {/* Video Actions sidebar panel */}
                  <div className="social-sidebar-actions">
                    <div className="sidebar-user-avatar">
                      <img className="sidebar-avatar-img" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="avatar" />
                      <div className="sidebar-follow-plus">
                        <Plus size={10} color="#fff" />
                      </div>
                    </div>

                    <button className="sidebar-action-button">
                      <div className="sidebar-action-circle">
                        <Heart size={18} fill="#fff" />
                      </div>
                      <span className="sidebar-number-label">{mockTikTokDetails.likesCount}</span>
                    </button>

                    <button className="sidebar-action-button">
                      <div className="sidebar-action-circle">
                        <MessageSquare size={18} fill="#fff" />
                      </div>
                      <span className="sidebar-number-label">{mockTikTokDetails.commentsCount}</span>
                    </button>

                    <button className="sidebar-action-button" onClick={() => setIsShareOverlayOpen(true)}>
                      <div className="sidebar-action-circle" style={{ backgroundColor: '#fe2c55' }}>
                        <Share2 size={18} fill="#fff" color="#fff" />
                      </div>
                      <span className="sidebar-number-label">{mockTikTokDetails.sharesCount}</span>
                    </button>
                  </div>

                  {/* Bottom Video metadata */}
                  <div className="social-bottom-meta">
                    <div className="social-author-tag">
                      {mockTikTokDetails.author}
                      <span style={{ fontSize: '9px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '3px' }}>Original</span>
                    </div>
                    <p className="social-desc-text">
                      like repost 🇦🇫 <br />
                      original sound
                    </p>
                  </div>

                  {/* FLOATING ACTION BANNER OVERLAY FROM SCREENSHOT 1 */}
                  <div className="social-floating-capsule">
                    <button className="pill-action-tiktok">
                      Watch on TikTok
                    </button>
                    <button className="pill-action-download" onClick={() => {
                      setUrl(mockTikTokDetails.url);
                      setActiveScreen('app_home');
                      setIsFormatSelectorOpen(true);
                    }}>
                      <Download size={12} strokeWidth={3} />
                      Download
                    </button>
                  </div>

                  {/* Pashto Translated Urdu comment overlay matching Screenshot 1 */}
                  <div className="urdu-comment-overlay">
                    <div className="comment-avatar">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="comment-content-block">
                      <div className="comment-meta-header">
                        <span className="comment-username">{mockTikTokDetails.topComment.userHandle}</span>
                        <Heart size={10} color="#64748b" />
                      </div>
                      <p className="comment-translated-pashto">
                        {mockTikTokDetails.topComment.textPashto}
                      </p>
                      <div className="comment-sub-links">
                        <span>{mockTikTokDetails.topComment.timeLabel}</span>
                        <span style={{ fontWeight: '700', color: '#94a3b8' }}>Reply</span>
                      </div>
                    </div>
                  </div>

                  {/* Sponsor 666D ad replica bottom strip from Screenshot 1 */}
                  <div className="replica-sponsor-strip">
                    <div className="sponsor-left-branding">
                      <div className="sponsor-box-icon">666D</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="sponsor-headline-rtl">روزانہ حاضری تے نقد! دوگنا موقع! فوری پیسے کڈھاؤ</span>
                        <span style={{ fontSize: '8px', color: '#64748b', textAlign: 'left' }}>AD • 666D.com</span>
                      </div>
                    </div>
                    <button className="sponsor-action-register" onClick={() => alert('Redirecting to sponsor portal...')}>
                      ابن رجسٹر کرو
                    </button>
                  </div>

                </div>

                {/* Simulated Native Share Sheet Selector */}
                {isShareOverlayOpen && (
                  <div className="share-overlay-mask" onClick={() => setIsShareOverlayOpen(false)}>
                    <div className="share-options-box" onClick={e => e.stopPropagation()}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#8e8e93', textAlign: 'center' }}>Send video to</div>
                      <div className="share-target-apps">
                        <button className="share-app-icon-btn" onClick={executeShareTargetClick}>
                          <div className="share-app-logo-box" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: '1px solid #ffcc00' }}>
                            <Download size={20} color="#fff" />
                          </div>
                          <span style={{ fontSize: '10px', color: '#ffcc00', fontWeight: '700' }}>Saver Pro</span>
                        </button>

                        <button className="share-app-icon-btn">
                          <div className="share-app-logo-box" style={{ backgroundColor: '#25d366' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800' }}>WA</span>
                          </div>
                          <span style={{ fontSize: '10px', color: '#fff' }}>WhatsApp</span>
                        </button>

                        <button className="share-app-icon-btn" onClick={() => {
                          setIsShareOverlayOpen(false);
                          runSimulatedClipboardCopy(mockTikTokDetails.url);
                        }}>
                          <div className="share-app-logo-box" style={{ backgroundColor: '#444' }}>
                            <LinkIcon size={16} />
                          </div>
                          <span style={{ fontSize: '10px', color: '#fff' }}>Copy Link</span>
                        </button>
                      </div>

                      <button style={{ backgroundColor: '#2c2c2e', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', width: '100%', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setIsShareOverlayOpen(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* SCREEN B: MAIN SYSTEM HOME SCREEN CONTROLLER */}
            {activeScreen === 'app_home' && (
              <div className="active-app-panel">
                
                {innerActiveTab === 'download' && (
                  <div className="main-panel-inner entry-fade-in">
                    
                    {/* Brand header */}
                    <div className="brand-header-area">
                      <div className="brand-circle-logo">
                        <Download size={24} color="#fff" />
                      </div>
                      <h1 className="brand-title-text">Social Saver Pro</h1>
                      <p className="brand-desc-tag">
                        Premium extraction engine for social multimedia structures.
                      </p>
                    </div>

                    {/* Inputs panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="input-group-relative">
                        <LinkIcon size={14} />
                        <input
                          type="text"
                          className="custom-url-field"
                          placeholder="Paste video sharing link here..."
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                        />
                        <button className="embedded-paste-btn" onClick={handleManualPaste}>
                          <Clipboard size={11} />
                          Paste
                        </button>
                      </div>

                      {/* Display platform if detected */}
                      {detectedPlatform && (
                        <div className={`pill-platform-tag ${detectedPlatform.colorClass} entry-fade-in`}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="platform-icon-square">{detectedPlatform.icon}</span>
                            Source Identified: {detectedPlatform.name}
                          </span>
                          <Sparkles size={14} className="animate-pulse" />
                        </div>
                      )}

                      {/* Process button */}
                      {isInputUrlPresent && processingState === 'idle' && (
                        <button 
                          className="sheet-download-action-btn"
                          onClick={() => setIsFormatSelectorOpen(true)}
                          style={{ marginTop: '8px' }}
                        >
                          <Download size={16} strokeWidth={3} />
                          Choose Streams & Qualities
                        </button>
                      )}

                      {/* Simulated progress container */}
                      {processingState !== 'idle' && (
                        <div style={{ backgroundColor: '#1c1c1e', padding: '16px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700' }}>
                            <span style={{ textTransform: 'uppercase', color: 'var(--yellow-primary)' }}>{processingState}</span>
                            <span>{extractionProgress}%</span>
                          </div>

                          <div style={{ width: '100%', height: '5px', backgroundColor: '#2c2c2e', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ width: `${extractionProgress}%`, height: '100%', backgroundColor: 'var(--yellow-primary)', transition: 'width 0.25s ease' }}></div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#8e8e93' }}>
                            <Loader2 size={11} className="animate-spin-loader" color="var(--yellow-primary)" />
                            <span>{activeStatusString}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Supported gateways */}
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '0.08em', color: '#555', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
                        Supported Gateways
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {['TikTok', 'Instagram', 'YouTube', 'Facebook'].map(plat => (
                          <div key={plat} style={{ backgroundColor: '#111', padding: '8px', borderRadius: '10px', border: '1px solid #1c1c1e', textAlign: 'center', fontSize: '10px', fontWeight: '700' }}>
                            {plat}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* APP VIEW TAB: DOWNLOAD LOGS HISTORY */}
                {innerActiveTab === 'history' && (
                  <div className="main-panel-inner entry-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Download Logs</h2>
                      <button onClick={() => setDownloadLogs([])} style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '11px', cursor: 'pointer' }}>
                        Clear
                      </button>
                    </div>

                    {downloadLogs.length === 0 ? (
                      <div style={{ padding: '36px 0', textAlign: 'center', color: '#555' }}>
                        <History size={36} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                        No histories registered yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {downloadLogs.map(item => (
                          <div key={item.id} className="history-item-row">
                            <div className="history-left-meta">
                              <span className="history-video-title">{item.title}</span>
                              <div className="history-sub-meta">
                                <span className="history-platform-badge">{item.platform}</span>
                                <span>•</span>
                                <span>{item.quality}</span>
                                <span>•</span>
                                <span>{item.date}</span>
                              </div>
                            </div>
                            <div className="history-circle-check-btn">
                              <Check size={12} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* APP VIEW TAB: USER GUIDE TAB */}
                {innerActiveTab === 'guide' && (
                  <div className="main-panel-inner entry-fade-in" style={{ textAlign: 'left' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '10px' }}>User Guide</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ backgroundColor: '#111', padding: '12px', borderRadius: '12px', border: '1px solid #1c1c1e' }}>
                        <span style={{ color: 'var(--yellow-primary)', fontWeight: '700', fontSize: '12px' }}>1. Copy Shared Video URL</span>
                        <p style={{ fontSize: '11px', color: '#8e8e93', margin: '2px 0 0 0' }}>Copy links from TikTok or Instagram players directly.</p>
                      </div>

                      <div style={{ backgroundColor: '#111', padding: '12px', borderRadius: '12px', border: '1px solid #1c1c1e' }}>
                        <span style={{ color: 'var(--yellow-primary)', fontWeight: '700', fontSize: '12px' }}>2. Specify Stream Format</span>
                        <p style={{ fontSize: '11px', color: '#8e8e93', margin: '2px 0 0 0' }}>Configure Classic MP3 conversions or direct 720p HD streaming channels.</p>
                      </div>

                      <div style={{ backgroundColor: '#111', padding: '12px', borderRadius: '12px', border: '1px solid #1c1c1e' }}>
                        <span style={{ color: 'var(--yellow-primary)', fontWeight: '700', fontSize: '12px' }}>3. Dispatch Processing</span>
                        <p style={{ fontSize: '11px', color: '#8e8e93', margin: '2px 0 0 0' }}>Initiate process to download zero-loss media files safely into device galleries.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom navigation tab-bar inside phone frame */}
                <div className="phone-bottom-navigation">
                  <button 
                    className={`bottom-nav-tab-btn ${innerActiveTab === 'download' ? 'active' : ''}`}
                    onClick={() => setInnerActiveTab('download')}
                  >
                    <Download size={18} />
                    <span className="bottom-nav-label">Downloader</span>
                  </button>

                  <button 
                    className={`bottom-nav-tab-btn ${innerActiveTab === 'history' ? 'active' : ''}`}
                    onClick={() => setInnerActiveTab('history')}
                  >
                    <History size={18} />
                    <span className="bottom-nav-label">History</span>
                  </button>

                  <button 
                    className={`bottom-nav-tab-btn ${innerActiveTab === 'guide' ? 'active' : ''}`}
                    onClick={() => setInnerActiveTab('guide')}
                  >
                    <HelpCircle size={18} />
                    <span className="bottom-nav-label">Guide</span>
                  </button>
                </div>

                <div className="screen-home-indicator"></div>
              </div>
            )}

            {/* SCREEN C: MORE FORMATS SPECIFIC PREVIEW PAGE (SCREENSHOT 3 REPLICATION) */}
            {activeScreen === 'more_formats' && (
              <div className="formats-full-page entry-fade-in">
                
                {/* Header matching Screenshot 3 back icon */}
                <div className="formats-page-header">
                  <button className="back-arrow-btn" onClick={() => {
                    setActiveScreen('app_home');
                    setIsFormatSelectorOpen(true);
                  }}>
                    <ArrowLeft size={20} />
                  </button>
                  <span className="formats-page-title-text" style={{ fontSize: '16px', fontWeight: '700' }}>More formats</span>
                </div>

                <div className="formats-page-content">
                  
                  {/* Music Streams in Screenshot 3 */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="sheet-section-title">Music</div>
                    {audioStreams.map(opt => (
                      <div 
                        key={opt.id}
                        className={`sheet-format-row ${musicSelection === opt.id ? 'selected' : ''}`}
                        onClick={() => setMusicSelection(opt.id)}
                      >
                        <div className="sheet-row-left">
                          <Music size={16} color={musicSelection === opt.id ? "var(--yellow-primary)" : "#8e8e93"} />
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span className="format-main-label">{opt.label}</span>
                            <span style={{ fontSize: '10px', color: '#8e8e93', marginTop: '1px' }}>{opt.subtitle}</span>
                          </div>
                        </div>
                        <div className="sheet-row-right">
                          <span className={`format-size-label ${musicSelection === opt.id ? 'selected-color' : ''}`}>{opt.size}</span>
                          <div className={`radio-check-ring ${musicSelection === opt.id ? 'selected' : ''}`}>
                            {musicSelection === opt.id && <div className="radio-inner-core"></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Video Streams resolution grids in Screenshot 3 */}
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
                    <div className="sheet-section-title">Video</div>
                    {videoStreams.map(opt => (
                      <div 
                        key={opt.id}
                        className={`sheet-format-row ${videoSelection === opt.id ? 'selected' : ''}`}
                        onClick={() => setVideoSelection(opt.id)}
                      >
                        <div className="sheet-row-left">
                          <Film size={16} color={videoSelection === opt.id ? "var(--yellow-primary)" : "#8e8e93"} />
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span className="format-main-label">
                              {opt.label}
                              {opt.badge && (
                                <span style={{ fontSize: '8px', padding: '1px 4px', borderRadius: '3px', backgroundColor: '#3a3a3c', color: '#f87171', fontWeight: '800', marginLeft: '6px' }}>
                                  {opt.badge}
                                </span>
                              )}
                            </span>
                            <span style={{ fontSize: '10px', color: '#8e8e93', marginTop: '1px' }}>{opt.subtitle}</span>
                          </div>
                        </div>
                        <div className="sheet-row-right">
                          <span className={`format-size-label ${videoSelection === opt.id ? 'selected-color' : ''}`}>{opt.size}</span>
                          <div className={`radio-check-ring ${videoSelection === opt.id ? 'selected' : ''}`}>
                            {videoSelection === opt.id && <div className="radio-inner-core"></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Settings section "Remember my choice" switch slider from Screenshot 3 */}
                  <div className="switch-row-item">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700' }}>Remember my choice</span>
                      <span style={{ fontSize: '10px', color: '#8e8e93', marginTop: '1px' }}>Save default format configurations</span>
                    </div>
                    <div 
                      className={`slider-box ${isChoiceRemembered ? 'active' : ''}`}
                      onClick={() => setIsChoiceRemembered(!isChoiceRemembered)}
                    >
                      <div className="slider-dot"></div>
                    </div>
                  </div>

                  <button className="sheet-download-action-btn" onClick={() => {
                    setActiveScreen('app_home');
                    runEmulatedDownload();
                  }}>
                    <Download size={14} strokeWidth={3} />
                    Download Stream
                  </button>

                </div>

                <div className="screen-home-indicator"></div>
              </div>
            )}

            {/* MOCK BOTTOM FORMAT PICKER SHEET (SCREENSHOT 2 REPLICATION) */}
            {isFormatSelectorOpen && (
              <div className="picker-backdrop" onClick={() => setIsFormatSelectorOpen(false)}>
                <div className="picker-bottom-sheet" onClick={e => e.stopPropagation()}>
                  <div className="sheet-header-line"></div>
                  <div className="sheet-title-text">Download</div>

                  {/* Music section subset replicating Screenshot 2 */}
                  <div className="sheet-section-title">Music</div>
                  <div 
                    className={`sheet-format-row ${musicSelection === 'classic_mp3' ? 'selected' : ''}`}
                    onClick={() => setMusicSelection('classic_mp3')}
                  >
                    <div className="sheet-row-left">
                      <Music size={16} />
                      <span className="format-main-label">Classic MP3</span>
                    </div>
                    <div className="sheet-row-right">
                      <span className="format-size-label">≈141.0 KB</span>
                      <div className={`radio-check-ring ${musicSelection === 'classic_mp3' ? 'selected' : ''}`}>
                        {musicSelection === 'classic_mp3' && <div className="radio-inner-core"></div>}
                      </div>
                    </div>
                  </div>

                  {/* Video section subset replicating Screenshot 2 */}
                  <div className="sheet-section-title" style={{ marginTop: '8px' }}>Video</div>
                  <div 
                    className={`sheet-format-row ${videoSelection === '480p' ? 'selected' : ''}`}
                    onClick={() => setVideoSelection('480p')}
                  >
                    <div className="sheet-row-left">
                      <Film size={16} />
                      <span className="format-main-label">Fast (480p)</span>
                    </div>
                    <div className="sheet-row-right">
                      <span className="format-size-label">677.8 KB</span>
                      <div className={`radio-check-ring ${videoSelection === '480p' ? 'selected' : ''}`}>
                        {videoSelection === '480p' && <div className="radio-inner-core"></div>}
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`sheet-format-row ${videoSelection === '720p' ? 'selected' : ''}`}
                    onClick={() => setVideoSelection('720p')}
                  >
                    <div className="sheet-row-left">
                      <Film size={16} />
                      <span className="format-main-label">High quality (720p)</span>
                    </div>
                    <div className="sheet-row-right">
                      <span className="format-size-label selected-color" style={{ color: 'var(--yellow-primary)' }}>1.4 MB</span>
                      <div className={`radio-check-ring ${videoSelection === '720p' ? 'selected' : ''}`}>
                        {videoSelection === '720p' && <div className="radio-inner-core"></div>}
                      </div>
                    </div>
                  </div>

                  {/* More Formats triggers deep link row matching Screenshot 2 */}
                  <div className="more-formats-toggle-link" onClick={() => {
                    setIsFormatSelectorOpen(false);
                    setActiveScreen('more_formats');
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '700' }}>More formats</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#8e8e93' }}>
                      <span style={{ fontSize: '11px' }}>All</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>

                  {/* Main Action Trigger */}
                  <button className="sheet-download-action-btn" onClick={runEmulatedDownload}>
                    Download
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}