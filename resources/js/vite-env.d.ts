/// <reference types="vite/client" />

// Define the ImportMeta interface with all Vite-specific properties
interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly glob: import('vite').ImportGlobFunction
}

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  // Add other VITE environment variables here as needed
}

// Make sure the module option is properly set for import.meta
// This is handled by the tsconfig.json module: "ESNext" setting