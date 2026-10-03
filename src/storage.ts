import { themes } from './themes';
import { sample } from './sample';

export type Draft = {
  id: string; markdown: string; themeId: string; fontSize: number; density: number;
  accent?: string; updatedAt: number;
};
export type Workspace = {
  version: 1; activeId: string; drafts: Draft[]; favorites: string[];
  /** Optional v1 metadata lets concurrent tabs detect stale writes; older backups default to zero. */
  storageRevision?: number; favoritesRevision?: number;
};
export const STORAGE_KEY = 'inkflow.workspace.v1';
export class WorkspaceStorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'WorkspaceStorageError';
  }
}
export function newDraft(markdown = ''): Draft {
  return {id:crypto.randomUUID(),markdown,themeId:themes[0].id,fontSize:16,density:1,updatedAt:Date.now()};
}
export function initialWorkspace(): Workspace {
  const draft = newDraft(sample);
  return {version:1,activeId:draft.id,drafts:[draft],favorites:[],storageRevision:0,favoritesRevision:0};
}
export function parseWorkspace(raw: string): Workspace {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('备份不是有效的工作台文件');
  const obj = value as Record<string,unknown>;
  if (obj.version !== 1 || typeof obj.activeId !== 'string' || !Array.isArray(obj.drafts) || !obj.drafts.length || !Array.isArray(obj.favorites)) throw new Error('备份格式不完整，未导入');
  const seen = new Set<string>();
  const drafts: Draft[] = obj.drafts.map((item:unknown) => {
    if (!item || typeof item !== 'object') throw new Error('文章数据无效');
    const d = item as Record<string,unknown>;
    if (typeof d.id !== 'string' || seen.has(d.id) || typeof d.markdown !== 'string' || d.markdown.length > 5_000_000 || typeof d.themeId !== 'string' || !themes.some(t => t.id === d.themeId) || typeof d.fontSize !== 'number' || d.fontSize < 12 || d.fontSize > 22 || typeof d.density !== 'number' || d.density < .8 || d.density > 1.3 || typeof d.updatedAt !== 'number' || !Number.isFinite(d.updatedAt) || (d.accent !== undefined && (typeof d.accent !== 'string' || !/^#[\da-f]{6}$/i.test(d.accent)))) throw new Error('文章或主题设置无效，原工作台已保留');
    seen.add(d.id);
    return {id:d.id,markdown:d.markdown,themeId:d.themeId,fontSize:d.fontSize,density:d.density,updatedAt:d.updatedAt,...(d.accent ? {accent:d.accent as string} : {})};
  });
  if (!drafts.some(d => d.id === obj.activeId) || !obj.favorites.every(id => typeof id === 'string' && themes.some(t => t.id === id))) throw new Error('备份引用无效，原工作台已保留');
  const storageRevision = obj.storageRevision === undefined ? 0 : obj.storageRevision;
  const favoritesRevision = obj.favoritesRevision === undefined ? 0 : obj.favoritesRevision;
  if (!Number.isSafeInteger(storageRevision) || (storageRevision as number) < 0 || !Number.isSafeInteger(favoritesRevision) || (favoritesRevision as number) < 0) throw new Error('备份版本信息无效，原工作台已保留');
  return {version:1,activeId:obj.activeId,drafts,favorites:[...new Set(obj.favorites as string[])],storageRevision:storageRevision as number,favoritesRevision:favoritesRevision as number};
}

/** Merge a tab's snapshot with the latest persisted snapshot before writing it. */
export function saveWorkspace(workspace: Workspace): Workspace {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (cause) {
    throw new WorkspaceStorageError('本地工作台无法读取，未保存。', {cause});
  }

  let stored: Workspace | undefined;
  if (raw) {
    try {
      stored = parseWorkspace(raw);
    } catch (cause) {
      throw new WorkspaceStorageError('本地工作台格式异常，未覆盖原数据。', {cause});
    }
  }
  const baseline = stored ?? workspace;
  const byId = new Map(baseline.drafts.map(draft => [draft.id,draft]));
  for (const draft of workspace.drafts) {
    const existing = byId.get(draft.id);
    // updatedAt is the per-article conflict clock; on ties this save is the explicit winner.
    if (!existing || draft.updatedAt >= existing.updatedAt) byId.set(draft.id,draft);
  }
  const drafts = [
    ...workspace.drafts.map(draft => byId.get(draft.id)!),
    ...baseline.drafts.filter(draft => !workspace.drafts.some(current => current.id === draft.id)),
  ];
  const activeId = drafts.some(draft => draft.id === workspace.activeId) ? workspace.activeId : baseline.activeId;

  const incomingFavoritesRevision = workspace.favoritesRevision ?? 0;
  const storedFavoritesRevision = baseline.favoritesRevision ?? 0;
  const favoritesConflict = incomingFavoritesRevision !== storedFavoritesRevision;
  // Favorites use compare-and-swap semantics: a stale tab keeps the stored set instead of silently replacing it.
  const favorites = favoritesConflict ? baseline.favorites : [...new Set(workspace.favorites)];
  const favoritesChanged = favorites.length !== baseline.favorites.length || favorites.some((id,index) => id !== baseline.favorites[index]);
  const contentChanged = activeId !== baseline.activeId || favoritesChanged || drafts.length !== baseline.drafts.length || drafts.some((draft,index) => {
    const prior = baseline.drafts.find(item => item.id === draft.id);
    return !prior || prior.updatedAt !== draft.updatedAt || prior.markdown !== draft.markdown || prior.themeId !== draft.themeId || prior.fontSize !== draft.fontSize || prior.density !== draft.density || prior.accent !== draft.accent || baseline.drafts[index]?.id !== draft.id;
  });
  const result: Workspace = {
    version:1,activeId,drafts,favorites,
    storageRevision:(baseline.storageRevision ?? 0) + (contentChanged ? 1 : 0),
    favoritesRevision:storedFavoritesRevision + (favoritesChanged ? 1 : 0),
  };
  try {
    if (contentChanged || !raw) localStorage.setItem(STORAGE_KEY,JSON.stringify(result));
  } catch (cause) {
    throw new WorkspaceStorageError('本地工作台无法写入，未保存。', {cause});
  }
  return result;
}
export function readWorkspace(): { workspace: Workspace; error?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return {workspace:raw ? parseWorkspace(raw) : initialWorkspace()};
  } catch {
    // Do not overwrite a damaged or inaccessible local draft with the welcome sample.
    return {workspace:initialWorkspace(),error:'本地草稿读取失败。原数据未覆盖，请先下载备份或尝试恢复。'};
  }
}
export function draftTitle(draft: Draft): string {
  return draft.markdown.match(/^#\s+(.+)$/m)?.[1]?.replace(/[*_`]/g,'').trim() || draft.markdown.trim().split('\n')[0]?.slice(0,30) || '未命名文章';
}
