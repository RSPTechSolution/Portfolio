// 1200x630 social preview images, rendered at build time (satori → SVG → sharp → PNG).
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const font = (p: string) => readFileSync(require.resolve(p));
const fonts = [
  { name: 'Bricolage', data: font('@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff'), weight: 800 as const, style: 'normal' as const },
  { name: 'Bricolage', data: font('@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'Mono', data: font('@fontsource/martian-mono/files/martian-mono-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
];
const photo = `data:image/jpeg;base64,${readFileSync(join(process.cwd(), 'src/assets/og-photo.jpg')).toString('base64')}`;

type Card = { kicker: string; title: string; subtitle: string };

export const getStaticPaths = (async () => {
  const studies = await getCollection('caseStudies');
  return [
    { params: { slug: 'home' }, props: { kicker: 'Open to full-time roles & freelance', title: 'Subodh Kant.', subtitle: 'Drupal, PHP & Python backend developer · Ludhiana, India' } },
    ...studies.map((s) => ({ params: { slug: s.data.slug }, props: { kicker: 'Case study · Subodh Kant', title: s.data.title, subtitle: s.data.summary } })),
  ];
}) satisfies GetStaticPaths;

const h = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  const { kicker, title, subtitle } = props as Card;
  const big = title.length <= 14;
  const tree = h('div', { width: 1200, height: 630, display: 'flex', background: '#f0ebe3', fontFamily: 'Bricolage', color: '#151411', padding: 56 }, [
    h('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 640, flexShrink: 0, paddingRight: 40 }, [
      h('div', { display: 'flex', alignItems: 'center', fontFamily: 'Mono', fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: '#6f665b' }, [
        h('div', { width: 14, height: 14, borderRadius: 7, background: '#3fbf7f', marginRight: 14 }),
        kicker,
      ]),
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', { fontSize: big ? 132 : 72, fontWeight: 800, lineHeight: 0.9, letterSpacing: -3, color: big ? '#151411' : '#151411' }, title),
        h('div', { width: 120, height: 10, borderRadius: 5, background: '#ff4a1c', marginTop: 28, marginBottom: 24 }),
        h('div', { fontSize: 30, fontWeight: 500, lineHeight: 1.3, color: '#3a352d', maxWidth: 640 }, subtitle),
      ]),
      h('div', { fontFamily: 'Mono', fontSize: 20, color: '#c4320c' }, 'subodh-cv.vidyanexa.com'),
    ]),
    h('div', { display: 'flex', flexShrink: 0, width: 404, height: 518, borderRadius: 36, overflow: 'hidden', boxShadow: '0 30px 60px rgba(80,60,40,.25)', border: '12px solid #f5f0e9' }, [
      { type: 'img', props: { src: photo, width: 380, height: 494, style: { objectFit: 'cover', width: '100%', height: '100%' } } },
    ]),
  ]);
  const svg = await satori(tree as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};

