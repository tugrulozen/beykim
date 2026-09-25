// İş Akışı uygulamasını derler: node scripts/build-taskflow.mjs <firma-slug>  (ör. hobiex)
process.env.APP = 'taskflow';
await import('./build-finance.mjs');
