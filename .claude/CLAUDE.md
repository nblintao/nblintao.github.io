# Claude Project Guide

This is a personal website project built with Node.js (migrated from Jekyll).

## Build the Website

```bash
npm run build
```

After building, static files will be generated in the `_site/` directory.

## Local Preview

After building, start a local server:

```bash
npm run serve
```

Or use the combined command:

```bash
npm run dev
```

Then visit in browser:
- English version: http://localhost:8000
- Chinese version: http://localhost:8000/zh/

## Modify Content

### Modify Text Content

Edit the following files:
- English content: `_i18n/en.yml`
- Chinese content: `_i18n/zh.yml`

### Modify HTML Structure

Edit files in `_includes/` directory:
- `_includes/header.html` - Navigation header
- `_includes/home.html` - Home page content
- `_includes/footer.html` - Footer

### Modify Styles

**Important**: The website uses minified CSS file `css/agency.min.css`, which is automatically generated from `css/agency.css` during build.

Correct workflow for modifying styles:
1. Edit `css/agency.css` (the source file)
2. Run `npm run build` to rebuild - this will automatically generate the minified version
3. Press `Cmd + Shift + R` in browser to force cache refresh

**Note**:
- The build script automatically minifies `css/agency.css` → `css/agency.min.css` using CSSO
- Do NOT manually edit `css/agency.min.css` - it will be overwritten during build
- Browsers cache CSS, so always force refresh after modifications to see changes

## Build System

The website uses a custom Node.js build script (`build/index.js`) that:
1. Loads translations from YAML files (`_i18n/en.yml` and `_i18n/zh.yml`)
2. Processes HTML templates in `_includes/` directory
3. Replaces `{{ t('key') }}` with translated text
4. Generates separate pages for English and Chinese versions
5. Minifies CSS (`css/agency.css` → `css/agency.min.css`) using CSSO
6. Copies static assets (JS, images, etc.)
7. Generates SEO files (sitemap.xml, feed.xml, robots.txt)

Template syntax:
- Translations: `{{ t('key.path') }}`
- Conditional logic: `{% if condition %} ... {% else %} ... {% endif %}`
- Relative URLs: `{{ '/path' | relative_url }}`

## Deployment

The website automatically deploys to GitHub Pages via GitHub Actions (`.github/workflows/nodejs.yml`) when you push to the master branch.

The workflow:
1. Checks out code
2. Sets up Node.js 20
3. Installs dependencies with `npm ci`
4. Runs `npm run build`
5. Deploys to GitHub Pages

## Development

### Requirements
- Node.js 18+ (recommended 20+)
- npm

### Install Dependencies
```bash
npm install
```

### Build Process
The build script is located at `build/index.js`. It's a simple Node.js script that doesn't require complex build tools - just reads templates, processes translations, and generates static HTML files.

Key dependencies:
- `js-yaml` - Parse YAML translation files
- `fs-extra` - File system operations
- `csso` - CSS minification
- `glob` - File pattern matching (not currently used but available)
- `nunjucks` - Template engine (installed but build uses simple string replacement)

After modifications, rebuild the website to see changes.
