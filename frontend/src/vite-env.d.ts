/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the deployed FastAPI backend, e.g. https://neerkaval-api.onrender.com */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
