export type KitSourceRef = { key: string; file: string; pick?: string };

export type KitFile = {
  slug: string;
  route: string;
  landscape: boolean;
  pages: number;
  format: string;
  /** null on the three run-sheets, whose name comes from data/educators.json. */
  title: string | null;
  blurb: string;
  sessionId: string | null;
  /** false = code stays, but the route 404s and builds/listings skip it. */
  published?: boolean;
};

export declare const REPO_ROOT: string;
export declare const KIT_SOURCES: KitSourceRef[];
export declare const KIT_FILES: KitFile[];
export declare function canonicalJson(value: unknown): string;
export declare function hashKitPayload(payload: unknown): string;
export declare function readKitPayload(root?: string): Record<string, unknown>;
export declare const PUBLISHED_KIT_FILES: KitFile[];
