
# Unused Image Finder for VSCode - Developer Guide

Welcome to the **Unused Image Finder** developer documentation! This guide explains how to set up, debug, and contribute to the extension. If you're looking to improve or extend its functionality, you're in the right place.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Directory Structure](#directory-structure)
- [Scripts](#scripts)
- [Development Workflow](#development-workflow)
  - [Run the Extension](#run-the-extension)
  - [Debugging](#debugging)
- [Contributing](#contributing)
  - [Code Guidelines](#code-guidelines)
  - [Submitting Issues](#submitting-issues)
  - [Pull Requests](#pull-requests)

## Prerequisites

Before starting development, ensure you have the following installed:

- **Node.js**: Version 16 or later
- **VSCode**: Version 1.95.0 or later
- **npm**: Version 7 or later

## Setup and Installation

1. Clone the repository:

```bash
git clone https://github.com/imShuheb/unusedFiles-extension-vs-code.git
cd unusedFiles-extension-vs-code
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run compile
```

## Directory Structure

Here’s a breakdown of the important directories and files in the project:

```
/src            # Source code for the extension
/dist           # Compiled extension files
/package.json   # Project dependencies and scripts
/tsconfig.json  # TypeScript configuration
/webpack.config.js # Webpack configuration (if any)
```

## Scripts

- **`npm run compile`**: Compiles the TypeScript code into JavaScript.
- **`npm run watch`**: Watches for file changes and re-compiles the code.
- **`npm run package`**: Packages the extension for publishing.
- **`npm run test`**: Runs the tests for the extension.

## Development Workflow

### Run the Extension

To run the extension locally within VSCode:

1. Open the extension project in VSCode.
2. Press `F5` or go to **Run > Start Debugging** to launch an instance of VSCode with the extension enabled.
3. The extension will be active in the new VSCode window, and you can test it there.

### Debugging

To debug the extension:

1. Open the **Run and Debug** tab in VSCode (`Ctrl+Shift+D`).
2. Set breakpoints in the source code.
3. Press `F5` to launch a debugging session.
4. Use the **Developer Tools** (`Help > Toggle Developer Tools`) for inspecting logs and errors.

## Contributing

We welcome contributions to the **Unused Image Finder** extension! Here's how you can contribute:

### Code Guidelines

- Follow the **TypeScript** and **ESLint** coding conventions.
- Ensure code changes are properly tested.

### Submitting Issues

If you encounter any bugs or have feature requests, please file an issue:

1. Go to the [Issues page](https://github.com/imShuheb/unusedFiles-extension-vs-code/issues).
2. Click **New Issue** and provide a detailed description.

### Pull Requests

To submit a pull request:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Open a pull request with a detailed description of your changes.

We appreciate your contributions!

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---
Happy coding! 🚀
