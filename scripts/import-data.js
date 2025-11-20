/**
 * Import Strapi Content to Strapi Cloud via API
 * 
 * This script imports content from exported JSON files
 * into your Strapi Cloud instance.
 * 
 * Usage: node scripts/import-data.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  // Your Strapi Cloud URL
  cloudUrl: process.env.CLOUD_STRAPI_URL || 'https://your-project.strapi.app',
  // Your Strapi Cloud API token (create one in Settings > API Tokens)
  apiToken: process.env.CLOUD_STRAPI_API_TOKEN || '',
  // Input directory (where exported files are)
  inputDir: path.join(__dirname, '..', 'exports'),
  // Batch size for creating entries
  batchSize: 10,
};

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

/**
 * Create a single entry
 */
async function createEntry(contentType, entryData) {
  try {
    // Remove Strapi internal fields
    const { id, createdAt, updatedAt, publishedAt, ...cleanData } = entryData;
    
    const url = `${CONFIG.cloudUrl}/api/${contentType}`;
    const response = await makeRequest(url, {
      method: 'POST',
      body: { data: cleanData },
    });

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.data };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Import content type from JSON file
 */
async function importContentType(contentType) {
  console.log(`\n📦 Importing ${contentType}...`);
  
  const filePath = path.join(CONFIG.inputDir, `${contentType}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return { imported: 0, failed: 0 };
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const entries = JSON.parse(fileContent);
  const entriesArray = Array.isArray(entries) ? entries : (entries.data || []);

  console.log(`📄 Found ${entriesArray.length} entries to import`);

  let imported = 0;
  let failed = 0;

  // Import in batches
  for (let i = 0; i < entriesArray.length; i += CONFIG.batchSize) {
    const batch = entriesArray.slice(i, i + CONFIG.batchSize);
    
    const promises = batch.map(async (entry) => {
      const result = await createEntry(contentType, entry);
      if (result.success) {
        imported++;
        process.stdout.write('.');
      } else {
        failed++;
        console.log(`\n❌ Failed to import entry:`, result.error);
      }
    });

    await Promise.all(promises);
    
    // Small delay between batches to avoid rate limiting
    if (i + CONFIG.batchSize < entriesArray.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n✅ Imported ${imported} entries, ${failed} failed`);
  return { imported, failed };
}

/**
 * Main import function
 */
async function main() {
  console.log('🚀 Starting Strapi Data Import to Cloud...\n');
  console.log(`📍 Cloud URL: ${CONFIG.cloudUrl}`);
  console.log(`📁 Input Directory: ${CONFIG.inputDir}\n`);

  // Check API token
  if (!CONFIG.apiToken) {
    console.error('❌ Error: CLOUD_STRAPI_API_TOKEN environment variable is required');
    console.log('\n📝 To create an API token:');
    console.log('   1. Go to your Strapi Cloud Admin Panel');
    console.log('   2. Settings > API Tokens');
    console.log('   3. Create a new token with "Full access" permissions');
    console.log('   4. Set it as: export CLOUD_STRAPI_API_TOKEN=your-token-here\n');
    process.exit(1);
  }

  // Check input directory
  if (!fs.existsSync(CONFIG.inputDir)) {
    console.error(`❌ Error: Input directory not found: ${CONFIG.inputDir}`);
    console.log('   Run the export script first: node scripts/export-data.js\n');
    process.exit(1);
  }

  // Get all JSON files
  const files = fs.readdirSync(CONFIG.inputDir)
    .filter(file => file.endsWith('.json') && file !== 'all-content.json');

  if (files.length === 0) {
    console.error(`❌ No export files found in: ${CONFIG.inputDir}`);
    process.exit(1);
  }

  console.log(`📋 Found ${files.length} content type files to import\n`);

  // Import each content type
  const results = {};
  for (const file of files) {
    const contentType = file.replace('.json', '');
    results[contentType] = await importContentType(contentType);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Import Summary:');
  console.log('='.repeat(50));
  
  let totalImported = 0;
  let totalFailed = 0;
  
  for (const [contentType, result] of Object.entries(results)) {
    console.log(`${contentType}: ${result.imported} imported, ${result.failed} failed`);
    totalImported += result.imported;
    totalFailed += result.failed;
  }
  
  console.log('='.repeat(50));
  console.log(`Total: ${totalImported} imported, ${totalFailed} failed`);
  console.log('\n✅ Import completed!\n');
}

// Run the script
main().catch(console.error);

