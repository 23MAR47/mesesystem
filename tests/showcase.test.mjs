import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Script } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { INDUSTRY_DEMOS_META, SHOWCASES_META } from '../scripts/generate-showcase-pages.mjs';
import { describe, it, run } from './harness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOWCASES_DIR = path.join(ROOT, 'public', 'showcases');

function findLicense(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = findLicense(fullPath);
      if (nested) return nested;
    } else if (/^license(?:\.md)?$/i.test(entry.name)) {
      return fullPath;
    }
  }
  return null;
}

describe('14 extracted showcase demos', () => {
  it('generates public assets before development and production servers start', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    assert.equal(packageJson.scripts.predev, 'npm run showcases:build');
    assert.equal(packageJson.scripts.prebuild, 'npm run showcases:build');
  });

  it('has a generated page and preserved license for each project', () => {
    assert.equal(SHOWCASES_META.length, 14);

    for (const project of SHOWCASES_META) {
      const outputDir = path.join(SHOWCASES_DIR, project.slug);
      const pagePath = path.join(outputDir, 'index.html');
      const licensePath = path.join(outputDir, 'LICENSE.md');
      const sourceLicense = findLicense(path.join(ROOT, 'templates', `ternyon-${project.slug}`));

      assert.ok(fs.existsSync(pagePath), `${project.slug} demo page is missing`);
      assert.ok(sourceLicense, `${project.slug} source license is missing`);
      assert.deepEqual(fs.readFileSync(licensePath), fs.readFileSync(sourceLicense));

      const html = fs.readFileSync(pagePath, 'utf8');
      assert.ok(html.includes('Türkiye'), `${project.slug} lacks the Turkey label`);
      assert.ok(html.includes('id="hikaye"'), `${project.slug} lacks its introduction section`);
      assert.ok(html.includes('id="yaklasim"'), `${project.slug} lacks its approach section`);
      assert.ok(html.includes('id="deneyim"'), `${project.slug} lacks its experience section`);
      assert.ok(html.includes('aria-label="Sayfa bölümleri"'), `${project.slug} lacks section navigation`);
      assert.ok(html.includes('data-action='), `${project.slug} lacks an interactive control`);
      assert.ok(html.includes('bağımsız bir portfolyo demosudur'), `${project.slug} lacks the demo disclaimer`);
      assert.ok(html.includes(`/showcases/${project.slug}/LICENSE.md`), `${project.slug} license link is missing`);
      const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
      assert.ok(inlineScript, `${project.slug} interaction script is missing`);
      assert.doesNotThrow(() => new Script(inlineScript), `${project.slug} interaction script has invalid syntax`);
      for (const [, assetUrl] of html.matchAll(/src="(\/showcases\/[^"]+\/media\/[^"]+)"/g)) {
        assert.ok(fs.existsSync(path.join(ROOT, 'public', assetUrl.slice(1))), `${project.slug} media asset is missing`);
      }

      const publicEntries = fs.readdirSync(outputDir).sort();
      assert.deepEqual(publicEntries, ['LICENSE.md', 'index.html', ...(fs.existsSync(path.join(outputDir, 'media')) ? ['media'] : [])]);
      if (fs.existsSync(path.join(outputDir, 'media'))) {
        assert.equal(fs.readdirSync(path.join(outputDir, 'media'), { withFileTypes: true }).some((entry) => entry.isDirectory()), false);
      }
      assert.doesNotMatch(html, /https?:\/\//, `${project.slug} should not require remote services`);
    }
  });

  it('keeps extracted local demo cards linked to explicit static index routes', () => {
    const component = fs.readFileSync(path.join(ROOT, 'components', 'DemoShowcase.tsx'), 'utf8');
    assert.ok(component.includes('href={`/showcases/${project.slug}/index.html`}'));
    assert.ok(component.includes('<ShowcasePreview'));
    assert.doesNotMatch(component, /<iframe/);
    assert.ok(component.includes('id="demolar"'));
  });

  it('uses existing local image assets for lightweight project previews', () => {
    const projectConfig = fs.readFileSync(path.join(ROOT, 'config', 'showcaseProjects.ts'), 'utf8');
    const assets = [...projectConfig.matchAll(/previewImage: '([^']+)'/g)];
    assert.ok(assets.length > 0);

    for (const [, assetPath] of assets) {
      assert.ok(fs.existsSync(path.join(ROOT, 'public', assetPath.slice(1))), `${assetPath} is missing`);
    }
  });

  it('provides a navigable master showcase index', () => {
    const master = fs.readFileSync(path.join(SHOWCASES_DIR, 'index.html'), 'utf8');
    for (const project of SHOWCASES_META) {
      assert.ok(master.includes(`/showcases/${project.slug}/index.html`), `${project.slug} is not linked from the index`);
    }
    assert.doesNotMatch(master, /eraslansoftware\.com/i);
  });
});

describe('13 industry demo sites', () => {
  it('keeps standalone demos available, interactive, and linked from the master index', () => {
    assert.equal(INDUSTRY_DEMOS_META.length, 13);
    const master = fs.readFileSync(path.join(SHOWCASES_DIR, 'index.html'), 'utf8');
    const projectConfig = fs.readFileSync(path.join(ROOT, 'config', 'showcaseProjects.ts'), 'utf8');

    for (const project of INDUSTRY_DEMOS_META) {
      const pagePath = path.join(SHOWCASES_DIR, project.slug, 'index.html');
      assert.ok(fs.existsSync(pagePath), `${project.slug} demo page is missing`);

      const html = fs.readFileSync(pagePath, 'utf8');
      assert.match(html, /<html\b[^>]*lang="tr"/i, `${project.slug} is missing Turkish document language`);
      assert.match(html, /<meta\b[^>]*name="viewport"/i, `${project.slug} is missing responsive viewport metadata`);
      assert.match(html, /demo|örnek|temsili/i, `${project.slug} lacks a demo disclosure`);
      const renderedTitle = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replaceAll('&amp;', '&');
      assert.ok(renderedTitle?.startsWith(project.title), `${project.slug} title differs from showcase metadata`);
      assert.ok(projectConfig.includes(`slug: '${project.slug}'`), `${project.slug} is missing from the site showcase`);
      assert.ok(master.includes(`/showcases/${project.slug}/index.html`), `${project.slug} is missing from the master index`);

      const inlineScripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
        .filter(([, inlineScript]) => inlineScript.trim().length > 0);
      assert.ok(inlineScripts.length > 0, `${project.slug} interaction script is missing`);
      for (const [, inlineScript] of inlineScripts) {
        assert.doesNotThrow(() => new Script(inlineScript), `${project.slug} interaction script has invalid syntax`);
      }
      assert.doesNotMatch(html, /<form\b[^>]*action=["']https?:/i, `${project.slug} must not submit demo form data externally`);
    }
  });
});

run();
