export function pad2(value: number): string {
	return value.toString().padStart(2, "0");
}

export function formatYear(date: Date): string {
	return date.getFullYear().toString();
}

export function formatMonth(date: Date): string {
	const year = formatYear(date);
	const month = pad2(date.getMonth() + 1);
	return `${year}-${month}`;
}

export function formatDay(date: Date): string {
	const year = formatYear(date);
	const month = pad2(date.getMonth() + 1);
	const day = pad2(date.getDate());
	return `${year}-${month}-${day}`;
}

export function startOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
	return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function getDaysInMonth(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function getFirstWeekday(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}
