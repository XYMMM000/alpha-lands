"""Local-only review server. No credentials or external upload."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser

if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    try:
        server = ThreadingHTTPServer(('127.0.0.1', 8787), partial(SimpleHTTPRequestHandler, directory=str(root)))
    except OSError:
        print('Port 8787 is unavailable. Close the old review server, then try again.')
        raise SystemExit(1)
    print('Review: http://127.0.0.1:8787/demo.html')
    print('Keep this window open. Press Ctrl+C to stop. No files are uploaded.')
    threading.Timer(0.8, lambda: webbrowser.open('http://127.0.0.1:8787/demo.html')).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
