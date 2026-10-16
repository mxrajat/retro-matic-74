const fs = require('fs');
const path = require('path');

// 1. Configure AndroidManifest.xml permissions
const manifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  const perms = `
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.FLASHLIGHT" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-feature android:name="android.hardware.camera.flash" android:required="false" />
`;
  if (!manifest.includes('android.permission.CAMERA')) {
    manifest = manifest.replace('</manifest>', perms + '\n</manifest>');
    fs.writeFileSync(manifestPath, manifest, 'utf8');
    console.log('✅ Added Camera, Flashlight, Mic & Storage permissions to AndroidManifest.xml');
  }
}

// 2. Configure MainActivity.java with Native Gallery Auto-Saver Bridge
const javaDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'java', 'com', 'craftcam', 'lofi');
const mainActivityPath = path.join(javaDir, 'MainActivity.java');
if (fs.existsSync(mainActivityPath)) {
  const customMainActivity = `package com.craftcam.lofi;

import android.Manifest;
import android.content.ContentValues;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register Native Gallery Auto-Saver Bridge
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().addJavascriptInterface(new AndroidGalleryBridge(), "AndroidGallery");
            this.bridge.getWebView().setWebChromeClient(new WebChromeClient() {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(() -> request.grant(request.getResources()));
                }
            });
        }

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

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE && this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().post(() ->
                this.bridge.getWebView().evaluateJavascript("if(window.onAndroidPermissionsGranted) window.onAndroidPermissionsGranted();", null)
            );
        }
    }

    public class AndroidGalleryBridge {
        @JavascriptInterface
        public void savePhoto(String base64Data, String filename) {
            try {
                String pureBase64 = base64Data.contains(",") ? base64Data.split(",")[1] : base64Data;
                byte[] bytes = Base64.decode(pureBase64, Base64.DEFAULT);

                ContentValues values = new ContentValues();
                values.put(MediaStore.Images.Media.DISPLAY_NAME, filename);
                values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_DCIM + "/CraftCam");
                }

                Uri uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                if (uri != null) {
                    OutputStream os = getContentResolver().openOutputStream(uri);
                    if (os != null) {
                        os.write(bytes);
                        os.close();
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void saveVideo(String base64Data, String filename) {
            try {
                String pureBase64 = base64Data.contains(",") ? base64Data.split(",")[1] : base64Data;
                byte[] bytes = Base64.decode(pureBase64, Base64.DEFAULT);
                String mime = filename.endsWith(".mp4") ? "video/mp4" : "video/webm";

                ContentValues values = new ContentValues();
                values.put(MediaStore.Video.Media.DISPLAY_NAME, filename);
                values.put(MediaStore.Video.Media.MIME_TYPE, mime);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.put(MediaStore.Video.Media.RELATIVE_PATH, Environment.DIRECTORY_DCIM + "/CraftCam");
                }

                Uri uri = getContentResolver().insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, values);
                if (uri != null) {
                    OutputStream os = getContentResolver().openOutputStream(uri);
                    if (os != null) {
                        os.write(bytes);
                        os.close();
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
`;
  fs.writeFileSync(mainActivityPath, customMainActivity, 'utf8');
  console.log('✅ Updated MainActivity.java with Instant Camera WebChromeClient + Auto Gallery Saver');
}

// 3. Configure Release Signing in android/app/build.gradle
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
            storePassword 'craftcam123'
            keyAlias 'craftcam'
            keyPassword 'craftcam123'
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

// 4. Copy release-key.jks to android/app/ if available
const rootKeystore = path.join(__dirname, 'release-key.jks');
const appKeystore = path.join(__dirname, 'android', 'app', 'release-key.jks');
if (fs.existsSync(rootKeystore) && fs.existsSync(path.join(__dirname, 'android', 'app'))) {
  fs.copyFileSync(rootKeystore, appKeystore);
  console.log('✅ Copied release-key.jks to android/app/');
}
