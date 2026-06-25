/**
 * Pre-build checks for Render deployments.
 * Logs build-time env and warns if the API URL is missing.
 */
const nodeEnv = process.env.NODE_ENV || 'development';
const apiBase = process.env.VITE_API_BASE_URL?.trim() || '';

console.log('--- AthenaVI Render build ---');
console.log(`Node:              ${process.version}`);
console.log(`NODE_ENV:          ${nodeEnv}`);
console.log(`VITE_API_BASE_URL: ${apiBase || '(not set)'}`);

if (!apiBase) {
  console.warn(
    '[render-build] WARNING: VITE_API_BASE_URL is empty. ' +
      'Set it in the Render dashboard Environment tab so production API calls reach your backend.'
  );
} else if (apiBase.endsWith('/')) {
  console.warn(
    '[render-build] WARNING: VITE_API_BASE_URL should not have a trailing slash.'
  );
}

console.log('--- Starting Vite production build ---\n');
