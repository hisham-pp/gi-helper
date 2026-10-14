import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { CHANGE_TYPES, type VersionRelease } from "./release-notes";

/**
 * Release notes live in `src/data/versions/<major>-<minor>-<patch>/release.json`.
 * The folder name is the version (e.g. `0-0-2` is v0.0.2), so adding a release
 * is just adding a folder. Files are read on the server at build time.
 */
export const VERSIONS_DIR = path.join(process.cwd(), "src/data/versions");
export const RELEASE_FILE = "release.json";

const VERSION_FOLDER = /^(\d+)-(\d+)-(\d+)$/;

// Shapes and paging live in ./release-notes (no fs, so the browser can use them)
export {
  CHANGE_TYPES,
  RELEASES_PER_PAGE,
  releasePage,
  type ChangeType,
  type ReleaseChange,
  type ReleasePage,
  type VersionRelease,
} from "./release-notes";

const releaseSchema = z.object({
  title: z.string().min(1),
  /** Release day as YYYY-MM-DD. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  summary: z.string().optional(),
  changes: z
    .array(
      z.object({
        type: z.enum(CHANGE_TYPES),
        text: z.string().min(1),
      }),
    )
    .min(1),
});

export type ReleaseNotes = z.infer<typeof releaseSchema>;

function versionParts(slug: string): number[] {
  return slug.split("-").map(Number);
}

/** Newest first, comparing major, then minor, then patch numerically. */
function compareDescending(a: VersionRelease, b: VersionRelease): number {
  const pa = versionParts(a.slug);
  const pb = versionParts(b.slug);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pb[i] - pa[i];
  }
  return 0;
}

/**
 * Every release in `dir`, newest first. Folders that don't look like a version
 * are ignored; a version folder with a missing or invalid `release.json` throws,
 * so a bad edit fails the build instead of silently disappearing.
 */
export function getVersions(dir: string = VERSIONS_DIR): VersionRelease[] {
  if (!existsSync(dir)) return [];

  const releases = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && VERSION_FOLDER.test(entry.name))
    .map((entry): VersionRelease => {
      const file = path.join(dir, entry.name, RELEASE_FILE);
      if (!existsSync(file)) {
        throw new Error(`Missing ${RELEASE_FILE} for version folder "${entry.name}" (${file})`);
      }

      let json: unknown;
      try {
        json = JSON.parse(readFileSync(file, "utf-8"));
      } catch (err) {
        throw new Error(`Invalid JSON in ${file}: ${(err as Error).message}`);
      }

      const parsed = releaseSchema.safeParse(json);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
          .join("; ");
        throw new Error(`Invalid release notes in ${file}: ${issues}`);
      }

      return {
        ...parsed.data,
        slug: entry.name,
        version: entry.name.replace(/-/g, "."),
      };
    });

  return releases.sort(compareDescending);
}

/** The newest release, or undefined when no versions exist yet. */
export function getLatestVersion(dir: string = VERSIONS_DIR): VersionRelease | undefined {
  return getVersions(dir)[0];
}
