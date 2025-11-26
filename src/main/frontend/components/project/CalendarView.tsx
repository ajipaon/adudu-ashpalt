import { useEffect, useState } from 'react';
import { ProjectService } from 'Frontend/generated/endpoints';
import { Dialog } from '@vaadin/react-components';
import { X, Plus } from 'lucide-react';

interface CalendarViewProps {
    projectId: string;
}

interface CalendarTask {
    id: string;
    title: string;
    date: Date;
    color: string;
}

export default function CalendarView({ projectId }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [newTaskColor, setNewTaskColor] = useState('bg-blue-500');
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [tasksForSelectedDate, setTasksForSelectedDate] = useState<CalendarTask[]>([]);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const [tasks, setTasks] = useState<CalendarTask[]>([
        { id: '1', title: 'iOS design in depth', date: new Date(currentYear, currentMonth, 1), color: 'bg-orange-500' },
        { id: '2', title: 'How We Structure Our CSS', date: new Date(currentYear, currentMonth, 6), color: 'bg-yellow-500' },
        { id: '3', title: 'How to use Trello like a Pro', date: new Date(currentYear, currentMonth, 7), color: 'bg-green-500' },
        { id: '4', title: 'How to Structure an Editorial Calendar', date: new Date(currentYear, currentMonth, 9), color: 'bg-blue-500' },
        { id: '5', title: 'Create Cards via Email', date: new Date(currentYear, currentMonth, 13), color: 'bg-green-500' },
        { id: '6', title: 'Holiday Campaign Wrap Up Stats', date: new Date(currentYear, currentMonth, 14), color: 'bg-blue-500' },
        { id: '7', title: 'Being Accountability: Basing Resolutions in Resolutions', date: new Date(currentYear, currentMonth, 15), color: 'bg-blue-500' },
        { id: '8', title: 'Trello for Charitable Donations', date: new Date(currentYear, currentMonth, 16), color: 'bg-purple-500' },
        { id: '9', title: 'Kickstarter case study', date: new Date(currentYear, currentMonth, 19), color: 'bg-orange-500' },
        { id: '10', title: 'Wedding Planning With Trello', date: new Date(currentYear, currentMonth, 22), color: 'bg-purple-500' },
        { id: '11', title: 'Common Questions', date: new Date(currentYear, currentMonth, 26), color: 'bg-green-500' },
        { id: '12', title: 'Using Multiple Boards for a Super Effective Workflow', date: new Date(currentYear, currentMonth, 27), color: 'bg-blue-500' },
    ]);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevMonthDate = new Date(year, month, -(startingDayOfWeek - i - 1));
            days.push(prevMonthDate);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        const remainingCells = 7 - (days.length % 7);
        if (remainingCells < 7) {
            for (let i = 1; i <= remainingCells; i++) {
                days.push(new Date(year, month + 1, i));
            }
        }

        return days;
    };

    const getTasksForDate = (date: Date | null) => {
        if (!date) return [];
        return tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate.getDate() === date.getDate() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getFullYear() === date.getFullYear();
        });
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const isCurrentMonth = (date: Date | null) => {
        if (!date) return false;
        return date.getMonth() === currentDate.getMonth();
    };

    const handleDateClick = (date: Date | null) => {
        if (!date) return;
        setSelectedDate(date);

        const dateTasks = getTasksForDate(date);
        if (dateTasks.length > 0) {
            setTasksForSelectedDate(dateTasks);
            setShowTaskDetails(true);
        } else {
            setIsDialogOpen(true);
        }
    };

    const handleCreateTask = async () => {
        if (!newTaskTitle || !selectedDate) return;

        const newTask: CalendarTask = {
            id: Date.now().toString(),
            title: newTaskTitle,
            date: selectedDate,
            color: newTaskColor
        };

        setTasks([...tasks, newTask]);

        // Reset form
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        setNewTaskColor('bg-blue-500');
        setIsDialogOpen(false);
        setShowTaskDetails(false);
    };

    const handleCreateNewTask = () => {
        setShowTaskDetails(false);
        setIsDialogOpen(true);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const days = getDaysInMonth(currentDate);

    return (
        <div className="flex flex-1 bg-white overflow-hidden">
            {/* Main Calendar Area */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="bg-orange-500 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold">Team Calendar</h2>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-orange-600 rounded">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <span className="text-sm">Travidex, LLC</span>
                            <button className="p-2 hover:bg-orange-600 rounded">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                            </button>
                            <span className="text-sm">Team Visible</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Calendar
                        </button>
                        <button className="px-4 py-2 hover:bg-orange-600 rounded">
                            Share
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateMonth('prev')}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button
                                onClick={() => navigateMonth('next')}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-4 py-2 rounded ${viewMode === 'week' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-4 py-2 rounded ${viewMode === 'month' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        >
                            Month
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-7 gap-0 border border-gray-200">
                        {dayNames.map(day => (
                            <div key={day} className="bg-gray-50 border-b border-r border-gray-200 px-4 py-2 text-center font-semibold text-gray-600 text-sm">
                                {day}
                            </div>
                        ))}

                        {/* Calendar Days */}
                        {days.map((date, index) => {
                            const dayTasks = getTasksForDate(date);
                            const isOtherMonth = !isCurrentMonth(date);

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleDateClick(date)}
                                    className={`min-h-[120px] border-b border-r border-gray-200 p-2 cursor-pointer ${isOtherMonth ? 'bg-gray-50' : 'bg-white'
                                        } hover:bg-blue-50 transition-colors`}
                                >
                                    <div className={`text-sm font-semibold mb-2 ${isOtherMonth ? 'text-gray-400' : 'text-gray-700'
                                        }`}>
                                        {date?.getDate()}
                                        {dayTasks.length > 0 && (
                                            <span className="ml-2 text-xs text-gray-500">
                                                {dayTasks.length} card{dayTasks.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        {dayTasks.map(task => (
                                            <div
                                                key={task.id}
                                                className="bg-white rounded shadow-sm p-2 border-l-4 hover:shadow-md transition-shadow"
                                                style={{ borderLeftColor: task.color.replace('bg-', '#') }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className={`w-8 h-1 rounded ${task.color} mt-1`}></div>
                                                    <div className="flex-1 text-xs text-gray-700 line-clamp-2">
                                                        {task.title}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {showTaskDetails && (
                <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {formatDate(selectedDate)}
                            </h3>
                            <button
                                onClick={() => setShowTaskDetails(false)}
                                className="p-2 hover:bg-gray-200 rounded transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-3">
                                {tasksForSelectedDate.length} task{tasksForSelectedDate.length > 1 ? 's' : ''} on this date
                            </p>

                            <div className="space-y-3">
                                {tasksForSelectedDate.map(task => (
                                    <div
                                        key={task.id}
                                        className="bg-white rounded-lg shadow-sm p-4 border-l-4 hover:shadow-md transition-shadow cursor-pointer"
                                        style={{ borderLeftColor: task.color.replace('bg-', '#') }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-3 h-3 rounded-full ${task.color} mt-1 flex-shrink-0`}></div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-800 mb-1">
                                                    {task.title}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    ID: {task.id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCreateNewTask}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Plus size={20} />
                            Create New Task
                        </button>
                    </div>
                </div>
            )}
            <Dialog
                headerTitle={`Create Task - ${formatDate(selectedDate)}`}
                opened={isDialogOpen}
                onOpenedChanged={(e) => setIsDialogOpen(e.detail.value)}
            >
                <div className="p-6 space-y-4">
                    {/* Task Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Task Title *
                        </label>
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Enter task title..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                            placeholder="Enter task description..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    {/* Color Label */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Label Color
                        </label>
                        <div className="flex gap-2">
                            {['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setNewTaskColor(color)}
                                    className={`w-8 h-8 rounded-full ${color} ${newTaskColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={() => setIsDialogOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateTask}
                            disabled={!newTaskTitle}
                            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Create Task
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
