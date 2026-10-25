import { createThemeArt, type ThemeArt } from './theme-art';

export function clearArtStyle(host: HTMLElement): void {
  host.style.backgroundImage = 'none';
  ['--inkflow-art','--inkflow-art-size','--inkflow-art-position'].forEach(name=>host.style.removeProperty(name));
  host.removeAttribute('data-inkflow-art');
}

export function embedArtBackground(host: HTMLElement, key: ThemeArt, size: string, position: string): void {
  const [width,height] = size.split(' ');
  const horizontal = position.includes('right') ? 'right' : position.includes('left') ? 'left' : 'center';
  const vertical = position.includes('bottom') ? 'bottom' : position.includes('top') || /^center \d/.test(position) ? 'top' : 'center';
  const xOffset = Number(position.match(/(?:right|left) (\d+)px/)?.[1] ?? 0);
  const yOffset = Number(position.match(/(?:top|bottom) (\d+)px|^center (\d+)/)?.slice(1).find(Boolean) ?? 0);
  const w = width === 'auto' ? '100%' : width;
  const h = height === 'auto' ? 'auto' : height;
  const art = createThemeArt(key,w,h === 'auto' || h.endsWith('%') ? 1 : parseFloat(h));
  if (h === 'auto' && w.endsWith('px')) {
    const [, , nativeWidth,nativeHeight] = art.getAttribute('viewBox')!.split(' ').map(Number);
    art.setAttribute('height',String(parseFloat(w)*nativeHeight/nativeWidth));
  }
  if (key === 'cobalt-panel') {
    const [, , nativeWidth,nativeHeight] = art.getAttribute('viewBox')!.split(' ').map(Number);
    // Retain the source crop without depending on a transformed CSS layer.
    art.setAttribute('viewBox',`${nativeWidth*.3} ${nativeHeight*.35} ${nativeWidth*.4} ${nativeHeight*.65}`);
  }
  const layer = document.createElement('span');
  layer.setAttribute('data-inkflow-decoration', 'true');
  layer.setAttribute('aria-hidden', 'true');
  // Only decoration occupies this zero-height line. Live text stays in normal flow;
  // removing positioning, transforms or negative margins cannot hide the SVG off-column.
  layer.style.cssText=`display:flex;width:100%;height:0;line-height:0;font-size:0;justify-content:${horizontal==='right'?'flex-end':horizontal==='left'?'flex-start':'center'};align-items:${vertical==='bottom'?'flex-end':'flex-start'};`;
  art.style.cssText=`display:block;flex-shrink:0;width:${w};height:${h.endsWith('%')||h==='auto'?'auto':h};overflow:hidden;`;
  if(xOffset) art.style[horizontal==='right'?'marginRight':'marginLeft']=`${xOffset}px`;
  if(yOffset) art.style[vertical==='bottom'?'marginBottom':'marginTop']=`${yOffset}px`;
  const text=document.createElement(['SECTION','BLOCKQUOTE','LI'].includes(host.tagName)?'section':'span');
  text.style.cssText=`display:block;width:100%;box-sizing:border-box;padding:${host.style.padding||'0'};`;
  text.append(...Array.from(host.childNodes));
  clearArtStyle(host);
  host.style.padding='0';
  host.style.display=host.style.display==='inline-block'?'inline-block':'block';
  host.style.overflow='hidden';
  if(key==='orbit-index') {
    host.style.width='66px';
  }
  layer.append(art);
  if (vertical==='bottom') host.append(text,layer);
  else host.append(layer,text);
}
