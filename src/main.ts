import {App, Editor, MarkdownView, Modal, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, DiaryLinkerSettings, DiaryLinkerSettingTab} from "./settings";

export default class DiaryLinkerPlugin extends Plugin {
	settings: DiaryLinkerSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('link', 'Diary Linker', () => {
			new Notice('Diary Linker loaded');
		});

		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Diary Linker ready');

		this.addCommand({
			id: 'open-diary-linker-modal',
			name: 'Open Diary Linker modal',
			callback: () => {
				new DiaryLinkerModal(this.app).open();
			}
		});

		this.addCommand({
			id: 'replace-selected-with-diary-link',
			name: 'Replace selected with diary link',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				void view;
				editor.replaceSelection('[[Daily Note]]');
			}
		});

		this.addSettingTab(new DiaryLinkerSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<DiaryLinkerSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class DiaryLinkerModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Diary Linker');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
