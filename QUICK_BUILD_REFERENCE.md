# Quick Build Reference

## Setup (One-time)

1. **Configure Android SDK path** in `android/local.properties`:
   ```properties
   sdk.dir=C:/Users/YourUsername/AppData/Local/Android/Sdk
   ```

2. **For Release builds**, create keystore (one-time):
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore android/app/my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
   ```

## Build Commands

### Debug APK
```powershell
cd android
.\gradlew.bat assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK
```powershell
# Set environment variables (Windows PowerShell)
$env:KEYSTORE_PASSWORD="your-password"
$env:KEY_ALIAS="my-key-alias"
$env:KEY_PASSWORD="your-password"

cd android
.\gradlew.bat assembleRelease
```
APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Install via ADB

```bash
# Debug
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Release (uninstall old version first if needed)
adb uninstall com.weathernow.app
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Clean Build

```powershell
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

## Check Connected Devices

```bash
adb devices
```

