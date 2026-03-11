# How to Download and Run The Perfume Lab

Welcome! Here's how to get started with **The Perfume Lab — Fragrance Atelier**.

## 🌐 Easiest Way: Use the Live Web App

**Just click this link:** [https://the-labratory.github.io/theperfumelab](https://the-labratory.github.io/theperfumelab)

No download needed! The app runs directly in your web browser.

---

## 💾 Download and Run Offline

Want to run the app on your computer without internet? Follow these steps:

### Step 1: Download the App
1. Go to the [Releases page](https://github.com/The-Labratory/theperfumelab/releases)
2. Click on the latest release
3. Download the `theperfumelab.zip` file

### Step 2: Extract the Files
1. Find the downloaded `theperfumelab.zip` file (usually in your Downloads folder)
2. Right-click the file and choose "Extract All" (Windows) or double-click (Mac)
3. Choose where to extract it (your Desktop or Documents folder works great)

### Step 3: Run the App

#### Option A: Simple Way (Just open the file)
1. Open the extracted folder
2. Find the file named `index.html`
3. Double-click `index.html` - it will open in your web browser
4. Done! The app is now running

#### Option B: Better Way (Use a local server)
For the best experience, run the app with a local server:

**If you have Python installed:**
1. Open Command Prompt (Windows) or Terminal (Mac)
2. Navigate to the extracted folder (replace with your actual path):
   ```
   cd ~/Downloads/theperfumelab
   ```
3. Run this command:
   ```
   python -m http.server 8080
   ```
4. Open your browser and go to: http://localhost:8080

**If you have Node.js installed:**
1. Open Command Prompt (Windows) or Terminal (Mac)
2. Navigate to the extracted folder (replace with your actual path):
   ```
   cd ~/Downloads/theperfumelab
   ```
3. Run this command:
   ```
   npx serve
   ```
4. Open the URL shown in the terminal (usually http://localhost:3000)

---

## ❓ Troubleshooting

**The app won't open:**
- Make sure you extracted the ZIP file first (don't try to open files while they're still inside the ZIP)
- Try opening with a different web browser (Chrome, Firefox, Safari, or Edge)

**Features aren't working:**
- Some features work better when using a local server (Option B above)
- Make sure JavaScript is enabled in your browser

**Need help?**
- Open an issue on the [GitHub repository](https://github.com/The-Labratory/theperfumelab/issues)

---

## 🔄 Updating to the Latest Version

1. Download the latest release from the [Releases page](https://github.com/The-Labratory/theperfumelab/releases)
2. Extract the new version
3. Replace your old folder with the new one

Your data is saved in your browser's local storage (and Supabase when signed in), so it will persist between versions.

---

## 🎨 Enjoy The Perfume Lab!

Craft your signature scent and explore the world of fragrances!
