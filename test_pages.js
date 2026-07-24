const http = require('http');

const pages = [
  '/',
  '/admin',
  '/hr',
  '/employee',
  '/attendance',
  '/calendar',
  '/documents',
  '/departments',
  '/recruitment',
  '/appraisals',
  '/projects',
  '/tasks',
  '/finance',
  '/crm'
];

async function checkPages() {
  for (const page of pages) {
    try {
      const res = await fetch(`http://localhost:3000${page}`);
      console.log(`${page}: ${res.status}`);
      if (res.status === 500) {
        const text = await res.text();
        console.log(`Error on ${page}: ${text.substring(0, 500)}`);
      }
    } catch (e) {
      console.log(`${page}: FAILED to fetch - ${e.message}`);
    }
  }
}

checkPages();
