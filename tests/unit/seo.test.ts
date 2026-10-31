import { expect, test } from 'vitest';
import { personSchema, websiteSchema, profilePageSchema, serviceSchema, caseStudySchema, breadcrumbSchema, absoluteUrl, HOME_SEO } from '../../src/seo/schema';

const SITE = 'https://subodh-cv.vidyanexa.com';

test('absoluteUrl joins without double slashes', () => {
  expect(absoluteUrl(SITE, '/')).toBe(`${SITE}/`);
  expect(absoluteUrl(`${SITE}/`, '/work/x')).toBe(`${SITE}/work/x`);
});

test('Person schema describes Subodh with verifiable facts only', () => {
  const p = personSchema(SITE);
  expect(p['@type']).toBe('Person');
  expect(p['@id']).toBe(`${SITE}/#person`);
  expect(p.name).toBe('Subodh Kant');
  expect(p.url).toBe(`${SITE}/`);
  expect(p.image).toMatch(/^https:\/\/subodh-cv\.vidyanexa\.com\//);
  expect(p.sameAs).toContain('https://www.linkedin.com/in/subodh-kant');
  expect(p.address).toMatchObject({ addressLocality: 'Ludhiana', addressRegion: 'Punjab', addressCountry: 'IN' });
  expect(p.worksFor).toMatchObject({ name: 'LN Webworks Pvt Ltd' });
  expect(p.alumniOf).toMatchObject({ name: 'Gulzar Group of Institutions' });
  expect(p.knowsAbout).toEqual(expect.arrayContaining(['Drupal', 'PHP', 'Python', 'FastAPI', 'Redis', 'PostgreSQL']));
  expect(p.award).toEqual(expect.arrayContaining(['Rising Star, LN Webworks (2022)', 'Glowing Star, LN Webworks (2023)']));
  expect(p).not.toHaveProperty('telephone');
});

test('site-level schemas link to the person', () => {
  expect(websiteSchema(SITE)).toMatchObject({ '@type': 'WebSite', url: `${SITE}/`, publisher: { '@id': `${SITE}/#person` } });
  expect(profilePageSchema(SITE)).toMatchObject({ '@type': 'ProfilePage', mainEntity: { '@id': `${SITE}/#person` } });
  const s = serviceSchema(SITE);
  expect(s['@type']).toBe('ProfessionalService');
  expect(s.provider).toEqual({ '@id': `${SITE}/#person` });
  expect(s.areaServed).toBe('Worldwide');
  expect(s.hasOfferCatalog.itemListElement.length).toBe(4);
});

test('case study and breadcrumbs', () => {
  const a = caseStudySchema(SITE, { title: 'Ads Delivery System', slug: 'ads-delivery-system', summary: 'x', stack: ['Redis'] });
  expect(a).toMatchObject({ '@type': 'TechArticle', headline: 'Ads Delivery System', url: `${SITE}/work/ads-delivery-system`, author: { '@id': `${SITE}/#person` } });
  const b = breadcrumbSchema(SITE, [{ name: 'Home', path: '/' }, { name: 'Ads Delivery System', path: '/work/ads-delivery-system' }]);
  expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  expect(b.itemListElement[1].item).toBe(`${SITE}/work/ads-delivery-system`);
});

test('home title and description fit Google display limits', () => {
  expect(HOME_SEO.title.length).toBeLessThanOrEqual(60);
  expect(HOME_SEO.description.length).toBeGreaterThanOrEqual(120);
  expect(HOME_SEO.description.length).toBeLessThanOrEqual(160);
  expect(HOME_SEO.keywords).toEqual(expect.arrayContaining(['Subodh Kant', 'Drupal Developer', 'Hire Drupal Developer']));
});
