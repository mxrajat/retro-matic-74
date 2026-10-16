# RETRO-MATIC '74 — APK Build Setup Guide

Is folder me aapka complete **Photo + Super-8 Video** app (`www/index.html`), **Release Keystore (`release-key.jks`)**, aur **Capacitor Android Release APK builder** setup ready hai.

---

## 🚀 DOWNLOAD READY APK (GITHUB RELEASES)
Har push ke baad GitHub automatically signed APK bana kar **Releases** me dal deta hai:
👉 **[Download Latest APK from Releases](https://github.com/mxrajat/retro-matic-74/releases)**

Wahan se `RetroMatic-74-Release.apk` direct download karein aur phone me install kar lein!

---

## 🔑 RELEASE KEYSTORE DETAILS
* **Keystore File:** `release-key.jks` (Root & `android/app/`)
* **Key Alias:** `release-key`
* **Keystore Password:** `retromatic123`
* **Key Password:** `retromatic123`
* **Signature Schemes:** V1 (JAR Signature) + V2 (Full APK Signature)
* **Benefit:** Phone me Google Play Protect "Harmful App / Blocked" ka error nahi dega aur APK smoothly install hoga.

---

## 🛠️ LOCAL BUILD (Agar PC par build karna ho)
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
