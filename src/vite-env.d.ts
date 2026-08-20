/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_CALENDAR_MEMBER1: string;
  readonly VITE_CALENDAR_MEMBER2: string;
  readonly VITE_CALENDAR_MEMBER3: string;
  readonly VITE_CALENDAR_FAMILY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Google Identity Services types
declare namespace google.accounts.oauth2 {
  interface TokenClient {
    requestAccessToken(overrides?: { prompt?: string }): void;
  }

  interface TokenResponse {
    access_token: string;
    error?: string;
    expires_in: number | string;
    scope: string;
    token_type: string;
    login_hint?: string;
  }

  function initTokenClient(config: {
    client_id: string;
    scope: string;
    login_hint?: string;
    callback: (response: TokenResponse) => void;
  }): TokenClient;

  function revoke(token: string, callback?: () => void): void;
}
