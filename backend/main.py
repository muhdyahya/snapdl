from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from typing import Any
import shutil
import tempfile
import time
import uuid
import re

import uvicorn
import yt_dlp

app = FastAPI(title="Social Saver Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOWNLOAD_JOBS: dict[str, dict[str, Any]] = {}
JOB_TTL_SECONDS = 60 * 60


class VideoRequest(BaseModel):
    url: str
    format: str = "mp4"
    quality: str = "1080p"
    fps: str = "60fps"
    audioBitrate: str = "320kbps"
    muteAudio: bool = False
    includeAlbumArt: bool = True


def cleanup_old_jobs() -> None:
    now = time.time()
    expired = [job_id for job_id, job in DOWNLOAD_JOBS.items() if now - job["created_at"] > JOB_TTL_SECONDS]
    for job_id in expired:
        DOWNLOAD_JOBS.pop(job_id, None)


def sanitize_filename(value: str | None, fallback: str = "SocialSaver_Content") -> str:
    clean = re.sub(r"[^a-zA-Z0-9._-]+", "_", value or fallback).strip("_")
    return clean[:120] or fallback


def target_height(quality: str) -> int:
    return {"1080p": 1080, "720p": 720, "480p": 480}.get(quality, 1080)


def target_fps(fps: str) -> int:
    return 60 if fps == "60fps" else 30


def target_bitrate(audio_bitrate: str) -> str:
    return {"320kbps": "320", "192kbps": "192", "128kbps": "128"}.get(audio_bitrate, "320")


def build_format_selector(payload: VideoRequest) -> str:
    if payload.format == "mp3":
        return "bestaudio/best"

    height = target_height(payload.quality)
    fps_value = target_fps(payload.fps)
    if payload.muteAudio:
        return (
            f"bestvideo[height<={height}][fps<={fps_value}][ext=mp4]/"
            f"bestvideo[height<={height}][ext=mp4]/"
            f"bestvideo[height<={height}]/bestvideo/best"
        )

    return (
        f"bestvideo[height<={height}][fps<={fps_value}][ext=mp4]+bestaudio[ext=m4a]/"
        f"bestvideo[height<={height}][ext=mp4]+bestaudio/"
        f"best[height<={height}][fps<={fps_value}][ext=mp4]/"
        f"best[height<={height}]/best"
    )


def base_ydl_options(payload: VideoRequest) -> dict[str, Any]:
    return {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "format": build_format_selector(payload),
        "socket_timeout": 30,
        "retries": 2,
    }


def metadata_ydl_options(payload: VideoRequest) -> dict[str, Any]:
    opts = base_ydl_options(payload)
    opts.update({"skip_download": True})
    return opts


def download_ydl_options(payload: VideoRequest, output_template: str) -> dict[str, Any]:
    opts = base_ydl_options(payload)
    opts.update({
        "outtmpl": output_template,
        "restrictfilenames": True,
        "continuedl": False,
    })

    if payload.format == "mp3":
        opts["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": target_bitrate(payload.audioBitrate),
            },
            {"key": "FFmpegMetadata"},
        ]
        if payload.includeAlbumArt:
            opts["writethumbnail"] = True
            opts["postprocessors"].append({"key": "EmbedThumbnail"})
    else:
        opts["merge_output_format"] = "mp4"
        if payload.muteAudio:
            opts["postprocessors"] = [{"key": "FFmpegVideoConvertor", "preferedformat": "mp4"}]

    return opts


def pick_downloaded_file(download_dir: Path, preferred_ext: str) -> Path:
    files = [path for path in download_dir.iterdir() if path.is_file()]
    if not files:
        raise ValueError("yt-dlp did not create a downloadable file.")

    preferred = [path for path in files if path.suffix.lower() == f".{preferred_ext}"]
    candidates = preferred or [path for path in files if path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".part"}]
    if not candidates:
        raise ValueError("Only thumbnail files were produced.")

    return max(candidates, key=lambda path: path.stat().st_size)


@app.get("/api/health")
async def health() -> dict[str, str]:
    ffmpeg_path = shutil.which("ffmpeg") or "not found"
    return {
        "service": "Social Saver Pro API",
        "status": "ok",
        "yt_dlp": getattr(yt_dlp.version, "__version__", "available"),
        "ffmpeg": ffmpeg_path,
        "download_mode": "server-side yt-dlp file generation",
    }


@app.post("/api/get-video-info")
async def get_video_info(payload: VideoRequest, request: Request) -> dict[str, Any]:
    cleanup_old_jobs()
    if not payload.url.lower().startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="A valid http or https URL is required.")
    if payload.format not in {"mp4", "mp3"}:
        raise HTTPException(status_code=400, detail="Format must be mp4 or mp3.")

    try:
        with yt_dlp.YoutubeDL(metadata_ydl_options(payload)) as ydl:
            info = ydl.extract_info(payload.url, download=False)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Extraction failure: {exc}") from exc

    title = sanitize_filename(info.get("title"), "SocialSaver_Content")
    extension = "mp3" if payload.format == "mp3" else "mp4"
    filename = f"{title}.{extension}"
    job_id = uuid.uuid4().hex
    DOWNLOAD_JOBS[job_id] = {
        "created_at": time.time(),
        "payload": payload.model_dump(),
        "title": title,
        "platform": info.get("extractor_key") or info.get("extractor") or "Media",
        "thumbnail": info.get("thumbnail"),
        "duration": info.get("duration"),
        "filename": filename,
    }

    base_url = str(request.base_url).rstrip("/")
    return {
        "download_id": job_id,
        "title": info.get("title") or title,
        "thumbnail": info.get("thumbnail"),
        "duration": info.get("duration"),
        "platform": DOWNLOAD_JOBS[job_id]["platform"],
        "filename": filename,
        "download_url": f"{base_url}/api/download/{job_id}",
    }


@app.get("/api/download/{job_id}")
async def download_media(job_id: str, background_tasks: BackgroundTasks) -> FileResponse:
    cleanup_old_jobs()
    job = DOWNLOAD_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Download job expired or was not found. Create a new download job.")

    payload = VideoRequest(**job["payload"])
    download_dir = Path(tempfile.mkdtemp(prefix="social_saver_"))
    output_template = str(download_dir / "download.%(ext)s")

    try:
      with yt_dlp.YoutubeDL(download_ydl_options(payload, output_template)) as ydl:
          ydl.extract_info(payload.url, download=True)
      preferred_ext = "mp3" if payload.format == "mp3" else "mp4"
      file_path = pick_downloaded_file(download_dir, preferred_ext)
    except Exception as exc:
      shutil.rmtree(download_dir, ignore_errors=True)
      raise HTTPException(status_code=400, detail=f"Download failure: {exc}") from exc

    media_type = "audio/mpeg" if payload.format == "mp3" else "video/mp4"
    filename = job.get("filename") or f"{job.get('title', 'SocialSaver_Content')}.{payload.format}"
    background_tasks.add_task(shutil.rmtree, download_dir, ignore_errors=True)
    DOWNLOAD_JOBS.pop(job_id, None)
    return FileResponse(file_path, media_type=media_type, filename=filename, background=background_tasks)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
