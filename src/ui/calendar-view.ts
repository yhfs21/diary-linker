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
		return "Diary calendar";
	}

	getIcon(): string {
		return "calendar-days";
	}

	onOpen(): void {
		this.render();
	}

	onClose(): void {
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
		const todayButton = headerEl.createEl("button", {text: "Today", cls: "diary-linker-calendar__today"});
		const nextButton = headerEl.createEl("button", {text: ">", cls: "diary-linker-calendar__nav"});

		prevButton.addEventListener("click", () => {
			this.currentMonth = addMonths(this.currentMonth, -1);
			this.render();
		});

		todayButton.addEventListener("click", () => {
			this.currentMonth = startOfMonth(new Date());
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

		const today = new Date();
		const isCurrentMonth =
			today.getFullYear() === year && today.getMonth() === monthIndex;

		for (let day = 1; day <= daysInMonth; day += 1) {
			const targetDate = new Date(year, monthIndex, day);
			const dayButton = gridEl.createEl("button", {
				text: day.toString(),
				cls: "diary-linker-calendar__day"
			});

			if (isCurrentMonth && day === today.getDate()) {
				dayButton.addClass("is-today");
			}

			if (this.diaryService.dayNoteExists(targetDate)) {
				dayButton.addClass("is-created");
			}

			dayButton.addEventListener("click", () => {
				void this.handleDayClick(targetDate);
			});
		}
	}

	private async handleDayClick(date: Date): Promise<void> {
		await this.diaryService.openOrCreateForDate(date);
		this.render();
	}
}
