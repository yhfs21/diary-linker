import {App, PluginSettingTab, Setting} from "obsidian";
import DiaryLinkerPlugin from "./main";

export interface DiaryLinkerSettings {
	diaryFolder: string;
}

export const DEFAULT_SETTINGS: DiaryLinkerSettings = {
	diaryFolder: "Daily"
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
			.setDesc("Daily notes folder name")
			.addText(text => text
				.setPlaceholder("Daily")
				.setValue(this.plugin.settings.diaryFolder)
				.onChange(async (value) => {
					this.plugin.settings.diaryFolder = value.trim();
					await this.plugin.saveSettings();
				}));
	}
}
