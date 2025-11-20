# Migration Scripts

These scripts help you migrate your Strapi content from local to Strapi Cloud.

## Quick Start

### Method 1: Using Strapi CLI (Recommended)

```bash
# Export from local
npm run export

# Then upload the .tar.gz file to Strapi Cloud and import
# (You'll need to do this via Strapi Cloud terminal/SSH)
```

### Method 2: Using API Scripts

```bash
# 1. Export data from local Strapi
export STRAPI_API_TOKEN=your-local-token
npm run export:api

# 2. Import to Strapi Cloud
export CLOUD_STRAPI_API_TOKEN=your-cloud-token
export CLOUD_STRAPI_URL=https://your-project.strapi.app
npm run import:api
```

## Scripts

### `export-data.js`
Exports all content from your local Strapi instance via API and saves as JSON files.

**Requirements:**
- Local Strapi server running
- API token with "Read" permissions

**Output:**
- Creates `exports/` directory
- Saves individual JSON files for each content type
- Creates `all-content.json` with combined data

### `import-data.js`
Imports content from exported JSON files into Strapi Cloud via API.

**Requirements:**
- Exported JSON files in `exports/` directory
- Strapi Cloud API token with "Full access" permissions
- Strapi Cloud URL configured

**Features:**
- Batch processing to avoid rate limits
- Error handling and reporting
- Progress indicators

## Environment Variables

### For Export (`export-data.js`)
- `LOCAL_STRAPI_URL` - Your local Strapi URL (default: `http://localhost:1337`)
- `STRAPI_API_TOKEN` - Your local Strapi API token (required)

### For Import (`import-data.js`)
- `CLOUD_STRAPI_URL` - Your Strapi Cloud URL (required)
- `CLOUD_STRAPI_API_TOKEN` - Your Strapi Cloud API token (required)

## Creating API Tokens

### Local Strapi
1. Go to Admin Panel → Settings → API Tokens
2. Create new token
3. Set permissions to "Read" (for export) or "Full access" (for import)
4. Copy the token

### Strapi Cloud
1. Go to your Strapi Cloud Admin Panel
2. Settings → API Tokens
3. Create new token with "Full access" permissions
4. Copy the token

## Troubleshooting

### Export fails
- Make sure local Strapi is running
- Verify API token has correct permissions
- Check that content types exist

### Import fails
- Verify Strapi Cloud URL is correct
- Check API token has "Full access" permissions
- Ensure exported files exist in `exports/` directory
- Check for schema mismatches between local and cloud

### Rate Limiting
If you get rate limit errors, the scripts include delays between batches. You can adjust `batchSize` in `import-data.js` if needed.

