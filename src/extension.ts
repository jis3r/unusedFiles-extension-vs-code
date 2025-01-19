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
            const allFiles = await getAllFilesInWorkspace();
            const filePaths = allFiles.map(uri => uri.fsPath);

            const imageFiles = filterImageFiles(filePaths);
            if (imageFiles.length === 0) {
                vscode.window.showInformationMessage('No image files found in the workspace.');
                provider.refresh([]);
                return;
            }

            const unusedImageFiles = (
                await Promise.all(imageFiles.map(async (imageFile) => {
                    const isUsed = await isImageFileUsed(imageFile);
                    return isUsed ? null : imageFile;
                }))
            ).filter((file): file is string => file !== null);

            provider.refresh(unusedImageFiles);
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to initialize unused assets: ${error.message}`);
            console.error(error);
            provider.refresh([]);
        }
    };


    // Call initializeCheck to perform the initial scan for unused assets.
    initializeCheck();

    context.subscriptions.push(
        vscode.commands.registerCommand('unusedAssets.deleteAllFiles', async () => {
            // Get current files but filter out special markers
            const unusedFiles = provider.getChildren().filter(file =>
                file !== '__loading__' && file !== '__no_assets__'
            );

            // Check if we have any real files to delete
            if (unusedFiles.length === 0) {
                vscode.window.showInformationMessage('No unused assets to delete.');
                return;
            }

            const confirmDelete = await vscode.window.showWarningMessage(
                `Are you sure you want to delete all ${unusedFiles.length} unused assets? This action cannot be undone.`,
                { modal: true },
                'Delete All'
            );

            if (confirmDelete === 'Delete All') {
                try {
                    const deletionPromises = unusedFiles.map(filePath => {
                        // Only attempt to delete if it's a real file path
                        if (filePath !== '__loading__' && filePath !== '__no_assets__') {
                            const fileUri = vscode.Uri.file(filePath);
                            return vscode.workspace.fs.delete(fileUri);
                        }
                        return Promise.resolve(); // Skip special markers
                    });

                    await Promise.all(deletionPromises);
                    provider.setLoading();
                    await initializeCheck();

                } catch (error) {
                    vscode.window.showErrorMessage(
                        `Failed to delete all unused assets: ${error}`
                    );
                }
            }
        })
    );

    // Register a command to delete an unused asset.
    context.subscriptions.push(
        vscode.commands.registerCommand('unusedAssets.deleteFile', async (filePath: string) => {
            // Skip deletion for special markers
            if (filePath === '__loading__' || filePath === '__no_assets__') {
                return;
            }

            const fileUri = vscode.Uri.file(filePath);

            // Confirm the deletion with the user.
            const confirmDelete = await vscode.window.showInformationMessage(
                `Are you sure you want to delete "${path.basename(filePath)}"?`,
                { modal: true },
                'Delete'
            );

            if (confirmDelete === 'Delete') {
                try {
                    await vscode.workspace.fs.delete(fileUri);
                    // Refresh the assets list after deletion
                    provider.setLoading();
                    await initializeCheck();

                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to delete "${path.basename(filePath)}".`);
                }
            }
        })
    );

    // Register the preview file command, to preview an image or open a text document.
    context.subscriptions.push(
        vscode.commands.registerCommand('unusedAssets.previewFile', async (filePath: string) => {
            if (filePath === '__loading__' || filePath === '__no_assets__') {
                return;
            }

            const fileUri = vscode.Uri.file(filePath);

            const fileExtension = path.extname(filePath).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(fileExtension)) {
                try {
                    await vscode.commands.executeCommand('vscode.open', fileUri);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to preview image: ${error}`);
                }
            } else {
                try {
                    const doc = await vscode.workspace.openTextDocument(fileUri);
                    await vscode.window.showTextDocument(doc); 
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

