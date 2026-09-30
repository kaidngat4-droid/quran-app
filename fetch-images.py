#!/usr/bin/env python3
"""
جلب صور مصحف المدينة النبوية (kfgqpc/hafs-wasat)
من مستودع QuranHub/quran-pages-images
"""
import os
import subprocess
import sys

TARGET_DIR = "pages-img"
REPO_URL = "https://github.com/QuranHub/quran-pages-images.git"

print("📥 جاري جلب صور مصحف المدينة...")
print("=" * 50)

# 1. تحقق إذا كانت الصور موجودة
if os.path.exists(TARGET_DIR) and len(os.listdir(TARGET_DIR)) >= 600:
    print(f"✅ الصور موجودة ({len(os.listdir(TARGET_DIR))} صورة)")
    sys.exit(0)

# 2. استنسخ المستودع مؤقتاً
print("⏳ استنساخ المستودع (قد يستغرق 2-5 دقائق)...")
if os.path.exists("temp-pages"):
    subprocess.run(["rm", "-rf", "temp-pages"])

try:
    subprocess.run(
        ["git", "clone", "--depth", "1", REPO_URL, "temp-pages"],
        check=True,
        capture_output=True
    )
    print("✅ تم الاستنساخ")
except subprocess.CalledProcessError as e:
    print(f"❌ فشل الاستنساخ: {e}")
    sys.exit(1)

# 3. انسخ الصور
os.makedirs(TARGET_DIR, exist_ok=True)
src = "temp-pages/kfgqpc/hafs-wasat"

if not os.path.exists(src):
    print(f"❌ لم يُعثر على المجلد: {src}")
    sys.exit(1)

print("📋 جاري النسخ...")
files = [f for f in os.listdir(src) if f.endswith((".jpg", ".png", ".jpeg"))]
for i, f in enumerate(files):
    subprocess.run(["cp", os.path.join(src, f), TARGET_DIR + "/"])
    if (i + 1) % 100 == 0:
        print(f"✅ {i+1}/{len(files)}")

# 4. احذف المؤقت
subprocess.run(["rm", "-rf", "temp-pages"])

print("=" * 50)
print(f"✅ تم نسخ {len(files)} صورة إلى {TARGET_DIR}/")
