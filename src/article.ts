import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import type { Theme } from './themes';
import { composeArticle } from './compositions';
import { articlePalette, mixColor } from './article-colors';

export type ArticleSettings = { fontSize: number; density: number; accent?: string };
export type Issue = { kind: 'warning' | 'info'; message: string };
const fontFamilies = {
  sans: '-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif',
  serif: 'Georgia,"Noto Serif SC","Songti SC",SimSun,serif',
};

export function buildArticle(markdown: string, theme: Theme, settings: ArticleSettings): string {
  const accent = settings.accent && /^#[\da-f]{6}$/i.test(settings.accent) ? settings.accent : theme.accent;
  const colors = articlePalette(theme, accent);
  const textAccent = colors.accentText;
  const size = Math.min(22, Math.max(12, settings.fontSize));
  // Restrain theme spacing for phone reading while keeping the user's three spacing choices independent.
  const rhythm = Math.min(1.04, Math.max(.94, theme.density)) * settings.density;
  // Markdown may contain HTML. Restrict structure and discard source styles before applying our own trusted theme.
  const clean = DOMPurify.sanitize(marked.parse(markdown, { async: false, gfm: true }) as string, {
    ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','strong','em','del','s','blockquote','ul','ol','li','pre','code','table','thead','tbody','tr','th','td','a','img','hr','sup','sub'],
    ALLOWED_ATTR: ['href','src','alt','title','class','start'],
    ALLOW_DATA_ATTR: false,
  });
  const article = document.createElement('section');
  article.innerHTML = clean;
  article.style.cssText = `font-family:${fontFamilies[theme.font]};font-size:${size}px;line-height:${1.9 * rhythm};color:${theme.ink};background:${theme.paper};padding:22px 16px;letter-spacing:.3px;word-wrap:break-word;overflow-wrap:break-word;text-align:left;`;
  let headingNumber = 0;
  let firstParagraph = true;
  article.querySelectorAll<HTMLElement>('*').forEach(el => {
    const tag = el.tagName.toLowerCase();
    let style = '';
    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag[1]);
      style = `font-weight:700;line-height:1.5;color:${theme.ink};margin:${level === 1 ? 8 : 28 * rhythm}px 0 16px;font-size:${level === 1 ? size * 1.6 : level === 2 ? size * 1.15 : size}px;`;
      if (level === 1) {
        const titleStyles: Record<Theme['titleStyle'], string> = {
          editorial: `font-family:${fontFamilies.serif};font-size:${size * 1.9}px;letter-spacing:1px;color:${textAccent};padding-bottom:14px;border-bottom:1px solid ${accent}45;`,
          compact: `font-size:${size * 1.4}px;letter-spacing:.2px;margin:4px 0 12px;`,
          centered: `text-align:center;font-family:${fontFamilies.serif};font-size:${size * 1.8}px;letter-spacing:1px;color:${textAccent};`,
          ruled: `padding:10px 0;border-top:2px solid ${accent};border-bottom:1px solid ${accent}55;letter-spacing:.4px;`,
          edge: `padding-left:12px;border-left:4px solid ${accent};letter-spacing:.5px;`,
          plain: `letter-spacing:.2px;`,
        };
        style += titleStyles[theme.titleStyle];
      }
      if (level === 2) {
        headingNumber++;
        const decorations: Record<Theme['headingStyle'], string> = {
          line: `border-bottom:2px solid ${accent};padding-bottom:10px;`,
          bar: `border-left:5px solid ${accent};padding:6px 0 6px 12px;`,
          pill: `display:table;border-radius:24px;padding:7px 18px;background:${accent};color:${colors.onAccent};`,
          boxed: `border:1px solid ${accent};padding:10px 14px;color:${textAccent};`,
          center: `text-align:center;color:${textAccent};padding:10px 0;border-top:1px solid ${accent}40;border-bottom:1px solid ${accent}40;`,
          underline: `display:table;border-bottom:5px solid ${accent}50;padding-bottom:2px;`,
          number: `color:${textAccent};padding:4px 0;`,
          ribbon: `background:${accent};color:${colors.onAccent};padding:10px 16px;border-radius:0 ${theme.radius}px ${theme.radius}px 0;`,
          plain: `color:${textAccent};letter-spacing:1px;`,
          side: `padding:10px 14px;background:${accent}12;border-left:2px solid ${accent};border-right:2px solid ${accent};`,
        };
        style += decorations[theme.headingStyle];
        // Preserve numbering written by the author instead of duplicating it with the theme's automatic number.
        if (theme.layout === 'plain' && theme.headingStyle === 'number' && !/^\s*\d{1,3}\s*[./、:：-]/.test(el.textContent || '')) {
          const number = document.createElement('span');
          number.setAttribute('data-inkflow-decoration', 'true');
          number.setAttribute('aria-hidden', 'true');
          number.textContent = `${String(headingNumber).padStart(2, '0')}  /  `;
          number.style.cssText = `font-family:Georgia,serif;font-size:${size * 1.45}px;color:${textAccent};`;
          el.prepend(number);
        }
      }
    }
    if (tag === 'p') {
      const lead = firstParagraph && theme.bodyStyle === 'lead';
      firstParagraph = false;
      const bodyStyles: Record<Theme['bodyStyle'], string> = {
        airy: `margin:0 0 ${22 * rhythm}px;line-height:${1.95 * rhythm};`,
        compact: `margin:0 0 ${11 * rhythm}px;line-height:${1.9 * rhythm};`,
        lead: `margin:0 0 ${19 * rhythm}px;line-height:${1.9 * rhythm};${lead ? `font-size:${size * 1.12}px;` : ''}`,
        serif: `font-family:${fontFamilies.serif};margin:0 0 ${19 * rhythm}px;line-height:${1.92 * rhythm};`,
        balanced: `margin:0 0 ${16 * rhythm}px;line-height:${1.9 * rhythm};`,
      };
      style = bodyStyles[theme.bodyStyle];
    }
    if (tag === 'strong') style = `font-weight:700;color:${textAccent};`;
    if (tag === 'em') style = 'font-style:italic;';
    if (tag === 'del' || tag === 's') style = 'text-decoration:line-through;';
    if (tag === 'blockquote') {
      style = `margin:22px 0;padding:16px 18px;color:${theme.ink};border-radius:${theme.radius}px;`;
      const quoteStyles: Record<Theme['quoteStyle'],string> = {
        line: `border-left:3px solid ${accent};background:${accent}09;`,
        fill: `background:${accent}0d;border-left:3px solid ${accent};`,
        outline: `border:1px solid ${accent}55;background:${theme.paper};`,
        serif: `font-family:${fontFamilies.serif};font-style:italic;text-align:center;border-top:1px solid ${accent}40;border-bottom:1px solid ${accent}40;`,
        minimal: `padding:6px 18px;border-left:2px solid ${accent}60;`,
      };
      style += quoteStyles[theme.quoteStyle];
    }
    if (tag === 'ul' || tag === 'ol') {
      const listStyles: Record<Theme['listStyle'], string> = {
        plain: `padding-left:24px;margin:12px 0 ${18 * rhythm}px;`,
        compact: `padding-left:21px;margin:8px 0 ${13 * rhythm}px;`,
        ruled: `padding-left:24px;margin:14px 0 ${20 * rhythm}px;`,
        boxed: `padding:12px 14px 12px 38px;margin:16px 0 ${20 * rhythm}px;background:${accent}09;border:1px solid ${accent}28;border-radius:${theme.radius}px;`,
        marker: `padding-left:26px;margin:14px 0 ${18 * rhythm}px;list-style-type:${tag === 'ul' ? 'square' : 'decimal'};`,
      };
      style = listStyles[theme.listStyle];
    }
    if (tag === 'li') {
      const listItemStyles: Record<Theme['listStyle'], string> = {
        plain: `margin:8px 0;line-height:${1.9 * rhythm};`,
        compact: `margin:3px 0;line-height:${1.9 * rhythm};`,
        ruled: `margin:5px 0;padding:5px 0;border-bottom:1px solid ${accent}20;line-height:${1.78 * rhythm};`,
        boxed: `margin:5px 0;padding:4px 0;line-height:${1.78 * rhythm};`,
        marker: `margin:8px 0;line-height:${1.9 * rhythm};`,
      };
      style = listItemStyles[theme.listStyle];
    }
    if (tag === 'pre') {
      const codeStyles: Record<Theme['codeStyle'], { background: string; ink: string; border: string }> = {
        light: {background:'#f3f5f6',ink:'#27343a',border:'#dce3e6'},
        dark: {background:'#202832',ink:'#f0f3f5',border:'#202832'},
        terminal: {background:'#1e2b39',ink:'#e2ebf3',border:'#354d65'},
        paper: {background:'#fbf8f1',ink:'#3b342b',border:'#e8dfcf'},
        accent: {background:`${accent}10`,ink:theme.ink,border:`${accent}38`},
      };
      const code = codeStyles[theme.codeStyle];
      style = `background:${code.background};color:${code.ink};padding:18px 16px;border-radius:${theme.radius}px;margin:20px 0;white-space:pre-wrap;word-break:break-all;border:1px solid ${code.border};line-height:1.65;font-size:${Math.max(12,size - 2)}px;text-align:left;`;
      if (theme.codeStyle === 'terminal') style += `border-top:3px solid ${theme.support};`;
    }
    if (tag === 'code') {
      style = 'font-family:Menlo,Consolas,"Courier New",monospace;';
      if (el.parentElement?.tagName !== 'PRE') style += `color:${textAccent};background:${accent}0d;padding:2px 5px;border-radius:3px;font-size:0.9em;`;
      else {
        const language = el.className.match(/language-([\w+-]+)/)?.[1];
        if (language && hljs.getLanguage(language)) el.innerHTML = hljs.highlight(el.textContent || '', { language }).value;
        el.querySelectorAll<HTMLElement>('span').forEach(span => {
          const cls = span.className;
          const dark = theme.codeStyle === 'dark' || theme.codeStyle === 'terminal';
          const color = /string|attr/.test(cls) ? (dark ? '#f0b47b' : '#88471e') : /keyword|built_in/.test(cls) ? (dark ? '#c7a7ff' : '#7957a8') : /comment/.test(cls) ? (dark ? '#91b39f' : '#56685e') : /number|literal/.test(cls) ? (dark ? '#8dd3e4' : '#216f8a') : (dark ? '#e0e6ea' : '#34434c');
          span.style.cssText = `color:${color};`;
          span.removeAttribute('class');
        });
      }
    }
    if (tag === 'table') {
      const tableStyles: Record<Theme['tableStyle'], string> = {
        grid: 'border:1px solid #dce3de;',
        striped: 'border:1px solid #dce3de;',
        ledger: `border-top:2px solid ${accent};border-bottom:2px solid ${accent};`,
        minimal: 'border:0;',
        compact: 'border:1px solid #dce3de;',
      };
      style = `width:100%;border-collapse:collapse;margin:20px 0;font-size:${Math.max(12,size - 2)}px;table-layout:fixed;${tableStyles[theme.tableStyle]}`;
    }
    if (tag === 'tr' && theme.tableStyle === 'striped') {
      const rows = Array.from(el.parentElement?.querySelectorAll<HTMLElement>('tr') || []);
      if (rows.indexOf(el) % 2 === 1) style = `background:${accent}0a;`;
    }
    if (tag === 'th') {
      const headerStyles: Record<Theme['tableStyle'], string> = {
        grid: `background:${accent}12;color:${textAccent};font-weight:700;`,
        striped: `background:${accent}16;color:${textAccent};font-weight:700;`,
        ledger: `background:${accent}08;color:${theme.ink};font-weight:700;border-bottom:2px solid ${accent};`,
        minimal: `background:transparent;color:${textAccent};font-weight:700;border-bottom:2px solid ${accent};`,
        compact: `background:${accent}10;color:${textAccent};font-weight:700;`,
      };
      style = headerStyles[theme.tableStyle];
    }
    if (tag === 'th' || tag === 'td') {
      const padding = theme.tableStyle === 'compact' ? '6px 6px' : theme.tableStyle === 'ledger' ? '9px 7px' : '10px 9px';
      const border = theme.tableStyle === 'minimal' ? 'border:0;border-bottom:1px solid #dce3de;' : theme.tableStyle === 'ledger' ? 'border:0;border-bottom:1px solid #dce3de;' : 'border:1px solid #dce3de;';
      style += `padding:${padding};${border}word-break:break-word;text-align:left;`;
    }
    if (tag === 'hr') {
      const rules: Record<Theme['ruleStyle'], string> = {
        solid: `border-top:1px solid ${accent}65;margin:26px 0;`,
        double: `border-top:3px double ${accent}75;margin:30px 0;`,
        dotted: `border-top:2px dotted ${accent}85;margin:24px 0;`,
        dashed: `border-top:1px dashed ${accent}75;margin:28px 0;`,
        spaced: `border-top:1px solid ${accent}35;margin:40px 0;`,
      };
      style = `border:0;${rules[theme.ruleStyle]}`;
    }
    if (tag === 'a') {
      const href = el.getAttribute('href') || '';
      if (!/^(https?:|mailto:|#)/i.test(href)) el.removeAttribute('href');
      el.setAttribute('target','_blank');
      el.setAttribute('rel','noopener noreferrer');
      style = `color:${colors.link};text-decoration:underline;text-underline-offset:3px;`;
    }
    if (tag === 'img') {
      const src = el.getAttribute('src') || '';
      // Browser-local URLs and SVG data are unsuitable for publishing; only known image transports are previewed.
      if (!/^https?:\/\//i.test(src) && !/^data:image\/(png|jpeg|gif|webp);base64,/i.test(src)) el.removeAttribute('src');
      el.setAttribute('referrerpolicy','no-referrer');
      const imageStyles: Record<Theme['imageStyle'], string> = {
        plain: `display:block;max-width:100%;height:auto;margin:18px auto;border-radius:${theme.radius}px;`,
        frame: 'display:block;max-width:100%;height:auto;margin:22px auto;padding:5px;border:1px solid #dce3de;border-radius:2px;',
        soft: 'display:block;max-width:100%;height:auto;margin:20px auto;border-radius:12px;',
        small: 'display:block;max-width:82%;height:auto;margin:18px auto;border-radius:6px;',
        wide: 'display:block;width:100%;max-width:100%;height:auto;margin:24px auto;border-radius:0;',
      };
      style = imageStyles[theme.imageStyle];
    }
    // Resolve decorative alpha colors against the paper before export, keeping copied colors self-contained.
    if (style) el.style.cssText = style.replace(/#[\da-f]{8}\b/gi, value => mixColor(value.slice(0,7), colors.paper, 1 - parseInt(value.slice(7),16)/255));
    el.removeAttribute('class');
  });
  article.querySelectorAll<HTMLElement>('blockquote p:last-child,li > p:last-child').forEach(p => p.style.marginBottom = '0');
  composeArticle(article, theme, size, accent);
  return article.outerHTML;
}

export function inspectArticle(html: string, source: string): Issue[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const issues: Issue[] = [];
  const images = Array.from(doc.querySelectorAll('img'));
  if (images.some(img => !img.getAttribute('src') || img.getAttribute('src')?.startsWith('data:'))) {
    issues.push({kind:'warning', message:'本地图片需要在公众号后台上传。当前不会自动上传图片。'});
  }
  if (images.some(img => /^https?:/.test(img.getAttribute('src') || ''))) {
    issues.push({kind:'info', message:'外部图片需在公众号后台确认可见；防盗链或过期链接可能影响显示。'});
  }
  if (Array.from(doc.querySelectorAll('a')).some(a => /^https?:/.test(a.getAttribute('href') || '') && !/^https?:\/\/mp\.weixin\.qq\.com\//.test(a.getAttribute('href') || ''))) {
    issues.push({kind:'info', message:'文章包含外部链接，公众号可能限制跳转，粘贴后请确认。'});
  }
  if (/\$\$|\\\[|\\\(|\$[^$\n]+\$/.test(source)) issues.push({kind:'warning', message:'此版本暂不渲染数学公式，公式会以原文显示。'});
  if (/```\s*(mermaid|plantuml)\b/i.test(source)) issues.push({kind:'warning', message:'此版本暂不渲染图表，请先转为图片。'});
  if (source.length > 25000) issues.push({kind:'info', message:'文章较长，公众号粘贴可能需要分段，请检查尾部内容是否完整。'});
  if (Array.from(doc.querySelectorAll('tr')).some(tr => tr.children.length > 4)) issues.push({kind:'info', message:'表格列数较多，建议在手机预览中检查阅读效果。'});
  return issues;
}

export function toPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html,'text/html');
  doc.querySelectorAll('[data-inkflow-decoration]').forEach(el => el.remove());
  doc.querySelectorAll('p,h1,h2,h3,h4,h5,h6,li,pre,blockquote,tr').forEach(el => el.append('\n'));
  return doc.body.textContent?.trim() || '';
}

export function htmlDocument(html: string, title: string): string {
  const titleElement = document.createElement('span');
  titleElement.textContent = title;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titleElement.innerHTML}</title></head><body style="margin:30px auto;max-width:720px">${html}</body></html>`;
}
