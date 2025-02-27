# Unused Image Finder for VSCode

This VSCode extension helps developers identify and manage unused image files in their workspace. It scans your project for image files, determines whether they are referenced in your code, and provides an easy way to clean up unused assets.

## Features

- **Identify Unused Images**: Automatically scans your workspace to find unused image files.
- **Customizable Directory Exclusions**: Exclude common directories like `node_modules`, `.next`, and others to speed up the scan.
- **Caching for Performance**: Caches the results of image usage checks to avoid repeated computations.
- **Filter for Image Files**: Automatically detects common image file types like `.jpg`, `.png`, `.svg`, etc.
- **Manual Cache Invalidation**: Provides a utility to clear the cache when workspace files change.

## Installation

1. **Install the Extension**:
   - Open VSCode.
   - Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
   - Search for "Unused Image Finder" and click **Install**.

## Usage

1. Open your project in VSCode.
2. Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) to invoke the following commands:
   - **Find Unused Images**: Scans for unused image files in your workspace.
   - **Refresh Cache**: Clears the current cache and triggers a new scan.
3. View the list of unused images and remove them if desired.

## How It Works

- The extension scans all files in your workspace, skipping excluded directories like `node_modules` or `.next`.
- It identifies image files and checks if they are referenced in your code files (like `.js`, `.ts`, `.html`, etc.).
- The results are cached for performance, so subsequent scans are faster.
- You can manually refresh the cache using the "Refresh Cache" command from the command palette.

## Supported File Types

- **Image file types**: `.jpg`, `.jpeg`, `.png`, `.svg`, `.gif`, `.bmp`, `.webp`, `.avif`
- **Code file types**: `.js`, `.ts`, `.html`, `.css`, `.tsx`, `.jsx`

## Customization

You can exclude specific directories from the scan (like `node_modules`, `.next`, etc.) by modifying the extension’s settings. For more advanced users, see the developer documentation.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Happy coding! 🚀
