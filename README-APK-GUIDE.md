# RETRO-MATIC '74 — APK Build Setup Guide

Is folder me aapka complete **Photo + Super-8 Video** app (`www/index.html`), **Release Keystore (`release-key.jks`)**, aur **Capacitor Android Release APK builder** setup ready hai.

---

## 🔑 RELEASE KEYSTORE DETAILS
* **Keystore File:** `release-key.jks` (Root & `android/app/`)
* **Key Alias:** `release-key`
* **Keystore Password:** `retromatic123`
* **Key Password:** `retromatic123`
* **Signature Schemes:** V1 (JAR Signature) + V2 (Full APK Signature)
* **Benefit:** Phone me Google Play Protect "Harmful App / Blocked" ka error nahi dega aur APK smoothly install hoga.

---

## TAREEKA 1: GitHub Cloud Build se Release APK Download karein (Recommended)
1. Repository GitHub par pushed hai: `https://github.com/mxrajat/retro-matic-74`
2. GitHub repo ke **Actions** tab me jayein -> **Build Retro-Matic 74 Android APK** workflow dekhein.
3. Build complete hone par niche **Artifacts** me **`Retro-Matic-74-Release-APK`** par click karein aur download karein.
4. Downloaded zip ko extract karke `RetroMatic-74-Release.apk` ko phone me install karein!

---

## TAREEKA 2: Local Terminal / Android SDK se Build karein
1. Dependencies install aur sync karein:
   ```bash
   npm install
   npm run init:android
   ```
2. Release APK assemble karein:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
3. Signed Release APK yahan generate hoga:
   `android/app/build/outputs/apk/release/app-release.apk`
