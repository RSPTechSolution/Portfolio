// Structured data (schema.org JSON-LD) and page-level SEO copy.
// Every fact comes from the content layer (spec §2); nothing here is invented.
import { profile } from '../content/data/profile';
import { awards } from '../content/data/awards';
import { experience } from '../content/data/experience';
import { services } from '../content/data/services';

export const SITE_NAME = 'Subodh Kant';
export const PORTRAIT_PATH = '/og/portrait.jpg';

export function absoluteUrl(site: string, path: string): string {
  return `${site.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

const personId = (site: string) => absoluteUrl(site, '/#person');

export const HOME_SEO = {
  title: 'Subodh Kant · Drupal, PHP & Python Backend Developer',
  description:
    'Drupal, PHP & Python (FastAPI) backend developer in Ludhiana, India. 5+ years building enterprise Drupal 10/11 platforms, APIs and real-time systems.',
  keywords: [
    'Subodh Kant', 'Drupal Developer', 'PHP Developer', 'Backend Developer', 'Python Developer', 'FastAPI Developer',
    'Drupal 10 Developer', 'Drupal 11 Developer', 'Drupal Developer India', 'Drupal Developer Ludhiana', 'Drupal Developer Punjab',
    'Hire Drupal Developer', 'Freelance Drupal Developer', 'Headless Drupal', 'Drupal Migration', 'Drupal 7 to 10 Migration',
    'Full Stack Backend Developer', 'Redis', 'PostgreSQL', 'REST API Developer', 'AI-assisted Developer',
  ],
};

export function personSchema(site: string) {
  const job = experience[0];
  const school = experience.find((e) => e.org.startsWith('Gulzar'))!;
  return {
    '@type': 'Person',
    '@id': personId(site),
    name: profile.name,
    url: absoluteUrl(site, '/'),
    image: absoluteUrl(site, PORTRAIT_PATH),
    jobTitle: 'Backend & Drupal Engineer',
    description: HOME_SEO.description,
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Ludhiana', addressRegion: 'Punjab', addressCountry: 'IN' },
    worksFor: { '@type': 'Organization', name: job.org },
    alumniOf: { '@type': 'CollegeOrUniversity', name: school.org.replace(/, Khanna$/, ''), address: 'Khanna, Punjab, India' },
    knowsLanguage: profile.languages,
    knowsAbout: ['Drupal', 'Drupal 10', 'Drupal 11', 'PHP', 'Python', 'FastAPI', 'Django', 'Redis', 'PostgreSQL', 'MySQL',
      'Solr', 'OpenSearch', 'REST APIs', 'JSON:API', 'Microservices', 'Docker', 'AWS', 'CI/CD', 'JavaScript', 'AI-assisted development'],
    award: awards.filter((a) => a.kind === 'award').map((a) => `${a.name}, ${a.issuer} (${a.year})`),
    hasCredential: awards.filter((a) => a.kind === 'cert').map((a) => ({ '@type': 'EducationalOccupationalCredential', name: `${a.name} Certification` })),
    sameAs: [profile.linkedin],
  };
}

export function websiteSchema(site: string) {
  return { '@type': 'WebSite', '@id': absoluteUrl(site, '/#website'), url: absoluteUrl(site, '/'), name: SITE_NAME, inLanguage: 'en', publisher: { '@id': personId(site) } };
}

export function profilePageSchema(site: string) {
  return {
    '@type': 'ProfilePage', '@id': absoluteUrl(site, '/#profile'), url: absoluteUrl(site, '/'), name: HOME_SEO.title,
    isPartOf: { '@id': absoluteUrl(site, '/#website') }, mainEntity: { '@id': personId(site) }, inLanguage: 'en',
  };
}

export function serviceSchema(site: string) {
  return {
    '@type': 'ProfessionalService',
    '@id': absoluteUrl(site, '/#services'),
    name: `${profile.name}: Drupal & Backend Development`,
    url: absoluteUrl(site, '/#services'),
    image: absoluteUrl(site, PORTRAIT_PATH),
    provider: { '@id': personId(site) },
    areaServed: 'Worldwide',
    address: { '@type': 'PostalAddress', addressLocality: 'Ludhiana', addressRegion: 'Punjab', addressCountry: 'IN' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Development services',
      itemListElement: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, description: `${s.summary} ${s.details}` } })),
    },
  };
}

export function caseStudySchema(site: string, s: { title: string; slug: string; summary: string; stack: string[] }) {
  const url = absoluteUrl(site, `/work/${s.slug}`);
  return {
    '@type': 'TechArticle', '@id': `${url}#article`, headline: s.title, description: s.summary, url,
    image: absoluteUrl(site, `/og/${s.slug}.png`), author: { '@id': personId(site) }, publisher: { '@id': personId(site) },
    about: s.stack, inLanguage: 'en', mainEntityOfPage: url,
  };
}

export function breadcrumbSchema(site: string, items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(site, it.path) })),
  };
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
