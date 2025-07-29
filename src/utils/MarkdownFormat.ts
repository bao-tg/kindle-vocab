import { Database } from 'sql.js';

export async function generateMarkdown(db: Database, sortOrder: string): Promise<string> {
	let query = `
		SELECT word, context, book_title, information, learned
		FROM MAIN
	`;

	if (sortOrder === 'timestamp') {
		query += ` ORDER BY rowid DESC`;
	} else if (sortOrder === 'unlearned') {
		query += ` ORDER BY learned ASC, rowid DESC`;
	}

	const result = db.exec(query);
	if (!result.length || !result[0].values.length) {
		return '# Recent Lookups\n\n_(No entries found)_';
	}

	const { columns, values } = result[0];
	const learnedCount = values.filter(row => row[columns.indexOf('learned')] === 1).length;
	const totalCount = values.length;
	const percent = Math.round((learnedCount / totalCount) * 100);

	let md = `# Recent Lookups\n\n📘 You’ve learned **${learnedCount}** out of **${totalCount}** words (${percent}%)\n\n`;

	for (const row of values) {
		const word = row[columns.indexOf('word')]?.toString().trim() || '(unknown)';
		const context = row[columns.indexOf('context')]?.toString().trim() || '(none)';
		const title = row[columns.indexOf('book_title')]?.toString().trim() || '(none)';
		const info = row[columns.indexOf('information')]?.toString().trim() || '(none)';
		const learned = row[columns.indexOf('learned')] === 1;

		md += `## ${word}\n\n`;
		md += `- **Context**: ${context}\n`;
		md += `- **Book Title**: ${title}\n`;
		md += `- **Learned**: <input type="checkbox" data-word="${word}" ${learned ? 'checked' : ''} />\n`;
		md += `- **Definition**:\n\n${info}\n\n---\n`;
	}

	return md;
}