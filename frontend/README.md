# Social Saver Pro Mobile

This frontend is now an Expo React Native app. It talks to the FastAPI backend, creates a real yt-dlp download job, downloads the generated media file on-device, and saves video to the media library when permission is granted.

## Run backend

```powershell
cd ..\backend
.\.venv\Scripts\python.exe main.py
```

The backend listens on `0.0.0.0:8000`. A physical phone must use your computer LAN IP, for example `http://192.168.1.10:8000`.

## Run mobile app

```powershell
npm install
npm start
```

Open with Expo Go, an Android emulator, or an iOS simulator. Android emulator can use `http://10.0.2.2:8000`; iOS simulator can use `http://localhost:8000`. Set the API URL inside the Backend tab before downloading from a real phone.
