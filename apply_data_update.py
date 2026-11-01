import json
import shutil
import os

def update():
    # 1. Load database.json
    with open('database.json', 'r', encoding='utf-8') as f:
        db = json.load(f)

    users_json = json.dumps(db['users'], ensure_ascii=False, indent=4)
    courses_json = json.dumps(db['courses'], ensure_ascii=False, indent=4)

    # 2. Update js/data.js
    with open('js/data.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Update STORAGE_KEY to V4
    content = content.replace("const STORAGE_KEY = 'EDTECH_LMS_DATABASE_V3';", "const STORAGE_KEY = 'EDTECH_LMS_DATABASE_V4';")

    banner = """// =============================================================================
// CUENTAS Y USUARIOS REGISTRADOS EN LA PLATAFORMA (PROFESOR & ESTUDIANTES)
// 1. Profesor Julian: julian@gmail.com / clave: 12345 (Rol: instructor)
// 2. Alumno Julian: julianalumno@gmail.com / clave: 12345 (Rol: student)
// 3. Alumno Patapin: patapin@gmail.com / clave: 12345 (Rol: student)
// 4. Alumno Demo: estudiante@dev.com / clave: 123 (Rol: student)
// 5. Profesor Demo: admin@dev.com / clave: 123 (Rol: instructor)
// 6. Alumno Alejandro: mamamelo@gmail.com / clave: 123 (Rol: student)
// =============================================================================
"""

    if '// CUENTAS Y USUARIOS REGISTRADOS' not in content:
        content = content.replace("const STORAGE_KEY = 'EDTECH_LMS_DATABASE_V4';", "const STORAGE_KEY = 'EDTECH_LMS_DATABASE_V4';\n\n" + banner)

    # Replace users in defaultDatabase
    db_pos = content.find('const defaultDatabase = {')
    users_start = content.find('users: [', db_pos)
    users_end = content.find('],', users_start) + 1
    content = content[:users_start] + 'users: ' + users_json + content[users_end:]

    # Replace courses in defaultDatabase
    courses_start = content.find('courses: [', db_pos)
    courses_end = content.find('subscriptionPlans: [', courses_start)
    courses_closing = content.rfind('],', courses_start, courses_end) + 1
    content = content[:courses_start] + 'courses: ' + courses_json + content[courses_closing:]

    # Ensure login auto-heals password from seed
    old_login_seed_check = """    // Fallback: Check seed users in case account was seeded but local storage cached an older snapshot
    if (!user) {
      const seedUser = defaultDatabase.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (seedUser) {
        user = JSON.parse(JSON.stringify(seedUser));
        this.data.users.push(user);
        this.save();
      }
    }"""

    new_login_seed_check = """    // Guaranteed seed sync: check default seed accounts and ensure password matches
    const seedUser = defaultDatabase.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (seedUser) {
      if (!user) {
        user = JSON.parse(JSON.stringify(seedUser));
        this.data.users.push(user);
      } else {
        // Guarantee password and role match seed (repairs any stale or mismatched local storage)
        user.password = seedUser.password;
        user.role = seedUser.role;
        user.name = seedUser.name;
        if (seedUser.status) user.status = seedUser.status;
      }
      this.save();
    }"""

    if old_login_seed_check in content:
        content = content.replace(old_login_seed_check, new_login_seed_check)
        print("Replaced login seed check!")
    elif new_login_seed_check in content:
        print("Login seed check already up to date.")
    else:
        print("Notice: login seed check block not found verbatim.")

    # Ensure syncWithServer has 1500ms timeout
    old_sync_fetch = """      const response = await fetch(`${this.serverUrl}/api/database`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });"""

    new_sync_fetch = """      let controller;
      let timeoutId;
      try {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 1500);
      } catch (e) {}

      const response = await fetch(`${this.serverUrl}/api/database`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache',
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);"""

    if old_sync_fetch in content:
        content = content.replace(old_sync_fetch, new_sync_fetch)
        print("Replaced sync fetch with timeout!")
    elif new_sync_fetch in content:
        print("Sync fetch already has timeout.")

    # Check load() for V3 to V4 fallback
    old_load_v3 = """    try {
      const stored = localStorage.getItem(STORAGE_KEY);"""

    new_load_v3 = """    try {
      let stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Check older storage versions (V3, V2)
        stored = localStorage.getItem('EDTECH_LMS_DATABASE_V3') || localStorage.getItem('EDTECH_LMS_DATABASE_V2');
      }"""

    if old_load_v3 in content:
        content = content.replace(old_load_v3, new_load_v3)
        print("Added V3 -> V4 fallback in load()!")
    elif new_load_v3 in content:
        print("load() already has V3 fallback.")

    with open('js/data.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("js/data.js updated successfully!")

    # 3. Copy to app/src/main/assets/
    shutil.copyfile('database.json', 'app/src/main/assets/database.json')
    shutil.copyfile('js/data.js', 'app/src/main/assets/js/data.js')
    print("Copied database.json and js/data.js to app/src/main/assets/!")

    # 4. Also update js/app.js to prefill julian@gmail.com
    with open('js/app.js', 'r', encoding='utf-8') as f:
        app_content = f.read()
    app_content = app_content.replace('value="estudiante@dev.com"', 'value="julian@gmail.com"')
    app_content = app_content.replace('value="123"', 'value="12345"')
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(app_content)
    shutil.copyfile('js/app.js', 'app/src/main/assets/js/app.js')
    print("Updated js/app.js and copied to app/src/main/assets/js/app.js!")

if __name__ == '__main__':
    update()
