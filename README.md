<p align="center">
  <h1 align="center">Known</h1>
</p>
<p align="center">
  <a href="https://github.com/Eric-Hei/known">
    <img alt="MIT License" src="https://img.shields.io/github/license/Eric-Hei/known"/>
  </a>
</p>

# Known : Your Personal Notion-like Workspace
Known is a powerful, local-first workspace inspired by Notion. Build your knowledge base with pages, databases, and rich content blocks - all stored locally in your browser.

## Why use Known ❓
Known is a local-first workspace that combines the power of Notion with the simplicity of local storage.

### ✨ Features
* 📝 **Rich Text Editor** - Block-based editor with slash commands and keyboard shortcuts
* 🗂️ **Hierarchical Pages** - Organize your content with nested pages and subpages
* 📊 **Databases & Tables** - Create powerful databases with multiple views (Table, Board, List, Calendar, Gallery)
* 🎨 **Customizable Properties** - Text, numbers, dates, select, multi-select, checkboxes, and more
* 🔍 **Filters & Sorts** - Organize your data exactly how you want
* 💾 **Local Storage** - All your data stays in your browser (IndexedDB)
* 🚀 **No Backend Required** - Works completely offline
* 🎯 **Quick Search** - Find anything with Cmd+K
* 🌙 **Modern UI** - Clean, Notion-inspired interface
* 📤 **Export/Import** - Backup and restore your data

### 🎯 Perfect for
* Personal knowledge management
* Project planning and tracking
* Note-taking and documentation
* Task management
* Content organization
* Prototyping and demos

## Getting started 🔧

### Prerequisites

Make sure you have the following installed:
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
- **Node.js** (v18+) and **yarn** (for local frontend development)

```bash
node -v  # Should be v18 or higher
yarn -v
docker --version
```

### Installation & Running the Application

Known uses Docker Compose to run the full stack (backend, database, authentication, collaboration server, and frontend).

#### 🐳 Option 1: Run Everything with Docker (Recommended)

1. **Clone the repository:**
```bash
git clone https://github.com/Eric-Hei/known.git
cd known
```

2. **Start Docker Desktop**
   - Launch Docker Desktop and wait for it to be ready (green icon in system tray)

3. **Start all services:**
```powershell
docker-compose up -d
```

4. **Verify all containers are running:**
```powershell
docker-compose ps
```

You should see all services in "running" state:
- `docs-frontend-development-1` (port 3000)
- `docs-app-dev-1` (port 8071)
- `docs-y-provider-development-1` (port 4444)
- `docs-keycloak-1` (port 8080)
- `docs-postgresql-1`, `docs-redis-1`, `docs-minio-1`, etc.

5. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8071
   - **Keycloak (Auth)**: http://localhost:8080

6. **Login credentials:**
   - Username: `impress`
   - Password: `impress`

**To stop all services:**
```powershell
docker-compose down
```

**To view logs:**
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app-dev
docker-compose logs -f frontend-development
```

#### 💻 Option 2: Run Frontend Locally + Backend in Docker

If you want to develop the frontend locally while keeping the backend in Docker:

1. **Start only backend services:**
```powershell
docker-compose up -d app-dev celery-dev postgresql redis minio createbuckets mailcatcher keycloak kc_postgresql nginx y-provider-development
```

2. **Run frontend locally:**
```powershell
cd src/frontend/apps/impress
yarn install
yarn dev
```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8071

### Building for Production

```bash
cd src/frontend/apps/impress
yarn build
yarn start
```

### Deployment

Deploy to Netlify:
```bash
netlify deploy --prod --dir=out --site=known
```

For Railway deployment, see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md).

## Tech Stack 🛠️

Known is built on top of amazing open-source technologies:

- **[Next.js](https://nextjs.org/)** - React framework
- **[BlockNote.js](https://www.blocknotejs.org/)** - Block-based editor
- **[Yjs](https://yjs.dev/)** - CRDT for real-time collaboration
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)** - Local storage
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Styled Components](https://styled-components.com/)** - CSS-in-JS

## Credits ❤️

Known is based on [La Suite Docs](https://github.com/suitenumerique/docs), an amazing collaborative text editor by DINUM and ZenDiS. We've adapted it to create a local-first, Notion-like workspace.

Special thanks to the teams behind BlockNote.js and Yjs for their incredible work!

## License 📝

This work is released under the MIT License (see [LICENSE](./LICENSE)).

## Contributing 🙌

Contributions are welcome! Feel free to open issues or submit pull requests.

---

**Version:** 1.0.0
**Made with ❤️ for personal knowledge management**
