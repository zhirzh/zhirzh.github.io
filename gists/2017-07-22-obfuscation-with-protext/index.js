const opentype = require('opentype.js');

const sourceFont = opentype.loadSync('./font.ttf');

const notdefGlyph = new opentype.Glyph({
  name: '.notdef',
  unicode: 0,
  advanceWidth: 650,
  path: new opentype.Path(),
});

const charset = 'abcdefghijklmnopqrstuvwxyz'.split('');

const glyphset = [notdefGlyph];

charset.forEach((sourceChar, i) => {
  const targetChar = charset[26 - 1 - i];

  const sourceGlyph = sourceFont.charToGlyph(sourceChar);
  const targetGlyph = new opentype.Glyph(sourceFont.charToGlyph(targetChar));

  targetGlyph.path = sourceGlyph.path;
  targetGlyph.advanceWidth = sourceGlyph.advanceWidth;

  glyphset.push(targetGlyph);
});

const targetFont = new opentype.Font({
  familyName: 'reverse',
  styleName: 'regular',

  unitsPerEm: sourceFont.unitsPerEm,
  ascender: sourceFont.ascender,
  descender: sourceFont.descender,

  glyphs: glyphset,
});

targetFont.download('font-reverse.ttf');
