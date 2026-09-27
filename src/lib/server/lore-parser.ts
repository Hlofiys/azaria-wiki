import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';
import { Marked } from 'marked';
import type { CategoryType } from '../utils/categories.js';
import { categoryDescriptions, categoryNames } from '../utils/categories.js';

// Type definitions
export interface EntryMetadata {
	title: string;
	type?: string;
	status?: string;
	age?: string;
	population?: string;
	location?: string;
	faction?: string;
	tags?: string[];
	image?: string;
	ruler?: string;
	owner?: string;
	realm?: string;
	length?: string;
	effect?: string;
	description?: string;
	creator?: string;
	era?: string;
	nickname?: string;
	feature?: string;
	access?: string;
	members?: string;
	philosophy?: string;
	specialization?: string;
	category: CategoryType;
	slug: string;
	updated?: string;
	[key: string]: unknown;
}

export interface TocItem {
	id: string;
	text: string;
	level: number;
}

export interface Entry {
	metadata: EntryMetadata;
	content: string;
	toc: TocItem[];
}

export interface EntryListItem {
	title: string;
	slug: string;
	category: CategoryType;
	type?: string;
	status?: string;
	age?: string;
	population?: string;
	location?: string;
	faction?: string;
	tags?: string[];
	updated?: string;
	[key: string]: unknown;
}

export interface EntityMapEntry {
	category: CategoryType;
	slug: string;
	title: string;
}

export interface CategoryInfo {
	title: string;
	description: string;
}

export interface FrontmatterResult {
	frontmatter: Partial<EntryMetadata>;
	body: string;
}

const LORE_CONTENT_DIR = path.join(process.cwd(), 'src/lib/lore-content');

const CATEGORY_DIRS: CategoryType[] = [
	'characters',
	'locations',
	'factions',
	'artifacts',
	'concepts',
	'creatures'
];

// Enhanced caching system for server-side operations
const serverCache = new Map<string, unknown>();
const cacheTimestamps = new Map<string, number>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache in development

// Load entity map for wiki linking with caching
let entityMap: Record<string, EntityMapEntry> = {};
try {
	const entityMapPath = path.join(process.cwd(), 'src/lib/entity-map.json');
	const cacheKey = 'entity-map';

	if (serverCache.has(cacheKey) && isValidCache(cacheKey)) {
		entityMap = serverCache.get(cacheKey) as Record<string, EntityMapEntry>;
	} else {
		entityMap = JSON.parse(fs.readFileSync(entityMapPath, 'utf-8'));
		serverCache.set(cacheKey, entityMap);
		cacheTimestamps.set(cacheKey, Date.now());
	}
} catch {
	console.warn('Entity map not found, wiki linking will be disabled');
}

// Cache validation helper
function isValidCache(key: string): boolean {
	const timestamp = cacheTimestamps.get(key);
	if (!timestamp) return false;
	return Date.now() - timestamp < CACHE_TTL;
}

/* --------------------------------------------------------------------------
   Heading anchors and table of contents
   -------------------------------------------------------------------------- */

const TRANSLIT: Record<string, string> = {
	а: 'a',
	б: 'b',
	в: 'v',
	г: 'g',
	д: 'd',
	е: 'e',
	ё: 'e',
	ж: 'zh',
	з: 'z',
	и: 'i',
	й: 'y',
	к: 'k',
	л: 'l',
	м: 'm',
	н: 'n',
	о: 'o',
	п: 'p',
	р: 'r',
	с: 's',
	т: 't',
	у: 'u',
	ф: 'f',
	х: 'h',
	ц: 'ts',
	ч: 'ch',
	ш: 'sh',
	щ: 'shch',
	ъ: '',
	ы: 'y',
	ь: '',
	э: 'e',
	ю: 'yu',
	я: 'ya'
};

/** Stable, readable anchor ids for Russian headings: «ВНЕШНИЙ ВИД» → #vneshniy-vid */
export function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.split('')
		.map((char) => TRANSLIT[char] ?? char)
		.join('')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 64);
}

/** Pull h2/h3 headings out of raw markdown before it is converted to HTML. */
function extractToc(markdown: string): TocItem[] {
	const toc: TocItem[] = [];
	const seen = new Map<string, number>();

	for (const line of markdown.split('\n')) {
		const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
		if (!match) continue;

		const text = match[2].replace(/[*_`]/g, '').trim();
		const base = slugifyHeading(text) || 'section';
		const count = (seen.get(base) ?? 0) + 1;
		seen.set(base, count);

		toc.push({ id: count === 1 ? base : `${base}-${count}`, text, level: match[1].length });
	}

	return toc;
}

/** Add ids + anchor links to markdown headings, using the same slugs as the TOC. */
function createMarked() {
	const instance = new Marked();
	const seen = new Map<string, number>();

	const escapeHtml = (value: string) =>
		value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');

	instance.use({
		renderer: {
			heading(token) {
				const plain = String(token.text).replace(/[*_`]/g, '').trim();
				const base = slugifyHeading(plain) || 'section';
				const count = (seen.get(base) ?? 0) + 1;
				seen.set(base, count);
				const id = count === 1 ? base : `${base}-${count}`;

				return `<h${token.depth} id="${id}"><a class="anchor-link" href="#${id}">${escapeHtml(plain)}</a></h${token.depth}>`;
			}
		}
	});

	return instance;
}

/* --------------------------------------------------------------------------
   Link index — which entries link to which titles (single pass over the files)
   -------------------------------------------------------------------------- */

interface LinkIndex {
	counts: Record<string, number>;
	sources: Record<string, string[]>;
}

const WIKI_LINK = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g;

function buildLinkIndex(): LinkIndex {
	const cacheKey = 'link-index';
	if (serverCache.has(cacheKey) && isValidCache(cacheKey)) {
		return serverCache.get(cacheKey) as LinkIndex;
	}

	const sources = new Map<string, Set<string>>();

	for (const category of CATEGORY_DIRS) {
		const dir = path.join(LORE_CONTENT_DIR, category);
		if (!fs.existsSync(dir)) continue;

		for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.md'))) {
			const body = fs.readFileSync(path.join(dir, file), 'utf-8');
			const slug = path.basename(file, '.md');

			for (const match of body.matchAll(WIKI_LINK)) {
				const target = match[1].trim().toLowerCase();
				if (!target) continue;
				const set = sources.get(target) ?? new Set<string>();
				set.add(`${category}/${slug}`);
				sources.set(target, set);
			}
		}
	}

	const counts: Record<string, number> = {};
	const flat: Record<string, string[]> = {};
	for (const [target, set] of sources) {
		counts[target] = set.size;
		flat[target] = [...set];
	}

	const index: LinkIndex = { counts, sources: flat };
	serverCache.set(cacheKey, index);
	cacheTimestamps.set(cacheKey, Date.now());
	return index;
}

export function getLinkCounts(): Record<string, number> {
	return buildLinkIndex().counts;
}

// Clear expired cache entries
function clearExpiredCache(): void {
	const now = Date.now();
	for (const [key, timestamp] of cacheTimestamps.entries()) {
		if (now - timestamp > CACHE_TTL) {
			serverCache.delete(key);
			cacheTimestamps.delete(key);
		}
	}
}

/**
 * Get all entries for a specific category (optimized with caching)
 * @param category - The category name (characters, locations, etc.)
 * @returns Array of entry objects with metadata
 */
export function getAllEntries(category: CategoryType): EntryListItem[] {
	const cacheKey = `category-${category}`;

	// Check cache first
	if (serverCache.has(cacheKey) && isValidCache(cacheKey)) {
		return serverCache.get(cacheKey) as EntryListItem[];
	}

	const categoryDir = path.join(LORE_CONTENT_DIR, category);

	if (!fs.existsSync(categoryDir)) {
		const emptyResult: EntryListItem[] = [];
		serverCache.set(cacheKey, emptyResult);
		cacheTimestamps.set(cacheKey, Date.now());
		return emptyResult;
	}

	try {
		const files = fs.readdirSync(categoryDir).filter((file) => file.endsWith('.md'));

		const entries = files
			.map((file) => {
				const filePath = path.join(categoryDir, file);
				const content = fs.readFileSync(filePath, 'utf-8');
				const metadata = extractFrontmatter(content);

				return {
					title: metadata.title || 'Untitled',
					...metadata,
					slug: path.basename(file, '.md'),
					category,
					updated: fs.statSync(filePath).mtime.toISOString()
				} as EntryListItem;
			})
			.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ru')); // Sort for consistent ordering

		// Cache the result
		serverCache.set(cacheKey, entries);
		cacheTimestamps.set(cacheKey, Date.now());

		return entries;
	} catch (error) {
		console.error(`Error loading entries for category ${category}:`, error);
		const emptyResult: EntryListItem[] = [];
		serverCache.set(cacheKey, emptyResult);
		cacheTimestamps.set(cacheKey, Date.now());
		return emptyResult;
	}
}

/**
 * Get a specific entry by category and slug
 * @param category - The category name
 * @param slug - The entry slug
 * @returns Entry object with metadata and content
 */
export async function getEntry(category: CategoryType, slug: string): Promise<Entry | null> {
	const filePath = path.join(LORE_CONTENT_DIR, category, `${slug}.md`);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const content = fs.readFileSync(filePath, 'utf-8');
	const { frontmatter, body } = parseFrontmatter(content);

	// Process wiki links in content first
	const processedBody = processWikiLinks(body);

	// Convert markdown to HTML (headings get ids + anchor links)
	const md = createMarked();
	const htmlContent = md.parse(processedBody, { async: false });

	return {
		metadata: {
			title: frontmatter.title || 'Untitled',
			...frontmatter,
			category,
			slug,
			updated: fs.statSync(filePath).mtime.toISOString()
		} as EntryMetadata,
		content: htmlContent,
		toc: extractToc(body)
	};
}

/**
 * Get all entries across all categories
 * @returns Array of all entries
 */
export function getAllEntriesFlat(): EntryListItem[] {
	const cacheKey = 'all-entries-flat';

	// Check cache first
	if (serverCache.has(cacheKey) && isValidCache(cacheKey)) {
		return serverCache.get(cacheKey) as EntryListItem[];
	}

	// Clear expired cache periodically
	clearExpiredCache();

	try {
		const allEntries = CATEGORY_DIRS.flatMap((category) => getAllEntries(category));

		// Cache the result
		serverCache.set(cacheKey, allEntries);
		cacheTimestamps.set(cacheKey, Date.now());

		return allEntries;
	} catch (error) {
		console.error('Error loading all entries:', error);
		return [];
	}
}

/**
 * Search entries by title or content
 * @param query - Search query
 * @returns Array of matching entries
 */
export function searchEntries(query: string): EntryListItem[] {
	const allEntries = getAllEntriesFlat();
	const lowerQuery = query.toLowerCase();

	return allEntries.filter(
		(entry) =>
			(entry.title || '').toLowerCase().includes(lowerQuery) ||
			(entry.tags && entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)))
	);
}

/**
 * Get a random entry
 * @returns Random entry object
 */
export function getRandomEntry(): EntryListItem | undefined {
	const allEntries = getAllEntriesFlat();
	if (allEntries.length === 0) return undefined;

	const randomIndex = Math.floor(Math.random() * allEntries.length);
	return allEntries[randomIndex];
}

/**
 * Get backlinks for an entry
 * @param category - The category name
 * @param slug - The entry slug
 * @returns Array of entries that link to this entry
 */
export async function getBacklinks(category: CategoryType, slug: string): Promise<EntryListItem[]> {
	const entry = await getEntry(category, slug);
	if (!entry) return [];

	const { sources } = buildLinkIndex();
	const keys = new Set(sources[(entry.metadata.title ?? '').toLowerCase()] ?? []);

	return getAllEntriesFlat().filter((item) => keys.has(`${item.category}/${item.slug}`));
}

/**
 * Extract frontmatter metadata only
 * @param content - Raw markdown content
 * @returns Parsed frontmatter
 */
function extractFrontmatter(content: string): Partial<EntryMetadata> {
	const { frontmatter } = parseFrontmatter(content);
	return frontmatter;
}

/**
 * Parse frontmatter and body from markdown content
 * @param content - Raw markdown content
 * @returns Object with frontmatter and body
 */
function parseFrontmatter(content: string): FrontmatterResult {
	const frontmatterRegex = /^---\s*\n(.*?)\n---\s*\n(.*)$/s;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return { frontmatter: { title: 'Untitled' }, body: content };
	}

	try {
		const frontmatter = parse(match[1]) as Record<string, unknown>;
		const body = match[2];
		return {
			frontmatter: {
				title: (frontmatter.title as string) || 'Untitled',
				...frontmatter
			},
			body
		};
	} catch (error) {
		console.error('Error parsing frontmatter:', error);
		return { frontmatter: { title: 'Untitled' }, body: content };
	}
}

/**
 * Process wiki links in content
 * @param content - Markdown content with [[WikiLinks]]
 * @returns Content with processed links
 */
function processWikiLinks(content: string): string {
	const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;

	return content.replace(wikiLinkRegex, (match, inner: string) => {
		const [targetRaw, displayRaw] = inner.split('|');
		const target = targetRaw.trim();
		const display = (displayRaw ?? targetRaw).trim();
		const entityInfo = entityMap[target.toLowerCase()];

		if (entityInfo) {
			return `<a href="/${entityInfo.category}/${entityInfo.slug}" class="wiki-link" title="${entityInfo.title}">${display}</a>`;
		}

		// If no match found, return the original text but styled as a missing link
		return `<span class="wiki-link-missing" title="Article not found: ${target}">${display}</span>`;
	});
}

/**
 * Get category display information
 * @param category - Category name
 * @returns Category display info
 */
export function getCategoryInfo(category: CategoryType): CategoryInfo {
	const categoryInfo: Record<CategoryType, CategoryInfo> = {
		characters: {
			title: categoryNames.characters.plural,
			description: categoryDescriptions.characters
		},
		locations: {
			title: categoryNames.locations.plural,
			description: categoryDescriptions.locations
		},
		factions: { title: categoryNames.factions.plural, description: categoryDescriptions.factions },
		artifacts: {
			title: categoryNames.artifacts.plural,
			description: categoryDescriptions.artifacts
		},
		concepts: { title: categoryNames.concepts.plural, description: categoryDescriptions.concepts },
		creatures: {
			title: categoryNames.creatures.plural,
			description: categoryDescriptions.creatures
		}
	};

	return (
		categoryInfo[category] || {
			title: category,
			description: ''
		}
	);
}
