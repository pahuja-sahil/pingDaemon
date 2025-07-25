from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import subprocess
import sys

class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Celery Beat Healthy")
    def log_message(self, format, *args):
        return

def run_health_server():
    server = HTTPServer(("", 8080), HealthHandler)
    server.serve_forever()

# Start health check server in background
health_thread = threading.Thread(target=run_health_server, daemon=True)
health_thread.start()

# Run celery beat
subprocess.run([sys.executable, "-m", "celery", "-A", "app.celery_worker", "beat", "--loglevel=info"])