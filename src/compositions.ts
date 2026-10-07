import type { Theme } from './themes';
import { articlePalette } from './article-colors';
import { themeArt, type ThemeArt } from './theme-art';

export const layoutNames: Record<Theme['layout'], string> = {
  plain: '留白长文', poster: '双色专题', press: '人文报刊', dossier: '品牌报告',
  notebook: '生活手记', cards: '知识卡片', studio: '图文画册', terminal: '技术专栏',
  experimental: '撞色实验', archive: '纸本档案', film: '胶片叙事',
  floral: '手绘花笺', orbit: '星轨信笺', postcard: '旅行邮简',
  botanical: '草木札记', ripple: '海盐波纹', ribbon: '丝带来信',
};

type NumberStyle = 'large' | 'box' | 'solid' | 'circle' | 'stack' | 'floral' | 'orbit' | 'small';
type Design = {
  inset: number; scale: number; serif?: boolean; centered?: boolean; dark?: boolean;
  cover?: string; title?: string; lead?: string; chapter?: string; heading?: string; quote?: string;
  art?: ThemeArt; artSize?: string; artPosition?: string; banner?: ThemeArt; hero?: ThemeArt;
  number?: NumberStyle; numberInk?: boolean; headingFilled?: boolean; quoteFilled?: boolean;
  headingArt?: ThemeArt; headingCentered?: boolean; quoteOpen?: boolean; quoteMarks?: boolean;
  content?: boolean; list?: 'plain' | 'frame' | 'cards' | 'panel'; tableFilled?: boolean;
};
const serif = 'Georgia,"Noto Serif SC","Songti SC",SimSun,serif';
const mono = 'Menlo,Consolas,"PingFang SC",monospace';

function decoration(text: string, style: string): HTMLElement {
  const element = document.createElement('span');
  element.textContent = text;
  element.setAttribute('data-inkflow-decoration', 'true');
  element.setAttribute('aria-hidden', 'true');
  element.style.cssText = style;
  return element;
}
function artStyle(key: ThemeArt, size = '100% 100%', position = 'center'): string {
  return `background-image:url("${themeArt[key]}");background-repeat:no-repeat;background-size:${size};background-position:${position};`;
}
function artwork(key: ThemeArt, style: string): HTMLElement {
  const element = decoration('', `display:block;${style}${artStyle(key, '100% 100%')}`);
  element.setAttribute('data-inkflow-art', key);
  return element;
}

function designFor(theme: Theme, accent: string): Design {
  const c = articlePalette(theme, accent);
  const a = c.accentText, s = c.support, line = c.line, tint = c.tint, light = c.surface, ink = c.ink;
  const designs: Record<string, Design> = {
    'quiet-slate': {inset:22,scale:1.8,cover:'padding:12px 0 26px;',title:`color:${ink};border-bottom:1px solid ${line};padding-bottom:20px;`,heading:`color:${ink};`,numberInk:true,quote:`border-left:2px solid ${line};padding:6px 18px;color:${a};font-style:italic;`,list:'plain'},
    'pine-teal': {inset:22,scale:1.75,serif:true,cover:`border-top:1px solid ${s};padding:30px 0 22px;`,art:'pine-header',artSize:'64% auto',artPosition:'right top',title:'max-width:82%;',heading:`border-bottom:1px solid ${a};padding-bottom:10px;`,quote:`background:${light};border-left:3px solid ${s};padding:24px 18px;`,quoteMarks:true,list:'plain'},
    'soft-terrace': {inset:22,scale:1.75,serif:true,centered:true,cover:'padding:16px 0 20px;',hero:'soft-photo',heading:'text-align:center;',headingCentered:true,quote:`text-align:center;border-top:3px double ${line};border-bottom:3px double ${line};padding:24px 12px;font-style:italic;`,quoteOpen:true,list:'plain'},
    'moss-margin': {inset:22,scale:1.75,serif:true,cover:'padding:20px 0 22px;',art:'moss-sprout',artSize:'25% auto',artPosition:'right top',title:'max-width:74%;',chapter:`border-left:1px solid ${a};padding-left:16px;`,heading:`border-bottom:1px solid ${s};padding-bottom:8px;`,number:'solid',quote:`background:#fbf6e8;border-left:2px solid ${s};border-radius:7px;padding:20px 18px;`,quoteMarks:true,list:'plain'},
    'cloud-paper': {inset:22,scale:1.75,serif:true,cover:`padding:18px 0 20px;border-bottom:3px double ${a};`,banner:'cloud-banner',heading:`border-bottom:1px solid ${line};padding-bottom:10px;`,quote:'text-align:center;font-style:italic;padding:18px 12px;',quoteMarks:true,quoteOpen:true,list:'plain'},
    'botanical-journal': {inset:22,scale:1.75,serif:true,cover:'padding:48px 0 20px;',art:'botanical-header',artSize:'100% auto',artPosition:'center top',title:'max-width:85%;',chapter:`border-left:1px solid ${s};padding-left:16px;`,heading:`border-bottom:1px solid ${line};padding-bottom:6px;`,quote:`background:${light};padding:22px 18px;border-radius:3px;`,quoteMarks:true,content:true,list:'plain'},
    'terminal-green': {inset:18,scale:1.6,dark:true,cover:`background:${c.deep};padding:28px 20px;`,title:`font-family:${mono};`,number:'box',heading:`border-bottom:1px solid ${line};padding-bottom:12px;color:${ink};`,quote:`background:${tint};padding:20px 18px;`,quoteMarks:true,list:'plain'},
    'blueprint-grid': {inset:18,scale:1.8,serif:true,cover:`border:1px solid ${a};border-top:9px solid ${accent};padding:26px 18px 20px;`,heading:`border-bottom:1px solid ${a};padding-bottom:10px;`,quote:`background:${tint};border-left:3px solid ${accent};padding:20px 18px;`,quoteMarks:true,list:'plain'},
    'signal-orange': {inset:20,scale:2.4,cover:'padding:18px 0 26px;',title:`font-weight:900;letter-spacing:-1px;line-height:1.2;border-bottom:10px solid ${s};padding-bottom:10px;`,heading:`border-bottom:4px solid ${accent};padding-bottom:12px;font-weight:800;`,quote:`background:${accent};color:${c.onAccent};padding:26px 20px;`,quoteFilled:true,quoteMarks:true,list:'plain'},
    'mono-violet': {inset:18,scale:1.7,serif:true,centered:true,cover:`background:${light};padding:52px 18px 24px;`,art:'lilac-branch',artSize:'24px 48px',artPosition:'center 0',chapter:`border:1px solid ${line};border-radius:18px;padding:22px 16px;`,heading:`display:table;background:${tint};border:1px solid ${line};border-radius:30px;padding:8px 14px;`,number:'small',quote:`background:${tint};border-radius:10px;padding:22px 18px;`,quoteMarks:true,list:'plain'},
    'circuit-black': {inset:20,scale:1.75,serif:true,dark:true,cover:`background:${c.deep};padding:36px 24px;`,art:'circuit-header',title:'max-width:88%;',number:'box',heading:`color:${ink};border-bottom:1px solid ${line};padding-bottom:10px;`,quote:`background:#f1f3f5;border-left:3px solid ${a};padding:22px 18px;`,quoteMarks:true,list:'plain'},
    'orbit-letter': {inset:22,scale:1.65,serif:true,centered:true,dark:true,cover:`background-color:${c.deep};border-radius:0 0 50% 50% / 0 0 24px 24px;padding:62px 30px 55px;`,art:'orbit-header',heading:`background:${tint};border-radius:45px 12px 35px 12px;padding:10px 16px;text-align:center;`,number:'orbit',quote:`border-left:1px solid ${s};border-right:1px solid ${s};padding:22px 18px;text-align:center;font-style:italic;`,quoteMarks:true,quoteOpen:true,content:true,list:'plain'},
    'editorial-wine': {inset:22,scale:2.25,serif:true,cover:`border-top:8px solid ${accent};padding:28px 0 24px;`,title:'font-weight:700;line-height:1.3;letter-spacing:1px;',lead:`border-bottom:1px solid ${s};padding-bottom:16px;`,heading:'text-align:center;',headingCentered:true,quote:'text-align:center;padding:24px 12px;',quoteOpen:true,quoteMarks:true,list:'plain'},
    'modern-column': {inset:22,scale:1.95,serif:true,cover:`border-top:5px double ${ink};border-bottom:4px double ${ink};padding:24px 0 20px;`,title:`color:${ink};font-weight:750;`,heading:`color:${ink};border-bottom:1px solid ${ink};padding-bottom:10px;`,quote:`border-left:1px solid ${ink};padding:12px 20px;`,quoteMarks:true,list:'plain'},
    'copper-ribbon': {inset:20,scale:1.75,serif:true,centered:true,cover:`border-bottom:1px solid ${s};padding:42px 0 22px;`,art:'ribbon-header',artSize:'100% 20px',artPosition:'center top',headingArt:'copper-band',heading:'padding:10px 20px;',headingFilled:true,number:'small',quote:`background:#faf5ed;padding:24px 18px;font-style:italic;`,quoteMarks:true,list:'plain'},
    'gallery-frame': {inset:22,scale:2.3,cover:'padding:20px 0 24px;',title:`color:${ink};border-left:5px solid ${accent};padding-left:14px;font-weight:900;line-height:1.25;`,lead:`border:1px solid ${s};padding:16px;`,heading:`display:table;border:1px solid ${a};padding:8px 12px;`,number:'small',quote:`border-left:2px solid ${accent};padding:12px 18px;`,quoteMarks:true,list:'plain'},
    'ink-underprint': {inset:18,scale:1.95,serif:true,cover:`border-left:5px solid ${ink};border-top:7px solid ${accent};padding:26px 16px;border-bottom:1px solid ${line};`,title:`color:${ink};`,chapter:`border:1px dashed ${line};padding:22px 16px;`,heading:`border-bottom:1px solid ${line};padding-bottom:10px;`,quote:`background:#fffefb;border-radius:4px;padding:22px 18px;`,quoteMarks:true,list:'plain'},
    'postcard-trip': {inset:20,scale:1.8,serif:true,cover:`border:2px dotted ${a};padding:26px 16px 20px;`,art:'postcard-header',artSize:'28% auto',artPosition:'right 10px top 12px',title:'max-width:70%;',lead:`border-top:1px solid ${line};padding-top:14px;`,heading:`border-bottom:1px dashed ${line};padding-bottom:12px;`,number:'box',quote:`background:#f5f8f8;border-left:3px solid ${s};padding:22px 18px;`,quoteMarks:true,content:true,list:'plain'},
    'executive-navy': {inset:20,scale:1.8,serif:true,dark:true,cover:`background:${c.deep};border-bottom:3px solid ${s};padding:34px 24px;`,heading:`border-left:5px solid ${accent};padding-left:12px;`,quote:`background:#f2f5f7;border-left:3px solid ${s};padding:24px 20px;`,quoteMarks:true,list:'plain'},
    'boardroom-umber': {inset:22,scale:1.35,serif:true,cover:`border-top:3px double ${a};border-bottom:3px double ${a};padding:20px 0;`,heading:`border-bottom:1px solid ${line};padding-bottom:8px;`,quote:`border:1px solid ${line};padding:18px 16px;`,quoteMarks:true,list:'plain'},
    'cobalt-report': {inset:20,scale:1.9,cover:`border-left:5px solid ${accent};padding:28px 16px;`,art:'cobalt-panel',artSize:'28% 100%',artPosition:'right center',title:'max-width:74%;font-weight:850;',lead:'max-width:74%;',heading:`border:1px solid ${accent};padding:0 12px 0 0;`,number:'solid',quote:`background:${tint};border-top:2px solid ${accent};border-left:2px solid ${line};padding:20px 18px;`,quoteMarks:true,list:'plain'},
    'formal-underline': {inset:22,scale:1.7,serif:true,centered:true,cover:`border-top:1px solid ${s};padding:28px 0 24px;`,title:`border-bottom:3px double ${s};padding-bottom:16px;`,heading:`border-bottom:1px solid ${line};padding-bottom:8px;`,quote:'text-align:center;font-style:italic;padding:22px 12px;',quoteMarks:true,quoteOpen:true,list:'plain'},
    'clear-agenda': {inset:20,scale:1.7,centered:true,cover:'padding:24px 12px;',title:`padding-bottom:14px;border-bottom:1px solid ${line};`,chapter:`background:${tint};padding:22px 18px;border-radius:18px;`,heading:`display:table;background:${accent};color:${c.onAccent};border-radius:30px;padding:8px 16px;`,headingFilled:true,number:'small',quote:`border-left:2px solid ${a};padding:8px 18px;background:transparent;text-align:center;font-style:italic;`,quoteMarks:true,quoteOpen:true,list:'plain'},
    'ribbon-letter': {inset:20,scale:1.7,serif:true,centered:true,cover:`background:#fffcf9;border:3px double ${s};padding:48px 16px 24px;`,art:'ribbon-header',artSize:'92% 18px',artPosition:'center 12px',headingArt:'rose-band',heading:'padding:10px 30px;text-align:center;',number:'small',headingCentered:true,quote:'text-align:center;font-style:italic;padding:22px 10px;',quoteMarks:true,quoteOpen:true,content:true,list:'plain'},
    'sunny-kitchen': {inset:20,scale:1.7,serif:true,centered:true,cover:`background:#fffaf0;border-top:5px solid ${s};padding:42px 48px 40px;`,art:'sunny-header',heading:`display:table;background:${accent};color:${c.onAccent};padding:8px 18px;border-radius:28px;`,headingFilled:true,number:'small',quote:`background:#fdf5de;border-left:3px solid ${s};padding:22px 18px;`,quoteMarks:true,list:'frame'},
    'garden-note': {inset:22,scale:2.05,serif:true,cover:`padding:32px 0 24px;border-bottom:1px dotted ${line};`,art:'garden-bookmark',artSize:'20px 55px',artPosition:'left top',title:'max-width:84%;padding-left:32px;',heading:`border-bottom:1px dotted ${line};padding-bottom:10px;`,quote:'text-align:center;font-style:italic;padding:22px 12px;',quoteMarks:true,quoteOpen:true,list:'plain'},
    'weekend-blue': {inset:20,scale:1.95,serif:true,dark:true,cover:'background:#25272b;padding:42px 34px;',art:'film-header',title:'max-width:84%;',lead:'max-width:84%;',heading:`color:${ink};border-bottom:1px solid ${s};padding-bottom:10px;`,number:'solid',quote:`background:#fcf5e8;border-left:3px solid ${accent};padding:20px 18px;`,quoteMarks:true,list:'plain'},
    'coffee-margin': {inset:22,scale:1.3,serif:true,cover:'padding:20px 0 26px;',art:'coffee-photo',artSize:'32% 100%',artPosition:'right center',title:'max-width:63%;',lead:'max-width:63%;',chapter:`border-left:3px solid ${s};padding-left:14px;`,heading:`color:${ink};border-bottom:1px solid ${line};padding-bottom:10px;`,number:'solid',quote:`border-top:1px solid ${a};border-bottom:1px solid ${a};text-align:center;font-style:italic;padding:20px 10px;`,quoteOpen:true,list:'plain'},
    'floral-notes': {inset:22,scale:1.65,serif:true,centered:true,cover:'padding:42px 0 20px;',art:'floral-header',artSize:'100% 120px',artPosition:'center top',title:'padding:0 26px;min-height:64px;display:flex;align-items:center;justify-content:center;',heading:'text-align:center;padding:0 0 34px;',number:'floral',headingCentered:true,quote:`background:${light};border-radius:12px;padding:24px 20px;`,quoteMarks:true,content:true,list:'plain'},
    'market-fresh': {inset:20,scale:1.8,serif:true,cover:'padding:22px 0 24px;',art:'market-header',artSize:'25% auto',artPosition:'right top',title:`max-width:73%;color:${ink};font-weight:850;border-bottom:3px solid ${line};padding-bottom:12px;`,lead:'background:#faf7d9;padding:16px;',chapter:`border:1px solid ${a};padding:20px 14px;`,heading:`border-bottom:1px solid ${a};padding-bottom:10px;`,number:'solid',quote:`background:#faf7d9;border-left:2px solid ${a};padding:20px 18px;`,quoteMarks:true,list:'panel',tableFilled:true},
    'study-index': {inset:20,scale:1.95,serif:true,cover:`border-left:4px solid ${accent};border-bottom:1px solid ${s};padding:26px 18px;`,heading:`background:${tint};padding:0 12px 0 0;`,number:'solid',quote:`background:${tint};border-left:3px solid ${s};padding:20px 18px;`,quoteMarks:true,list:'plain'},
    'learning-lilac': {inset:20,scale:1.95,serif:true,cover:`background:${tint};border-bottom:4px solid ${accent};padding:30px 18px;`,art:'lilac-branch',artSize:'18% 85%',artPosition:'right 12px center',title:'max-width:80%;',heading:`border-left:4px solid ${accent};padding-left:12px;border-bottom:1px solid ${line};padding-bottom:8px;`,quote:`background:${tint};border-radius:10px;padding:22px 18px;`,quoteMarks:true,list:'plain'},
    'classical-lesson': {inset:22,scale:1.8,serif:true,centered:true,cover:`border-top:3px double ${a};border-bottom:3px double ${a};padding:28px 0;`,heading:'text-align:center;',number:'stack',headingCentered:true,quote:'text-align:center;font-style:italic;padding:22px 12px;',quoteMarks:true,quoteOpen:true,list:'plain'},
    'concept-cards': {inset:20,scale:1.95,serif:true,cover:`border:1px solid ${a};border-radius:14px;padding:26px 18px;`,heading:`border:1px solid ${a};border-radius:8px;padding:10px 14px;`,number:'circle',quote:`background:${light};border-left:2px solid ${s};padding:18px 16px;`,quoteMarks:true,list:'cards'},
    'reading-ribbon': {inset:20,scale:2.05,serif:true,cover:`border-top:5px solid ${accent};padding:28px 0 24px;`,lead:`background:#fbf0f1;border-left:2px solid ${s};padding:18px 50px 18px 16px;${artStyle('reading-leaf','55px auto','right center')}`,headingArt:'wine-band',heading:'padding:10px 22px;',headingFilled:true,number:'small',quote:'text-align:center;font-style:italic;padding:22px 12px;',quoteMarks:true,quoteOpen:true,list:'plain'},
    'sea-salt': {inset:20,scale:1.75,serif:true,centered:true,cover:'padding:22px 10px 64px;',art:'sea-wave',artSize:'100% 40px',artPosition:'center bottom',heading:'text-align:center;padding:0 0 18px;',headingCentered:true,chapter:`background:${tint};border-radius:42px 42px 12px 12px;padding:26px 18px;`,quote:`background:${c.paper};border-radius:12px;padding:22px 18px;`,quoteMarks:true,content:true,list:'plain'},
  };
  return designs[theme.id];
}

// Split only the author's prefix; Range keeps inline markup and every original character.
function takePrefix(element: HTMLElement, length: number): DocumentFragment {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const first = walker.nextNode()!;
  let current = first, remaining = length;
  while ((current.textContent?.length ?? 0) < remaining) {
    remaining -= current.textContent?.length ?? 0;
    current = walker.nextNode()!;
  }
  const range = document.createRange();
  range.setStart(first, 0);
  range.setEnd(current, remaining);
  const ancestors: HTMLElement[] = [];
  const originals: HTMLElement[] = [];
  let ancestor = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer;
  while (ancestor instanceof HTMLElement && ancestor !== element) {
    ancestors.push(ancestor.cloneNode(false) as HTMLElement);
    originals.push(ancestor);
    ancestor = ancestor.parentElement;
  }
  const fragment = range.extractContents();
  // A Range wholly inside one text node omits its ancestors; retain the author's emphasis too.
  for (const wrapper of ancestors) { wrapper.append(...Array.from(fragment.childNodes)); fragment.append(wrapper); }
  for (const original of originals) if (original.innerHTML === '') original.remove();
  return fragment;
}

function styleNumber(heading: HTMLElement, design: Design, colors: ReturnType<typeof articlePalette>, size: number, index: number): void {
  const match = heading.textContent?.match(/^(\s*\d{1,3})(\s*[./、:：-]\s*)/);
  const number = document.createElement('span');
  number.setAttribute('data-inkflow-number', 'true');
  const separator = document.createElement('span');
  if (match) {
    number.append(takePrefix(heading, match[1].length));
    separator.append(takePrefix(heading, match[2].length));
  } else {
    number.textContent = String(index + 1).padStart(2, '0');
    number.setAttribute('data-inkflow-decoration', 'true');
    number.setAttribute('aria-hidden', 'true');
    separator.textContent = ' / ';
    separator.setAttribute('data-inkflow-decoration', 'true');
    separator.setAttribute('aria-hidden', 'true');
  }
  const label = document.createElement('span');
  label.setAttribute('data-inkflow-heading-label', 'true');
  label.append(...Array.from(heading.childNodes));
  heading.append(number, separator, label);
  const kind = design.number ?? 'large';
  const foreground = design.headingFilled ? colors.onAccent : design.numberInk ? colors.ink : colors.accentText;
  number.style.cssText = `display:inline-block;font-family:${serif};font-size:${size * 1.7}px;font-weight:400;line-height:1.3;vertical-align:baseline;color:${foreground};`;
  separator.style.cssText = `display:inline-block;font-size:${size}px;padding:0 7px;color:${foreground};font-weight:400;`;
  label.style.cssText = `color:${design.headingFilled ? colors.onAccent : heading.style.color};`;
  if (kind === 'small') number.style.fontSize = `${size * 1.15}px`;
  if (kind === 'box' || kind === 'solid' || kind === 'circle') {
    number.style.cssText += `font-size:${size * 1.25}px;min-width:${size * 2}px;text-align:center;padding:7px 4px;box-sizing:border-box;border:1px solid ${colors.accentText};border-radius:${kind === 'circle' ? '50%' : '0'};`;
    if (kind === 'solid') {
      number.style.cssText += `background:${colors.accent};color:${colors.onAccent};border-color:${colors.accent};`;
      separator.style.padding = '0 7px';
    }
  }
  if (kind === 'stack' || kind === 'floral') {
    number.style.cssText += `display:block;width:74px;margin:0 auto 10px;padding:${kind === 'floral' ? '12px 12px' : '0 0 7px'};border-bottom:${kind === 'stack' ? `1px solid ${colors.support}` : '0'};`;
    // Keep authored punctuation in the DOM and text export, while the visual layout stacks its number.
    separator.style.cssText += 'display:none;font-size:0;padding:0;';
    label.style.display = 'block';
    if (kind === 'floral') {
      number.style.cssText += artStyle('floral-index');
      heading.style.cssText += artStyle('floral-divider','100% 16px','center bottom');
    }
  }
  if (kind === 'orbit') {
    number.style.cssText += `min-width:66px;padding:10px 7px;box-sizing:border-box;text-align:center;${artStyle('orbit-index','100% 100%')}`;
    separator.style.padding = '0 4px';
  }
  if (design.headingArt && design.headingFilled) {
    // The raster ribbon has transparent cut ends; only the live text's central area needs a solid surface.
    heading.style.color = colors.accentText;
    [number, separator, label].forEach(el => { el.style.backgroundColor = colors.accent; el.style.color = colors.onAccent; });
  }
  for (const element of [number, label]) {
    element.querySelectorAll<HTMLElement>('*').forEach(child => { child.style.color = element.style.color; child.style.background = 'transparent'; });
  }
}

export function composeArticle(article: HTMLElement, theme: Theme, size: number, accent: string): void {
  if (!article.children.length) return;
  const design = designFor(theme, accent);
  const colors = articlePalette(theme, accent);
  article.style.padding = `20px ${design.inset}px`;
  article.style.boxSizing = 'border-box';
  article.style.background = colors.paper;
  if (design.serif) article.style.fontFamily = serif;
  if (theme.id === 'moss-margin' || theme.id === 'coffee-margin') article.style.borderLeft = `2px solid ${colors.accentText}`;
  if (theme.id === 'ink-underprint') article.style.borderLeft = `12px solid ${colors.ink}`;
  if (theme.id === 'blueprint-grid') article.style.border = `1px solid ${colors.accentText}`;
  article.querySelectorAll<HTMLElement>('img').forEach(image => image.style.boxSizing = 'border-box');

  let intro = article;
  const chapters: HTMLElement[] = [];
  if (theme.layout !== 'plain') {
    const nodes = Array.from(article.childNodes);
    intro = document.createElement('section');
    intro.setAttribute('data-inkflow-intro', 'true');
    article.append(intro);
    let group = intro;
    // Only direct H2s create chapters. Move original nodes so nested headings and captions retain their order.
    for (const node of nodes) {
      if (node instanceof HTMLElement && node.tagName === 'H2') {
        group = document.createElement('section');
        group.setAttribute('data-inkflow-chapter', 'true');
        article.append(group);
        chapters.push(group);
      }
      group.append(node);
    }
  }
  const title = intro.firstElementChild?.tagName === 'H1' ? intro.firstElementChild as HTMLElement : null;
  const cover = document.createElement('section');
  let lead: HTMLElement | null = null;
  if (title) {
    let next: ChildNode | null = title.nextSibling;
    // Do not skip meaningful raw text or pull a later caption into the cover.
    while (next?.nodeType === Node.TEXT_NODE && !next.textContent?.trim()) next = next.nextSibling;
    if (next instanceof HTMLElement && next.tagName === 'P') lead = next;
    intro.insertBefore(cover, title);
    cover.setAttribute('data-inkflow-cover', 'true');
    cover.append(title);
    if (lead) cover.append(lead);
    cover.style.cssText = `box-sizing:border-box;${design.cover ?? ''}`;
    if (theme.id === 'ink-underprint') {
      cover.style.borderLeft = '0';
      cover.style.borderTop = '0';
      cover.prepend(artwork('archive-tab', 'width:58%;height:25px;margin:0 0 24px;'));
    }
    if (theme.id === 'blueprint-grid') {
      cover.style.border = '0';
      cover.style.borderTop = `9px solid ${accent}`;
      cover.style.borderBottom = `1px solid ${colors.accentText}`;
      cover.style.padding = '26px 8px 20px';
    }
    if (theme.id === 'executive-navy') {
      cover.style.position = 'relative';
      cover.append(decoration('', `position:absolute;top:34px;bottom:34px;right:18px;width:12%;border-left:1px solid ${colors.support};`));
    }
    if (theme.id === 'ribbon-letter') cover.style.backgroundColor = colors.tint;
    if (theme.id === 'orbit-letter') {
      // Reuse the illustration's alpha edge so the navy backing does not create a second bottom arc.
      cover.style.maskImage = `url("${themeArt['orbit-header']}")`;
      cover.style.maskSize = '100% 100%';
      cover.style.maskRepeat = 'no-repeat';
      cover.style.borderRadius = '0';
      cover.style.padding = '36px 30px 38px';
    }
    if (design.art) {
      const art = design.art;
      cover.style.cssText += artStyle(art, design.artSize, design.artPosition);
      cover.setAttribute('data-inkflow-art', art);
    }
    if (theme.id === 'cobalt-report') {
      cover.style.backgroundImage = 'none';
      cover.style.backgroundColor = colors.tint;
      cover.style.position = 'relative';
      cover.style.paddingRight = 'calc(28% + 12px)';
      cover.removeAttribute('data-inkflow-art');
      const panel = artwork('cobalt-panel','position:absolute;top:0;right:0;width:28%;height:100%;');
      panel.style.backgroundSize = '250% auto';
      panel.style.backgroundPosition = 'center bottom';
      cover.prepend(panel);
    }
    if (['orbit-letter','circuit-black','executive-navy','sunny-kitchen','weekend-blue'].includes(theme.id)) {
      cover.style.margin = `-20px -${design.inset}px 0`;
    }
    if (design.banner) cover.prepend(artwork(design.banner, 'height:110px;margin-bottom:20px;'));
    title.style.cssText = `box-sizing:border-box;font-size:${Math.min(42,size * design.scale)}px;font-weight:700;line-height:1.45;letter-spacing:.5px;color:${colors.accentText};margin:0 0 18px;padding:0;border:0;text-align:${design.centered ? 'center' : 'left'};font-family:${design.serif ? serif : '"PingFang SC","Microsoft YaHei",sans-serif'};${design.title ?? ''}`;
    title.style.textWrap = 'balance';
    if (theme.id === 'blueprint-grid') {
      title.style.fontFamily = '"PingFang SC","Microsoft YaHei",sans-serif';
      title.style.fontWeight = '850';
    }
    if (theme.id === 'study-index') title.style.fontSize = `${size * 1.65}px`;
    if (theme.id === 'cobalt-report') title.style.maxWidth = '100%';
    if (theme.id === 'executive-navy') title.style.maxWidth = '84%';
    if (theme.id === 'floral-notes') {
      // The title owns the illustrated frame, so longer headings expand the frame instead of escaping it.
      cover.style.backgroundImage = 'none';
      cover.removeAttribute('data-inkflow-art');
      cover.style.padding = '0 0 20px';
      title.style.cssText += artStyle('floral-header');
      title.setAttribute('data-inkflow-art','floral-header');
      title.style.minHeight = '120px';
      title.style.padding = '26px 18px 26px 44px';
      title.style.marginBottom = '12px';
    }
    if (theme.id === 'orbit-letter') {
      title.style.maxWidth = '75%';
      title.style.marginLeft = 'auto';
      title.style.marginRight = 'auto';
    }
    if (theme.id === 'pine-teal') title.style.maxWidth = '100%';
    if (theme.id === 'botanical-journal') title.style.maxWidth = '90%';
    title.querySelectorAll<HTMLElement>('*').forEach(el => { el.style.color = title.style.color; el.style.background = 'transparent'; });
    if (lead) {
      // Preserve the existing line height: spacing controls must still affect the live lead.
      lead.style.margin = '0';
      lead.style.fontSize = `${size * .9}px`;
      lead.style.color = colors.ink;
      lead.style.cssText += `text-align:${design.centered ? 'center' : 'left'};${design.lead ?? ''}`;
      if (theme.id === 'learning-lilac') lead.style.maxWidth = '80%';
      if (theme.id === 'executive-navy') lead.style.maxWidth = '84%';
      if (theme.id === 'cobalt-report') lead.style.maxWidth = '100%';
    }
    if (design.dark) {
      cover.querySelectorAll<HTMLElement>('h1,p,strong,em,a,code').forEach(el => { el.style.color = '#ffffff'; if (el.tagName === 'CODE') el.style.background = 'transparent'; });
    }
    if (theme.id === 'terminal-green') cover.prepend(decoration('— — —', `display:block;font:14px ${mono};color:${colors.support};margin-bottom:18px;letter-spacing:3px;`));
    const hero = theme.id === 'copper-ribbon' ? 'copper-photo' : design.hero;
    if (hero) {
      const image = artwork(hero, `height:${size * 8}px;margin-top:22px;`);
      image.style.backgroundSize = 'cover';
      cover.append(image);
    }
  }
  const packContent = (group: HTMLElement, after?: HTMLElement) => {
    const nodes: ChildNode[] = [];
    let current = after ? after.nextSibling : group.firstChild;
    while (current) { nodes.push(current); current = current.nextSibling; }
    if (!nodes.some(node => node instanceof HTMLElement || node.textContent?.trim())) return;
    const content = document.createElement('section');
    content.setAttribute('data-inkflow-content', 'true');
    content.style.cssText = 'box-sizing:border-box;';
    group.insertBefore(content, nodes[0]);
    content.append(...nodes);
  };
  if (design.content) packContent(intro, title ? cover : undefined);

  const styleHeading = (heading: HTMLElement, index: number) => {
    heading.style.cssText = `box-sizing:border-box;max-width:100%;font-size:${size * 1.18}px;font-weight:700;line-height:1.65;letter-spacing:.3px;color:${colors.accentText};margin:0 0 22px;padding:0;border:0;font-family:${serif};${design.heading ?? ''}`;
    heading.style.textWrap = 'balance';
    heading.querySelectorAll<HTMLElement>('*').forEach(el => { el.style.color = heading.style.color; el.style.background = 'transparent'; });
    let headingColors = colors;
    if (design.headingArt) {
      heading.style.cssText += artStyle(design.headingArt);
      // Ribbon artwork uses its original pigment; text must contrast with that pigment, even with a custom accent.
      headingColors = articlePalette(theme);
    }
    styleNumber(heading, design, headingColors, size, index);
    if (theme.id === 'orbit-letter') {
      heading.style.backgroundColor = colors.paper;
      heading.style.borderRadius = '0';
      heading.style.cssText += artStyle('orbit-band');
      heading.style.textAlign = 'left';
      heading.style.padding = '8px 10px';
    }
    if (theme.id === 'sea-salt') heading.style.cssText += artStyle('sea-underline','76px 7px','center bottom');
    if (design.headingCentered && !['stack','floral'].includes(design.number ?? '')) heading.style.textAlign = 'center';
    if (['editorial-wine','soft-terrace'].includes(theme.id)) {
      heading.style.cssText += 'display:flex;align-items:center;justify-content:center;gap:6px;';
      const rule = decoration('', `display:block;flex:1;min-width:10px;border-top:1px solid ${colors.line};`);
      heading.prepend(rule);
      heading.append(rule.cloneNode());
      (heading.querySelector('[data-inkflow-heading-label]') as HTMLElement).style.minWidth = '0';
    }
    if (theme.id === 'signal-orange') {
      heading.style.fontFamily = '"PingFang SC","Microsoft YaHei",sans-serif';
      const number = heading.querySelector<HTMLElement>('[data-inkflow-number]')!;
      number.style.fontFamily = 'inherit'; number.style.fontWeight = '850';
      number.style.fontSize = `${size * 2.25}px`;
      heading.style.borderTop = `2px solid ${accent}`;
      heading.style.paddingTop = '10px';
    }
    if (theme.id === 'ribbon-letter') {
      heading.style.fontSize = `${size * 1.05}px`;
      (heading.children[1] as HTMLElement).style.padding = '0 2px';
    }
    if (theme.id === 'gallery-frame') {
      heading.style.border = '0';
      heading.style.display = 'block';
      heading.style.padding = '4px 0';
      heading.style.color = colors.ink;
      const number = heading.querySelector<HTMLElement>('[data-inkflow-number]')!;
      number.style.fontSize = `${size * 1.7}px`;
      number.style.fontStyle = 'italic';
      number.style.color = colors.paper;
      number.style.webkitTextStroke = `.6px ${colors.accentText}`;
      (heading.querySelector('[data-inkflow-heading-label]') as HTMLElement).style.color = colors.ink;
    }
  };
  if (theme.layout === 'plain') {
    Array.from(article.children).filter(el => el.tagName === 'H2').forEach((el,index) => { styleHeading(el as HTMLElement,index); (el as HTMLElement).style.marginTop = '34px'; });
  }
  chapters.forEach((chapter, index) => {
    chapter.style.cssText = `box-sizing:border-box;margin:34px 0 0;padding:0;${design.chapter ?? ''}`;
    const heading = Array.from(chapter.children).find(el => el.tagName === 'H2') as HTMLElement;
    styleHeading(heading, index);
    if (design.content) packContent(chapter, heading);
    if (theme.id === 'clear-agenda') {
      // Quotes interrupt the card in the design; keep every authored node in its original position.
      chapter.style.background = 'transparent';
      chapter.style.padding = '0';
      const nodes = Array.from(chapter.childNodes);
      let panel: HTMLElement | null = null;
      for (const node of nodes) {
        if (node === heading) continue;
        if (node instanceof HTMLElement && node.tagName === 'BLOCKQUOTE') { panel = null; continue; }
        if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
          if (panel) panel.append(node);
          continue;
        }
        if (!panel) {
          panel = document.createElement('section');
          panel.setAttribute('data-inkflow-content', 'true');
          let previous = node.previousSibling;
          while (previous?.nodeType === Node.TEXT_NODE && !previous.textContent?.trim()) previous = previous.previousSibling;
          const followsHeading = previous === heading;
          panel.style.cssText = `background:${colors.tint};border-radius:${followsHeading ? '0 0 18px 18px' : '18px'};padding:${followsHeading ? '0' : '22px'} 18px 22px;box-sizing:border-box;`;
          chapter.insertBefore(panel, node);
        }
        panel.append(node);
      }
      heading.style.display = 'block';
      heading.style.background = colors.tint;
      heading.style.color = colors.accentText;
      heading.style.padding = '22px 18px';
      heading.style.margin = '0';
      heading.style.borderRadius = '18px 18px 0 0';
      const number = heading.querySelector<HTMLElement>('[data-inkflow-number]')!;
      number.style.cssText += `background:${accent};color:${colors.onAccent};border-radius:24px;padding:4px 10px;`;
      const separator = number.nextElementSibling as HTMLElement;
      separator.style.color = colors.accentText;
      const label = heading.querySelector<HTMLElement>('[data-inkflow-heading-label]')!;
      label.style.color = colors.accentText;
      label.querySelectorAll<HTMLElement>('*').forEach(child => child.style.color = colors.accentText);
    }
  });

  article.querySelectorAll<HTMLElement>('blockquote').forEach(quote => {
    quote.style.cssText = `box-sizing:border-box;margin:26px 0;padding:20px 18px;border:0;border-radius:0;background:${colors.paper};color:${colors.ink};font-family:${serif};${design.quote ?? ''}`;
    const foreground = design.quoteFilled ? colors.onAccent : design.quoteOpen ? colors.accentText : colors.ink;
    quote.querySelectorAll<HTMLElement>('p,strong,em,a,h2,h3,h4').forEach(el => { el.style.color = foreground; if (/^H[2-4]$/.test(el.tagName)) el.style.background = 'transparent'; });
    const first = Array.from(quote.children).find(el => el.tagName === 'P') as HTMLElement | undefined;
    if (first && design.quoteMarks) {
      first.style.fontSize = `${size * (design.quoteOpen ? 1.18 : 1.04)}px`;
      first.prepend(decoration('“', `font-family:Georgia,serif;font-size:${size * 2}px;line-height:.6;display:inline-block;margin-right:5px;vertical-align:-4px;color:${design.quoteFilled ? colors.onAccent : colors.accentText};`));
      first.append(decoration('”', `font-family:Georgia,serif;font-size:${size * 2}px;line-height:.6;display:inline-block;margin-left:5px;vertical-align:-4px;color:${design.quoteFilled ? colors.onAccent : colors.accentText};`));
    }
    if (theme.id === 'floral-notes') {
      quote.style.cssText += artStyle('floral-sprig','38px 76px','right 8px top 8px');
      quote.style.paddingRight = '46px';
    }
    if (['ribbon-letter','formal-underline','garden-note','classical-lesson','reading-ribbon'].includes(theme.id)) {
      if (first) {
        const text = document.createElement('span');
        text.style.cssText = 'flex:1;min-width:0;';
        text.append(...Array.from(first.childNodes));
        const rule = decoration('', `display:block;width:24px;flex-shrink:0;border-top:1px solid ${colors.line};`);
        first.style.cssText += 'display:flex;align-items:center;gap:10px;';
        first.append(rule,text,rule.cloneNode());
      }
    }
    quote.querySelectorAll<HTMLElement>('code').forEach(el => { if (el.parentElement?.tagName !== 'PRE') { el.style.color = foreground; el.style.background = 'transparent'; } });
    quote.querySelectorAll<HTMLElement>('p:last-child').forEach(p => p.style.marginBottom = '0');
  });
  article.querySelectorAll<HTMLElement>('ul,ol').forEach(list => {
    list.style.cssText = `margin:18px 0 22px;padding:0 0 0 23px;background:transparent;border:0;list-style-type:${list.tagName === 'OL' ? 'decimal' : ['pine-teal','market-fresh'].includes(theme.id) ? 'square' : 'disc'};`;
    if (design.list === 'frame') list.style.cssText += `border:1px solid ${colors.line};padding:12px 16px 12px 38px;border-radius:4px;`;
    if (design.list === 'panel') list.style.cssText += 'background:#faf7d9;padding:14px 16px 14px 36px;';
    if (design.list === 'cards') {
      list.style.listStyle = 'none';
      list.style.paddingLeft = '0';
    }
    Array.from(list.children).filter(el => el.tagName === 'LI').forEach((el,index) => {
      const item = el as HTMLElement;
      item.style.borderBottom = '0';
      item.style.padding = '0';
      item.style.margin = '8px 0';
      // Native markers retain list semantics; live item text keeps the reading color.
      const text = document.createElement('span');
      text.style.color = colors.ink;
      text.append(...Array.from(item.childNodes));
      item.append(text);
      item.style.color = ['orbit-letter','mono-violet','learning-lilac'].includes(theme.id) ? colors.line : colors.accentText;
      if (list.tagName === 'UL' && ['sunny-kitchen','study-index','reading-ribbon'].includes(theme.id)) {
        item.style.cssText += 'list-style:none;position:relative;padding-left:25px;';
        const filled = theme.id !== 'reading-ribbon';
        const marker = decoration(String(index + 1), `position:absolute;left:0;top:5px;width:17px;height:17px;line-height:17px;text-align:center;font:12px/17px Georgia,serif;border-radius:${theme.id === 'study-index' ? 0 : '50%'};border:1px solid ${theme.id === 'study-index' ? accent : colors.support};background:${filled ? theme.id === 'study-index' ? accent : colors.support : colors.paper};color:${theme.id === 'study-index' ? colors.onAccent : colors.ink};`);
        item.prepend(marker);
      }
      if (theme.id === 'floral-notes' && list.tagName === 'UL') {
        list.style.paddingLeft = '0';
        item.style.listStyle = 'none';
        item.style.paddingLeft = '26px';
        item.style.cssText += artStyle('floral-bullet','14px 14px','left 8px');
      }
      if (design.list === 'cards') item.style.cssText += `border:1px solid ${colors.line};border-left:3px solid ${colors.accent};border-radius:4px;padding:10px 14px;`;
    });
  });
  article.querySelectorAll<HTMLElement>('table').forEach(table => {
    table.style.cssText += `border-collapse:collapse;border:1px solid ${colors.line};border-radius:0;overflow:hidden;`;
    table.querySelectorAll<HTMLElement>('th,td').forEach(cell => {
      cell.style.cssText += `border:1px solid ${colors.line};padding:9px 10px;text-align:left;background:${colors.paper};color:${colors.ink};`;
      if (cell.tagName === 'TH') cell.style.cssText += `background:${design.tableFilled ? accent : colors.tint};color:${design.tableFilled ? colors.onAccent : colors.accentText};font-weight:600;`;
      cell.querySelectorAll<HTMLElement>('strong,a,code').forEach(el => { el.style.color = cell.style.color; el.style.background = 'transparent'; });
    });
    if (['floral-notes','orbit-letter','sea-salt','mono-violet','clear-agenda'].includes(theme.id)) {
      const frame = document.createElement('section');
      frame.style.cssText = `box-sizing:border-box;overflow:hidden;border:1px solid ${colors.line};border-radius:10px;margin:20px 0;`;
      table.before(frame);
      frame.append(table);
      table.style.margin = '0';
      table.style.border = '0';
    }
  });
}
