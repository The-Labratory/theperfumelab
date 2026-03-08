# Scentra World Builder - The Perfume Lab

A fragrance atelier where you can craft your signature scent, explore fragrance worlds, build custom compositions, and shop luxury perfumes.

## 🚀 Download and Run the App

### Option 1: Use the Live Web App (Easiest)
Visit the deployed app at: **[https://lawrencehariri.github.io/scentra-world-builder](https://lawrencehariri.github.io/scentra-world-builder)**

### Option 2: Download Pre-Built Release
1. Go to the [Releases page](https://github.com/LawrenceHariri/scentra-world-builder/releases)
2. Download the latest `scentra-world-builder.zip`
3. Extract the zip file to your computer
4. Open `index.html` in your web browser

**Or run with a local server:**
```bash
# Using Python (if installed)
cd scentra-world-builder
python -m http.server 8080

# Using Node.js (if installed)
npx serve

# Then open http://localhost:8080 in your browser
```

### Option 3: Build From Source
See the "Development" section below.

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## 🛠️ Development

### Prerequisites
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup and Run Locally

```sh
# Clone the repository
git clone https://github.com/LawrenceHariri/scentra-world-builder.git

# Navigate to the project directory
cd scentra-world-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```sh
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` directory.

### Other Development Options

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Edit directly in GitHub**

- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon) at the top right
- Make your changes and commit

**Use GitHub Codespaces**

- Navigate to the main page of your repository
- Click on the "Code" button (green button) near the top right
- Select the "Codespaces" tab
- Click on "New codespace" to launch a new Codespace environment

## 🧪 Technologies

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - Component library
- **Tailwind CSS** - Utility-first CSS
- **Supabase** - Backend and authentication
- **PWA** - Progressive Web App support

## 📦 Deployment

### Automated Deployment

This project uses GitHub Actions for automated builds and deployments:
- **Pushes to `main`** trigger automatic deployment to GitHub Pages
- **Tagged releases** create downloadable zip files
- All builds are available as artifacts for 90 days

### Manual Deployment

**Via Lovable:**

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share → Publish.

**Via GitHub Pages:**

Enable GitHub Pages in your repository settings and point it to the `gh-pages` branch or GitHub Actions.

**Custom Domain:**

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 📝 License

This project is part of the Lovable platform.
