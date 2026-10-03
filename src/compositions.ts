import type { Theme } from './themes';
import { articlePalette } from './article-colors';
import { decorateHeading } from './motifs';

export const layoutNames: Record<Theme['layout'], string> = {
  plain: '留白长文', poster: '双色专题', press: '人文报刊', dossier: '品牌报告',
  notebook: '生活手记', cards: '知识卡片', studio: '图文画册', terminal: '技术专栏',
  experimental: '撞色实验', archive: '纸本档案', film: '胶片叙事',
  floral: '手绘花笺', orbit: '星轨信笺', postcard: '旅行邮简',
  botanical: '草木札记', ripple: '海盐波纹', ribbon: '丝带来信',
};

function decoration(text: string, style: string): HTMLElement {
  const element = document.createElement('span');
  element.textContent = text;
  element.setAttribute('data-inkflow-decoration', 'true');
  element.setAttribute('aria-hidden', 'true');
  element.style.cssText = style;
  return element;
}

function coverText(cover: HTMLElement, color: string): void {
  cover.querySelectorAll<HTMLElement>('h1,p,strong,em,a,code').forEach(element => {
    element.style.color = color;
    if (element.tagName === 'CODE') element.style.background = 'transparent';
  });
}

function chapterIndex(chapter: HTMLElement, text: string, style: string): void {
  // Author-supplied chapter numbers already carry this hierarchy; an extra badge would repeat it visually.
  if (/^\s*\d{1,3}\s*[./、:：-]/.test(chapter.querySelector('h2')?.textContent || '')) return;
  chapter.prepend(decoration(text, style));
}

export function composeArticle(article: HTMLElement, theme: Theme, size: number, accent: string): void {
  const layout = theme.layout;
  if (layout === 'plain' || !article.children.length) return;
  const colors = articlePalette(theme, accent);
  const { onAccent, ink } = colors;
  const mono = 'Menlo,Consolas,"Courier New",monospace';
  // Group only direct chapter headings. Nested quotes/lists stay intact, and moving nodes preserves source order.
  const nodes = Array.from(article.childNodes);
  const intro = document.createElement('section');
  intro.setAttribute('data-inkflow-intro', 'true');
  article.append(intro);
  const chapters: HTMLElement[] = [];
  let group = intro;
  for (const node of nodes) {
    if (node instanceof HTMLElement && node.tagName === 'H2') {
      group = document.createElement('section');
      group.setAttribute('data-inkflow-chapter', 'true');
      article.append(group);
      chapters.push(group);
    }
    group.append(node);
  }
  // Publishing keeps a single reading column and inline styles; no grid, absolute positioning or external CSS is required.
  article.style.boxSizing = 'border-box';
  article.querySelectorAll<HTMLElement>('img').forEach(image => image.style.boxSizing = 'border-box');
  const title = intro.firstElementChild?.tagName === 'H1' ? intro.firstElementChild as HTMLElement : null;
  const cover = document.createElement('section');
  if (title) {
    intro.insertBefore(cover, title);
    // Raw HTML can leave meaningful text between blocks; never jump over it to extract a lead paragraph.
    let lead: ChildNode | null = title.nextSibling;
    while (lead?.nodeType === Node.TEXT_NODE && !lead.textContent?.trim()) lead = lead.nextSibling;
    cover.append(title);
    if (lead instanceof HTMLElement && lead.tagName === 'P') cover.append(lead);
    title.style.border = '0';
    title.style.padding = '0';
    title.style.margin = '0 0 20px';
    title.style.lineHeight = '1.3';
    cover.querySelectorAll<HTMLElement>('p').forEach(p => { p.style.margin = '0'; });
  }

  article.style.background = colors.paper;
  const titleSize = (scale: number) => `${Math.min(32, size * scale)}px`;
  const chapterTitle = (chapter: HTMLElement, style: string) => {
    chapter.querySelector<HTMLElement>('h2')!.style.cssText = `font-weight:700;line-height:1.55;${style}`;
  };
  const quote = (style: string) => {
    article.querySelectorAll<HTMLElement>('blockquote').forEach(el => {
      el.style.cssText = `margin:24px 0;padding:18px 16px;line-height:1.9;font-size:${size}px;${style}`;
      el.querySelectorAll<HTMLElement>('p').forEach(p => { p.style.lineHeight = '1.9'; p.style.color = ink; });
      el.querySelectorAll<HTMLElement>('p:last-child').forEach(p => p.style.marginBottom = '0');
    });
  };

  switch (layout) {
    case 'floral':
    case 'orbit':
    case 'postcard':
    case 'botanical':
    case 'ripple':
    case 'ribbon': {
      const motifColors = { accent: colors.accentText, support: colors.support, ink };
      const centered = !['postcard', 'botanical'].includes(layout);
      const contentStyles = {
        floral: 'background:#f8f8fa;padding:20px 16px;',
        orbit: `background:${colors.surface};padding:22px 18px;border-radius:24px 4px 24px 4px;`,
        postcard: `background:${colors.paper};padding:20px 16px;border:2px dotted ${colors.line};`,
        botanical: `background:${colors.paper};padding:0 0 0 16px;border-left:1px solid ${colors.support};`,
        ripple: `background:${colors.surface};padding:22px 16px;border-radius:36px 36px 4px 4px;`,
        ribbon: `background:${colors.paper};padding:0 8px;border-bottom:1px solid ${colors.line};`,
      };
      article.style.padding = '22px 14px';
      const decorate = (heading: HTMLElement, isTitle: boolean) => {
        heading.style.cssText = `font-size:${size * (isTitle ? 1.65 : 1.2)}px;font-weight:700;line-height:1.65;color:${colors.accentText};text-align:${centered ? 'center' : 'left'};margin:0 0 ${isTitle ? 28 : 30}px;padding:0;border:0;letter-spacing:.5px;text-wrap:balance;`;
        heading.querySelectorAll<HTMLElement>('*').forEach(el => { el.style.color = colors.accentText; el.style.background = 'transparent'; });
        if (layout === 'ribbon' && !isTitle) {
          heading.style.cssText += `display:table;max-width:100%;box-sizing:border-box;margin-left:auto;margin-right:auto;background:${colors.tint};padding:8px 14px;border-bottom:2px solid ${colors.support};`;
        }
        decorateHeading(heading, layout, layout === 'orbit' && isTitle ? { ...motifColors, accent: '#ffffff' } : motifColors);
      };
      // Keep headings outside the illustrated content surfaces, and retain raw text before a cover in its original position.
      const packContent = (group: HTMLElement, after?: HTMLElement) => {
        const nodes: ChildNode[] = [];
        let current = after ? after.nextSibling : group.firstChild;
        while (current) { nodes.push(current); current = current.nextSibling; }
        if (!nodes.some(node => node instanceof HTMLElement || node.textContent?.trim())) return;
        const body = document.createElement('section');
        body.setAttribute('data-inkflow-content', 'true');
        body.style.cssText = `box-sizing:border-box;${contentStyles[layout]}`;
        group.insertBefore(body, nodes[0]);
        body.append(...nodes);
        body.querySelectorAll<HTMLElement>('p:last-child,ul:last-child,ol:last-child').forEach(el => el.style.marginBottom = '0');
      };
      if (title) {
        cover.style.cssText = 'padding:12px 2px 0;';
        decorate(title, true);
        const lead = cover.querySelector<HTMLElement>('p');
        if (lead) {
          lead.style.cssText = `box-sizing:border-box;font-size:${size}px;line-height:1.9;color:${ink};margin:0;${contentStyles[layout]}`;
          // A lead may contain a photo; no fabricated image or caption is inserted for text-only articles.
        }
        if (layout === 'orbit') {
          cover.style.cssText = `background:${colors.deep};border-radius:80px 80px 8px 8px;padding:30px 18px 20px;`;
          title.style.color = '#ffffff';
          coverText(title, '#ffffff');
        }
        if (layout === 'postcard') {
          cover.style.cssText = `background:${colors.surface};border:2px dotted ${colors.accentText};padding:20px 16px;`;
          if (lead) { lead.style.border = '0'; lead.style.background = 'transparent'; lead.style.padding = '0'; }
        }
        if (layout === 'botanical') cover.style.cssText = `padding:16px 4px 24px;border-bottom:1px solid ${colors.line};`;
        if (layout === 'ribbon') {
          cover.style.cssText = `background:${colors.surface};border-top:1px solid ${colors.support};border-bottom:3px double ${colors.support};padding:22px 14px;`;
          if (lead) { lead.style.border = '0'; lead.style.background = 'transparent'; lead.style.padding = '0'; lead.style.textAlign = 'center'; }
        }
        packContent(intro, cover);
      } else packContent(intro);
      chapters.forEach(chapter => {
        chapter.style.cssText = `margin-top:${layout === 'botanical' ? 36 : 44}px;padding:0;`;
        const heading = chapter.querySelector<HTMLElement>('h2')!;
        decorate(heading, false);
        packContent(chapter, heading);
      });
      quote(`background:${layout === 'floral' || layout === 'orbit' || layout === 'ripple' ? colors.paper : colors.surface};border:0;border-left:${layout === 'ribbon' ? 0 : 2}px solid ${colors.support};border-radius:${layout === 'orbit' ? 14 : 0}px;color:${ink};text-align:${layout === 'ribbon' ? 'center' : 'left'};`);
      if (layout === 'ribbon') {
        article.querySelectorAll<HTMLElement>('blockquote').forEach(el => el.style.borderTop = `2px solid ${colors.support}`);
      }
      article.querySelectorAll<HTMLElement>('ul,ol').forEach(el => {
        el.style.background = 'transparent';
        el.style.border = '0';
        el.style.padding = '0 0 0 22px';
      });
      article.querySelectorAll<HTMLElement>('img').forEach(image => {
        image.style.cssText = `display:block;box-sizing:border-box;width:100%;max-width:100%;height:auto;margin:0 auto 18px;border-radius:${layout === 'orbit' ? 16 : layout === 'ripple' ? 24 : 0}px;`;
        if (layout === 'postcard') { image.style.padding = '8px'; image.style.background = colors.surface; image.style.border = `1px solid ${colors.line}`; }
      });
      break;
    }
    case 'experimental':
      article.style.padding = '12px';
      if (title) {
        cover.style.cssText = `background:${accent};padding:22px 20px 20px;border-bottom:10px solid ${colors.support};`;
        title.style.cssText = `font-size:${Math.min(40, size * 2.4)}px;font-weight:900;line-height:1.2;letter-spacing:-1px;margin:0;color:${onAccent};`;
        coverText(cover, onAccent);
        cover.prepend(decoration('✳', `display:block;text-align:right;font-size:72px;line-height:1;color:${colors.support};margin-bottom:24px;`));
        const lead = cover.querySelector<HTMLElement>('p');
        if (lead) {
          lead.style.cssText = `background:${colors.support};color:${ink};font-size:${size}px;line-height:1.8;padding:16px;margin:24px 0 0;`;
          coverText(lead, ink);
        }
      }
      chapters.forEach((chapter, index) => {
        chapter.style.cssText = 'padding:32px 4px 8px;';
        const background = index % 2 ? accent : colors.support;
        const foreground = index % 2 ? onAccent : ink;
        chapterTitle(chapter, `background:${background};color:${foreground};font-size:${size * 1.4}px;line-height:1.4;padding:16px 14px;margin:0 0 24px;border:0;border-bottom:5px solid ${ink};`);
        chapter.querySelector<HTMLElement>('h2')!.querySelectorAll<HTMLElement>('*').forEach(el => { el.style.color = foreground; el.style.background = 'transparent'; });
      });
      quote(`background:${colors.support};border:0;border-left:8px solid ${accent};color:${ink};border-radius:0;`);
      // Filled quote surfaces need their own text color, including headings nested by the author.
      article.querySelectorAll<HTMLElement>('blockquote h2,blockquote h3,blockquote h4,blockquote strong,blockquote em,blockquote a').forEach(el => el.style.color = ink);
      break;
    case 'archive':
      article.style.padding = '18px 12px';
      if (title) {
        cover.style.cssText = `background:${colors.paper};border:1px solid ${ink};border-left:7px solid ${ink};padding:0 16px 20px;margin:8px 6px 0;`;
        cover.prepend(decoration('文本档案 / TEXT ARCHIVE', `display:table;background:${accent};color:${onAccent};font-family:${mono};font-size:11px;letter-spacing:1px;padding:7px 9px;margin:0 0 24px;`));
        title.style.cssText = `font-family:Georgia,"Songti SC",SimSun,serif;font-size:${Math.min(36, size * 2.1)}px;line-height:1.45;color:${ink};font-weight:800;padding:0 0 20px;margin:0 0 20px;border-bottom:3px double ${ink};`;
        const lead = cover.querySelector<HTMLElement>('p');
        if (lead) {
          lead.style.cssText = `background:${colors.support};color:${ink};padding:14px;font-size:${size}px;line-height:1.9;margin:0;`;
          coverText(lead, ink);
        }
      }
      chapters.forEach((chapter, index) => {
        chapter.style.cssText = `background:${colors.paper};border:1px dashed ${colors.accentText};border-left:5px solid ${colors.support};padding:0 14px 12px;margin:${index ? 32 : 28}px ${index % 2 ? 0 : 8}px 0 ${index % 2 ? 8 : 0}px;`;
        chapterTitle(chapter, `display:table;max-width:100%;box-sizing:border-box;background:${accent};color:${onAccent};font-family:Georgia,"Songti SC",SimSun,serif;font-size:${size * 1.15}px;padding:9px 12px;margin:0 0 22px;border:0;`);
        chapter.querySelector<HTMLElement>('h2')!.querySelectorAll<HTMLElement>('*').forEach(el => { el.style.color = onAccent; el.style.background = 'transparent'; });
      });
      quote(`background:${colors.support};border:0;border-top:1px dashed ${colors.accentText};border-bottom:1px dashed ${colors.accentText};color:${ink};font-family:Georgia,"Songti SC",SimSun,serif;border-radius:0;`);
      article.querySelectorAll<HTMLElement>('blockquote h2,blockquote h3,blockquote h4,blockquote strong,blockquote em,blockquote a').forEach(el => el.style.color = ink);
      break;
    case 'film': {
      const frame = '#25272b';
      const sprockets = () => {
        // Inline blocks keep the film perforations independent of font glyphs and external assets when copied.
        const strip = decoration('', 'display:block;text-align:center;line-height:0;padding:12px 0;white-space:nowrap;overflow:hidden;');
        for (let hole = 0; hole < 8; hole++) {
          strip.append(decoration('', `display:inline-block;width:14px;height:7px;border-radius:2px;background:${colors.paper};margin:0 4px;`));
        }
        return strip;
      };
      article.style.padding = '12px';
      if (title) {
        cover.style.cssText = `background:${frame};padding:0 16px;border-left:5px solid ${frame};border-right:5px solid ${frame};`;
        title.style.cssText = `font-size:${Math.min(36, size * 2.1)}px;font-weight:800;line-height:1.45;letter-spacing:1px;margin:0;padding:26px 4px;border-top:1px solid #62666f;color:#ffffff;`;
        coverText(cover, '#ffffff');
        cover.prepend(sprockets());
        const lead = cover.querySelector<HTMLElement>('p');
        if (lead) {
          lead.style.cssText = `color:${ink};background:${colors.support};font-size:${size}px;line-height:1.9;padding:18px 14px;margin:0;border-left:4px solid ${accent};`;
          coverText(lead, ink);
        }
        cover.append(sprockets());
      }
      chapters.forEach((chapter, index) => {
        chapter.style.cssText = `padding:30px 4px 12px;border-bottom:1px solid ${colors.line};`;
        chapterIndex(chapter, `FRAME ${String(index + 1).padStart(2, '0')}`, `display:table;font-family:${mono};font-size:11px;letter-spacing:2px;color:${colors.accentText};border:1px solid ${colors.accentText};padding:5px 8px;margin-bottom:14px;`);
        chapterTitle(chapter, `font-size:${size * 1.3}px;background:${frame};color:#ffffff;padding:12px 14px;margin:0 0 24px;border:0;border-left:5px solid ${accent};`);
        chapter.querySelector<HTMLElement>('h2')!.querySelectorAll<HTMLElement>('*').forEach(el => { el.style.color = '#ffffff'; el.style.background = 'transparent'; });
      });
      quote(`background:${colors.paper};border:2px solid ${frame};border-left:7px solid ${accent};color:${ink};text-align:left;border-radius:0;`);
      article.querySelectorAll<HTMLElement>('blockquote').forEach(el => {
        el.prepend(decoration('“', `display:block;font-family:Georgia,serif;color:${colors.accentText};font-size:48px;line-height:1;margin-bottom:8px;`));
      });
      break;
    }
    case 'poster':
      article.style.padding = '16px';
      if (title) {
        cover.style.cssText = `background:${colors.surface};border-top:8px solid ${accent};border-bottom:2px solid ${colors.support};padding:26px 18px 22px;`;
        title.style.fontSize = titleSize(1.85);
        title.style.textAlign = 'left';
        title.style.color = colors.accentText;
        cover.querySelectorAll<HTMLElement>('p').forEach(p => p.style.color = ink);
      }
      chapters.forEach(chapter => {
        chapter.style.cssText = 'padding:30px 0 8px;';
        chapterTitle(chapter, `font-size:${size * 1.25}px;color:${colors.accentText};margin:0 0 22px;border-left:4px solid ${accent};padding:2px 0 2px 12px;`);
      });
      quote(`background:${colors.tint};color:${ink};border-left:0;border-top:2px solid ${colors.support};border-bottom:1px solid ${colors.line};border-radius:0;`);
      break;
    case 'press':
      article.style.padding = '24px 18px';
      if (title) {
        cover.style.cssText = `border-top:3px double ${colors.accentText};border-bottom:1px solid ${colors.line};padding:22px 0;`;
        title.style.cssText = `font-family:Georgia,"Songti SC",SimSun,serif;font-size:${titleSize(1.9)};line-height:1.45;text-align:left;color:${ink};margin:0 0 20px;font-weight:800;letter-spacing:.5px;`;
      }
      chapters.forEach(chapter => {
        chapter.style.cssText = `border-top:1px solid ${colors.line};padding:26px 0 6px;margin-top:24px;`;
        chapterTitle(chapter, `font-size:${size * 1.25}px;color:${ink};margin:0 0 20px;`);
      });
      quote(`border:0;border-top:1px solid ${colors.support};border-bottom:1px solid ${colors.support};background:${colors.paper};font-family:Georgia,"Songti SC",SimSun,serif;text-align:center;color:${ink};`);
      article.querySelectorAll<HTMLElement>('strong').forEach(el => el.style.color = ink);
      break;
    case 'dossier':
      article.style.padding = '16px';
      if (title) {
        cover.style.cssText = `background:${colors.deep};border-top:4px solid ${colors.support};padding:24px 18px;`;
        title.style.fontSize = titleSize(1.65);
        coverText(cover, '#ffffff');
      }
      chapters.forEach((chapter, index) => {
        chapter.style.cssText = `padding:22px 16px;margin-top:24px;border:1px solid ${colors.line};border-top:3px solid ${accent};background:${colors.paper};`;
        chapterIndex(chapter, String(index + 1).padStart(2, '0'), `display:block;font-family:${mono};font-size:13px;letter-spacing:2px;color:${colors.accentText};margin-bottom:12px;`);
        chapterTitle(chapter, `font-size:${size * 1.2}px;color:${colors.accentText};margin:0 0 20px;`);
      });
      quote(`background:${colors.surface};border:0;border-left:3px solid ${colors.support};color:${ink};`);
      break;
    case 'notebook':
      article.style.padding = '22px 18px';
      if (title) {
        cover.style.cssText = `padding:12px 0 24px;border-bottom:1px solid ${colors.line};border-top:4px solid ${colors.support};`;
        title.style.fontSize = titleSize(1.8);
        title.style.textAlign = 'left';
        title.style.color = colors.accentText;
      }
      chapters.forEach(chapter => {
        chapter.style.cssText = 'padding:28px 0 4px;';
        chapterTitle(chapter, `display:table;background:${colors.tint};color:${colors.accentText};border-left:3px solid ${colors.support};padding:8px 12px;font-size:${size * 1.15}px;margin:0 0 22px;`);
      });
      quote(`background:${colors.tint};color:${ink};border:0;border-top:3px solid ${colors.support};border-radius:2px;`);
      break;
    case 'cards':
      article.style.padding = '16px 12px';
      if (title) {
        cover.style.cssText = `padding:20px 8px 24px;border-bottom:3px solid ${colors.support};`;
        title.style.fontSize = titleSize(1.85);
        title.style.textAlign = 'left';
        title.style.color = colors.accentText;
      }
      chapters.forEach((chapter, index) => {
        chapter.style.cssText = `background:${colors.surface};border:1px solid ${colors.line};border-radius:8px;padding:22px 16px;margin-top:24px;`;
        chapterIndex(chapter, String(index + 1).padStart(2, '0'), `display:table;background:${accent};color:${onAccent};padding:7px 10px;border-radius:3px;font-size:${size * 1.15}px;font-family:${mono};line-height:1;margin-bottom:16px;`);
        chapterTitle(chapter, `font-size:${size * 1.25}px;color:${colors.accentText};padding:0;margin:0 0 20px;`);
      });
      quote(`background:${colors.paper};border:0;border-left:3px solid ${colors.support};color:${ink};border-radius:0;`);
      break;
    case 'studio':
      article.style.padding = '24px 16px';
      if (title) {
        cover.style.cssText = `border-top:5px solid ${accent};border-bottom:1px solid ${colors.line};padding:28px 0;`;
        title.style.fontSize = titleSize(2);
        title.style.letterSpacing = '.5px';
        title.style.textAlign = 'left';
        title.style.color = ink;
      }
      chapters.forEach(chapter => {
        chapter.style.cssText = `padding:32px 0 12px;border-bottom:1px solid ${colors.line};`;
        chapterTitle(chapter, `font-size:${size * 1.3}px;color:${colors.accentText};margin:0 0 24px;`);
      });
      quote(`padding:24px 16px;background:${colors.surface};border:0;border-top:1px solid ${colors.support};border-bottom:1px solid ${colors.support};color:${ink};text-align:center;`);
      break;
    case 'terminal':
      article.style.padding = '16px';
      if (title) {
        cover.style.cssText = `border-top:3px solid ${accent};background:${colors.surface};padding:20px 16px;border-bottom:1px solid ${colors.line};`;
        cover.prepend(decoration('● ● ●', `display:block;color:${colors.support};font-size:10px;letter-spacing:5px;margin-bottom:18px;`));
        title.style.fontSize = titleSize(1.65);
        title.style.fontFamily = mono;
        title.style.color = colors.accentText;
      }
      chapters.forEach((chapter, index) => {
        chapter.style.cssText = `padding:24px 0 8px;border-bottom:1px solid ${colors.line};margin-top:8px;`;
        chapterIndex(chapter, `[ ${String(index + 1).padStart(2, '0')} ]`, `display:block;color:${colors.accentText};font-family:${mono};font-size:13px;letter-spacing:2px;margin-bottom:14px;`);
        chapterTitle(chapter, `font-family:${mono};font-size:${size * 1.2}px;color:${colors.accentText};margin:0 0 20px;`);
      });
      quote(`background:${colors.surface};border:0;border-left:3px solid ${accent};color:${ink};`);
      break;
  }
}
