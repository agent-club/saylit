// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseWorkspace, saveWorkspace, STORAGE_KEY, WorkspaceStorageError, type Draft, type Workspace } from './storage';
import { themes } from './themes';

function draft(id:string,markdown:string,updatedAt:number):Draft {
  return {id,markdown,themeId:themes[0].id,fontSize:16,density:1,updatedAt};
}

function workspace(drafts:Draft[],activeId:string,favorites:string[]=[]):Workspace {
  return {version:1,activeId,drafts,favorites,storageRevision:0,favoritesRevision:0};
}

function useMemoryStorage() {
  const data=new Map<string,string>();
  vi.stubGlobal('localStorage',{
    getItem:(key:string)=>data.get(key)??null,
    setItem:(key:string,value:string)=>{data.set(key,String(value));},
    clear:()=>data.clear(),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('saveWorkspace',() => {
  it('stores only the supplied drafts on the first save',() => {
    useMemoryStorage();
    const article=draft('first','# First',1);

    const saved=saveWorkspace(workspace([article],article.id));

    expect(saved.drafts.map(item=>item.id)).toEqual(['first']);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).drafts.map((item:Draft)=>item.id)).toEqual(['first']);
  });

  it('keeps compatibility with original v1 backups and empty markdown',() => {
    const article=draft('article','',1);
    const parsed=parseWorkspace(JSON.stringify({version:1,activeId:article.id,drafts:[article],favorites:[]}));
    expect(parsed.drafts[0].markdown).toBe('');
    expect(parsed.storageRevision).toBe(0);
    expect(parsed.favoritesRevision).toBe(0);
  });

  it('merges two stale tab snapshots without losing independent article edits',() => {
    useMemoryStorage();
    const first=draft('first','# First original',1);
    const second=draft('second','# Second original',1);
    const initial=workspace([first,second],first.id);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(initial));
    const tabA=JSON.parse(JSON.stringify(initial)) as Workspace;
    const tabB=JSON.parse(JSON.stringify(initial)) as Workspace;

    tabA.drafts[0]={...tabA.drafts[0],markdown:'# First edited',updatedAt:2};
    const savedA=saveWorkspace(tabA);
    tabB.drafts[1]={...tabB.drafts[1],markdown:'# Second edited',updatedAt:3};
    const savedB=saveWorkspace(tabB);

    expect(savedB.drafts.map(item=>item.markdown)).toEqual(['# First edited','# Second edited']);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).drafts.map((item:Draft)=>item.markdown)).toEqual(['# First edited','# Second edited']);
    expect(savedA.storageRevision).toBeLessThan(savedB.storageRevision!);
  });

  it('keeps the newer version when stale and current tabs edit the same article',() => {
    useMemoryStorage();
    const original=draft('article','# Original',1);
    const initial=workspace([original],original.id);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(initial));
    const stale=JSON.parse(JSON.stringify(initial)) as Workspace;
    const newer={...original,markdown:'# Newer',updatedAt:3};
    saveWorkspace({...initial,drafts:[newer]});

    const result=saveWorkspace({...stale,drafts:[{...original,markdown:'# Stale',updatedAt:2}]});
    expect(result.drafts[0].markdown).toBe('# Newer');
  });

  it('does not silently replace favorites from a newer tab',() => {
    useMemoryStorage();
    const article=draft('article','# Article',1);
    const initial=workspace([article],article.id);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(initial));
    const stale=JSON.parse(JSON.stringify(initial)) as Workspace;
    const favoriteFromA=themes[1].id;
    const favoriteFromB=themes[2].id;

    const savedA=saveWorkspace({...initial,favorites:[favoriteFromA]});
    const savedB=saveWorkspace({...stale,favorites:[favoriteFromB]});

    expect(savedB.favorites).toEqual([favoriteFromA]);
    expect(savedB.favoritesRevision).toBe(savedA.favoritesRevision);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).favorites).toEqual([favoriteFromA]);
  });

  it('reports storage access failure separately from invalid backup data',() => {
    vi.stubGlobal('localStorage',{getItem:()=>{throw new Error('denied');}});
    const article=draft('article','# Article',1);
    expect(()=>saveWorkspace(workspace([article],article.id))).toThrow(WorkspaceStorageError);
  });
});
