# Deployment Guide — The Perfume Lab

## What Was Implemented

This setup enables automatic building, deployment, and distribution of **The Perfume Lab — Fragrance Atelier** so that the latest version is always accessible online.

## Key Features

### 1. GitHub Actions Workflows

#### Build and Deploy Workflow (`build-and-deploy.yml`)
- **Triggers:**
  - Automatically on every push to `main` branch
  - On pull requests to `main`
  - Manually via workflow_dispatch

- **What it does:**
  - Builds the app using Vite
  - Creates downloadable artifacts (kept for 90 days)
  - Deploys to GitHub Pages for live web access

#### Release Workflow (`release.yml`)
- **Triggers:**
  - On git tags matching `v*` pattern (e.g., `v1.0.0`)
  - Manually via workflow_dispatch

- **What it does:**
  - Builds the app
  - Creates a ZIP file of the build
  - Creates a GitHub Release with:
    - The ZIP file as a downloadable asset
    - Automatic release notes with instructions
    - Links to the live web version

### 2. Multiple Access Options

Users can access the app in three ways:

1. **Live Web App** (Easiest)
   - URL: https://the-labratory.github.io/theperfumelab
   - No download needed
   - Automatically updated when code is pushed to main

2. **Download Release** (For offline use)
   - Visit GitHub Releases page
   - Download `theperfumelab.zip`
   - Extract and run locally

3. **Build from Source** (For developers)
   - Clone repository
   - Run `npm install` and `npm run build`
   - Full development environment

## How to Use

### For Repository Maintainers

**To deploy to GitHub Pages:**
1. Ensure GitHub Pages is enabled in repository settings
2. Set Pages source to "GitHub Actions"
3. Push code to `main` branch
4. Workflow automatically builds and deploys

**To create a release:**
```bash
# Option 1: Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# Option 2: Use GitHub UI
# Go to Actions → Create Release → Run workflow
```

**To manually trigger a build:**
1. Go to Actions tab
2. Select "Build and Deploy" workflow
3. Click "Run workflow"

### For End Users

Users should follow the instructions in `DOWNLOAD.md` which provides:
- Step-by-step download instructions
- Multiple options for running the app
- Troubleshooting tips
- Update instructions

## Files Added/Modified

### Workflow Files
- `.github/workflows/build-and-deploy.yml` — Main CI/CD workflow
- `.github/workflows/release.yml` — Release creation workflow

### Documentation
- `DOWNLOAD.md` — User-friendly download guide
- `README.md` — Updated with download options and deployment info

## Security

- All workflows use official GitHub Actions
- No secrets are exposed in workflow files
- CodeQL security scanning shows no alerts
- Proper permissions set for each workflow

## Next Steps

After merging this PR:

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Set source to "GitHub Actions"
   - Save settings

2. **Create first release:**
   - Tag the main branch: `git tag v1.0.0 && git push origin v1.0.0`
   - Or use Actions → Create Release → Run workflow

3. **Test deployment:**
   - Verify GitHub Pages URL works: https://the-labratory.github.io/theperfumelab
   - Download the release ZIP and test locally
   - Confirm artifacts are created in workflow runs

## Maintenance

- Artifacts are kept for 90 days
- GitHub Pages deployment happens automatically on every push to `main`
- Releases are permanent and should follow semantic versioning
- Old releases can be deleted manually if needed

## Troubleshooting

**GitHub Pages not working:**
- Check repository settings
- Verify Pages source is set to "GitHub Actions"
- Check workflow run logs for errors

**Release workflow failing:**
- Ensure tag follows `v*` pattern
- Check build succeeds locally first: `npm run build`
- Review workflow logs for specific errors

**Artifacts not appearing:**
- Workflow must complete successfully
- Check Actions tab for workflow status
- Artifacts expire after 90 days
