#!/bin/bash
M=android/app/src/main/AndroidManifest.xml
echo "== manifest =="; ls -la "$M" || exit 0
mkdir -p android/app/src/main/res/raw
cp adhan.mp3 android/app/src/main/res/raw/adhan.mp3 || echo "فشل نسخ الصوت"
for P in POST_NOTIFICATIONS SCHEDULE_EXACT_ALARM USE_EXACT_ALARM RECEIVE_BOOT_COMPLETED VIBRATE WAKE_LOCK; do
  if ! grep -q "android.permission.$P" "$M"; then
    sed -i "s#</manifest>#    <uses-permission android:name=\"android.permission.$P\" />\n</manifest>#" "$M" || echo "تعذر $P"
  fi
done
grep -c "uses-permission" "$M"
echo "patched"
exit 0
