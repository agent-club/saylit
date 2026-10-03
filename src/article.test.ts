import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildArticle, inspectArticle, htmlDocument, toPlainText } from './article';
import { themes } from './themes';
import { articlePalette, contrastRatio } from './article-colors';
import { parseWorkspace, initialWorkspace, readWorkspace, STORAGE_KEY } from './storage';

const settings={fontSize:16,density:1};
describe('publishing output',()=>{
  it('does not duplicate the author\'s section numbers',()=>{
    const numbered=themes.find(t=>t.headingStyle==='number')!;
    const doc=new DOMParser().parseFromString(buildArticle('## 01 / 已有编号',numbered,settings),'text/html');
    expect(doc.querySelector('h2')?.textContent).toBe('01 / 已有编号');
    for(const theme of themes){
      const doc=new DOMParser().parseFromString(buildArticle('## 01 / 已有编号',theme,settings),'text/html');
      expect(doc.querySelector('[data-inkflow-chapter] > [data-inkflow-decoration]'),theme.id).toBeNull();
    }
  });
  it('keeps article structure and inline styles for every built-in theme',()=>{
    const source='# 测试文章\n\n## 第二节\n\n正文 **重点**\n\n> 引用\n\n1. 项目\n\n```javascript\nconst value = 42;\n```\n\n| 字段 | 内容 |\n| --- | --- |\n| A | B |';
    for(const theme of themes){
      const doc=new DOMParser().parseFromString(buildArticle(source,theme,settings),'text/html');
      expect(doc.querySelectorAll('h1,h2').length).toBe(2);
      expect(doc.querySelector('strong')?.textContent).toBe('重点');
      expect(doc.querySelector('blockquote')).not.toBeNull();
      expect(doc.querySelector('ol li')).not.toBeNull();
      expect(doc.querySelector('table td')?.textContent).toBe('A');
      expect(doc.querySelector('pre code')?.textContent?.trimEnd()).toBe('const value = 42;');
      expect(doc.querySelector('pre code span')?.hasAttribute('style')).toBe(true);
      expect(doc.querySelectorAll('[class]').length).toBe(0);
      expect(doc.querySelector('h2')?.hasAttribute('style')).toBe(true);
    }
  });
  it('gives each design family a distinct inline layout across the article',()=>{
    const source='# 文章主标题\n\n开篇段落介绍本文内容。\n\n## 内容章节\n\n正文说明一个具体观点。\n\n> 引用中的原文\n\n- 第一项\n- 第二项\n\n| 名称 | 数值 |\n| --- | --- |\n| 样例 | 42 |\n\n```js\nconst answer = 42;\n```\n\n---\n\n![配图](https://example.com/photo.jpg)';
    const representatives=['quiet-slate','terminal-green','editorial-wine','executive-navy','sunny-kitchen','study-index'];
    const docs=representatives.map(id=>new DOMParser().parseFromString(buildArticle(source,themes.find(t=>t.id===id)!,settings),'text/html'));
    const style=(doc:Document,selector:string)=>doc.querySelector<HTMLElement>(selector)?.getAttribute('style')||'';
    for(const selector of ['h1','p','ul','table','pre','hr','img']) {
      expect(new Set(docs.map(doc=>style(doc,selector))).size,selector).toBeGreaterThan(1);
    }
    expect(style(docs[1],'pre')).toContain('rgb(30, 43, 57)');
    expect(style(docs[2],'p')).toContain('font-size');
    expect(style(docs[4],'ul')).toContain('border: 1px solid');
    expect(docs.every(doc=>doc.querySelector('style')===null)).toBe(true);
    expect(docs.every(doc=>doc.querySelectorAll('[class]').length===0)).toBe(true);
  });
  it('keeps six visibly distinct layout combinations within each category',()=>{
    for(const category of ['极简','技术','杂志','商务','生活','知识'] as const){
      const family=themes.filter(theme=>theme.category===category);
      const layouts=new Set(family.map(theme=>[theme.titleStyle,theme.bodyStyle,theme.listStyle,theme.tableStyle,theme.codeStyle,theme.ruleStyle,theme.imageStyle].join('|')));
      expect(family).toHaveLength(6);
      expect(layouts.size).toBe(6);
    }
  });
  it('preserves content order across composed pages, multiple titles and nested headings',()=>{
    const sources=[
      '# 标题 **重点**\n\n开篇 [链接](https://example.com) 与 `代码`。\n\n## 01 / 原有编号\n\n正文一\n\n> ## 引用内标题\n>\n> 引用正文\n\n- 第一项\n  - 子项目\n\n## 后一章节\n\n正文二\n\n# 另一标题\n\n末尾',
      '开篇无标题\n\n## 一个章节\n\n```js\nconst x = "<test>";\n```\n\n| A | B |\n|---|---|\n| 一 | 二 |\n\n尾声',
      '# 只有标题', '', '没有标题与章节的文章。',
      '<h1>原始标题</h1>必须先出现的文字<p>随后出现的段落</p>',
      '不能被移到标题后的文字<h1>随后出现的标题</h1><p>导语</p>',
    ];
    const normalize=(text:string)=>text.replace(/\s+/g,'');
    for(const source of sources){
      const baseline=normalize(toPlainText(buildArticle(source,themes[0],settings)));
      for(const theme of themes){
        const html=buildArticle(source,theme,settings);
        expect(normalize(toPlainText(html)),theme.id).toBe(baseline);
        const doc=new DOMParser().parseFromString(html,'text/html');
        expect(doc.querySelectorAll('blockquote h2').length).toBe(source.includes('引用内标题')?1:0);
        expect(doc.querySelectorAll('[data-inkflow-chapter] > h2').length).toBe(theme.layout==='plain'?0:(source.includes('后一章节')?2:source.includes('一个章节')?1:0));
      }
    }
  });
  it('keeps illustrated headings and photo captions intact without publishing decorative text',()=>{
    const source='# 手记 **重点**\n\n导语\n\n## 01 / **这一站**\n\n![作者配图](https://example.com/photo.jpg)\n\n照片说明 [原始链接](https://example.com/detail)\n\n- **地点**：海边';
    const expected=toPlainText(buildArticle(source,themes[0],settings)).replace(/\s/g,'');
    for(const id of ['floral-notes','orbit-letter','postcard-trip','botanical-journal','sea-salt','ribbon-letter']){
      const html=buildArticle(source,themes.find(t=>t.id===id)!,settings);
      const doc=new DOMParser().parseFromString(html,'text/html');
      expect(doc.querySelector('h2')?.textContent,id).toBe('01 / 这一站');
      expect(doc.querySelector('h2 strong')?.textContent,id).toBe('这一站');
      expect(doc.querySelector('img')?.getAttribute('src'),id).toBe('https://example.com/photo.jpg');
      expect(doc.querySelector('img')?.getAttribute('alt'),id).toBe('作者配图');
      expect(doc.querySelector('[data-inkflow-content] a')?.getAttribute('href'),id).toBe('https://example.com/detail');
      expect(toPlainText(html).replace(/\s/g,''),id).toBe(expected);
      expect(doc.querySelector('[data-inkflow-content] img'),id).not.toBeNull();
      expect(doc.querySelector('style,script,svg,[class]'),id).toBeNull();
    }
  });
  it('exports structural surfaces inline and excludes trusted decorative labels from plain text',()=>{
    const source='# 封面\n\n开篇 **重点**\n\n## 章节\n\n正文\n\n> 摘引';
    const expected=toPlainText(buildArticle(source,themes[0],settings));
    for(const theme of themes.filter(t=>t.layout!=='plain')){
      const html=buildArticle(source,theme,settings);
      const doc=new DOMParser().parseFromString(htmlDocument(html,'封面'),'text/html');
      expect(doc.querySelector('[data-inkflow-chapter]')?.hasAttribute('style')).toBe(true);
      expect(doc.querySelector('style,script,link,[class]')).toBeNull();
      expect(toPlainText(html).replace(/\s+/g,''),theme.id).toBe(expected.replace(/\s+/g,''));
    }
    const injected=buildArticle('<p data-inkflow-decoration="true">不能隐藏的正文</p>',themes[0],settings);
    expect(toPlainText(injected)).toBe('不能隐藏的正文');
  });
  it('keeps reading colors legible with pale custom colors and retains their artwork hue',()=>{
    const accents=['#ffffff','#ffff00','#f8c8dc','#88ddff','#111111'];
    const hex=(rgb:string)=>'#'+rgb.match(/\d+/g)!.slice(0,3).map(value=>Number(value).toString(16).padStart(2,'0')).join('');
    const inherited=(element:HTMLElement,property:'color'|'backgroundColor'):string=>{
      let current:HTMLElement|null=element;
      while(current){
        const value=current.style[property];
        if(value && value!=='transparent') return hex(value);
        current=current.parentElement;
      }
      return '#ffffff';
    };
    for(const theme of themes){
      for(const accent of [theme.accent,...accents]){
        const colors=articlePalette(theme,accent);
        expect(colors.accent).toBe(accent);
        expect(contrastRatio(colors.ink,colors.paper),`${theme.id} body`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(colors.accentText,colors.tint),`${theme.id} accent`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(colors.onAccent,accent),`${theme.id} badge`).toBeGreaterThanOrEqual(4.5);
        const html=buildArticle('# 标题 **重点** 与 `代码`\n\n**重点** 和 [链接](https://example.com) 与 `行内代码`\n\n## 章节 **强调** 与 `代码`\n\n> 引言 **强调**\n>\n> ## 引用内的标题\n\n| 资料 | 值 |\n|---|---|\n| A | B |\n\n```js\n// comment\nconst value = "hello";\n```',theme,{...settings,accent});
        expect(html).not.toMatch(/#[\da-f]{8}\b/i);
        const doc=new DOMParser().parseFromString(html,'text/html');
        expect(hex(doc.querySelector<HTMLElement>('body > section')!.style.backgroundColor)).toBe(colors.paper);
        doc.querySelectorAll<HTMLElement>('h1,h2,p,strong,a,code,pre span,th,td').forEach(element=>{
          expect(contrastRatio(inherited(element,'color'),inherited(element,'backgroundColor')),`${theme.id} ${accent} ${element.tagName}`).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
  });
  it('keeps spacing adjustments distinct after constraining theme rhythm for phone reading',()=>{
    const theme=themes.find(t=>t.id==='editorial-wine')!;
    const lineHeights=[.9,1,1.12].map(density=>{
      const doc=new DOMParser().parseFromString(buildArticle('# 题头\n\n导语\n\n## 章节\n\n正文',theme,{...settings,density}),'text/html');
      return doc.querySelector<HTMLElement>('[data-inkflow-chapter] p')!.style.lineHeight;
    });
    expect(new Set(lineHeights).size).toBe(3);
  });
  it('rejects executable HTML, unsafe image URLs, source styles and event handlers',()=>{
    const source='<script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(1)"><a href="javascript:alert(1)">bad</a><iframe src="https://example.com"></iframe><p style="position:fixed">safe</p>';
    const html=buildArticle(source,themes[0],settings);
    const doc=new DOMParser().parseFromString(html,'text/html');
    expect(doc.querySelector('script,iframe,[onerror]')).toBeNull();
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('position:fixed');
    expect(doc.querySelector('p')?.textContent).toBe('safe');
  });
  it('distinguishes local image publishing issues from external image checks',()=>{
    const local='![图](data:image/png;base64,YQ==)';
    expect(inspectArticle(buildArticle(local,themes[0],settings),local).some(i=>i.kind==='warning')).toBe(true);
    const external='![图](https://example.com/image.png)';
    expect(inspectArticle(buildArticle(external,themes[0],settings),external).some(i=>i.kind==='warning')).toBe(false);
    expect(inspectArticle(buildArticle(external,themes[0],settings),external).some(i=>i.kind==='info')).toBe(true);
  });
  it('calls out unsupported formulas and diagrams without silently dropping content',()=>{
    const source='# 数学\n\n$E=mc^2$\n\n```mermaid\ngraph TD;A-->B\n```';
    const html=buildArticle(source,themes[0],settings);
    expect(inspectArticle(html,source).filter(i=>i.kind==='warning').length).toBe(2);
    expect(toPlainText(html)).toContain('$E=mc^2$');
    expect(toPlainText(html)).toContain('graph TD;A-->B');
  });
  it('escapes exported titles and exports without UI decorations',()=>{
    const html=buildArticle('# 标题\n\n正文',themes[0],settings);
    const file=htmlDocument(html,'</title><script>alert(1)</script>');
    const doc=new DOMParser().parseFromString(file,'text/html');
    expect(doc.querySelector('script')).toBeNull();
    expect(doc.title).toBe('</title><script>alert(1)</script>');
    expect(toPlainText(html)).toMatch(/^标题\n+正文$/);
  });
});
describe('local drafts and recovery',()=>{
  beforeEach(()=>{
    // Keep draft tests independent of Node 25's experimental global web storage.
    const values=new Map<string,string>();
    vi.stubGlobal('localStorage',{
      getItem:(key:string)=>values.get(key)??null,
      setItem:(key:string,value:string)=>values.set(key,String(value)),
      removeItem:(key:string)=>values.delete(key),
      clear:()=>values.clear(),
    });
    localStorage.clear();
  });
  it('restores zero-length documents and customized settings exactly',()=>{
    const data=initialWorkspace();data.drafts[0].markdown='';data.drafts[0].accent='#123456';
    expect(parseWorkspace(JSON.stringify(data))).toEqual(data);
  });
  it('rejects duplicate IDs and unknown themes',()=>{
    const data=initialWorkspace();data.drafts.push({...data.drafts[0]});
    expect(()=>parseWorkspace(JSON.stringify(data))).toThrow();
    data.drafts.pop();data.drafts[0].themeId='unknown';
    expect(()=>parseWorkspace(JSON.stringify(data))).toThrow();
  });
  it('preserves corrupt original data when reading fails',()=>{
    localStorage.setItem(STORAGE_KEY,'broken-json');
    expect(readWorkspace().error).toBeTruthy();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('broken-json');
  });
});
