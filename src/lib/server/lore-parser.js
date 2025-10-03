import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';
import { marked } from 'marked';

const LORE_CONTENT_DIR = path.join(process.cwd(), 'src/lib/lore-content');

// Load entity map for wiki linking
let entityMap = {};
try {
	const entityMapPath = path.join(process.cwd(), 'src/lib/entity-map.json');
	entityMap = JSON.parse(fs.readFileSync(entityMapPath, 'utf-8'));
} catch (error) {
	console.warn('Entity map not found, wiki linking will be disabled');
}

/**
 * Get all entries for a specific category
 * @param {string} category - The category name (characters, locations, etc.)
 * @returns {Array} Array of entry objects with metadata
 */
export function getAllEntries(category) {
	const categoryDir = path.join(LORE_CONTENT_DIR, category);
	
	if (!fs.existsSync(categoryDir)) {
		return [];
	}
	
	const files = fs.readdirSync(categoryDir).filter(file => file.endsWith('.md'));
	
	return files.map(file => {
		const filePath = path.join(categoryDir, file);
		const content = fs.readFileSync(filePath, 'utf-8');
		const metadata = extractFrontmatter(content);
		
		return {
			...metadata,
			slug: path.basename(file, '.md'),
			category
		};
	}).sort((a, b) => a.title.localeCompare(b.title, 'ru'));
}

/**
 * Get a specific entry by category and slug
 * @param {string} category - The category name
 * @param {string} slug - The entry slug
 * @returns {Object|null} Entry object with metadata and content
 */
export function getEntry(category, slug) {
	const filePath = path.join(LORE_CONTENT_DIR, category, `${slug}.md`);
	
	if (!fs.existsSync(filePath)) {
		return null;
	}
	
	const content = fs.readFileSync(filePath, 'utf-8');
	const { frontmatter, body } = parseFrontmatter(content);
	
	// Process wiki links in content first
	const processedBody = processWikiLinks(body);
	
	// Convert markdown to HTML
	const htmlContent = marked(processedBody);
	
	return {
		metadata: {
			...frontmatter,
			category,
			slug
		},
		content: htmlContent
	};
}

/**
 * Get all entries across all categories
 * @returns {Array} Array of all entries
 */
export function getAllEntriesFlat() {
	const categories = ['characters', 'locations', 'factions', 'artifacts', 'concepts', 'creatures'];
	const allEntries = [];
	
	categories.forEach(category => {
		const entries = getAllEntries(category);
		allEntries.push(...entries);
	});
	
	return allEntries;
}

/**
 * Search entries by title or content
 * @param {string} query - Search query
 * @returns {Array} Array of matching entries
 */
export function searchEntries(query) {
	const allEntries = getAllEntriesFlat();
	const lowerQuery = query.toLowerCase();
	
	return allEntries.filter(entry => 
		entry.title.toLowerCase().includes(lowerQuery) ||
		(entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
	);
}

/**
 * Get a random entry
 * @returns {Object} Random entry object
 */
export function getRandomEntry() {
	const allEntries = getAllEntriesFlat();
	const randomIndex = Math.floor(Math.random() * allEntries.length);
	return allEntries[randomIndex];
}

/**
 * Get backlinks for an entry
 * @param {string} category - The category name
 * @param {string} slug - The entry slug
 * @returns {Array} Array of entries that link to this entry
 */
export function getBacklinks(category, slug) {
	const allEntries = getAllEntriesFlat();
	const targetEntry = getEntry(category, slug);
	
	if (!targetEntry) return [];
	
	const backlinks = [];
	
	allEntries.forEach(entry => {
		const fullEntry = getEntry(entry.category, entry.slug);
		if (fullEntry && fullEntry.content.includes(`[[${targetEntry.metadata.title}]]`)) {
			backlinks.push(entry);
		}
	});
	
	return backlinks;
}

/**
 * Extract frontmatter metadata only
 * @param {string} content - Raw markdown content
 * @returns {Object} Parsed frontmatter
 */
function extractFrontmatter(content) {
	const { frontmatter } = parseFrontmatter(content);
	return frontmatter;
}

/**
 * Parse frontmatter and body from markdown content
 * @param {string} content - Raw markdown content
 * @returns {Object} Object with frontmatter and body
 */
function parseFrontmatter(content) {
	const frontmatterRegex = /^---\s*\n(.*?)\n---\s*\n(.*)$/s;
	const match = content.match(frontmatterRegex);
	
	if (!match) {
		return { frontmatter: {}, body: content };
	}
	
	try {
		const frontmatter = parse(match[1]);
		const body = match[2];
		return { frontmatter, body };
	} catch (error) {
		console.error('Error parsing frontmatter:', error);
		return { frontmatter: {}, body: content };
	}
}

/**
 * Process wiki links in content
 * @param {string} content - Markdown content with [[WikiLinks]]
 * @returns {string} Content with processed links
 */
function processWikiLinks(content) {
	const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
	
	return content.replace(wikiLinkRegex, (match, linkText) => {
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
 * @param {string} category - Category name
 * @returns {Object} Category display info
 */
export function getCategoryInfo(category) {
	const categoryInfo = {
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
	
	return categoryInfo[category] || {
		title: category,
		description: ''
	};
}