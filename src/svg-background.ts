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
  if (h.endsWith('%')) {
    const [, , nativeWidth,nativeHeight] = art.getAttribute('viewBox')!.split(' ').map(Number);
    const fraction = parseFloat(h)/100;
    let sourceX=0,sourceY=0,sourceWidth=nativeWidth,sourceHeight=nativeHeight;
    if (key === 'cobalt-panel') {
      // Keep the enlarged, bottom-aligned crop of the original report's narrow side panel.
      sourceX=nativeWidth*.3;sourceWidth=nativeWidth*.4;sourceY=nativeHeight*.35;sourceHeight=nativeHeight*.65;
    }
    const y = vertical === 'top' ? 0 : vertical === 'bottom' ? 1-fraction : (1-fraction)/2;
    const sx=1000/sourceWidth,sy=fraction/sourceHeight;
    // A shallow viewBox removes intrinsic image height; flex then stretches artwork to the live text.
    art.setAttribute('viewBox','0 0 1000 1');
    art.querySelectorAll('path').forEach(path=>path.setAttribute('transform',`matrix(${sx} 0 0 ${sy} ${-sourceX*sx} ${y-sourceY*sy})`));
  }
  let left: string,overlap: string;
  if (horizontal === 'right') {left=`calc(100% - ${w} - ${xOffset}px)`;overlap=`calc(-100% + ${xOffset}px)`;}
  else if (horizontal === 'center') {left=`calc(50% - ${parseFloat(w)/2}${w.endsWith('%')?'%':'px'})`;overlap=`calc(-50% - ${parseFloat(w)/2}${w.endsWith('%')?'%':'px'})`;}
  else {left=`${xOffset}px`;overlap=`calc(-${w} - ${xOffset}px)`;}
  art.style.cssText=`display:block;flex:0 0 ${w};width:${w};min-width:0;margin-left:${left};height:${h.endsWith('%')||h==='auto'?'auto':h};align-self:${h.endsWith('%')?'stretch':vertical==='top'?'flex-start':vertical==='bottom'?'flex-end':'center'};overflow:hidden;`;
  if(yOffset) art.style[vertical==='bottom'?'marginBottom':'marginTop']=`${yOffset}px`;
  const text=document.createElement('span');
  text.style.cssText=`display:block;flex:0 0 100%;width:100%;min-width:0;box-sizing:border-box;margin-left:${overlap};padding:${host.style.padding||'0'};`;
  text.append(...Array.from(host.childNodes));
  clearArtStyle(host);
  host.style.padding='0';
  host.style.display=host.style.display==='inline-block'?'inline-flex':'flex';
  host.style.alignItems='stretch';
  if(key==='orbit-index') {
    host.style.width='66px';
    // The live number must supply the inline baseline; an SVG baseline would drop the following label.
    host.style.alignItems='baseline';
    text.style.alignSelf='baseline';
  }
  host.append(art,text);
}
