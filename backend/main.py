from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import yt_dlp
import uvicorn

app = FastAPI(title="Social Saver Pro API")

# Setup CORS so your local frontend web/mobile app can communicate with it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This schema handles the new polished parameters from the frontend
class VideoRequest(BaseModel):
    url: str
    format: str = "mp4"           # "mp4" or "mp3"
    quality: str = "1080p"        # "1080p", "720p", "480p"
    fps: str = "60fps"            # "60fps" or "30fps"
    audioBitrate: str = "320kbps"  # "320kbps", "192kbps", "128kbps"
    muteAudio: bool = False
    includeAlbumArt: bool = True   # Include album art in MP3 files

@app.post("/api/get-video-info")
async def get_video_info(request: VideoRequest):
    ydl_opts = {
        'quiet': True,
        'skip_download': True, # Keep server fast by only fetching links, not files
    }

    # 1. HANDLE MP3 AUDIO EXTRACTION
    if request.format == "mp3":
        # Map bitrate to audio codec bitrate
        bitrate_map = {
            "320kbps": "320",
            "192kbps": "192",
            "128kbps": "128"
        }
        target_bitrate = bitrate_map.get(request.audioBitrate, "320")
        ydl_opts['format'] = 'bestaudio/best'
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': target_bitrate,
        }]
        if request.includeAlbumArt:
            ydl_opts['writethumbnail'] = True
        
    # 2. HANDLE MP4 VIDEO EXTRACTION
    else:
        # Map resolution height strings
        height = "1080" if request.quality == "1080p" else ("720" if request.quality == "720p" else "480")
        fps_val = "60" if request.fps == "60fps" else "30"
        
        if request.muteAudio:
            # Best video stream only, discarding audio tracks
            ydl_opts['format'] = f'bestvideo[height<={height}][fps<={fps_val}]/bestvideo'
        else:
            # Best single pre-merged container matching the user resolution bounds
            ydl_opts['format'] = f'best[height<={height}][fps<={fps_val}]/best'

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            
            # Locate the direct, un-throttled media link
            direct_url = info.get("url")
            if not direct_url and "formats" in info:
                direct_url = info["formats"][-1].get("url")
            
            if not direct_url:
                raise ValueError("Unable to unlock raw download stream from provider.")

            return {
                "title": info.get("title", "SocialSaver_Content"),
                "thumbnail": info.get("thumbnail"),
                "download_url": direct_url,
                "platform": info.get("extractor_key")
            }
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Extraction failure: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)