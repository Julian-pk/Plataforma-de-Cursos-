import json

with open('database.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

users_json = json.dumps(db['users'], ensure_ascii=False, indent=4)
# For courses, we want the gustavo course and others
courses_json = json.dumps(db['courses'], ensure_ascii=False, indent=4)

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace users: [ ... ] in defaultDatabase
# Let's find defaultDatabase = {
db_pos = content.find('const defaultDatabase = {')
users_start = content.find('users: [', db_pos)
users_end = content.find('],', users_start) + 1

new_users_block = 'users: ' + users_json

content = content[:users_start] + new_users_block + content[users_end:]

# Now replace courses: [ ... ] in defaultDatabase
courses_start = content.find('courses: [', db_pos)
# Find the matching closing of courses array before subscriptionPlans: [
courses_end = content.find('subscriptionPlans: [', courses_start)
courses_closing = content.rfind('],', courses_start, courses_end) + 1

new_courses_block = 'courses: ' + courses_json

content = content[:courses_start] + new_courses_block + content[courses_closing:]

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("js/data.js successfully updated with all users and courses in defaultDatabase seed!")
