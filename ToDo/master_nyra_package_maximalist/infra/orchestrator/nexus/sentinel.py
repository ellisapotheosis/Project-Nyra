# Save as: sentinel.py
import time
import yaml
import os
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

NEXUS_URL = "http://localhost:8000/_internal/reload"
CONFIG_FILE = "nexus.yaml"

class ConfigSentry(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith(CONFIG_FILE):
            print(f"⚡ DETECTED CHANGE IN {CONFIG_FILE}")
            try:
                # 1. Pre-Flight Check: Validate YAML Syntax
                with open(CONFIG_FILE, 'r') as f:
                    yaml.safe_load(f)
                print("✅ SYNTAX VALID. INITIATING HOT RELOAD...")
                
                # 2. Trigger Nexus Reload
                response = requests.post(NEXUS_URL, headers={"X-Admin-Token": os.getenv("NEXUS_ADMIN_TOKEN")})
                if response.status_code == 200:
                    print(f"🚀 NEXUS RELOADED SUCCESSFULLY: {response.json().get('timestamp')}")
                else:
                    print(f"❌ RELOAD FAILED: {response.text}")
                    
            except yaml.YAMLError as e:
                print(f"🛑 INVALID YAML CONFIG. RELOAD ABORTED.\nError: {e}")

if __name__ == "__main__":
    print("👁️  NEXUS SENTRY WATCHING...")
    observer = Observer()
    observer.schedule(ConfigSentry(), path=".", recursive=False)
    observer.start()
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()