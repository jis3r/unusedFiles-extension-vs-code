# Change Log

## [Unreleased]

- N/A

## [0.0.3] - 2024-11-24
### Added
- Added a **Refresh** button to the `Assets` view title bar for manually triggering a refresh of unused assets.
- Registered a custom view for unused assets in the **Explorer** sidebar (`unusedAssetsView`).
- Added activation event `onStartupFinished` to ensure the extension starts up early and the view is ready.
- Added Developer guide

## [0.0.2] - 2024-11-18
### Fixed
- Improved the search functionality for unused assets to optimize speed and accuracy.

## [0.0.1] - 2024-11-18
### Added
- Initial release with the following features:
  - Detect unused asset files in your project.
  - Preview unused files.
  - Delete unused files directly from the tree view.
  - Support for paginated results in the unused assets view.
  - Exclude directories like `node_modules`, `.next`, `.dist`, and `.out`.
