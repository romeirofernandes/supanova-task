import type { ProfileVersion } from "@/lib/api";

export function VersionHistory({ versions }: { versions: ProfileVersion[] }) {
  const latest = versions[versions.length - 1];
  return (
    <p className="px-1 font-mono text-xs text-muted-foreground">
      {latest
        ? `v${latest.version} saved ${new Date(latest.saved_at).toLocaleDateString()} · ${versions.length} version${versions.length === 1 ? "" : "s"}`
        : "Unsaved defaults · no versions yet"}
    </p>
  );
}
