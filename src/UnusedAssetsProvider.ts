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
     * Number of items displayed per page in the tree view.
     */
    private pageSize: number = 50;

    /** 
     * Current page index for pagination.
     */
    private currentPage: number = 0;

    /**
     * Refreshes the tree view with a new list of unused assets.
     * @param unusedAssets Array of file paths for unused assets.
     */
    refresh(unusedAssets: string[]): void {
        this.unusedAssets = unusedAssets;
        this.cache = new Set(unusedAssets);
        this.loading = false; // Stop loading after data is loaded
        this.currentPage = 0; // Reset to the first page
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
        if (this.loading) {
            const loadingItem = new vscode.TreeItem('Loading...', vscode.TreeItemCollapsibleState.None);
            loadingItem.iconPath = new vscode.ThemeIcon('sync~spin');
            loadingItem.tooltip = 'Searching for unused assets...';
            return loadingItem;
        }

        const fileName = path.basename(element);
        const treeItem = new vscode.TreeItem(fileName, vscode.TreeItemCollapsibleState.None);

        // Determine the icon based on file extension
        const fileExtension = path.extname(fileName).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(fileExtension)) {
            treeItem.iconPath = new vscode.ThemeIcon('file-media');
        } else if (['.txt', '.md'].includes(fileExtension)) {
            treeItem.iconPath = new vscode.ThemeIcon('note');
        } else {
            treeItem.iconPath = new vscode.ThemeIcon('file');
        }

        // Add command for previewing the file
        treeItem.contextValue = 'unusedAsset';
        treeItem.command = {
            command: 'unusedAssets.previewFile',
            title: 'Preview File',
            arguments: [element], // Pass the full path for preview
        };

        return treeItem;
    }

    /**
     * Returns an array of unused assets or a loading placeholder.
     * Handles pagination and adds a "Load More" item if more assets are available.
     * @returns An array of file paths or loading/empty placeholders.
     */
    getChildren(): string[] {
        if (this.loading) {
            return ['Loading...']; // Placeholder while loading
        }

        if (this.unusedAssets.length === 0) {
            return ['No unused assets found'];
        }

        // Return paginated results
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const paginatedAssets = this.unusedAssets.slice(startIndex, endIndex);

        // Add a "Load More" item if more results are available
        if (endIndex < this.unusedAssets.length) {
            return [...paginatedAssets, 'Load More'];
        }

        return paginatedAssets;
    }

    /**
     * Handles the "Load More" action to display additional unused assets.
     */
    loadMore(): void {
        this.currentPage += 1;
        this._onDidChangeTreeData.fire();
    }

    /**
     * Handles the selection of a tree item, specifically for the "Load More" item.
     * @param element The selected tree item element (either a file or "Load More").
     */
    handleLoadMoreSelection(element: string): void {
        if (element === 'Load More') {
            this.loadMore();
        }
    }
}
