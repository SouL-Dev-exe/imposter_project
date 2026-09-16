# 🕵️ Undercover / Pretender — Party Game Web App

A fully functional, responsive, serverless web application for the popular party game **Undercover / Pretender**, built with **React**, **Vite**, **Tailwind CSS v4**, and **Framer Motion**.

Designed for free deployment on **GitHub Pages**.

---

## ✨ Features

- **📱 Pass & Play Mode (Single Device):** Pass phone/laptop around; secret role cards flip to reveal assigned words in private.
- **📡 Peer-to-Peer Multi-Device Sync:** Play across multiple devices over serverless WebRTC data channels via PeerJS with QR Code room join.
- **🎭 Dynamic Roles:** Civilians, Impostors/Undercover, and Mr. White with custom secret word distribution.
- **📊 Anonymous Pass & Play Voting:** Interactive tallying with tie-breaker sudden-death rounds.
- **🎯 Impostor Multiple-Choice Final Guess:** Caught impostors get one last chance to guess the civilian word from candidate choices to steal the win!
- **📦 Built-in & Custom Pack Editor:** Pre-packaged categories + in-app editor to create/edit custom word packs with JSON import/export.
- **🔊 Web Audio API Synthesizer:** Custom sound effects without external file dependencies.
- **🎉 Victory Celebration:** Canvas confetti bursts on win.

---

## 🚀 Free GitHub Pages Deployment (Quick Guide)

1. Create a new empty repository on GitHub: **[https://github.com/new](https://github.com/new)**
   - Name: `imposter_project` (or any repository name)
   - Do NOT check "Initialize with README".

2. Connect your local repository and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/imposter_project.git
   git push -u origin main
   ```

3. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

4. **Your Live Game URL will be:**
   `https://YOUR_USERNAME.github.io/imposter_project/`

*(Alternatively, GitHub Actions workflow is pre-configured in `.github/workflows/deploy.yml` — pushing to `main` will automatically build and publish your site!)*

