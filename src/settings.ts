import {App, FuzzySuggestModal, Notice, PluginSettingTab, Setting, TFile, TFolder} from "obsidian";
import DiaryLinkerPlugin from "./main";

export interface DiaryLinkerSettings {
	diaryFolder: string;
	templatePath: string;
}

export const DEFAULT_SETTINGS: DiaryLinkerSettings = {
	diaryFolder: "Daily",
	templatePath: ""
};

export class DiaryLinkerSettingTab extends PluginSettingTab {
	plugin: DiaryLinkerPlugin;

	constructor(app: App, plugin: DiaryLinkerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Diary folder")
			.setDesc("Root folder for diary notes")
			.addText((text) => text
				.setPlaceholder("Daily")
				.setValue(this.plugin.settings.diaryFolder)
				.onChange(async (value) => {
					this.plugin.settings.diaryFolder = value.trim();
					this.plugin.diaryService.updateSettings(this.plugin.settings);
					await this.plugin.saveSettings();
				})
			);

		const templateSetting = new Setting(containerEl)
			.setName("Template note")
			.setDesc("Pick a template from the Templates folder (must include {{diary-link}})");

		let setTemplateValue: ((value: string) => void) | null = null;
		templateSetting.addText((text) => {
			text.inputEl.setAttr("readonly", "true");
			setTemplateValue = (value: string) => text.setValue(value);
			return text
				.setPlaceholder("Templates/YourTemplate.md")
				.setValue(this.plugin.settings.templatePath)
				.onChange(async (value) => {
					this.plugin.settings.templatePath = value.trim();
					this.plugin.diaryService.updateSettings(this.plugin.settings);
					await this.plugin.saveSettings();
				});
		});

		templateSetting.addButton((button) => {
			button.setButtonText("Choose");
			button.onClick(() => {
				const modal = new TemplatePickerModal(this.app, (file) => {
					this.plugin.settings.templatePath = file.path;
					this.plugin.diaryService.updateSettings(this.plugin.settings);
					setTemplateValue?.(file.path);
					void this.plugin.saveSettings();
				});
				modal.open();
			});
		});
	}
}

class TemplatePickerModal extends FuzzySuggestModal<TFile> {
	private onChoose: (file: TFile) => void;

	constructor(app: App, onChoose: (file: TFile) => void) {
		super(app);
		this.onChoose = onChoose;
		this.setPlaceholder("Select a template note");
	}

	getItems(): TFile[] {
		const templatesFolder = this.app.vault.getAbstractFileByPath("Templates");
		if (!(templatesFolder instanceof TFolder)) {
			new Notice("Templates folder not found.");
			return [];
		}

		const files: TFile[] = [];
		this.walkFolder(templatesFolder, files);
		return files;
	}

	getItemText(item: TFile): string {
		return item.path;
	}

	onChooseItem(item: TFile): void {
		this.onChoose(item);
	}

	private walkFolder(folder: TFolder, files: TFile[]): void {
		for (const child of folder.children) {
			if (child instanceof TFile) {
				files.push(child);
			} else if (child instanceof TFolder) {
				this.walkFolder(child, files);
			}
		}
	}
}
