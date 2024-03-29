import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess

class FileModifiedHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith('generated_response.txt'):
            print(f"File '{event.src_path}' modified. Running Python script.")
            subprocess.run(["sudo", "python3", "hosts.py"])

if __name__ == "__main__":
    path = '/var/log/dahn'  # Specify the directory containing generated_response.txt
    event_handler = FileModifiedHandler()
    observer = Observer()
    observer.schedule(event_handler, path)
    observer.start()
    print(f"Monitoring '{path}' for modifications to 'generated_response.txt'...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
