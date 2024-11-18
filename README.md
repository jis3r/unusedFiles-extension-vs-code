
# Unused Image Finder for VSCode

This VSCode extension helps developers identify unused image files in their workspace. It scans for all image files and determines whether they are referenced in the code, making it easy to clean up unused assets.

## Features

- **Identify Unused Images**: Automatically scans your workspace to find unused image files.
- **Customizable Directory Exclusions**: Exclude common directories like `node_modules`, `.next`, and others to speed up the scan.
- **Caching for Performance**: Caches the results of image usage checks to avoid repeated computations.
- **Filter for Image Files**: Automatically detects common image file types like `.jpg`, `.png`, `.svg`, etc.
- **Manual Cache Invalidation**: Provides a utility to clear the cache when workspace files change.

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   ```
2. Open the project in VSCode.
3. Run the `Extension Development Host` to start using the extension.

## Usage

1. Open your workspace in VSCode.
2. Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) to invoke commands like:
   - **Find Unused Images**
3. View the list of unused images and clean up your workspace.

## How It Works

1. The extension scans all files in your workspace while ignoring excluded directories.
2. It identifies image files and checks their usage across code files (`.js`, `.ts`, `.html`, etc.).
3. Results are cached to improve performance for subsequent scans.
4. Developers can invalidate the cache manually when needed.

## Supported File Types

- Image file types: `.jpg`, `.jpeg`, `.png`, `.svg`, `.gif`, `.bmp`, `.webp`
- Code file types scanned for usage: `.js`, `.ts`, `.html`, `.css`, `.tsx`, `.jsx`

## Customization

You can customize the excluded directories by editing the `EXCLUDED_DIRECTORIES` array in the `constants.ts` file.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Happy coding! 🚀
