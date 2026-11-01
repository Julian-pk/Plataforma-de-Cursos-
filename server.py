#!/usr/bin/env python3
"""
Plataforma de Cursos Online y Membresias - Central Sync & Static Server
Provides multi-device synchronization for PC and Mobile Android devices.
"""

import os
import sys
import json
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

PORT = 3000
DATA_FILE = os.path.join(os.path.dirname(__file__), 'database.json')
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), 'uploads')

if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR, exist_ok=True)

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

class EdTechSyncHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable universal CORS for mobile WebView and browsers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        
        # API: Get synchronized database
        if parsed.path == '/api/database' or parsed.path == '/api/sync':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        data = f.read()
                    self.wfile.write(data.encode('utf-8'))
                    return
                except Exception as e:
                    pass
            self.wfile.write(json.dumps({"empty": True}).encode('utf-8'))
            return

        # API: Server status & network info
        if parsed.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            status = {
                "status": "online",
                "ip": get_local_ip(),
                "port": PORT,
                "hasData": os.path.exists(DATA_FILE)
            }
            self.wfile.write(json.dumps(status).encode('utf-8'))
            return

        # Fallback to static file server
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)

        if parsed.path in ['/api/database', '/api/sync']:
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length).decode('utf-8')

            try:
                data = json.loads(post_body)
                
                # If existing database file exists, merge users and courses so nothing is lost
                if os.path.exists(DATA_FILE):
                    try:
                        with open(DATA_FILE, 'r', encoding='utf-8') as f:
                            existing = json.load(f)
                        
                        # Merge users
                        if 'users' in data and 'users' in existing:
                            existing_users = {u['email'].lower(): u for u in existing['users']}
                            for u in data['users']:
                                existing_users[u['email'].lower()] = u
                            data['users'] = list(existing_users.values())

                        # Merge courses
                        if 'courses' in data and 'courses' in existing:
                            existing_courses = {c['id']: c for c in existing['courses']}
                            for c in data['courses']:
                                existing_courses[c['id']] = c
                            data['courses'] = list(existing_courses.values())

                        # Merge enrolledStudents
                        if 'enrolledStudents' in data and 'enrolledStudents' in existing:
                            existing_enrolled = {(s['email'].lower() + '_' + s['courseId']): s for s in existing['enrolledStudents']}
                            for s in data['enrolledStudents']:
                                existing_enrolled[s['email'].lower() + '_' + s['courseId']] = s
                            data['enrolledStudents'] = list(existing_enrolled.values())
                    except Exception as merge_err:
                        print("Merge notice:", merge_err)

                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "data": data}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
            return

        # Upload endpoint for PDFs or images
        if parsed.path == '/api/upload':
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length).decode('utf-8')
            try:
                payload = json.loads(post_body)
                filename = payload.get('filename', f'file_{int(os.times()[4] * 1000)}')
                base64_data = payload.get('base64Data', '')
                if ',' in base64_data:
                    base64_data = base64_data.split(',')[1]

                import base64
                file_bytes = base64.b64decode(base64_data)
                safe_name = os.path.basename(filename).replace(' ', '_')
                file_path = os.path.join(UPLOADS_DIR, safe_name)
                with open(file_path, 'wb') as f:
                    f.write(file_bytes)

                file_url = f"/uploads/{safe_name}"
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "url": file_url, "filename": safe_name}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
            return

        super().do_POST()

def run_server():
    server_address = ('0.0.0.0', PORT)
    httpd = HTTPServer(server_address, EdTechSyncHandler)
    local_ip = get_local_ip()
    print("=" * 60)
    print(f"EdTech LMS Central Sync Server Running!")
    print(f"Local access:   http://localhost:{PORT}")
    print(f"Network access: http://{local_ip}:{PORT} (Access this from your phone!)")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == '__main__':
    run_server()
