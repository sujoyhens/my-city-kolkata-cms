/**
 * Export Strapi Content via API
 * 
 * This script exports all content from your local Strapi instance
 * and saves it as JSON files for migration to Strapi Cloud.
 * 
 * Usage: node scripts/export-data.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  // Your local Strapi URL
  localUrl: process.env.LOCAL_STRAPI_URL || 'http://localhost:1337',
  // Your Strapi API token (create one in Settings > API Tokens)
  apiToken: process.env.STRAPI_API_TOKEN || '',
  // Output directory
  outputDir: path.join(__dirname, '..', 'exports'),
};

// Content types to export (based on your project)
const CONTENT_TYPES = [
  'mycitykolkata',
  'cover-content',
  'healthcare',
  'attraction',
  'suggestion',
];

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
      method: options.method || 'GET',
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
 * Export all entries for a content type
 */
async function exportContentType(contentType) {
  console.log(`\n📦 Exporting ${contentType}...`);
  
  try {
    const url = `${CONFIG.localUrl}/api/${contentType}?pagination[limit]=1000&populate=*`;
    const response = await makeRequest(url);
    
    if (response.status !== 200) {
      console.error(`❌ Failed to export ${contentType}:`, response.data);
      return null;
    }

    const data = response.data.data || response.data;
    const count = Array.isArray(data) ? data.length : (data.length || 0);
    
    console.log(`✅ Exported ${count} entries for ${contentType}`);
    return data;
  } catch (error) {
    console.error(`❌ Error exporting ${contentType}:`, error.message);
    return null;
  }
}

/**
 * Main export function
 */
async function main() {
  console.log('🚀 Starting Strapi Data Export...\n');
  console.log(`📍 Local URL: ${CONFIG.localUrl}`);
  console.log(`📁 Output Directory: ${CONFIG.outputDir}\n`);

  // Check API token
  if (!CONFIG.apiToken) {
    console.error('❌ Error: STRAPI_API_TOKEN environment variable is required');
    console.log('\n📝 To create an API token:');
    console.log('   1. Go to your Strapi Admin Panel');
    console.log('   2. Settings > API Tokens');
    console.log('   3. Create a new token with "Read" permissions');
    console.log('   4. Set it as: export STRAPI_API_TOKEN=your-token-here\n');
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${CONFIG.outputDir}`);
  }

  // Export each content type
  const exportData = {
    exportedAt: new Date().toISOString(),
    contentTypes: {},
  };

  for (const contentType of CONTENT_TYPES) {
    const data = await exportContentType(contentType);
    if (data) {
      exportData.contentTypes[contentType] = data;
      
      // Also save individual file
      const filePath = path.join(CONFIG.outputDir, `${contentType}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`💾 Saved to: ${filePath}`);
    }
  }

  // Save combined export
  const combinedPath = path.join(CONFIG.outputDir, 'all-content.json');
  fs.writeFileSync(combinedPath, JSON.stringify(exportData, null, 2));
  console.log(`\n💾 Combined export saved to: ${combinedPath}`);

  console.log('\n✅ Export completed!');
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Review the exported files in: ${CONFIG.outputDir}`);
  console.log(`   2. Use the import script to upload to Strapi Cloud`);
  console.log(`   3. Or use Strapi CLI: yarn strapi export --no-encrypt\n`);
}

// Run the script
main().catch(console.error);

