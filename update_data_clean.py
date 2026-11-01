import json, os

with open('database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

users_json = json.dumps(db['users'], ensure_ascii=False, indent=4)
courses_json = json.dumps(db['courses'], ensure_ascii=False, indent=4)

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

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

# Now update load() to guarantee seed users and courses
load_target = """        // Preserve users if present
        if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = JSON.parse(JSON.stringify(defaultDatabase.users));
        } else {
          // Ensure default demo users exist so test buttons work
          defaultDatabase.users.forEach(defU => {
            if (!parsed.users.some(u => u.email.toLowerCase() === defU.email.toLowerCase())) {
              parsed.users.push(JSON.parse(JSON.stringify(defU)));
            }
          });
        }"""

load_replacement = """        // Preserve users if present
        if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = JSON.parse(JSON.stringify(defaultDatabase.users));
        } else {
          // Ensure all seed users (Julian, Carlos, Mateo, etc.) exist with valid credentials
          defaultDatabase.users.forEach(defU => {
            const existingU = parsed.users.find(u => u.email.toLowerCase() === defU.email.toLowerCase());
            if (!existingU) {
              parsed.users.push(JSON.parse(JSON.stringify(defU)));
            } else {
              existingU.password = defU.password;
              existingU.role = defU.role;
              existingU.name = defU.name;
              if (defU.status) existingU.status = defU.status;
            }
          });
        }

        // Ensure all seed courses (including Vamos a la casa de gustavo) are present
        defaultDatabase.courses.forEach(defC => {
          if (!parsed.courses.some(c => c.id === defC.id)) {
            parsed.courses.unshift(JSON.parse(JSON.stringify(defC)));
          }
        });"""

if load_target in content:
    content = content.replace(load_target, load_replacement)
    print("Replaced load() logic successfully!")
else:
    print("load_target not found verbatim, let's check.")

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated js/data.js, file size is now:", os.path.getsize('js/data.js'))
