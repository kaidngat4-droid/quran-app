#!/bin/bash
set -e
M=android/app/src/main/AndroidManifest.xml
mkdir -p android/app/src/main/res/raw
cp adhan.mp3 android/app/src/main/res/raw/adhan.mp3
for P in POST_NOTIFICATIONS SCHEDULE_EXACT_ALARM USE_EXACT_ALARM RECEIVE_BOOT_COMPLETED VIBRATE WAKE_LOCK; do
  grep -q "android.permission.$P" $M || sed -i "s|</manifest>|    <uses-permission android:name=\"android.permission.$P\" />\n</manifest>|" $M
done
echo "patched"
