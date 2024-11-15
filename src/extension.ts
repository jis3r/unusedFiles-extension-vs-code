import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const EXCLUDED_DIRECTORIES = ['node_modules', '.next', '.dist', '.out'];

export function activate(context: vscode.ExtensionContext) {
    console.log('This is from the custom extension');

    const disposable = vscode.commands.registerCommand('files.check', async () => {
        vscode.window.showInformationMessage('Checking unused assets in the workspace...');

        const allFiles = await getAllFilesInWorkspace();

        const assetFiles = allFiles.filter(file => isAssetFile(file));

        vscode.window.showInformationMessage(`Total asset files: ${assetFiles.length}`);

        const referencedAssets = await getReferencedAssets(allFiles);

        const unusedAssets = await getUnusedAssets(allFiles, referencedAssets);

        vscode.window.showInformationMessage(`Total unused assets: ${unusedAssets.length}`);

        console.log('Unused assets:', unusedAssets);
    });

    context.subscriptions.push(disposable);
}

async function getAllFilesInWorkspace(): Promise<vscode.Uri[]> {
    const includePattern = '**/*';
    const excludePattern = `**/(${EXCLUDED_DIRECTORIES.join('|')})/**`;
    const files = await vscode.workspace.findFiles(includePattern, excludePattern);
    return files;
}

// Check if the file is an asset (image, CSS, etc.)
function isAssetFile(file: vscode.Uri): boolean {
    const assetExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.scss'];
    return assetExtensions.includes(path.extname(file.fsPath).toLowerCase());
}

async function getReferencedAssets(allFiles: vscode.Uri[]): Promise<Set<string>> {
    const referencedAssets = new Set<string>();

    for (const file of allFiles) {
        const filePath = file.fsPath;
        const fileExt = path.extname(filePath);

        if (shouldExcludeFile(filePath)) {
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf8');

        if (fileExt === '.js' || fileExt === '.ts') {
            const assetPattern = /['"]([^'"]+\.(png|jpg|jpeg|gif|svg|css))['"]/g;
            const dynamicPattern = /require\(['"]([^'"]+\.(png|jpg|jpeg|gif|svg|css))['"]\)/g;
            let match;
            while ((match = assetPattern.exec(content)) !== null) {
                console.log(`Found reference in JS/TS: ${match[1]}`);
                referencedAssets.add(match[1]);
            }
            while ((match = dynamicPattern.exec(content)) !== null) {
                console.log(`Found dynamic reference in JS/TS: ${match[1]}`);
                referencedAssets.add(match[1]);
            }
        }

        if (fileExt === '.css' || fileExt === '.scss') {
            const cssPattern = /url\(['"]?([^'")]+)['"]?\)/g;
            let match;
            while ((match = cssPattern.exec(content)) !== null) {
                console.log(`Found reference in CSS: ${match[1]}`);
                referencedAssets.add(match[1]);
            }
        }
    }

    return referencedAssets;
}

function shouldExcludeFile(filePath: string): boolean {
    return EXCLUDED_DIRECTORIES.some(dir => filePath.includes(path.join(dir)));
}

async function getUnusedAssets(allFiles: vscode.Uri[], referencedAssets: Set<string>): Promise<vscode.Uri[]> {
    const unusedAssets = allFiles.filter(file => {
        const fileName = path.basename(file.fsPath);  
        let isUsed = false;

        referencedAssets.forEach(referencedPath => {
            const referencedFileName = path.basename(referencedPath);  
            if (fileName === referencedFileName) {
                isUsed = true;  
            }
        });

        return !isUsed;
    });

    return unusedAssets;
}

export function deactivate() {
    // Clean up resources (optional)
}
