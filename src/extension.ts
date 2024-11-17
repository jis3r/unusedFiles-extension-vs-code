import * as vscode from 'vscode';
import * as path from 'path';
import { UnusedAssetsProvider } from './UnusedAssetsProvider';
import { filterImageFiles, getAllFilesInWorkspace, isImageFileUsed } from './fileUtils';

/**
 * Activates the extension, setting up the required commands and file watchers.
 * @param context - The extension context provided by VSCode.
 */
export function activate(context: vscode.ExtensionContext) {
    // Create an instance of the UnusedAssetsProvider to manage unused assets in the workspace.
    const provider = new UnusedAssetsProvider();

    // Register the UnusedAssetsProvider with the tree view in VSCode.
    vscode.window.registerTreeDataProvider('unusedAssetsView', provider);

    /**
     * Initializes the check for unused image files in the workspace.
     * @returns {Promise<void>} A promise that resolves when the check is complete.
     */
    const initializeCheck = async (): Promise<void> => {
        provider.setLoading(); // Set loading state in the provider

        try {
            // Fetch all files in the workspace.
            const allFiles = await getAllFilesInWorkspace();
            const filePaths = allFiles.map(uri => uri.fsPath);

            // Filter out only image files from the workspace.
            const imageFiles = filterImageFiles(filePaths);

            vscode.window.showInformationMessage(`Total image files: ${imageFiles.length}`);

            const unusedImageFiles: string[] = [];

            // Check if each image file is used in the workspace
            for (const imageFile of imageFiles) {
                const isUsed = await isImageFileUsed(imageFile);
                if (!isUsed) {
                    unusedImageFiles.push(imageFile); // If unused, add to the unused list
                }
            }

            // Refresh the provider with the unused image files.
            provider.refresh(unusedImageFiles);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize unused assets: ${error}`);
            provider.refresh([]); // If there's an error, refresh with an empty list.
        }
    };

    // Call initializeCheck to perform the initial scan for unused assets.
    initializeCheck();

    // Create a file system watcher to watch for file creation, deletion, and modification events.
    const watcher = vscode.workspace.createFileSystemWatcher('**/*', false, false, false);

    /**
     * Handles file creation events. Triggers the 'files.check' command when a new file is created.
     * @param uri - The URI of the created file.
     */
    watcher.onDidCreate(async (uri) => {
        vscode.window.showInformationMessage(`File created: ${uri.fsPath}`);
        // Trigger the 'files.check' command when a file is created.
        await vscode.commands.executeCommand('files.check');
    });

    /**
     * Handles file deletion events. Triggers the 'files.check' command when a file is deleted.
     * @param uri - The URI of the deleted file.
     */
    watcher.onDidDelete(async (uri) => {
        vscode.window.showInformationMessage(`File deleted: ${uri.fsPath}`);
        // Trigger the 'files.check' command when a file is deleted.
        await vscode.commands.executeCommand('files.check');
    });

    // Add the watcher to the subscriptions for proper cleanup when the extension is deactivated.
    context.subscriptions.push(watcher);

    // Register a command to delete an unused asset.
    context.subscriptions.push(
        vscode.commands.registerCommand('unusedAssets.deleteFile', async (filePath: string) => {
            const fileUri = vscode.Uri.file(filePath);

            // Confirm the deletion with the user.
            const confirmDelete = await vscode.window.showInformationMessage(
                `Are you sure you want to delete "${filePath}"?`,
                { modal: true },
                'Delete'
            );

            if (confirmDelete === 'Delete') {
                try {
                    await vscode.workspace.fs.delete(fileUri); // Delete the file
                    vscode.window.showInformationMessage(`Successfully deleted "${filePath}".`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to delete "${filePath}".`);
                }
            }
        })
    );

    // Register the preview file command, to preview an image or open a text document.
    context.subscriptions.push(
        vscode.commands.registerCommand('unusedAssets.previewFile', async (filePath: string) => {
            const fileUri = vscode.Uri.file(filePath);

            const fileExtension = path.extname(filePath).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(fileExtension)) {
                try {
                    await vscode.commands.executeCommand('vscode.open', fileUri); // Open image preview
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to preview image: ${error}`);
                }
            } else {
                try {
                    const doc = await vscode.workspace.openTextDocument(fileUri);
                    await vscode.window.showTextDocument(doc); // Open text document preview
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to open file: ${error}`);
                }
            }
        })
    );

    // Register the check files command, to manually trigger the check for unused assets.
    context.subscriptions.push(
        vscode.commands.registerCommand('files.check', async () => {
            provider.setLoading(); // Set loading state in the provider

            try {
                // Perform the same process as before to check for unused assets.
                const allFiles = await getAllFilesInWorkspace();
                const filePaths = allFiles.map(uri => uri.fsPath);

                const imageFiles = filterImageFiles(filePaths);
                vscode.window.showInformationMessage(`Total image files: ${imageFiles.length}`);

                const unusedImageFiles: string[] = [];

                for (const imageFile of imageFiles) {
                    const isUsed = await isImageFileUsed(imageFile);
                    if (!isUsed) {
                        unusedImageFiles.push(imageFile);
                    }
                }

                provider.refresh(unusedImageFiles); // Refresh the provider with the unused image files.
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to check unused assets: ${error}`);
                provider.refresh([]); // If error occurs, refresh with empty list.
            }
        })
    );

    // Register a context menu item to show a custom context menu for unused assets in the explorer.
    context.subscriptions.push(
        vscode.commands.registerCommand('unusedAssets.explorerContextMenu', (fileUri: vscode.Uri) => {
            const filePath = fileUri.fsPath;
            vscode.commands.executeCommand('unusedAssets.showContextMenu', filePath);
        })
    );
}
