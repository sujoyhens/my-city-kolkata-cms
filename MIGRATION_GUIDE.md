# Migration Guide: Local Strapi to Strapi Cloud

This guide will help you migrate your local Strapi database contents to your new Strapi Cloud instance.

## Prerequisites

1. ✅ Your local Strapi project is running and accessible
2. ✅ You have created a new Strapi Cloud project
3. ✅ Both projects have the same content types (schemas must match)
4. ✅ You have admin access to both projects

## Method 1: Using Strapi CLI (Recommended)

### Step 1: Export Data from Local Strapi

1. **Stop your local Strapi server** (if running)

2. **Export your data** using one of these commands:

   ```bash
   # Using npm
   npm run strapi export --no-encrypt

   # OR using yarn
   yarn strapi export --no-encrypt
   ```

   This will create a `.tar.gz` file in your project root (e.g., `export-2024-01-15.tar.gz`)

   **Note:** Use `--no-encrypt` flag because Strapi Cloud doesn't support encrypted imports.

### Step 2: Upload to Strapi Cloud

1. **Access your Strapi Cloud project** via:
   - Strapi Cloud Dashboard
   - SSH/Terminal access (if available)
   - Or use the Strapi Cloud web interface

2. **Upload the export file** to your Strapi Cloud project root directory

3. **Import the data** in your Strapi Cloud project:

   ```bash
   # Using npm
   npm run strapi import -f export-2024-01-15.tar.gz

   # OR using yarn
   yarn strapi import -f export-2024-01-15.tar.gz
   ```

### Step 3: Verify and Recreate Admin Users

- The import process **does NOT** include admin users
- You'll need to create a new admin user in Strapi Cloud after import
- Go to: `https://your-cloud-project.strapi.app/admin/auth/register-admin`

## Method 2: Using API Migration Script

If the CLI method doesn't work, you can use the provided migration scripts:

### Step 1: Export from Local

```bash
node scripts/export-data.js
```

This will create JSON files for each content type in the `exports/` directory.

### Step 2: Import to Strapi Cloud

1. Update `scripts/import-data.js` with your Strapi Cloud API URL and token
2. Run:

```bash
node scripts/import-data.js
```

## Important Notes

⚠️ **Data Overwrite Warning:** 
- Importing will **DELETE all existing data** in your Strapi Cloud project
- Make sure you have backups if needed

⚠️ **Schema Compatibility:**
- Your local and cloud projects **must have identical content types**
- Field names, types, and relationships must match exactly

⚠️ **Media Files:**
- Media files are included in the export
- If you're using Cloudinary, ensure it's configured in Strapi Cloud
- Large media files may take time to transfer

⚠️ **Content Types to Migrate:**
Based on your project, you have these content types:
- `mycitykolkata`
- `cover-content`
- `healthcare`
- `attraction`
- `suggestion`

## Troubleshooting

### Export fails
- Make sure Strapi is not running
- Check you have write permissions in the project directory
- Try running with `--no-encrypt` flag

### Import fails
- Verify the export file is not corrupted
- Check that schemas match between local and cloud
- Ensure Strapi Cloud project is accessible
- Check file size limits (Strapi Cloud may have limits)

### Missing data after import
- Check if all content types were exported
- Verify media files were included
- Check Strapi Cloud logs for errors

## Alternative: Manual Migration via Admin Panel

If automated methods fail, you can:

1. Export data via Strapi Admin Panel → Settings → Transfer Tokens
2. Use the Content API to fetch data from local
3. Use the Content API to create entries in Strapi Cloud

See `scripts/api-migration.js` for a programmatic approach.

