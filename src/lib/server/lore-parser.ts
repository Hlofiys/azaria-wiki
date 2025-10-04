import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';
import { marked } from 'marked';
import type { CategoryType } from '../icons.js';

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
	[key: string]: unknown;
}

export interface Entry {
	metadata: EntryMetadata;
	content: string;
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

// Load entity map for wiki linking
let entityMap: Record<string, EntityMapEntry> = {};
try {
	const entityMapPath = path.join(process.cwd(), 'src/lib/entity-map.json');
	entityMap = JSON.parse(fs.readFileSync(entityMapPath, 'utf-8'));
} catch {
	console.warn('Entity map not found, wiki linking will be disabled');
}

/**
 * Get all entries for a specific category
 * @param category - The category name (characters, locations, etc.)
 * @returns Array of entry objects with metadata
 */
export function getAllEntries(category: CategoryType): EntryListItem[] {
	const categoryDir = path.join(LORE_CONTENT_DIR, category);

	if (!fs.existsSync(categoryDir)) {
		return [];
	}

	const files = fs.readdirSync(categoryDir).filter((file) => file.endsWith('.md'));

	return files
		.map((file) => {
			const filePath = path.join(categoryDir, file);
			const content = fs.readFileSync(filePath, 'utf-8');
			const metadata = extractFrontmatter(content);

			return {
				title: metadata.title || 'Untitled',
				...metadata,
				slug: path.basename(file, '.md'),
				category
			} as EntryListItem;
		});
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

	// Convert markdown to HTML
	const htmlContent = await marked(processedBody);

	return {
		metadata: {
			title: frontmatter.title || 'Untitled',
			...frontmatter,
			category,
			slug
		} as EntryMetadata,
		content: htmlContent
	};
}

/**
 * Get all entries across all categories
 * @returns Array of all entries
 */
export function getAllEntriesFlat(): EntryListItem[] {
	const categories: CategoryType[] = [
		'characters',
		'locations',
		'factions',
		'artifacts',
		'concepts',
		'creatures'
	];
	const allEntries: EntryListItem[] = [];

	categories.forEach((category) => {
		const entries = getAllEntries(category);
		allEntries.push(...entries);
	});

	return allEntries;
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
	const allEntries = getAllEntriesFlat();
	const targetEntry = await getEntry(category, slug);

	if (!targetEntry) return [];

	const backlinks: EntryListItem[] = [];

	for (const entry of allEntries) {
		const fullEntry = await getEntry(entry.category, entry.slug);
		if (fullEntry && fullEntry.content.includes(`[[${targetEntry.metadata.title || ''}]]`)) {
			backlinks.push(entry);
		}
	}

	return backlinks;
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

	return content.replace(wikiLinkRegex, (match, linkText: string) => {
		const entityInfo = entityMap[linkText.toLowerCase()];

		if (entityInfo) {
			return `<a href="/${entityInfo.category}/${entityInfo.slug}" class="wiki-link" title="${entityInfo.title}">${linkText}</a>`;
		}

		// If no match found, return the original text but styled as a missing link
		return `<span class="wiki-link-missing" title="Article not found: ${linkText}">${linkText}</span>`;
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
			title: 'Персонажи',
			description: 'Влиятельные личности мира Азарии'
		},
		locations: {
			title: 'Локации',
			description: 'Города, крепости и загадочные места'
		},
		factions: {
			title: 'Фракции',
			description: 'Государства, организации и союзы'
		},
		artifacts: {
			title: 'Артефакты',
			description: 'Магические предметы и реликвии'
		},
		concepts: {
			title: 'Концепции',
			description: 'Философии и принципы мира Азарии'
		},
		creatures: {
			title: 'Существа',
			description: 'Монстры, демоны и фантастические создания'
		}
	};

	return (
		categoryInfo[category] || {
			title: category,
			description: ''
		}
	);
}
