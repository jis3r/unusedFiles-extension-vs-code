import * as vscode from 'vscode';
import * as path from 'path';
import { EXCLUDED_DIRECTORIES } from './constants';

const imageUsageCache: Map<string, boolean> = new Map();

/**
 * Get all files in the workspace, excluding certain directories like node_modules, .next, etc.
 * 
 * @returns {Promise<vscode.Uri[]>} A promise that resolves to an array of file URIs in the workspace.
 * The directories specified in `EXCLUDED_DIRECTORIES` are excluded from the search.
 */
export async function getAllFilesInWorkspace(): Promise<vscode.Uri[]> {
    const includePattern = '**/*';
    const excludePattern = `{${EXCLUDED_DIRECTORIES.map(dir => `**/${dir}/**`).join(',')}}`;
    const files = await vscode.workspace.findFiles(includePattern, excludePattern);
    return files;
}

/**
 * Check if an image file is used in the workspace by searching for its name in the content of code files.
 * The result is cached for subsequent checks to improve performance.
 * 
 * @param {string} imageFile - The full path of the image file to check.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the image is used in any code file, otherwise `false`.
 */
export async function isImageFileUsed(imageFile: string): Promise<boolean> {
    if (imageUsageCache.has(imageFile)) {
        return imageUsageCache.get(imageFile)!;
    }

    const imageFileName = path.basename(imageFile).toLowerCase();
    const excludePattern = EXCLUDED_DIRECTORIES.map(dir => `**/${dir}/**`).join(',');

    // Add Python, Django, and other frameworks' extensions to fileTypes
    const fileTypes = [
        '.js',    // JavaScript files
        '.ts',    // TypeScript files
        '.html',  // HTML files
        '.css',   // CSS files
        '.tsx',   // TypeScript with JSX 
        '.jsx',   // JavaScript with JSX 
        '.json',  // JSON files 
        '.ejs',   // EJS files 
        '.svelte',// Svelte component files
        '.vue',   // Vue.js component files
        '.scss',  // SCSS files 
        '.sass',  // SASS files 
        '.less',  // LESS files 
        '.py',    // Python files
        '.j2',    // Jinja2 files
        '.go',    // Go source files
        '.java',  // Java source files
        '.jsp',   // Java Server Pages
        '.gohtml',// Go HTML templates
    ];

    const files = await vscode.workspace.findFiles(
        '**/*',
        `**/{${excludePattern}}`, 5000
    );

    const filePromises = files.map(async (fileUri) => {
        const filePath = fileUri.fsPath;
        const fileExtension = path.extname(filePath).toLowerCase();

        if (fileTypes.includes(fileExtension)) {
            try {
                const fileContent = await vscode.workspace.fs.readFile(fileUri);
                const contentString = fileContent.toString().toLowerCase();
                const regex = new RegExp(`['"(]?${imageFileName}['")]?`, 'i');

                if (regex.test(contentString)) {
                    return true;
                }
            } catch (error) {
                console.error(`Failed to read file: ${filePath}`, error);
            }
        }

        return false;
    });

    const results = await Promise.all(filePromises);
    const isUsed = results.some(result => result);

    imageUsageCache.set(imageFile, isUsed);
    return isUsed;
}

/**
 * Filter out only image files from a given list of file paths.
 * 
 * @param {string[]} files - An array of file paths to filter.
 * @returns {string[]} A filtered array containing only image file paths.
 */
export function filterImageFiles(files: string[]): string[] {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.gif', '.bmp', '.webp'];
    return files.filter(file => {
        const fileExtension = file.toLowerCase().split('.').pop();
        return fileExtension && imageExtensions.includes(`.${fileExtension}`);
    });
}

/**
 * Optimized function to check and return all unused image files in the workspace.
 * It first gets all files, filters out the image files, and then checks if they are used.
 * 
 * @returns {Promise<string[]>} A promise that resolves to an array of unused image file paths.
 */
export async function getUnusedImageAssets(): Promise<string[]> {
    const allFiles = await getAllFilesInWorkspace();

    // Filter out only image files from the list of all files
    const imageFiles = filterImageFiles(allFiles.map(file => file.fsPath));

    const unusedAssets: string[] = [];

    // Check if each image file is used
    for (const imageFile of imageFiles) {
        const isUsed = await isImageFileUsed(imageFile);
        if (!isUsed) {
            unusedAssets.push(imageFile); // Add to unused if it's not used
        }
    }

    return unusedAssets;
}

/**
 * Utility function to manually invalidate the image usage cache.
 * This should be called when files in the workspace change and the cache needs to be cleared.
 */
export function invalidateCache(): void {
    imageUsageCache.clear();
}
