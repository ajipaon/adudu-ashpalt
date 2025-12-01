
export const PriorityColors: Record<string, string> = {
    DEFAULT: "bg_slate_600",
    LOW: "bg-blue-600",
    MEDIUM: "bg-yellow-600",
    HIGH: "bg-orange-600",
    CRITICAL: "bg-red-600",
};

export interface MetaValueCalenderProps {
    title: string;
    description?: string;
    date: Date;
    color: string;
    startTime: string;
    endTime: string;
    recurrenceType?: 'single' | 'range' | 'daily';
    endDate?: Date;
    memberIds?: string[];
}