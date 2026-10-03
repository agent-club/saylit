'use client';
import { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react';
import { Feather, Plus, FileText, Search, ChevronDown, ArrowUpRight, Upload, Download, Copy, Check, Heart, SlidersHorizontal, Palette, Smartphone, Monitor, PanelLeftClose, PanelLeft, X, ArrowLeftRight, ShieldCheck, CircleHelp, ImagePlus, Bold, Italic, Heading2, List, Link, Quote, Code2, Table2, Undo2, Redo2, AlertCircle, CheckCircle2, ChevronRight, FileDown, Archive, RotateCcw, Keyboard, BookOpen } from 'lucide-react';
import { themes, categories, type Theme } from './themes';
import { layoutNames } from './compositions';
import { articlePalette } from './article-colors';
import { buildArticle, inspectArticle, toPlainText, htmlDocument } from './article';
import { readWorkspace, newDraft, draftTitle, parseWorkspace, saveWorkspace, STORAGE_KEY, type Draft } from './storage';

type Toast = {text:string; error?:boolean};
const dateLabel = (time:number) => new Date(time).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'});

export default function App() {
  const [loaded] = useState(readWorkspace);
  const [workspace,setWorkspace] = useState(loaded.workspace);
  const [saveStatus,setSaveStatus] = useState(loaded.error ? '保存暂停' : '已保存到本地');
  const [saveBlocked,setSaveBlocked] = useState(Boolean(loaded.error));
  const [toast,setToast] = useState<Toast|null>(loaded.error ? {text:loaded.error,error:true} : null);
  const [sideOpen,setSideOpen] = useState(() => window.innerWidth > 1080);
  const [panel,setPanel] = useState<'themes'|'settings'>('themes');
  const [phone,setPhone] = useState(true);
  const [mobileView,setMobileView] = useState<'edit'|'preview'|'themes'>('edit');
  const [category,setCategory] = useState<string>('全部');
  const [query,setQuery] = useState('');
  const [draftQuery,setDraftQuery] = useState('');
  const [onlyFavorites,setOnlyFavorites] = useState(false);
  const [exportOpen,setExportOpen] = useState(false);
  const [checkOpen,setCheckOpen] = useState(false);
  const [helpOpen,setHelpOpen] = useState(false);
  const [compareOpen,setCompareOpen] = useState(false);
  const [compareIds,setCompareIds] = useState<string[]>([]);
  const [copied,setCopied] = useState(false);
  const [historyVersion,setHistoryVersion] = useState(0);
  const histories = useRef<Record<string,{past:string[];future:string[]}>>({});
  const editor = useRef<HTMLTextAreaElement>(null);
  const mdInput = useRef<HTMLInputElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const latestWorkspace = useRef(workspace);
  latestWorkspace.current = workspace;
  const latestBlocked = useRef(saveBlocked);
  latestBlocked.current = saveBlocked;
  const pendingSave = useRef(false);
  const draft = workspace.drafts.find(d => d.id === workspace.activeId)!;
  const title = draftTitle(draft);
  const theme = themes.find(t => t.id === draft.themeId)!;
  const deferredMarkdown = useDeferredValue(draft.markdown);
  const settings = {fontSize:draft.fontSize,density:draft.density,accent:draft.accent};
  const html = useMemo(() => buildArticle(deferredMarkdown,theme,settings),[deferredMarkdown,theme,draft.fontSize,draft.density,draft.accent]);
  const articleColors = articlePalette(theme, draft.accent);
  const issues = useMemo(() => inspectArticle(html,deferredMarkdown),[html,deferredMarkdown]);
  const wordCount = draft.markdown.replace(/[#*`>|\[\]()-]/g,'').replace(/\s/g,'').length;
  const showcase = ['floral-notes','orbit-letter','postcard-trip','botanical-journal','sea-salt','ribbon-letter','signal-orange','ink-underprint','weekend-blue','editorial-wine','modern-column','terminal-green','concept-cards','garden-note','gallery-frame','executive-navy'];
  const displayedThemes = [...themes].sort((a,b) => {
    const rank = (id:string) => showcase.includes(id) ? showcase.indexOf(id) : showcase.length;
    return rank(a.id) - rank(b.id);
  });
  const filtered = displayedThemes.filter(t => (category === '全部' || t.category === category) && (!onlyFavorites || workspace.favorites.includes(t.id)) && (t.name + t.description + t.category + layoutNames[t.layout]).includes(query.trim()));
  const history = histories.current[draft.id];
  void historyVersion;

  function notify(text:string,error=false) {setToast({text,error});}
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(()=>{ /* Offline caching is optional; a failed registration must not prevent editing. */ });
    }
  },[]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null),toast.error ? 7000 : 3000);
    return () => clearTimeout(timer);
  },[toast]);
  useEffect(() => {
    if (saveBlocked) return;
    pendingSave.current = true;
    setSaveStatus('正在保存…');
    const timer = setTimeout(() => {
      try {
        const merged = saveWorkspace(workspace);
        pendingSave.current = false;
        if (JSON.stringify(merged) !== JSON.stringify(workspace)) setWorkspace(merged);
        if (merged.favorites.join() !== workspace.favorites.join()) notify('另一个窗口更新了收藏，已保留最新收藏，请重新选择。',true);
        setSaveStatus('已保存到本地');
      } catch {setSaveStatus('保存失败');notify('本地存储不可用或数据异常，请下载工作台备份。',true);}
    },400);
    return () => clearTimeout(timer);
  },[workspace,saveBlocked]);
  useEffect(() => {
    // The debounce avoids serializing on every keystroke; flush synchronously before a tab is hidden or closed.
    function flush() {
      if (!pendingSave.current || latestBlocked.current) return;
      try {saveWorkspace(latestWorkspace.current);pendingSave.current=false;}
      catch { /* Keep the unsaved marker so beforeunload can warn and the visible app can offer a backup. */ }
    }
    function visibility() {if(document.visibilityState==='hidden')flush();}
    function leaving(event:BeforeUnloadEvent) {
      flush();
      if(pendingSave.current || latestBlocked.current){event.preventDefault();event.returnValue='';}
    }
    window.addEventListener('pagehide',flush);window.addEventListener('beforeunload',leaving);document.addEventListener('visibilitychange',visibility);
    return()=>{window.removeEventListener('pagehide',flush);window.removeEventListener('beforeunload',leaving);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  useEffect(() => {
    function close(event:MouseEvent) {if (!exportRef.current?.contains(event.target as Node)) setExportOpen(false);}
    function escape(event:KeyboardEvent) {if (event.key === 'Escape') {setExportOpen(false);setCompareOpen(false);setCheckOpen(false);setHelpOpen(false);if(window.innerWidth<=1080)setSideOpen(false);}}
    document.addEventListener('mousedown',close);document.addEventListener('keydown',escape);
    return () => {document.removeEventListener('mousedown',close);document.removeEventListener('keydown',escape);};
  },[]);

  function updateDraft(patch:Partial<Draft>) {
    setWorkspace(w => ({...w,drafts:w.drafts.map(d => d.id === w.activeId ? {...d,...patch,updatedAt:Date.now()} : d)}));
  }
  function editMarkdown(next:string) {
    if (next === draft.markdown) return;
    const h = histories.current[draft.id] ||= {past:[],future:[]};
    h.past.push(draft.markdown);if (h.past.length > 100) h.past.shift();h.future=[];
    setHistoryVersion(v=>v+1);updateDraft({markdown:next});
  }
  function undo(redo=false) {
    const h = histories.current[draft.id];if (!h) return;
    const next = (redo ? h.future : h.past).pop();if (next === undefined) return;
    (redo ? h.past : h.future).push(draft.markdown);updateDraft({markdown:next});setHistoryVersion(v=>v+1);
  }
  function insert(before:string,after='',placeholder='文字') {
    const el=editor.current;if (!el) return;
    const start=el.selectionStart,end=el.selectionEnd;
    const selected=draft.markdown.slice(start,end)||placeholder;
    editMarkdown(draft.markdown.slice(0,start)+before+selected+after+draft.markdown.slice(end));
    requestAnimationFrame(()=>{el.focus();el.setSelectionRange(start+before.length,start+before.length+selected.length);});
  }
  function createDraft() {
    const item=newDraft();setWorkspace(w=>({...w,activeId:item.id,drafts:[item,...w.drafts]}));setMobileView('edit');
    if(window.innerWidth<=1080)setSideOpen(false);
    requestAnimationFrame(()=>editor.current?.focus());
  }
  function toggleFavorite(id:string) {
    setWorkspace(w=>({...w,favorites:w.favorites.includes(id)?w.favorites.filter(f=>f!==id):[...w.favorites,id]}));
  }
  function selectTheme(id:string) {updateDraft({themeId:id,accent:undefined});}
  function download(content:string,filename:string,mime:string) {
    const url=URL.createObjectURL(new Blob([content],{type:mime}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportFile(type:'md'|'html'|'backup') {
    const name=title.replace(/[\\/:*?"<>|]/g,'-').slice(0,80);
    if (type==='md') download(draft.markdown,`${name}.md`,'text/markdown;charset=utf-8');
    if (type==='html') download(htmlDocument(buildArticle(draft.markdown,theme,settings),title),`${name}.html`,'text/html;charset=utf-8');
    if (type==='backup') download(JSON.stringify(workspace,null,2),'saylit-backup.json','application/json');
    setExportOpen(false);notify('文件已准备下载');
  }
  async function copyArticle() {
    if (!draft.markdown.trim()) {notify('先写一点内容，再复制排版。',true);return;}
    const fresh=buildArticle(draft.markdown,theme,settings);
    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem==='undefined') throw new Error('unsupported');
      // Generate the HTML synchronously inside the click gesture; Safari requires user activation for clipboard writes.
      await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([fresh],{type:'text/html'}),'text/plain':new Blob([toPlainText(fresh)],{type:'text/plain'})})]);
      setCopied(true);setTimeout(()=>setCopied(false),2500);
      const freshIssues=inspectArticle(fresh,draft.markdown);
      if (freshIssues.some(i=>i.kind==='warning')) {setCheckOpen(true);notify('排版已复制，请先处理发布检查中的提示。');}
      else notify('排版已复制，到公众号后台粘贴即可。');
    } catch {setCheckOpen(true);notify('浏览器未允许富文本复制。请允许剪贴板访问，或下载 HTML 后手动复制正文。',true);}
  }
  async function importMarkdown(files:FileList|File[]) {
    const entries=Array.from(files);
    if (!entries.length) return;
    if (entries.some(f=>!/\.(md|markdown|txt)$/i.test(f.name)||f.size>5_000_000)) {notify('请选择 5MB 以内的 Markdown 或 TXT 文件。',true);return;}
    try {
      const drafts=await Promise.all(entries.map(async f=>newDraft(await f.text())));
      setWorkspace(w=>({...w,activeId:drafts[0].id,drafts:[...drafts,...w.drafts]}));notify(`已导入 ${drafts.length} 篇文章`);setMobileView('edit');
    } catch {notify('文件读取失败，原文章已保留。',true);}
  }
  async function importBackup(file:File) {
    if (file.size>20_000_000) {notify('备份文件超过 20MB，请先减小文件。',true);return;}
    try {
      const data=parseWorkspace(await file.text());
      // Import is additive: restored IDs are regenerated so a backup can never replace existing articles.
      const drafts=data.drafts.map(d=>({...d,id:crypto.randomUUID()}));
      const next={...latestWorkspace.current,activeId:drafts[0].id,drafts:[...drafts,...latestWorkspace.current.drafts],favorites:[...new Set([...latestWorkspace.current.favorites,...data.favorites])]};
      if (saveBlocked) {
        try {
          const raw=localStorage.getItem(STORAGE_KEY);
          if(raw)download(raw,'saylit-original-data.json','application/json');
          // The explicit recovery backs up unreadable data before replacing it with the validated merged workspace.
          localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
          setSaveBlocked(false);
        } catch {
          setWorkspace(next);setSaveStatus('保存失败');
          notify(`已读取 ${drafts.length} 篇备份文章，但本地存储不可用。请导出工作台备份，刷新前不会自动保存。`,true);
          return;
        }
      }
      setWorkspace(next);
      notify(`已恢复 ${drafts.length} 篇文章，现有文章保留。`);
    } catch (e) {notify(e instanceof Error?e.message:'备份读取失败',true);}
  }
  function insertImage(file:File) {
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)||file.size>3_000_000) {notify('请选择 3MB 以内的 PNG、JPEG、WebP 或 GIF 图片。',true);return;}
    const targetId=draft.id;
    const reader=new FileReader();
    reader.onload=()=>{
      const image=`\n\n![${file.name.replace(/[\[\]\n]/g,'')} ](${reader.result})\n\n`;
      setWorkspace(w=>({...w,drafts:w.drafts.map(d=>d.id===targetId?{...d,markdown:d.markdown+image,updatedAt:Date.now()}:d)}));
      notify('图片已插入本地预览，发布时需要在公众号后台上传。');
    };
    reader.onerror=()=>notify('图片读取失败。',true);reader.readAsDataURL(file);
  }

  return <div className={`app ${sideOpen?'':'sidebar-hidden'}`}>
    <input ref={mdInput} type="file" accept=".md,.markdown,.txt" multiple hidden onChange={e=>{if(e.target.files)void importMarkdown(e.target.files);e.target.value='';}} />
    <input ref={backupInput} type="file" accept=".json" hidden onChange={e=>{if(e.target.files?.[0])void importBackup(e.target.files[0]);e.target.value='';}} />
    <input ref={imageInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={e=>{if(e.target.files?.[0])insertImage(e.target.files[0]);e.target.value='';}} />
    {sideOpen&&<><button className="sidebar-shade" aria-label="关闭文章列表" onClick={()=>setSideOpen(false)}/><aside className="sidebar"><button className="sidebar-close icon-button" aria-label="关闭侧栏" onClick={()=>setSideOpen(false)}><X size={18}/></button>
      <a className="brand" href="#" onClick={e=>e.preventDefault()}><span className="brand-mark"><Feather size={23}/></span><span>简言<small>SAYLIT</small></span></a>
      <div className="workspace-label"><span className="workspace-avatar">我</span><div>个人工作台<small>把灵感，写成文章</small></div><ChevronDown size={14}/></div>
      <button className="new-draft" onClick={createDraft}><Plus size={17}/>新建文章<span>MD</span></button>
      <div className="sidebar-heading"><span>我的文章 <em>{workspace.drafts.length}</em></span><button className="icon-button" aria-label="搜索文章" onClick={()=>setDraftQuery(q=>q?'':' ')}><Search size={15}/></button></div>
      {draftQuery!==''&&<input className="draft-search" autoFocus aria-label="搜索我的文章" placeholder="搜索文章…" value={draftQuery.trimStart()} onChange={e=>setDraftQuery(e.target.value||' ')} />}
      <nav className="draft-list">{workspace.drafts.filter(d=>draftTitle(d).includes(draftQuery.trim())).map(d=><button key={d.id} className={`draft-item ${d.id===draft.id?'active':''}`} onClick={()=>{setWorkspace(w=>({...w,activeId:d.id}));if(window.innerWidth<=1080)setSideOpen(false);}}><FileText size={16}/><span>{draftTitle(d)}<small>{dateLabel(d.updatedAt)} · {d.markdown.replace(/\s/g,'').length} 字</small></span></button>)}</nav>
      <div className="sidebar-bottom"><div className="little-card"><span className="little-card-icon"><BookOpen size={19}/></span><strong>内容是主角</strong><p>排版的事，就交给简言。</p><button onClick={()=>setHelpOpen(true)}>看看使用指南 <ArrowUpRight size={13}/></button></div><button className="sidebar-help" onClick={()=>setHelpOpen(true)}><CircleHelp size={16}/>使用指南与快捷键</button><div className="local-badge"><ShieldCheck size={14}/><span>文章保存在此浏览器</span><span className="status-dot"/></div></div>
    </aside></>}
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb"><button className="icon-button" aria-label={sideOpen?'收起侧栏':'展开侧栏'} onClick={()=>setSideOpen(v=>!v)}>{sideOpen?<PanelLeftClose size={18}/>:<PanelLeft size={18}/>}</button><span>我的文章</span><ChevronRight size={13}/><strong title={title}>{title}</strong><span className="draft-tag">草稿</span></div><div className="topbar-actions"><button className="text-button" aria-label="导入文章" onClick={()=>mdInput.current?.click()}><Upload size={15}/><span>导入</span></button><div className="export-wrapper" ref={exportRef}><button className="text-button" aria-label="导出文章" aria-expanded={exportOpen} onClick={()=>setExportOpen(v=>!v)}><Download size={15}/><span>导出</span><ChevronDown size={12}/></button>{exportOpen&&<div className="export-menu"><button onClick={()=>exportFile('md')}><FileText size={16}/>Markdown 原文 <small>.md</small></button><button onClick={()=>exportFile('html')}><Code2 size={16}/>完整排版 <small>.html</small></button><div className="menu-divider"/><button onClick={()=>exportFile('backup')}><Archive size={16}/>备份整个工作台</button><button onClick={()=>backupInput.current?.click()}><RotateCcw size={16}/>恢复工作台备份</button></div>}</div><button className="copy-button" onClick={()=>void copyArticle()}>{copied?<Check size={16}/>:<Copy size={16}/>}<span>{copied?'已复制排版':'复制到公众号'}</span></button></div></header>
      <div className="work-heading"><div><span className="eyebrow">SAYLIT / WRITING STUDIO</span><h1>创作工作台</h1></div><div className={`save-state ${saveStatus==='保存失败'||saveBlocked?'save-error':''}`}><span className="status-dot"/>{saveStatus}</div></div>
      <div className="mobile-tabs"><button className={mobileView==='edit'?'selected':''} onClick={()=>setMobileView('edit')}>写作</button><button className={mobileView==='preview'?'selected':''} onClick={()=>setMobileView('preview')}>预览</button><button className={mobileView==='themes'?'selected':''} onClick={()=>setMobileView('themes')}>主题与调整</button></div>
      <main className={`workbench mobile-${mobileView}`}>
        <section className="editor-panel"><div className="pane-heading"><span><FileText size={16}/>写作</span><span className="subtle-label">MARKDOWN</span></div><div className="format-toolbar"><button aria-label="二级标题" title="二级标题" onClick={()=>insert('\n## ','\n','标题')}><Heading2 size={17}/></button><button aria-label="加粗" title="加粗" onClick={()=>insert('**','**')}><Bold size={16}/></button><button aria-label="斜体" title="斜体" onClick={()=>insert('*','*')}><Italic size={16}/></button><span/><button aria-label="引用" title="引用" onClick={()=>insert('\n> ','\n','引用内容')}><Quote size={16}/></button><button aria-label="列表" title="列表" onClick={()=>insert('\n- ','\n','列表内容')}><List size={17}/></button><button aria-label="链接" title="链接" onClick={()=>insert('[','](https://example.com)','链接文字')}><Link size={15}/></button><button aria-label="插入图片" title="插入本地图片" onClick={()=>imageInput.current?.click()}><ImagePlus size={16}/></button><button aria-label="代码块" title="代码块" onClick={()=>insert('\n```javascript\n','\n```\n','// 写下代码')}><Code2 size={17}/></button><button aria-label="表格" title="表格" onClick={()=>insert('\n','\n','| 标题 | 标题 |\n| --- | --- |\n| 内容 | 内容 |')}><Table2 size={16}/></button><span/><button aria-label="撤销" title="撤销" disabled={!history?.past.length} onClick={()=>undo()}><Undo2 size={15}/></button><button aria-label="重做" title="重做" disabled={!history?.future.length} onClick={()=>undo(true)}><Redo2 size={15}/></button></div><div className="editor-area" onDragOver={e=>{if(e.dataTransfer.types.includes('Files'))e.preventDefault();}} onDrop={e=>{if(e.dataTransfer.files.length){e.preventDefault();void importMarkdown(e.dataTransfer.files);}}}><textarea ref={editor} aria-label="Markdown 正文" spellCheck={false} placeholder={'# 写下你的第一行\n\n粘贴 Markdown，或把 .md 文件拖到这里。'} value={draft.markdown} onChange={e=>editMarkdown(e.target.value)} onKeyDown={e=>{
          if(e.key==='Tab'){e.preventDefault();insert('  ','','');}
          if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='b'){e.preventDefault();insert('**','**');}
          if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo(e.shiftKey);}
          if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){e.preventDefault();exportFile('md');}
        }} /></div><div className="editor-footer"><span><span className="status-dot"/>专注表达，其余交给排版</span><span>{wordCount.toLocaleString()} 字 · {Math.max(1,Math.ceil(wordCount/400))} 分钟</span></div></section>
        <section className="preview-panel"><div className="pane-heading"><span><span className="preview-dot"/>实时预览</span><div className="device-toggle"><button aria-label="手机预览" title="手机预览" aria-pressed={phone} className={phone?'selected':''} onClick={()=>setPhone(true)}><Smartphone size={15}/></button><button aria-label="宽屏预览" title="宽屏预览" aria-pressed={!phone} className={!phone?'selected':''} onClick={()=>setPhone(false)}><Monitor size={15}/></button></div></div><div className="preview-scroll"><div className={`article-paper ${phone?'phone-width':'desktop-width'}`}><div className="paper-meta"><span>微信公众号 · 正文预览</span><span>{theme.name}</span></div><div className="rendered-article" dangerouslySetInnerHTML={{__html:html}} /><div className="paper-end"><span/>好内容，自有回响<span/></div></div></div><div className="preview-footer"><button onClick={()=>setCheckOpen(true)} className={issues.some(i=>i.kind==='warning')?'warning':''}>{issues.length?<AlertCircle size={14}/>:<CheckCircle2 size={14}/>}<span>{issues.length?`${issues.length} 项发布提示`:'发布前检查'}</span><ChevronRight size={13}/></button><span>{phone?'手机阅读宽度':'宽屏阅读宽度'}</span></div></section>
        <aside className="theme-panel"><div className="theme-panel-tabs"><button className={panel==='themes'?'selected':''} onClick={()=>setPanel('themes')}><Palette size={16}/>主题</button><button className={panel==='settings'?'selected':''} onClick={()=>setPanel('settings')}><SlidersHorizontal size={16}/>调整</button><button className="compare-launch" aria-label="对比主题" title="用当前文章对比主题" onClick={()=>{setCompareIds([theme.id,displayedThemes.find(t=>t.layout!==theme.layout)!.id]);setCompareOpen(true);}}><ArrowLeftRight size={14}/>对比</button></div>{panel==='themes'?<><div className="theme-intro"><div><h2>选一套文章版式</h2><span>公众号阅读 · {themes.length} 套配色版式</span></div><span className="theme-count">{themes.length}</span></div><div className="theme-search"><Search size={15}/><input aria-label="搜索主题" placeholder="找一个喜欢的主题…" value={query} onChange={e=>setQuery(e.target.value)}/><button aria-pressed={onlyFavorites} aria-label={onlyFavorites?'查看全部主题':'只看收藏主题'} title="只看收藏" className={onlyFavorites?'favorite-filter active':'favorite-filter'} onClick={()=>setOnlyFavorites(v=>!v)}><Heart size={14} fill={onlyFavorites?'currentColor':'none'}/></button></div><div className="category-row">{categories.map(c=><button key={c} aria-pressed={category===c} className={category===c?'selected':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="active-theme-note"><span style={{background:theme.accent}}/><div><strong>当前 · {theme.name}</strong><p>{theme.description}</p></div></div><div className="theme-grid">{filtered.map(t=><ThemeCard key={t.id} theme={t} selected={theme.id===t.id} favorite={workspace.favorites.includes(t.id)} markdown={deferredMarkdown} onSelect={()=>selectTheme(t.id)} onFavorite={()=>toggleFavorite(t.id)}/>)}{!filtered.length&&<div className="empty-themes"><Search size={23}/><p>{onlyFavorites?'还没有收藏的主题':'没有找到匹配的主题'}</p><button onClick={()=>{setQuery('');setCategory('全部');setOnlyFavorites(false);}}>查看全部主题</button></div>}</div><div className="theme-bottom"><ShieldCheck size={13}/>全部内置，选中即用，无需安装</div></>:<div className="settings-panel"><div className="settings-intro"><h2>刚刚好的阅读感</h2><p>微调几处，让文章更像你。</p></div><div className="setting-group"><label>正文字号 <strong>{draft.fontSize}px</strong></label><div className="font-size-options">{[14,15,16,17,18].map(size=><button key={size} className={draft.fontSize===size?'selected':''} onClick={()=>updateDraft({fontSize:size})}>{size}</button>)}</div><input aria-label="正文字号" type="range" min="12" max="22" value={draft.fontSize} onChange={e=>updateDraft({fontSize:Number(e.target.value)})}/></div><div className="setting-group"><label>阅读节奏</label><div className="density-options">{[{name:'紧凑',value:.9},{name:'舒适',value:1},{name:'舒展',value:1.12}].map(item=><button key={item.name} className={draft.density===item.value?'selected':''} onClick={()=>updateDraft({density:item.value})}>{item.name}</button>)}</div></div><div className="setting-group"><label>文章主色 <strong>{draft.accent||theme.accent}</strong></label><div className="color-options">{[{name:'朱砂',color:'#ad403b'},{name:'墨蓝',color:'#355c81'},{name:'暖赭',color:'#8b673e'},{name:'紫藤',color:'#6a5298'},{name:'松青',color:'#2f6b58'},{name:'石墨',color:'#444b55'}].map(({name,color})=><button key={color} aria-label={`主色 ${name}`} title={name} aria-pressed={(draft.accent||theme.accent)===color} className={(draft.accent||theme.accent)===color?'selected':''} style={{background:color}} onClick={()=>updateDraft({accent:color})}/>)}<label className="custom-color" title="自定义主色"><Plus size={15}/><input aria-label="自定义主色" type="color" value={draft.accent||theme.accent} onChange={e=>updateDraft({accent:e.target.value})}/></label></div><div className="article-color-preview" aria-label="当前文章配色">{[{name:'主色',color:articleColors.accent},{name:'强调文字',color:articleColors.accentText},{name:'浅色底纹',color:articleColors.tint},{name:'正文',color:articleColors.ink}].map(item=><div key={item.name}><span style={{background:item.color}}/><small>{item.name}</small></div>)}</div><p className="color-guidance">主色突出标题和分隔，深灰正文保持清晰；浅色主色会搭配更深的强调文字。</p></div><div className="setting-tip"><Feather size={19}/><p>调整自动保存在当前文章中。换一套主题时，会恢复新主题的配色。</p></div><button className="reset-settings" onClick={()=>updateDraft({fontSize:16,density:1,accent:undefined})}><RotateCcw size={14}/>恢复默认调整</button></div>}</aside>
      </main><footer className="bottom-line"><span>简言 Saylit <span>·</span> 轻松写作，随心排版</span><span><ShieldCheck size={12}/>本地处理 · 无需注册</span></footer>
    </div>
    {toast&&<div className={`toast ${toast.error?'error':''}`} role="status">{toast.error?<AlertCircle size={17}/>:<CheckCircle2 size={17}/>}<span>{toast.text}</span><button aria-label="关闭提示" onClick={()=>setToast(null)}><X size={14}/></button></div>}
    {checkOpen&&<Modal title="复制后的最后一小步" subtitle="编辑器预览不代表公众号最终显示，发布前再看一眼。" onClose={()=>setCheckOpen(false)}><div className="checklist"><div className="check-item success"><CheckCircle2 size={20}/><div><strong>排版使用内联样式</strong><p>标题、段落、代码和表格的样式会随富文本一起复制。</p></div></div>{issues.map((issue,i)=><div key={i} className={`check-item ${issue.kind}`}><AlertCircle size={20}/><p>{issue.message}</p></div>)}{!issues.length&&<div className="check-item success"><CheckCircle2 size={20}/><p>当前未检测到图片、公式或长文等特殊内容。</p></div>}<div className="check-note">在公众号后台粘贴后，检查文章尾部、图片、代码和表格。当前版本不自动登录、上传或发布。</div><div className="modal-actions"><button className="secondary-button" onClick={()=>exportFile('html')}><FileDown size={15}/>下载排版 HTML</button><button className="primary-button" onClick={()=>setCheckOpen(false)}>知道了</button></div></div></Modal>}
    {helpOpen&&<Modal title="写作，简单一点" subtitle="从一篇文章开始，三步完成排版。" onClose={()=>setHelpOpen(false)}><div className="help-steps"><div><em>01</em><section><strong>写下来，或直接导入</strong><p>左侧编辑 Markdown，支持拖入 .md、.txt 文件。所有文章保存在当前浏览器。</p></section></div><div><em>02</em><section><strong>选一套喜欢的主题</strong><p>{themes.length} 套内置主题开箱即用。收藏常用主题，或点对比按钮用当前文章比较两套效果。</p></section></div><div><em>03</em><section><strong>复制，粘贴，检查</strong><p>点击「复制到公众号」，在公众号后台粘贴并检查。图片需确认上传结果，公式和图表暂不渲染。</p></section></div></div><div className="keyboard-help"><Keyboard size={17}/><span>⌘ / Ctrl B 加粗</span><span>⌘ / Ctrl Z 撤销</span><span>⌘ / Ctrl S 导出原文</span></div><div className="check-note">本地保存依赖浏览器存储。清理网站数据会移除草稿，建议定期通过「导出 → 备份整个工作台」保存备份。当前不支持 Word 导入。</div><button className="secondary-button" onClick={()=>backupInput.current?.click()}><Archive size={15}/>导入工作台备份</button></Modal>}
    {compareOpen&&<Modal title="同一篇文章，两种版式" subtitle="直接用你的内容比较，找到更适合的表达。" wide onClose={()=>setCompareOpen(false)}><div className="comparison-columns">{compareIds.map((id,index)=>{const t=themes.find(item=>item.id===id)!;return <div className="comparison-column" key={index}><div className="comparison-toolbar"><select aria-label={`对比主题 ${index+1}`} value={id} onChange={e=>setCompareIds(ids=>ids.map((current,i)=>i===index?e.target.value:current))}>{themes.map(option=><option value={option.id} key={option.id}>{option.name} · {option.category}</option>)}</select><button onClick={()=>{selectTheme(id);setCompareOpen(false);}}>{theme.id===id?'当前主题':'应用主题'}<Check size={13}/></button></div><p className="comparison-description">{t.description}</p><div className="comparison-preview" dangerouslySetInnerHTML={{__html:buildArticle(deferredMarkdown,t,{fontSize:draft.fontSize,density:draft.density,accent:id===theme.id?draft.accent:undefined})}}/></div>;})}</div></Modal>}
  </div>;
}

function ThemeCard({theme,selected,favorite,markdown,onSelect,onFavorite}:{theme:Theme;selected:boolean;favorite:boolean;markdown:string;onSelect:()=>void;onFavorite:()=>void}) {
  // Cards preview the start of the current article; rendering thirty complete long documents would delay typing.
  const excerpt=markdown.slice(0,1800);
  const html=useMemo(()=>buildArticle(excerpt||'# 你的文章\n\n## 一段新的开始\n\n让内容被更好地阅读。\n\n> 留一点空白，给灵感。',theme,{fontSize:16,density:1}),[excerpt,theme]);
  return <div className={`theme-card ${selected?'selected':''}`}><button className="theme-card-main" aria-label={`应用主题 ${theme.name}`} aria-pressed={selected} onClick={onSelect}><div className="theme-mini" aria-hidden="true" style={{background:theme.paper}}><div className="mini-content" dangerouslySetInnerHTML={{__html:html}}/>{selected&&<span className="theme-selected"><Check size={12}/></span>}</div><div className="theme-card-name"><strong>{theme.name}</strong><span>{layoutNames[theme.layout]}</span></div><p>{theme.description}</p><div className="theme-palette" aria-hidden="true">{[theme.accent,theme.support,theme.paper,theme.ink].map((color,i)=><span key={i} style={{background:color}}/>)}</div></button><button className={`theme-heart ${favorite?'active':''}`} aria-pressed={favorite} aria-label={`${favorite?'取消收藏':'收藏'} ${theme.name}`} title={theme.description} onClick={onFavorite}><Heart size={12} fill={favorite?'currentColor':'none'}/></button></div>;
}

function Modal({title,subtitle,children,onClose,wide=false}:{title:string;subtitle:string;children:React.ReactNode;onClose:()=>void;wide?:boolean}) {
  const dialog=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    const el=dialog.current;el?.focus();
    function trap(event:KeyboardEvent){
      if(event.key!=='Tab'||!el)return;
      const focusable=el.querySelectorAll<HTMLElement>('button:not([disabled]),select,input,a[href]');
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===el)){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
    el?.addEventListener('keydown',trap);return()=>{el?.removeEventListener('keydown',trap);previous?.focus();};
  },[]);
  return <div className="modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div ref={dialog} tabIndex={-1} className={`modal ${wide?'wide':''}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" aria-label="关闭窗口" onClick={onClose}><X size={20}/></button></div>{children}</div></div>;
}
