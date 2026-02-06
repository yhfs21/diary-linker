import {Plugin, WorkspaceLeaf} from "obsidian";
import {DiaryLinkerSettingTab, DEFAULT_SETTINGS, DiaryLinkerSettings} from "./settings";
import {DiaryCalendarView, DIARY_CALENDAR_VIEW} from "./ui/calendar-view";
import {DiaryService} from "./diary/diary-service";

export default class DiaryLinkerPlugin extends Plugin {
	settings: DiaryLinkerSettings;
	diaryService: DiaryService;

	async onload() {
		await this.loadSettings();
		this.diaryService = new DiaryService(this.app, this.settings);

		this.registerView(
			DIARY_CALENDAR_VIEW,
			(leaf: WorkspaceLeaf) => new DiaryCalendarView(leaf, this.diaryService)
		);

		this.addSettingTab(new DiaryLinkerSettingTab(this.app, this));

		this.addCommand({
			id: "open-diary-calendar",
			name: "Open diary calendar",
			callback: () => {
				void this.activateCalendarView();
			}
		});

		void this.activateCalendarView();
	}

	onunload() {
		this.app.workspace.getLeavesOfType(DIARY_CALENDAR_VIEW).forEach((leaf) => leaf.detach());
	}

	async loadSettings() {
		const data = await this.loadData() as Partial<DiaryLinkerSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async activateCalendarView(): Promise<void> {
		const existingLeaves = this.app.workspace.getLeavesOfType(DIARY_CALENDAR_VIEW);
		const existingLeaf = existingLeaves[0];
		if (existingLeaf) {
			await this.app.workspace.revealLeaf(existingLeaf);
			return;
		}

		let leaf = this.app.workspace.getRightLeaf(false);
		if (!leaf) {
			leaf = this.app.workspace.createLeafBySplit(this.app.workspace.getLeaf());
		}

		if (!leaf) {
			return;
		}

		await leaf.setViewState({type: DIARY_CALENDAR_VIEW, active: true});
		await this.app.workspace.revealLeaf(leaf);
	}
}
