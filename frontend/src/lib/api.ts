import type { Weights } from "./weights";

const BASE = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export interface Project {
  id: string;
  name: string;
  type: string;
}

export interface RankedSignal {
  key: string;
  id: string;
  title: string;
  date: string;
  time?: string;
  projects: string[];
  score: number;
  rank: number;
  breakdown: Record<string, number>;
}

export interface Mover {
  key: string;
  id: string;
  title: string;
  old_rank: number;
  new_rank: number;
  delta: number;
  score: number;
}

export interface PreviewResponse {
  project: string;
  as_of: string;
  weights_used: Weights;
  active_weights: Weights;
  sentence: string;
  movers: Mover[];
  top: RankedSignal[];
  all: RankedSignal[];
  total: number;
}

export interface ProfileVersion {
  version: number;
  weights: Weights;
  as_of: string;
  note?: string | null;
  saved_at: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

export function getProjects() {
  return request<{ projects: Project[] }>("/api/projects");
}

export function getProfile(projectId: string) {
  return request<{ weights: Weights; version: number; saved: boolean }>(
    `/api/projects/${projectId}/profile`
  );
}

export function getHistory(projectId: string) {
  return request<{ versions: ProfileVersion[] }>(`/api/projects/${projectId}/profiles`);
}

export function preview(projectId: string, weights: Weights, top_n = 15) {
  return request<PreviewResponse>(`/api/projects/${projectId}/preview`, {
    method: "POST",
    body: JSON.stringify({ weights, top_n }),
  });
}

export function saveProfile(projectId: string, weights: Weights, note?: string) {
  return request<ProfileVersion & { project: string }>(`/api/projects/${projectId}/profile`, {
    method: "POST",
    body: JSON.stringify({ weights, note }),
  });
}
