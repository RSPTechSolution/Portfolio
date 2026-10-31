import type { Experience } from '../schemas';

export const experience: Experience[] = [
  {
    org: 'LN Webworks Pvt Ltd',
    title: {
      all: 'Drupal, PHP & Backend Developer',
      drupal: 'Drupal Developer',
      php: 'PHP Developer',
      backend: 'Full Stack Backend Developer',
      ai: 'Full Stack Backend Developer',
    },
    start: 'Oct 2021',
    end: null,
    points: [
      'Enterprise Drupal 8/9/10/11 websites and custom modules for global clients',
      'REST APIs and integrations with CRM, payment gateways and AI platforms',
      'Search API with Solr/OpenSearch; performance with Redis, Cache API and query tuning',
      'Python (FastAPI) microservices supporting Drupal applications',
      'Drupal upgrades and migrations, Docker environments and Bitbucket Pipelines CI/CD',
    ],
  },
  {
    org: 'HB Infotech Pvt Ltd',
    title: 'PHP Developer',
    start: 'Mar 2021',
    end: 'Jul 2021',
    points: ['PHP and MySQL web applications', 'Responsive UIs with HTML, CSS, JavaScript and jQuery', 'First exposure to React and Node.js'],
  },
  {
    org: 'Gulzar Group of Institutions, Khanna',
    title: 'Bachelor of Computer Applications (BCA)',
    start: '2018',
    end: 'Jan 2021',
    points: [],
  },
];
