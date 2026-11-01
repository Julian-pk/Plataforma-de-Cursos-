import json, base64, os

# 1. Load database.json
with open('database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# Find gustavo course
gustavo = None
for c in db['courses']:
    if 'gustavo' in c['title'].lower() or c['id'] == 'course_1792595961625':
        gustavo = c
        break

if gustavo and gustavo.get('image', '').startswith('data:'):
    raw_b64 = gustavo['image'].split(',', 1)[1]
    img_bytes = base64.b64decode(raw_b64)
    img_dir = os.path.join('assets', 'images')
    os.makedirs(img_dir, exist_ok=True)
    img_path = os.path.join(img_dir, 'course_gustavo.jpg')
    with open(img_path, 'wb') as img_f:
        img_f.write(img_bytes)
    gustavo['image'] = 'assets/images/course_gustavo.jpg'
    print(f"Extracted course image to {img_path} ({len(img_bytes)} bytes)")

# Save cleaned database.json
with open('database.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("Cleaned database.json saved! File size:", os.path.getsize('database.json'))
