PRESENTATION RATING SYSTEM

How to run it (in VS Code):
1. Install Node.js (nodejs.org, LTS version).
2. Open this folder in VS Code (File > Open Folder).
3. Open the terminal (Terminal > New Terminal) and run:
      node server.js
4. Open in the browser: http://localhost:3000
5. Teacher login: PIN 1234 (to change it: ADMIN_PIN=5555 node server.js)

To run it on everyone's phone (same WiFi):
- Find the laptop IP (Windows: ipconfig, Mac/Linux: ifconfig).
- Open on students' phones: http://<laptop-ip>:3000

To host it on the internet: deploy this folder to Render.com / Railway.app
from GitHub. Start command: node server.js
Set the ADMIN_PIN environment variable.
Note: on free hosting, data.json may occasionally reset.
