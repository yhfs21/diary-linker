import {App, Notice, TFile, TFolder} from "obsidian";
import {DiaryLinkerSettings} from "../settings";
import {formatDay, formatMonth, formatYear} from "../utils/dates";

const PLACEHOLDER = "{{diary-link}}";
const TEMPLATE_ROOT = "Templates";

export class DiaryService {
	private app: App;
	private settings: DiaryLinkerSettings;

	constructor(app: App, settings: DiaryLinkerSettings) {
		this.app = app;
		this.settings = settings;
	}

	updateSettings(settings: DiaryLinkerSettings) {
		this.settings = settings;
	}

	async openOrCreateForDate(date: Date): Promise<void> {
		const diaryFolder = this.settings.diaryFolder.trim();
		const templatePath = this.settings.templatePath.trim();

		if (!diaryFolder) {
			new Notice("Diary folder is not set.");
			return;
		}

		if (!templatePath) {
			new Notice("Template note is not set.");
			return;
		}

		if (!this.isTemplateInTemplatesFolder(templatePath)) {
			new Notice("Template note must be inside the templates folder.");
			return;
		}

		const templateFile = this.getFileByPath(templatePath);
		if (!templateFile) {
			new Notice("Template note not found.");
			return;
		}

		const templateContent = await this.app.vault.read(templateFile);
		if (!templateContent.includes(PLACEHOLDER)) {
			new Notice("Template note must include {{diary-link}}.");
			return;
		}

		const year = formatYear(date);
		const month = formatMonth(date);
		const day = formatDay(date);

		const diaryRootFolder = diaryFolder;
		const yearFolder = `${diaryRootFolder}/${year}`;
		const monthFolder = `${yearFolder}/${month}`;

		const diaryRootNotePath = `${diaryRootFolder}/${diaryRootFolder}.md`;
		const yearNotePath = `${yearFolder}/${year}.md`;
		const monthNotePath = `${monthFolder}/${month}.md`;
		const dayNotePath = `${monthFolder}/${day}.md`;

		try {
			await this.ensureFolder(diaryRootFolder);
			await this.ensureFolder(yearFolder);
			await this.ensureFolder(monthFolder);

			const rootLinkTarget = this.toLinkTarget(diaryRootNotePath);
			const yearLinkTarget = this.toLinkTarget(diaryRootNotePath);
			const monthLinkTarget = this.toLinkTarget(yearNotePath);
			const dayLinkTarget = this.toLinkTarget(monthNotePath);

			await this.ensureNoteWithLink(diaryRootNotePath, templateContent, rootLinkTarget);
			await this.ensureNoteWithLink(yearNotePath, templateContent, yearLinkTarget);
			await this.ensureNoteWithLink(monthNotePath, templateContent, monthLinkTarget);
			const dayNote = await this.ensureNoteWithLink(dayNotePath, templateContent, dayLinkTarget);

			const leaf = this.app.workspace.getLeaf(false);
			await leaf.openFile(dayNote, {active: true});
		} catch (error) {
			console.error("Diary Linker error", error);
			new Notice("Failed to create or open diary note.");
		}
	}

	getDayNotePath(date: Date): string {
		const diaryFolder = this.settings.diaryFolder.trim();
		const year = formatYear(date);
		const month = formatMonth(date);
		const day = formatDay(date);

		const yearFolder = `${diaryFolder}/${year}`;
		const monthFolder = `${yearFolder}/${month}`;
		return `${monthFolder}/${day}.md`;
	}

	dayNoteExists(date: Date): boolean {
		const diaryFolder = this.settings.diaryFolder.trim();
		if (!diaryFolder) {
			return false;
		}

		const dayNotePath = this.getDayNotePath(date);
		const existing = this.app.vault.getAbstractFileByPath(dayNotePath);
		return existing instanceof TFile;
	}

	private toLinkTarget(path: string): string {
		const normalized = path.replace(/\\/g, "/");
		return normalized.endsWith(".md") ? normalized.slice(0, -3) : normalized;
	}

	private isTemplateInTemplatesFolder(path: string): boolean {
		const normalized = path.replace(/\\/g, "/");
		return normalized === TEMPLATE_ROOT || normalized.startsWith(`${TEMPLATE_ROOT}/`);
	}

	private getFileByPath(path: string): TFile | null {
		const file = this.app.vault.getAbstractFileByPath(path);
		return file instanceof TFile ? file : null;
	}

	private async ensureFolder(path: string): Promise<void> {
		const existing = this.app.vault.getAbstractFileByPath(path);
		if (!existing) {
			await this.app.vault.createFolder(path);
			return;
		}
		if (!(existing instanceof TFolder)) {
			throw new Error(`Expected folder at ${path}`);
		}
	}

	private async ensureNoteWithLink(
		path: string,
		templateContent: string,
		linkTarget: string
	): Promise<TFile> {
		const link = `[[${linkTarget}]]`;
		const existing = this.app.vault.getAbstractFileByPath(path);
		let content: string;
		let file: TFile;

		if (existing instanceof TFile) {
			file = existing;
			content = await this.app.vault.read(existing);
		} else if (!existing) {
			content = templateContent;
			file = await this.app.vault.create(path, "");
		} else {
			throw new Error(`Expected file at ${path}`);
		}

		let updated = content;
		if (updated.includes(PLACEHOLDER)) {
			updated = updated.split(PLACEHOLDER).join(link);
		} else if (!updated.includes(link)) {
			const trimmed = updated.replace(/\s*$/, "");
			updated = `${trimmed}\n\n${link}\n`;
		}

		if (updated !== content) {
			await this.app.vault.modify(file, updated);
		}

		return file;
	}
}
