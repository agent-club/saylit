export type MotifKind =
  | 'floral'
  | 'orbit'
  | 'postcard'
  | 'botanical'
  | 'ripple'
  | 'ribbon';

export type MotifColors = {
  accent: string;
  support: string;
  ink: string;
};

type Style = Partial<CSSStyleDeclaration>;

function mark(style: Style = {}): HTMLSpanElement {
  const span = document.createElement('span');
  span.setAttribute('data-inkflow-decoration', 'true');
  span.setAttribute('aria-hidden', 'true');
  span.style.cssText = Object.entries(style)
    .map(([property, value]) => `${property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${value}`)
    .join(';');
  return span;
}

function piece(parent: HTMLElement, style: Style): HTMLSpanElement {
  const span = mark(style);
  parent.append(span);
  return span;
}

function inlineBox(width: number, height: number, style: Style = {}): Style {
  return {
    display: 'inline-block',
    boxSizing: 'border-box',
    width: `${width}px`,
    height: `${height}px`,
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    ...style,
  };
}

function addFloral(heading: HTMLElement, colors: MotifColors): void {
  const loop = mark(inlineBox(29, 27, { marginRight: '-8px', transform: 'rotate(-28deg)' }));
  piece(loop, inlineBox(27, 25, {
    border: `2px solid ${colors.support}`,
    borderRightColor: 'transparent',
    borderRadius: '50%',
  }));
  piece(loop, inlineBox(19, 19, {
    marginLeft: '-20px',
    border: `2px solid ${colors.support}`,
    borderLeftColor: 'transparent',
    borderRadius: '50%',
    transform: 'rotate(25deg)',
  }));

  const rays = mark(inlineBox(23, 22, { marginLeft: '5px', verticalAlign: 'top' }));
  piece(rays, inlineBox(11, 2, {
    marginTop: '2px',
    backgroundColor: '#e8a294',
    transform: 'rotate(-38deg)',
  }));
  piece(rays, inlineBox(8, 2, {
    marginLeft: '-2px',
    marginTop: '-2px',
    backgroundColor: '#e8a294',
    transform: 'rotate(-18deg)',
  }));
  heading.prepend(loop);
  heading.append(rays);
}

function addOrbit(heading: HTMLElement, colors: MotifColors): void {
  const isTitle = heading.tagName === 'H1';
  const orbit = mark(inlineBox(isTitle ? 52 : 35, isTitle ? 42 : 28, {
    marginRight: isTitle ? '0' : '-10px',
    transform: 'rotate(-12deg)',
  }));
  piece(orbit, inlineBox(isTitle ? 38 : 25, isTitle ? 20 : 13, {
    border: `1.5px solid ${colors.accent}`,
    borderRadius: '50%',
    transform: 'rotate(38deg)',
  }));
  piece(orbit, inlineBox(isTitle ? 36 : 24, isTitle ? 19 : 14, {
    marginLeft: isTitle ? '-30px' : '-20px',
    border: `1.5px solid ${colors.support}`,
    borderRadius: '50%',
    transform: 'rotate(-42deg)',
  }));
  const star = piece(orbit, inlineBox(isTitle ? 6 : 5, isTitle ? 6 : 5, {
    marginLeft: isTitle ? '-7px' : '-5px',
    backgroundColor: colors.accent,
    transform: 'rotate(45deg)',
  }));
  piece(star, inlineBox(1, isTitle ? 11 : 9, { marginLeft: isTitle ? '2.5px' : '2px', backgroundColor: colors.accent }));
  if (isTitle) {
    const shell = mark({ display: 'block', width: '52px', height: '42px', lineHeight: '0', margin: '0 auto 14px' });
    shell.append(orbit);
    heading.prepend(shell);
  } else {
    heading.prepend(orbit);
  }
}

function addPostcard(heading: HTMLElement, colors: MotifColors): void {
  const isTitle = heading.tagName === 'H1';
  const stamp = mark(inlineBox(28, 27, { marginRight: '8px', verticalAlign: 'top' }));
  piece(stamp, inlineBox(25, 24, {
    border: `1.5px dashed ${colors.ink}`,
    borderRadius: '3px',
    boxShadow: `inset 0 0 0 2px ${colors.support}`,
    transform: 'rotate(-3deg)',
  }));
  const postmark = mark(inlineBox(31, 24, { marginRight: '7px', verticalAlign: 'middle' }));
  piece(postmark, inlineBox(21, 2, {
    marginTop: '4px',
    backgroundColor: colors.support,
    transform: 'rotate(-12deg)',
  }));
  piece(postmark, inlineBox(18, 2, {
    marginTop: '3px',
    backgroundColor: colors.accent,
    transform: 'rotate(-12deg)',
  }));
  piece(postmark, inlineBox(14, 2, {
    marginTop: '3px',
    backgroundColor: colors.support,
    transform: 'rotate(-12deg)',
  }));
  if (isTitle) {
    const row = mark({ display: 'block', textAlign: 'right', whiteSpace: 'nowrap', marginBottom: '10px' });
    row.append(stamp, postmark);
    heading.prepend(row);
  } else {
    heading.prepend(stamp, postmark);
  }
}

function addBotanical(heading: HTMLElement, colors: MotifColors): void {
  const isTitle = heading.tagName === 'H1';
  const sprig = mark(inlineBox(isTitle ? 48 : 34, isTitle ? 40 : 32, {
    marginRight: isTitle ? '0' : '7px',
    verticalAlign: 'middle',
  }));
  piece(sprig, inlineBox(2, isTitle ? 36 : 30, {
    display: 'block',
    marginLeft: isTitle ? '23px' : '17px',
    backgroundColor: colors.ink,
    transform: 'rotate(28deg)',
  }));
  piece(sprig, inlineBox(11, 7, {
    display: 'block',
    marginLeft: isTitle ? '23px' : '16px',
    marginTop: isTitle ? '-34px' : '-28px',
    border: `1px solid ${colors.ink}`,
    borderRadius: '70% 30% 70% 30%',
    backgroundColor: colors.accent,
    transform: 'rotate(-28deg)',
  }));
  piece(sprig, inlineBox(11, 7, {
    display: 'block',
    marginLeft: isTitle ? '12px' : '8px',
    marginTop: isTitle ? '5px' : '4px',
    border: `1px solid ${colors.ink}`,
    borderRadius: '70% 30% 70% 30%',
    backgroundColor: colors.support,
    transform: 'rotate(152deg)',
  }));
  piece(sprig, inlineBox(11, 7, {
    display: 'block',
    marginLeft: isTitle ? '16px' : '14px',
    marginTop: isTitle ? '1px' : '1px',
    border: `1px solid ${colors.ink}`,
    borderRadius: '70% 30% 70% 30%',
    backgroundColor: colors.accent,
    transform: 'rotate(-28deg)',
  }));
  if (isTitle) {
    const shell = mark({ display: 'block', width: '48px', height: '40px', lineHeight: '0', margin: '0 auto 12px' });
    shell.append(sprig);
    heading.prepend(shell);
  } else {
    heading.prepend(sprig);
  }
}

function addRipple(heading: HTMLElement, colors: MotifColors): void {
  const waves = mark({ display: 'block', width: '84px', height: '10px', margin: '12px auto 0', whiteSpace: 'nowrap', textAlign: 'center' });
  for (let index = 0; index < 6; index += 1) {
    piece(waves, inlineBox(14, 8, {
      verticalAlign: 'top',
      borderBottom: `2px solid ${index % 2 === 0 ? colors.support : colors.accent}`,
      borderRadius: '0 0 50% 50%',
      transform: `translateY(${index % 2 === 0 ? '0' : '-2px'})`,
    }));
  }
  heading.append(waves);
}

function addRibbon(heading: HTMLElement, colors: MotifColors): void {
  const isTitle = heading.tagName === 'H1';
  const bow = mark(inlineBox(isTitle ? 60 : 34, isTitle ? 38 : 30, {
    marginRight: isTitle ? '0' : '-8px',
    verticalAlign: 'middle',
  }));
  piece(bow, inlineBox(isTitle ? 28 : 19, isTitle ? 21 : 15, {
    border: `2px solid ${colors.accent}`,
    borderRadius: '70% 45% 70% 45%',
    transform: 'rotate(28deg)',
  }));
  piece(bow, inlineBox(isTitle ? 28 : 19, isTitle ? 21 : 15, {
    marginLeft: isTitle ? '-18px' : '-12px',
    border: `2px solid ${colors.support}`,
    borderRadius: '45% 70% 45% 70%',
    transform: 'rotate(-28deg)',
  }));
  piece(bow, inlineBox(0, 0, {
    marginLeft: isTitle ? '-21px' : '-15px',
    marginTop: isTitle ? '17px' : '14px',
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: `8px solid ${colors.accent}`,
  }));
  if (isTitle) {
    const shell = mark({ display: 'block', width: '60px', height: '38px', lineHeight: '0', margin: '0 auto 12px' });
    shell.append(bow);
    heading.prepend(shell);
  } else {
    heading.prepend(bow);
  }
}

/** Adds copy-safe, aria-hidden motif marks without changing authored heading text. */
export function decorateHeading(
  heading: HTMLElement,
  kind: MotifKind,
  colors: MotifColors,
): void {
  switch (kind) {
    case 'floral':
      addFloral(heading, colors);
      break;
    case 'orbit':
      addOrbit(heading, colors);
      break;
    case 'postcard':
      addPostcard(heading, colors);
      break;
    case 'botanical':
      addBotanical(heading, colors);
      break;
    case 'ripple':
      addRipple(heading, colors);
      break;
    case 'ribbon':
      addRibbon(heading, colors);
      break;
  }
}
