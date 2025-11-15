# Android APK Build Instructions

This guide will help you build Android APKs locally using your Android SDK and JDK 17.

## Prerequisites

- ✅ Expo SDK 49
- ✅ Android SDK installed
- ✅ JDK 17 installed
- ✅ Android SDK Platform 34 and Build Tools 34.0.0 installed
- ✅ ADB (Android Debug Bridge) installed and in PATH

## Step 1: Configure Android SDK Path

The `local.properties` file tells Gradle where your Android SDK is located.

### Find Your Android SDK Path

**On Windows:**
- Open Android Studio
- Go to **File > Settings > Appearance & Behavior > System Settings > Android SDK**
- Copy the "Android SDK Location" path (typically: `C:\Users\YourUsername\AppData\Local\Android\Sdk`)

**On macOS/Linux:**
- Usually: `/Users/YourUsername/Library/Android/sdk` or `~/Android/Sdk`

### Create local.properties

Create or edit `android/local.properties` and add:

```properties
sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

**Important:** On Windows, use double backslashes (`\\`) for path separators, or use forward slashes:
```properties
sdk.dir=C:/Users/YourUsername/AppData/Local/Android/Sdk
```

## Step 2: Verify Android SDK Components

Ensure you have the following installed via Android Studio SDK Manager:

- **Android SDK Platform 34**
- **Android SDK Build-Tools 34.0.0**
- **Android SDK Platform-Tools** (for ADB)
- **NDK 23.1.7779620** (should be automatically managed)

## Step 3: Build Debug APK

The debug APK is signed with a debug keystore and is suitable for testing.

### Build Command

```bash
cd android
./gradlew assembleDebug
```

**On Windows (PowerShell):**
```powershell
cd android
.\gradlew.bat assembleDebug
```

### Output Location

The APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Install via ADB

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or if you're already in the `android` directory:
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Step 4: Build Release APK

For production releases, you need to create a keystore and configure signing.

### 4.1: Generate Release Keystore

**Important:** Keep this keystore file safe! You'll need it for all future updates.

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore android/app/my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

You'll be prompted for:
- **Keystore password**: Choose a strong password
- **Key password**: (can be same as keystore password)
- **Your name, organization, etc.**

### 4.2: Configure Keystore in build.gradle

Edit `android/app/build.gradle` and update the `signingConfigs` section:

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        storeFile file('my-release-key.jks')
        storePassword System.getenv("KEYSTORE_PASSWORD") ?: 'your-keystore-password'
        keyAlias System.getenv("KEY_ALIAS") ?: 'my-key-alias'
        keyPassword System.getenv("KEY_PASSWORD") ?: 'your-key-password'
    }
}
buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        signingConfig signingConfigs.release
        shrinkResources true
        minifyEnabled true
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

**Security Best Practice:** Use environment variables for passwords instead of hardcoding:

**On Windows (PowerShell):**
```powershell
$env:KEYSTORE_PASSWORD="your-keystore-password"
$env:KEY_ALIAS="my-key-alias"
$env:KEY_PASSWORD="your-key-password"
cd android
.\gradlew.bat assembleRelease
```

**On macOS/Linux:**
```bash
export KEYSTORE_PASSWORD="your-keystore-password"
export KEY_ALIAS="my-key-alias"
export KEY_PASSWORD="your-key-password"
cd android
./gradlew assembleRelease
```

### 4.3: Build Release APK

```bash
cd android
./gradlew assembleRelease
```

**On Windows:**
```powershell
cd android
.\gradlew.bat assembleRelease
```

### Output Location

The release APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Install Release APK via ADB

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

**Note:** If installing over a debug version, you may need to uninstall first:
```bash
adb uninstall com.weathernow.app
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Step 5: Verify APK

You can verify the APK was built correctly:

```bash
# Check APK info
aapt dump badging android/app/build/outputs/apk/release/app-release.apk

# Or use apksigner to verify signature
apksigner verify --print-certs android/app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

### Issue: "SDK location not found"

**Solution:** Ensure `android/local.properties` exists and contains the correct `sdk.dir` path.

### Issue: "Build Tools version mismatch"

**Solution:** Install Android SDK Build-Tools 34.0.0 via Android Studio SDK Manager.

### Issue: "JDK version error"

**Solution:** Ensure JDK 17 is installed and set as JAVA_HOME:
```powershell
# Windows
$env:JAVA_HOME="C:\Program Files\Java\jdk-17"

# Verify
java -version
```

### Issue: "Gradle daemon failed"

**Solution:** 
```bash
cd android
./gradlew --stop
./gradlew clean
./gradlew assembleDebug
```

### Issue: "Flipper dependencies error"

**Solution:** Flipper is only used in debug builds. If you encounter issues, you can disable it in `android/gradle.properties`:
```properties
FLIPPER_VERSION=0.182.0
```

Or remove Flipper dependencies from `android/app/build.gradle` if not needed.

### Issue: "Metro bundler not found"

**Solution:** The build process uses Expo CLI for bundling. Ensure `@expo/cli` is installed:
```bash
npm install -g @expo/cli
```

### Issue: "Keystore file not found"

**Solution:** Ensure the keystore file path in `build.gradle` is correct relative to `android/app/` directory.

### Issue: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"

**Solution:** Uninstall the existing app first:
```bash
adb uninstall com.weathernow.app
adb install app-release.apk
```

### Issue: Build takes too long

**Solutions:**
- Enable Gradle daemon (already enabled in `gradle.properties`)
- Increase memory: `org.gradle.jvmargs=-Xmx4096m` in `gradle.properties`
- Use `--no-daemon` flag if daemon causes issues

## Project Configuration Summary

Your project is configured with:

- **Expo SDK:** 49.0.0
- **React Native:** 0.72.10
- **compileSdkVersion:** 34
- **targetSdkVersion:** 34
- **minSdkVersion:** 21
- **buildToolsVersion:** 34.0.0
- **Hermes:** Enabled
- **New Architecture:** Disabled (can be enabled in `gradle.properties`)

## Next Steps

1. ✅ Project is configured for Expo Prebuild (hybrid workflow)
2. ✅ Android native code is generated in `android/` folder
3. ✅ Build configuration is aligned with Expo SDK 49
4. 🔨 Build your APKs using the commands above
5. 📱 Install and test on your device

## Additional Resources

- [Expo Prebuild Documentation](https://docs.expo.dev/workflow/prebuild/)
- [React Native Android Build Guide](https://reactnative.dev/docs/signed-apk-android)
- [Expo Build Properties Plugin](https://docs.expo.dev/versions/latest/sdk/build-properties/)

