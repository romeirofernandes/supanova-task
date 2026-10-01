import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FloppyDiskIcon, InboxIcon } from "@hugeicons/core-free-icons";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { Button } from "@/components/ui/button";
import { FounderNote } from "@/components/FounderNote";
import { MoversList } from "@/components/MoversList";
import { RankingTable } from "@/components/RankingTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VersionHistory } from "@/components/VersionHistory";
import { WeightSliders } from "@/components/WeightSliders";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { usePreview } from "@/hooks/usePreview";
import { getHistory, getProfile, getProjects, saveProfile, type ProfileVersion, type Project } from "@/lib/api";
import { DEFAULT_WEIGHTS, isFullTotal, type Weights } from "@/lib/weights";

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("harborline");
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [active, setActive] = useState<Weights>(DEFAULT_WEIGHTS);
  const [versions, setVersions] = useState<ProfileVersion[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { data, loading } = usePreview(projectId, weights);

  useEffect(() => {
    getProjects().then((r) => setProjects(r.projects)).catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    getProfile(projectId)
      .then((p) => {
        setWeights({ ...p.weights });
        setActive({ ...p.weights });
      })
      .catch(() => {
        setWeights({ ...DEFAULT_WEIGHTS });
        setActive({ ...DEFAULT_WEIGHTS });
      });
    getHistory(projectId).then((h) => setVersions(h.versions)).catch(() => setVersions([]));
  }, [projectId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const dirty =
    weights.recency !== active.recency ||
    weights.needsAttention !== active.needsAttention ||
    weights.evidence !== active.evidence ||
    weights.projectMatch !== active.projectMatch;
  const sumValid = isFullTotal(weights);

  const onSave = useCallback(async () => {
    setSaving(true);
    try {
      const saved = await saveProfile(projectId, weights);
      setActive({ ...saved.weights });
      const h = await getHistory(projectId);
      setVersions(h.versions);
      setToast(`Saved v${saved.version}`);
    } catch {
      setToast("Save failed: weights must sum to 100");
    } finally {
      setSaving(false);
    }
  }, [projectId, weights]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="mx-auto flex h-svh w-full max-w-6xl flex-col gap-4 overflow-hidden px-4 py-4 md:gap-5 md:px-8 md:py-6">
        <header className="flex shrink-0 items-center gap-3">
          <HugeiconsIcon icon={InboxIcon} size={20} strokeWidth={1.5} className="shrink-0 text-primary" />
          <h1 className="font-serif text-xl leading-none">Calibration</h1>
          <div className="w-px self-stretch bg-border" aria-hidden />
          <div className="min-w-0 flex-1" role="group" aria-label="Project">
            <Tabs value={projectId} onValueChange={setProjectId} variant="pill" className="w-full min-w-0">
              <TabsList ariaLabel="Project">
                {projects.map((p) => (
                  <TabsTrigger key={p.id} value={p.id}>
                    {p.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Button onClick={onSave} disabled={!dirty || !sumValid || saving} className="active:scale-[0.96]">
              <HugeiconsIcon icon={FloppyDiskIcon} size={16} strokeWidth={1.5} />
              {saving ? "Saving" : dirty ? "Save" : `v${versions.length || "0"}`}
            </Button>
          </div>
        </header>

        <FounderNote sentence={data?.sentence ?? null} loading={loading} />

        <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto md:gap-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:overflow-hidden">
          <div className="flex flex-col gap-4 md:gap-5 lg:min-h-0 lg:overflow-hidden lg:pr-1">
            <div className="shrink-0">
              <WeightSliders weights={weights} onChange={setWeights} />
            </div>
            {data && <MoversList movers={data.movers} />}
            <div className="shrink-0">
              <VersionHistory versions={versions} />
            </div>
          </div>
          <div className="flex min-h-0 flex-col lg:overflow-hidden">
            {data ? (
              <RankingTable key={projectId} signals={data.all} projectId={projectId} />
            ) : (
              <p className="text-sm text-muted-foreground">Loading preview…</p>
            )}
          </div>
        </main>

        <AnimatePresence>
          {toast && (
            <m.div
              initial={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(2px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="t-toast is-open fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-border bg-card px-4 py-2 text-sm shadow-lg"
              role="status"
            >
              {toast}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}

export default App;
