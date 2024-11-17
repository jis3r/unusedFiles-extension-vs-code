/**
 * List of directories to be excluded from certain operations, 
 * such as asset scanning or file handling in the project.
 * These directories typically contain generated or dependency files 
 * that should not be processed or included in tasks like bundling, 
 * cleaning, or other operations.
 */
export const EXCLUDED_DIRECTORIES = ['node_modules', '.next', '.dist', '.out'];
