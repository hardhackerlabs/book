import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagesDir = path.join(root, "pages");
const publicDir = path.join(root, "public");
const outDir = path.join(root, "obsidian-vault");
const siteBase = "https://book.hardhacker.com";

const sectionDirs = new Set(["idea", "build", "launch", "grow", "review", "appendix"]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function emptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { frontmatter: {}, body: raw };
  const end = raw.indexOf("\n---", 4);
  if (end === -1) return { frontmatter: {}, body: raw };
  const block = raw.slice(4, end).trim();
  const body = raw.slice(end + 4).replace(/^\s*\n/, "");
  const frontmatter = {};
  for (const line of block.split("\n")) {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) frontmatter[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return { frontmatter, body };
}

function toFileName(title) {
  return `${title.replace(/[\\/:*?"<>|]/g, "-")}.md`;
}

function routeFor(dir, slug) {
  if (slug === "index") return "/";
  return `/${[dir, slug].filter(Boolean).join("/")}`;
}

function routeFromHref(href) {
  let value = href.trim();
  if (value.startsWith(siteBase)) value = value.slice(siteBase.length);
  if (!value.startsWith("/")) return null;
  value = value.replace(/\/$/, "") || "/";
  return value;
}

function relativeMarkdownPath(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replaceAll(path.sep, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return encodeURI(rel);
}

function relativeAssetPath(fromFile, assetPath) {
  const clean = assetPath.replace(/^\/+/, "").replace(/^public\//, "");
  const target = path.join(outDir, clean);
  let rel = path.relative(path.dirname(fromFile), target).replaceAll(path.sep, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return encodeURI(rel);
}

function collectPages() {
  const rootMeta = readJson(path.join(pagesDir, "_meta.json"));
  const pages = [];

  for (const [key, value] of Object.entries(rootMeta)) {
    if (typeof value === "object" && value.type === "menu") {
      continue;
    }

    if (sectionDirs.has(key)) {
      const sectionTitle = typeof value === "string" ? value : value.title;
      const sectionMeta = readJson(path.join(pagesDir, key, "_meta.json"));
      for (const [slug, title] of Object.entries(sectionMeta)) {
        const source = path.join(pagesDir, key, `${slug}.mdx`);
        if (!fs.existsSync(source)) continue;
        pages.push({
          section: sectionTitle,
          sectionSlug: key,
          slug,
          title,
          route: routeFor(key, slug),
          source,
        });
      }
      continue;
    }

    const source = path.join(pagesDir, `${key}.mdx`);
    if (!fs.existsSync(source)) continue;
    pages.push({
      section: "首页",
      sectionSlug: "",
      slug: key,
      title: typeof value === "string" ? value : value.title,
      route: routeFor("", key),
      source,
    });
  }

  return pages;
}

function buildTargets(pages) {
  const byRoute = new Map();
  for (const page of pages) {
    const dir = page.sectionSlug ? path.join(outDir, page.section) : outDir;
    const file = path.join(dir, toFileName(page.title));
    page.outFile = file;
    byRoute.set(page.route, file);
  }
  return byRoute;
}

function convertHtmlImageLinks(markdown, outFile) {
  return markdown.replace(
    /<a\s+href="([^"]+)"[^>]*>\s*<img\s+([^>]*?)src="([^"]+)"([^>]*?)\/?>\s*<\/a>/gis,
    (_all, href, before, src, after) => {
      const altMatch = `${before} ${after}`.match(/\balt="([^"]*)"/i);
      const widthMatch = `${before} ${after}`.match(/\bwidth="([^"]*)"/i);
      const alt = altMatch?.[1] || "";
      const asset = relativeAssetPath(outFile, src);
      const width = widthMatch ? ` width="${widthMatch[1]}"` : "";
      return `<a href="${href}"><img src="${asset}" alt="${alt}"${width}></a>`;
    },
  );
}

function convertStandaloneImages(markdown, outFile) {
  return markdown.replace(/<img\s+([^>]*?)src="([^"]+)"([^>]*?)\/?>/gi, (_all, before, src, after) => {
    const attrs = `${before} ${after}`;
    const altMatch = attrs.match(/\balt="([^"]*)"/i);
    const widthMatch = attrs.match(/\bwidth="([^"]*)"/i) || attrs.match(/style=\{\{width:\s*(\d+)\s*\+\s*'px'\}\}/i);
    const alt = altMatch?.[1] || "";
    const width = widthMatch ? ` width="${widthMatch[1]}"` : "";
    return `<img src="${relativeAssetPath(outFile, src)}" alt="${alt}"${width}>`;
  });
}

function convertMarkdownImages(markdown, outFile) {
  return markdown.replace(/!\[([^\]]*)\]\((\/attachments\/[^)]+)\)/g, (_all, alt, src) => {
    return `![${alt}](${relativeAssetPath(outFile, src)})`;
  });
}

function convertLinks(markdown, page, byRoute) {
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (all, label, href) => {
    const route = routeFromHref(href);
    if (!route || !byRoute.has(route)) return all;
    return `[${label}](${relativeMarkdownPath(page.outFile, byRoute.get(route))})`;
  });
}

function convertBareBookUrls(markdown, page, byRoute) {
  return markdown.replace(/https:\/\/book\.hardhacker\.com(\/[A-Za-z0-9_/-]*)/g, (all, route) => {
    const normalized = route.replace(/\/$/, "") || "/";
    if (!byRoute.has(normalized)) return all;
    return relativeMarkdownPath(page.outFile, byRoute.get(normalized));
  });
}

function normalizeMdx(markdown, page, byRoute) {
  let output = markdown;
  output = output.replace(/<p align="center">\s*/g, '<p align="center">\n');
  output = output.replace(/\s*<\/p>/g, "\n</p>");
  output = output.replace(/<a rev="license" href="([^"]+)">([^<]+)<\/a>/g, "[$2]($1)");
  output = convertHtmlImageLinks(output, page.outFile);
  output = convertStandaloneImages(output, page.outFile);
  output = convertMarkdownImages(output, page.outFile);
  output = convertLinks(output, page, byRoute);
  output = convertBareBookUrls(output, page, byRoute);
  output = output.replace(/[ \t]+\n/g, "\n");
  return output.trim();
}

function pageFrontmatter(page, title) {
  return [
    "---",
    `title: "${title.replaceAll('"', '\\"')}"`,
    `source: "${page.route}"`,
    `section: "${page.section}"`,
    "---",
    "",
  ].join("\n");
}

function pageNavigation(page, previous, next) {
  const lines = ["", "", "---", "", "## 页面导航", ""];
  if (previous) lines.push(`上一页： [${previous.title}](${relativeMarkdownPath(page.outFile, previous.outFile)})`);
  lines.push(`总目录： [硬地骇客 - 目录](${relativeMarkdownPath(page.outFile, path.join(outDir, "硬地骇客 - 目录.md"))})`);
  if (next) lines.push(`下一页： [${next.title}](${relativeMarkdownPath(page.outFile, next.outFile)})`);
  lines.push("");
  return lines.join("\n");
}

function writePage(page, index, pages, byRoute) {
  const raw = fs.readFileSync(page.source, "utf8");
  const { frontmatter, body } = parseFrontmatter(raw);
  const title = frontmatter.title || page.title;
  const markdown = normalizeMdx(body, page, byRoute);
  const previous = pages[index - 1];
  const next = pages[index + 1];

  ensureDir(path.dirname(page.outFile));
  fs.writeFileSync(
    page.outFile,
    `${pageFrontmatter(page, title)}# ${title}\n\n${markdown}${pageNavigation(page, previous, next)}`,
  );
}

function writeIndex(pages) {
  const lines = [
    "---",
    'title: "硬地骇客 - 目录"',
    "---",
    "",
    "# 硬地骇客 - 目录",
    "",
    "这是从 Nextra/MDX 版本导出的 Obsidian 本地 Markdown 目录。",
    "",
  ];

  let currentSection = "";
  for (const page of pages) {
    if (page.section !== currentSection) {
      currentSection = page.section;
      lines.push(`## ${currentSection}`, "");
    }
    lines.push(`- [${page.title}](${relativeMarkdownPath(path.join(outDir, "硬地骇客 - 目录.md"), page.outFile)})`);
  }

  fs.writeFileSync(path.join(outDir, "硬地骇客 - 目录.md"), `${lines.join("\n")}\n`);
}

function writeReadme() {
  const text = [
    "# Obsidian 浏览说明",
    "",
    "这个目录由 `scripts/export-obsidian.mjs` 自动生成，可以作为 Obsidian vault 打开。",
    "",
    "- 入口文件：`硬地骇客 - 目录.md`",
    "- 图片资源：`attachments/`",
    "- 每篇文章底部都有上一页、总目录、下一页导航",
    "- 原网页中的 HTML 图片、折叠块和表格会尽量保留为 Obsidian 可显示的 Markdown/HTML",
    "",
    "如需重新生成，回到项目根目录运行：",
    "",
    "```sh",
    "node scripts/export-obsidian.mjs",
    "```",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(outDir, "README.md"), text);
}

emptyDir(outDir);
copyDir(path.join(publicDir, "attachments"), path.join(outDir, "attachments"));

const pages = collectPages();
const byRoute = buildTargets(pages);

pages.forEach((page, index) => writePage(page, index, pages, byRoute));
writeIndex(pages);
writeReadme();

console.log(`Exported ${pages.length} pages to ${path.relative(root, outDir)}`);
