import type { Theme } from './themes';

function channels(hex: string): number[] {
  return hex.slice(1).match(/../g)!.map(value => parseInt(value, 16));
}

export function mixColor(color: string, background: string, amount: number): string {
  const surface = channels(background);
  return '#' + channels(color).map((value, index) => Math.round(value * (1 - amount) + surface[index] * amount).toString(16).padStart(2, '0')).join('');
}

function luminance(hex: string): number {
  const rgb = channels(hex).map(value => {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}

export function contrastRatio(text: string, background: string): number {
  const a = luminance(text), b = luminance(background);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

function readableAccent(accent: string, paper: string): string {
  // Keep a chosen hue in the artwork, but deepen its text variant for reading on light paper.
  for (let step = 0; step <= 20; step++) {
    const candidate = mixColor(accent, '#20242b', step / 20);
    if (contrastRatio(candidate, mixColor(accent, paper, .91)) >= 5) return candidate;
  }
  return '#20242b';
}

export function articlePalette(theme: Theme, accent = theme.accent) {
  const paper = theme.paper;
  const accentText = readableAccent(accent, paper);
  const onAccent = ['#ffffff', '#17191d', '#000000'].sort((a,b) => contrastRatio(b, accent) - contrastRatio(a, accent))[0];
  return {
    accent, accentText, onAccent, paper, ink: theme.ink, support: theme.support,
    surface: mixColor(accent, paper, .96), tint: mixColor(accent, paper, .91),
    line: mixColor(accent, paper, .74), muted: '#626974', link: '#4d6288',
    deep: mixColor(accent, '#20242b', .72),
  };
}
