
import os
import subprocess
import webbrowser
import time
import psutil

def is_voicemod_running():
    for proc in psutil.process_iter(['name']):
        if 'voicemod' in proc.info['name'].lower():
            return True
    return False

def run_server():
    subprocess.Popen(["python", "-m", "http.server", "8000"], cwd=os.path.dirname(__file__))

def main():
    print("🔍 Checking for Voicemod...")
    if not is_voicemod_running():
        print("❌ Voicemod not running. Please start Voicemod and try again.")
        input("Press Enter to exit...")
        return

    print("✅ Voicemod is running.")
    run_server()
    time.sleep(2)
    print("🌐 Opening browser to http://localhost:8000")
    webbrowser.open("http://localhost:8000")

if __name__ == "__main__":
    main()
