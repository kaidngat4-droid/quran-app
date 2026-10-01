#!/usr/bin/env python3
"""جلب صور مصحف التجويد من QuranHub"""
import os
import subprocess
import sys

TARGET = "pages-img"
REPO = "https://github.com/QuranHub/quran-pages-images.git"

print("📥 جلب صور مصحف التجويد...")
print("=" * 50)

if os.path.exists(TARGET) and len([f for f in os.listdir(TARGET) if f.endswith('.jpg')]) >= 600:
    print("✅ الصور موجودة")
    sys.exit(0)

if os.path.exists("temp-pages"):
    subprocess.run(["rm", "-rf", "temp-pages"])

try:
    subprocess.run(["git", "clone", "--depth", "1", REPO, "temp-pages"], check=True)
    print("✅ تم الاستنساخ")
except subprocess.CalledProcessError as e:
    print(f"❌ فشل: {e}")
    sys.exit(1)

os.makedirs(TARGET, exist_ok=True)
src = "temp-pages/easyquran.com/hafs-tajweed"

if not os.path.exists(src):
    print(f"❌ غير موجود: {src}")
    sys.exit(1)

files = [f for f in os.listdir(src) if f.endswith('.jpg')]
print(f"📋 نسخ {len(files)} صورة...")

for i, f in enumerate(files):
    subprocess.run(["cp", os.path.join(src, f), TARGET + "/"])
    if (i + 1) % 100 == 0:
        print(f"✅ {i+1}/{len(files)}")

subprocess.run(["rm", "-rf", "temp-pages"])
print("=" * 50)
print(f"✅ {len(files)} صورة في {TARGET}/")
