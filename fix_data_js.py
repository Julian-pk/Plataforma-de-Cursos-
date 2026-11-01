import json
import shutil
import os

def fix():
    # 1. Load database.json
    with open('database.json', 'r', encoding='utf-8') as f:
        db = json.load(f)

    # 2. Read js/data.js
    with open('js/data.js', 'r', encoding='utf-8') as f:
        content = f.read()

    db_start = content.find('const defaultDatabase = {')
    class_start = content.find('class DatabaseController')

    if db_start == -1 or class_start == -1:
        print("Error: Could not locate boundaries in js/data.js")
        return

    # Generate clean defaultDatabase code
    default_db_code = "const defaultDatabase = " + json.dumps(db, ensure_ascii=False, indent=2) + ";\n\n"

    new_content = content[:db_start] + default_db_code + content[class_start:]

    with open('js/data.js', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("js/data.js fixed! New file size:", os.path.getsize('js/data.js'))

    # Sync to Android assets
    shutil.copyfile('js/data.js', 'app/src/main/assets/js/data.js')
    shutil.copyfile('database.json', 'app/src/main/assets/database.json')
    print("Synced to app/src/main/assets/js/data.js and database.json")

if __name__ == '__main__':
    fix()
