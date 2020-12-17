import iro from '@jaames/iro';

export default function (hexColor) {
  // console.log(hexColor)
  const {h, s, l} = new iro.Color(hexColor).hsl;

  if ((l / 100) < 0.2) return 'Blacks';
  if ((l / 100) > 0.85) return 'Whites';

  if ((s / 100) < 0.20) return 'Grays';

  if (h < 30) return 'Reds';
  if (h < 60) return 'Oranges';
  if (h < 90) return 'Yellows';
  if (h < 150) return 'Greens';
  if (h < 210) return 'Cyans';
  if (h < 270) return 'Blues';
  if (h < 330) return 'Magentas';

  return 'Reds';
}