const { Client } = require('pg');
const regions = ['us-east-1', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-west-2', 'eu-central-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-south-1', 'sa-east-1', 'ca-central-1'];
const password = 'nOOB5Si3TH6oWIHh';
const project = 'zlszqcxqunihwzlhlasj';

async function testRegions() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connStr = `postgresql://postgres.${project}:${password}@${host}:6543/postgres`;
    const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
    try {
      console.log('Testing', region, '...');
      await new Promise((resolve, reject) => {
        client.connect(err => {
          if (err) return reject(err);
          client.query('SELECT 1', (err2) => {
            if (err2) return reject(err2);
            client.end();
            resolve();
          });
        });
        setTimeout(() => reject(new Error('Timeout')), 3000);
      });
      console.log('>>> SUCCESS IN REGION:', region);
      process.exit(0);
    } catch(e) {
      // console.log('Failed', region, e.message);
    }
  }
  console.log('All failed');
}
testRegions();
