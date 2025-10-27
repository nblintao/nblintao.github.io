const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const csso = require('csso');

// Helper function to get translation
function getTranslation(translations, key) {
  const keys = key.split('.');
  let value = translations;

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }

  return value || key;
}

// Generate full HTML from templates
function generateHTML(lang, translations, config) {
  const t = (key) => getTranslation(translations[lang], key);

  // Read templates
  const headerHtml = fs.readFileSync('_includes/header.html', 'utf8');
  const homeContentHtml = fs.readFileSync('_includes/home.html', 'utf8');
  const footerHtml = fs.readFileSync('_includes/footer.html', 'utf8');

  // Build full page HTML manually
  const fullHtml = `<!DOCTYPE html>
<html lang="${lang}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${config.site.description}">
    <meta name="author" content="Tao Lin">

    <title>${config.site.title} | Home</title>

    <!-- Bootstrap Core CSS -->
    <link href="/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom Fonts -->
    <link href="/vendor/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
    <link href='https://fonts.googleapis.com/css?family=Kaushan+Script' rel='stylesheet' type='text/css'>
    <link href='https://fonts.googleapis.com/css?family=Droid+Serif:400,700,400italic,700italic' rel='stylesheet' type='text/css'>
    <link href='https://fonts.googleapis.com/css?family=Roboto+Slab:400,100,300,700' rel='stylesheet' type='text/css'>

    <!-- Theme CSS -->
    <link href="/css/agency.min.css" rel="stylesheet"><link type="application/atom+xml" rel="alternate" href="${config.site.url}/feed.xml" title="${config.site.title}" /><!-- Begin Jekyll SEO tag v2.8.0 -->
<title>Home | ${config.site.title}</title>
<meta name="generator" content="Jekyll v4.2.2" />
<meta property="og:title" content="Home" />
<meta property="og:locale" content="${lang}" />
<meta name="description" content="${config.site.description}" />
<meta property="og:description" content="${config.site.description}" />
<link rel="canonical" href="${config.site.url}/" />
<meta property="og:url" content="${config.site.url}/" />
<meta property="og:site_name" content="${config.site.title}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary" />
<meta property="twitter:title" content="Home" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","description":"${config.site.description}","headline":"Home","name":"${config.site.title}","url":"${config.site.url}/"}</script>
<!-- End Jekyll SEO tag -->
</head>

<body id="page-top" class="index">
${processTemplate(headerHtml, t, lang)}
${processTemplate(homeContentHtml, t, lang)}
${processTemplate(footerHtml, t, lang)}

    <!-- jQuery -->
    <script src="/vendor/jquery/jquery.min.js"></script>

    <!-- Bootstrap Core JavaScript -->
    <script src="/vendor/bootstrap/js/bootstrap.min.js"></script>

    <!-- Plugin JavaScript -->
    <script src="http://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.3/jquery.easing.min.js"></script>

    <!-- Contact Form JavaScript -->
    <script src="/js/jqBootstrapValidation.js"></script>
    <script src="/js/contact_me.js"></script>

    <!-- Theme JavaScript -->
    <script src="/js/agency.min.js"></script>

    <!-- Google Universal Analytics -->
    <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-80873012-1', 'auto');
    ga('send', 'pageview');
    </script>
</body>

</html>
`;

  return fullHtml;
}

// Process template - replace {{ t('key') }} with translations
function processTemplate(html, t, lang) {
  // Replace {{ t('key') }}
  html = html.replace(/\{\{\s*t\('([^']+)'\)\s*\}\}/g, (match, key) => {
    return t(key);
  });

  // Replace {% if lang == "en" %} ... {% else %} ... {% endif %}
  html = html.replace(/\{%\s*if\s+lang\s*==\s*"en"\s*%\}([\s\S]*?)\{%\s*else\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g,
    (match, enContent, otherContent) => {
      return lang === 'en' ? enContent : otherContent;
    });

  // Replace {{ '/path' | relative_url }} with /path
  html = html.replace(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/g, (match, path) => {
    return path;
  });

  return html;
}

async function build() {
  try {
    console.log('🚀 Start building website...');

    const config = {
      site: {
        title: 'Tao Lin',
        url: 'https://nblintao.github.io',
        description: 'A Programmer & Data Scientist'
      },
      languages: ['en', 'zh'],
      defaultLanguage: 'en',
      paths: {
        output: '_site',
        i18n: '_i18n',
        static: ['css', 'js', 'vendor', 'image', 'img', 'pdf', 'cv_tex', 'mail', 'less', 'scss']
      }
    };

    // 1. Clean output directory
    await fs.remove(config.paths.output);
    await fs.ensureDir(config.paths.output);

    // 2. Load translations
    const translations = {};
    for (const lang of config.languages) {
      const filePath = path.join(config.paths.i18n, `${lang}.yml`);
      const content = fs.readFileSync(filePath, 'utf8');
      translations[lang] = yaml.load(content);
    }

    // Load calligraphy template
    const calligraphyTemplate = fs.readFileSync('_pages/calligraphy.html', 'utf8');

    // 3. Generate HTML for each language
    for (const lang of config.languages) {
      const langDir = lang === config.defaultLanguage ? '' : lang;
      const outputDir = path.join(config.paths.output, langDir);
      await fs.ensureDir(outputDir);

      const html = generateHTML(lang, translations, config);
      await fs.writeFile(path.join(outputDir, 'index.html'), html);
      console.log(`✅ Generated ${lang} homepage: ${langDir || '/'}/index.html`);

      const t = (key) => getTranslation(translations[lang], key);
      const calligraphyHtml = processTemplate(calligraphyTemplate, t, lang);
      const calligraphyDir = path.join(outputDir, 'calligraphy');
      await fs.ensureDir(calligraphyDir);
      await fs.writeFile(path.join(calligraphyDir, 'index.html'), calligraphyHtml);
      const calligraphyLogPath = lang === config.defaultLanguage
        ? '/calligraphy/index.html'
        : `/${lang}/calligraphy/index.html`;
      console.log(`✅ Generated ${lang} calligraphy page: ${calligraphyLogPath}`);
    }

    // 4. Process and copy CSS
    await fs.ensureDir(path.join(config.paths.output, 'css'));

    // Read source CSS
    const cssSource = fs.readFileSync('css/agency.css', 'utf8');

    // Copy unminified CSS
    await fs.writeFile(
      path.join(config.paths.output, 'css/agency.css'),
      cssSource
    );
    console.log('✅ Copied css/agency.css');

    // Minify and save
    const minified = csso.minify(cssSource);
    await fs.writeFile(
      path.join(config.paths.output, 'css/agency.min.css'),
      minified.css
    );
    console.log('✅ Generated css/agency.min.css (minified)');

    // 5. Copy other static assets (excluding css)
    const otherStatic = config.paths.static.filter(dir => dir !== 'css');
    for (const dir of otherStatic) {
      if (await fs.pathExists(dir)) {
        await fs.copy(dir, path.join(config.paths.output, dir));
        console.log(`✅ Copied static assets: ${dir}`);
      }
    }

    // 6. Generate SEO files
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>${config.site.url}/zh/</loc>
</url>
<url>
<loc>${config.site.url}/en/</loc>
</url>
<url>
<loc>${config.site.url}/</loc>
</url>
</urlset>
`;

    await fs.writeFile(path.join(config.paths.output, 'sitemap.xml'), sitemap);
    console.log('✅ Generated sitemap.xml');

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <generator uri="https://jekyllrb.com/" version="4.2.2">Jekyll</generator>
  <link href="${config.site.url}/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="${config.site.url}/" rel="alternate" type="text/html"/>
  <updated>${new Date().toISOString()}</updated>
  <id>${config.site.url}/feed.xml</id>
  <title type="html">${config.site.title}</title>
  <subtitle>${config.site.description}</subtitle>
</feed>`;

    await fs.writeFile(path.join(config.paths.output, 'feed.xml'), feed);
    console.log('✅ Generated feed.xml');

    const robots = `Sitemap: ${config.site.url}/sitemap.xml`;
    await fs.writeFile(path.join(config.paths.output, 'robots.txt'), robots);
    console.log('✅ Generated robots.txt');

    // 7. Copy other files
    const otherFiles = ['404.html', 'LICENSE', 'README.md'];
    for (const file of otherFiles) {
      if (await fs.pathExists(file)) {
        await fs.copy(file, path.join(config.paths.output, file));
      }
    }

    // 8. Copy others directory
    if (await fs.pathExists('others')) {
      await fs.copy('others', path.join(config.paths.output, 'others'));
      console.log('✅ Copied others directory');
    }

    // 9. Create /en/ as alias for English version
    await fs.ensureDir(path.join(config.paths.output, 'en'));
    const enHtml = generateHTML('en', translations, config);
    await fs.writeFile(path.join(config.paths.output, 'en/index.html'), enHtml);
    console.log('✅ Created /en/ alias');

    console.log('✨ Build complete!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

build();
