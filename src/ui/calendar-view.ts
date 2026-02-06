import {ItemView, WorkspaceLeaf} from "obsidian";
import {DiaryService} from "../diary/diary-service";
import {addMonths, getDaysInMonth, getFirstWeekday, startOfMonth} from "../utils/dates";

export const DIARY_CALENDAR_VIEW = "diary-linker-calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export class DiaryCalendarView extends ItemView {
	private diaryService: DiaryService;
	private currentMonth: Date;

	constructor(leaf: WorkspaceLeaf, diaryService: DiaryService) {
		super(leaf);
		this.diaryService = diaryService;
		this.currentMonth = startOfMonth(new Date());
	}

	getViewType(): string {
		return DIARY_CALENDAR_VIEW;
	}

	getDisplayText(): string {
		return "Diary Calendar";
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {
		this.contentEl.empty();
	}

	setDiaryService(service: DiaryService) {
		this.diaryService = service;
	}

	private render(): void {
		const contentEl = this.contentEl;
		contentEl.empty();
		contentEl.addClass("diary-linker-calendar");

		const headerEl = contentEl.createDiv({cls: "diary-linker-calendar__header"});
		const prevButton = headerEl.createEl("button", {text: "<", cls: "diary-linker-calendar__nav"});
		const titleEl = headerEl.createDiv({cls: "diary-linker-calendar__title"});
		const nextButton = headerEl.createEl("button", {text: ">", cls: "diary-linker-calendar__nav"});

		prevButton.addEventListener("click", () => {
			this.currentMonth = addMonths(this.currentMonth, -1);
			this.render();
		});

		nextButton.addEventListener("click", () => {
			this.currentMonth = addMonths(this.currentMonth, 1);
			this.render();
		});

		const year = this.currentMonth.getFullYear();
		const monthIndex = this.currentMonth.getMonth();
		titleEl.setText(`${year}-${(monthIndex + 1).toString().padStart(2, "0")}`);

		const gridEl = contentEl.createDiv({cls: "diary-linker-calendar__grid"});
		WEEKDAYS.forEach((weekday) => {
			gridEl.createDiv({text: weekday, cls: "diary-linker-calendar__weekday"});
		});

		const firstWeekday = getFirstWeekday(this.currentMonth);
		const daysInMonth = getDaysInMonth(this.currentMonth);

		for (let i = 0; i < firstWeekday; i += 1) {
			gridEl.createDiv({cls: "diary-linker-calendar__empty"});
		}

		for (let day = 1; day <= daysInMonth; day += 1) {
			const dayButton = gridEl.createEl("button", {
				text: day.toString(),
				cls: "diary-linker-calendar__day"
			});

			dayButton.addEventListener("click", () => {
				const targetDate = new Date(year, monthIndex, day);
				void this.diaryService.openOrCreateForDate(targetDate);
			});
		}
	}
}
