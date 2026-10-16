const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  const perms = `
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
`;
  if (!manifest.includes('android.permission.CAMERA')) {
    manifest = manifest.replace('</manifest>', perms + '\n</manifest>');
    fs.writeFileSync(manifestPath, manifest, 'utf8');
    console.log('✅ Added CAMERA & RECORD_AUDIO permissions to AndroidManifest.xml');
  }
}

// Find MainActivity.java and add runtime permission prompt + WebView permission grant
const javaDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'java', 'com', 'retromatic74', 'camera');
const mainActivityPath = path.join(javaDir, 'MainActivity.java');
if (fs.existsSync(mainActivityPath)) {
  const customMainActivity = `package com.retromatic74.camera;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        checkAndRequestPermissions();
    }

    private void checkAndRequestPermissions() {
        String[] permissions = {
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO
        };
        boolean allGranted = true;
        for (String perm : permissions) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }
        if (!allGranted) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
        }
    }
}
`;
  fs.writeFileSync(mainActivityPath, customMainActivity, 'utf8');
  console.log('✅ Updated MainActivity.java with Camera & Mic runtime permission request');
}

// Configure release signing in android/app/build.gradle
const buildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');
if (fs.existsSync(buildGradlePath)) {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  if (!buildGradle.includes('signingConfigs')) {
    const signingConfigCode = `    signingConfigs {
        release {
            def ksFile = file('release-key.jks')
            if (!ksFile.exists()) {
                ksFile = file("\${rootDir}/../release-key.jks")
            }
            storeFile ksFile
            storePassword 'retromatic123'
            keyAlias 'release-key'
            keyPassword 'retromatic123'
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }`;
    buildGradle = buildGradle.replace(/buildTypes\s*\{\s*release\s*\{[\s\S]*?\}\s*\}/, signingConfigCode);
    fs.writeFileSync(buildGradlePath, buildGradle, 'utf8');
    console.log('✅ Added Release SigningConfig (V1 + V2) to build.gradle');
  }
}

// Copy release keystore to android/app/ directory if present
const rootKeystore = path.join(__dirname, 'release-key.jks');
const appKeystore = path.join(__dirname, 'android', 'app', 'release-key.jks');
if (fs.existsSync(rootKeystore) && fs.existsSync(path.join(__dirname, 'android', 'app'))) {
  fs.copyFileSync(rootKeystore, appKeystore);
  console.log('✅ Copied release-key.jks to android/app/');
}
