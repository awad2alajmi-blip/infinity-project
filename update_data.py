import requests
import json
import datetime
import os
import re

# 1. إعدادات البثاثين وروابطهم
STREAMERS = {
    "GhTzy": "https://kick.com/ghtzy",
    "3Yazan": "https://kick.com/3yazan",
    "LNXX": "https://kick.com/lnxx_",
    "ik70n": "https://kick.com/ik70n",
    "IA7MD": "https://kick.com/ia7md1",
    "M8Y8": "https://kick.com/m8y8",
    "IIYousf": "https://kick.com/illyousf",
    "SkyHunter": "https://kick.com/skyhunter278"
}

def is_live_kick(channel_url):
    """وظيفة للتحقق هل البث شغال أم لا عبر قراءة كود الصفحة"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        response = requests.get(channel_url, headers=headers, timeout=15)
        if response.status_code == 200:
            # البحث عن كلمة "is_live":true أو علامة المباشر في الصفحة
            content = response.text
            if '"is_live":true' in content or 'label="Live"' in content or 'Livestreaming' in content:
                return True
        return False
    except Exception as e:
        print(f"Error checking {channel_url}: {e}")
        return False

# 2. تحميل ملف البيانات الحالي (streams.json)
file_path = 'streams.json'
if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except:
            data = {}
else:
    data = {}

# الحصول على تاريخ اليوم بتنسيق (YYYY-MM-DD)
today = datetime.datetime.now().strftime("%Y-%m-%d")

# 3. فحص كل بثاث وتحديث البيانات
updated = False
for s_id, url in STREAMERS.items():
    if is_live_kick(url):
        print(f"🔴 {s_id} is LIVE! Updating hours...")
        if today not in data:
            data[today] = []
        
        found = False
        for entry in data[today]:
            if entry['streamerId'] == s_id:
                # بما أن السكربت يعمل كل 30 دقيقة، نضيف 0.5 ساعة
                entry['hours'] = round(entry.get('hours', 0) + 0.5, 2)
                found = True
                break
        
        if not found:
            data[today].append({
                "streamerId": s_id,
                "hours": 0.5,
                "game": "بث مباشر",
                "title": "بث تلقائي عبر Kick"
            })
        updated = True
    else:
        print(f"⚪ {s_id} is offline.")

# 4. حفظ التعديلات في الملف
if updated:
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("✅ streams.json has been updated.")
else:
    print("No live streams found. Nothing changed.")