import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Provider class to handle and display unused assets in a tree view.
 * Implements the vscode.TreeDataProvider interface.
 */
export class UnusedAssetsProvider implements vscode.TreeDataProvider<string> {

    /** 
     * Event emitter that triggers updates in the tree view when data changes.
     */
    private _onDidChangeTreeData: vscode.EventEmitter<string | undefined | void> =
        new vscode.EventEmitter<string | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<string | undefined | void> = this._onDidChangeTreeData.event;

    /** 
     * List of unused asset file paths.
     */
    private unusedAssets: string[] = [];

    /** 
     * Set used to keep track of already added assets to avoid duplicates.
     */
    private cache: Set<string> = new Set();

    /** 
     * Boolean flag to track the loading state.
     */
    private loading: boolean = true;

    
    /**
     * Refreshes the tree view with a new list of unused assets.
     * @param unusedAssets Array of file paths for unused assets.
     */
    refresh(unusedAssets: string[]): void {
        this.unusedAssets = unusedAssets;
        this.cache = new Set(unusedAssets);
        this.loading = false; // Stop loading after data is loaded
        this._onDidChangeTreeData.fire();
    }

    /**
     * Incrementally adds a new unused asset to the tree view.
     * @param asset The file path of the unused asset to add.
     */
    addUnusedAsset(asset: string): void {
        if (!this.cache.has(asset)) {
            this.unusedAssets.push(asset);
            this.cache.add(asset);
            this._onDidChangeTreeData.fire();
        }
    }

    /**
     * Incrementally removes a used asset from the tree view.
     * @param asset The file path of the asset to remove.
     */
    removeUsedAsset(asset: string): void {
        if (this.cache.has(asset)) {
            this.unusedAssets = this.unusedAssets.filter((item) => item !== asset);
            this.cache.delete(asset);
            this._onDidChangeTreeData.fire();
        }
    }

    /**
     * Sets the loading state to true and refreshes the view.
     */
    setLoading(): void {
        this.loading = true;
        this._onDidChangeTreeData.fire();
    }

    /**
     * Returns a tree item for a given element (unused asset).
     * @param element The file path of the unused asset.
     * @returns A TreeItem representing the unused asset.
     */
    getTreeItem(element: string): vscode.TreeItem {
        // Handle loading state with spinning icon
        if (this.loading) {
            const loadingItem = new vscode.TreeItem('Loading...', vscode.TreeItemCollapsibleState.None);
            loadingItem.iconPath = new vscode.ThemeIcon('sync~spin'); // Spinning sync icon
            loadingItem.tooltip = 'Searching for unused assets...';
            return loadingItem;
        }

        // Extract the file name and extension
        const fileName = path.basename(element);
        const treeItem = new vscode.TreeItem(fileName, vscode.TreeItemCollapsibleState.None);

        // Determine icon based on file type
        const fileExtension = path.extname(fileName).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(fileExtension)) {
            treeItem.iconPath = new vscode.ThemeIcon('file-media'); // Media file icon
        } else if (['.txt', '.md'].includes(fileExtension)) {
            treeItem.iconPath = new vscode.ThemeIcon('note'); // Note file icon
        } else {
            treeItem.iconPath = new vscode.ThemeIcon('file'); // Generic file icon
        }

        // Assign a context value for inline actions
        treeItem.contextValue = 'unusedAsset';

        // Attach the preview command for default click behavior
        treeItem.command = {
            command: 'unusedAssets.previewFile',
            title: 'Preview File',
            arguments: [element], // Pass the full file path to the command
        };

        // Tooltip for better UX
        treeItem.tooltip = `Path: ${element}`;

        return treeItem;
    }

    /**
     * Returns all unused assets (no pagination).
     * @returns An array of file paths.
     */
    getChildren(): string[] {
        if (this.loading) {
            return ['Loading...']; 
        }

        if (this.unusedAssets.length === 0) {
            return ['No unused assets found'];
        }

        return this.unusedAssets;
    }

    /**
     * Adds a "Refresh" item at the top of the tree view for refreshing the list.
     * @returns An array with "Refresh" at the beginning of the list.
     */
    getTreeItemsWithRefresh(): vscode.TreeItem[] {
        // Refresh item that can be clicked to trigger refresh
        const refreshItem = new vscode.TreeItem('Refresh', vscode.TreeItemCollapsibleState.None);
        refreshItem.command = {
            command: 'unusedAssets.refreshAssets',
            title: 'Refresh Assets',
        };
        refreshItem.iconPath = new vscode.ThemeIcon('refresh');
        refreshItem.tooltip = 'Click to refresh the unused assets list';

        // Return the refresh item followed by the unused assets
        const treeItems = this.unusedAssets.map((asset) => {
            const treeItem = new vscode.TreeItem(path.basename(asset), vscode.TreeItemCollapsibleState.None);
            treeItem.contextValue = 'unusedAsset';
            treeItem.command = {
                command: 'unusedAssets.previewFile',
                title: 'Preview File',
                arguments: [asset],
            };
            return treeItem;
        });

        return [refreshItem, ...treeItems];
    }
}
