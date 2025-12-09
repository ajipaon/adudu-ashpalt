import { Dialog, TimePicker } from '@vaadin/react-components';
import { MetaValueCalenderProps } from 'Frontend/components/project/dto/projectDto';
import MetaType from 'Frontend/generated/com/adudu/ashpalt/models/project/MetaType';
import PostMeta from 'Frontend/generated/com/adudu/ashpalt/models/project/PostMeta';
import { PostMetaService, ProjectService } from 'Frontend/generated/endpoints';
import { dayNames, monthNames } from 'Frontend/util/date';
import { Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface CalendarViewProps {
  projectId: string;
}

const mKey = 'calendar';
const metaType: MetaType = MetaType.JSON;

// parent untuk calender adalah projectId
export default function CalendarView({ projectId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventPriority, setNewEventPriority] = useState('medium');
  const [newEventColor, setNewEventColor] = useState('bg-blue-500');
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('17:00');
  const [isFullDay, setIsFullDay] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<PostMeta[]>([]);
  const [recurrenceType, setRecurrenceType] = useState<'single' | 'range' | 'daily'>('single');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [events, setEvents] = useState<PostMeta[]>([]);

  const loadCalendar = useCallback(() => {
    PostMetaService.getMeta(projectId!!, mKey)
      .then((value) => {
        const filtered = (value ?? []).filter((v): v is PostMeta => !!v);
        setEvents(filtered || []);
      })
      .catch((error) => {
        console.error('Failed to load assignees:', error);
        setEvents([]);
      });
  }, [projectId]);

  useEffect(() => {
    loadCalendar();
    ProjectService.getProjectMembers(projectId)
      .then((members) => {
        setProjectMembers(members || []);
      })
      .catch((error) => {
        console.error('Failed to load project members:', error);
        setProjectMembers([]);
      });
  }, [loadCalendar, projectId]);

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

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter((event) => {
      const content: MetaValueCalenderProps = JSON.parse(event.metaValue!!);
      const eventDate = new Date(content.date);
      const recurrence = content.recurrenceType || 'single';

      if (recurrence === 'daily') {
        return true;
      }
      if (recurrence === 'range' && content.endDate) {
        const eventEndDate = new Date(content.endDate);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        const startDate = new Date(eventDate);
        startDate.setHours(0, 0, 0, 0);
        const endDateNormalized = new Date(eventEndDate);
        endDateNormalized.setHours(0, 0, 0, 0);

        return checkDate >= startDate && checkDate <= endDateNormalized;
      }
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
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

    const dateEvents = getEventsForDate(date);
    if (dateEvents.length > 0) {
      setEventsForSelectedDate(dateEvents);
      setShowEventDetails(true);
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventTitle || !selectedDate) return;
    if (recurrenceType === 'range' && (!endDate || endDate < selectedDate)) {
      alert('End date must be after or equal to start date');
      return;
    }

    const newEvent: MetaValueCalenderProps = {
      title: newEventTitle,
      date: selectedDate,
      color: newEventColor,
      description: newEventDescription,
      startTime: isFullDay ? '' : newEventStartTime,
      endTime: isFullDay ? '' : newEventEndTime,
      recurrenceType: recurrenceType,
      endDate: recurrenceType === 'range' ? endDate || undefined : undefined,
      memberIds: selectedMemberIds.length > 0 ? selectedMemberIds : undefined,
    };
    const newMeta: PostMeta = {
      postId: projectId,
      metaKey: mKey,
      metaType,
      metaValue: JSON.stringify(newEvent),
    };
    await PostMetaService.saveMeta(newMeta);

    setEvents([...events, newMeta]);

    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventPriority('medium');
    setNewEventColor('bg-blue-500');
    setNewEventStartTime('09:00');
    setNewEventEndTime('10:00');
    setIsFullDay(false);
    setRecurrenceType('single');
    setEndDate(null);
    setSelectedMemberIds([]);
    setIsDialogOpen(false);
    setShowEventDetails(false);
  };

  const handleCreateNewEvent = () => {
    setShowEventDetails(false);
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: string | undefined) => {
    if (!eventId) return;
    const isDelete = window.confirm('Are you sure you want to delete this event?');
    if (!isDelete) return;

    try {
      await PostMetaService.deleteMeta(eventId as any);
      setEvents(events.filter((t) => t.id !== eventId));
      setEventsForSelectedDate(eventsForSelectedDate.filter((t) => t.id !== eventId));
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="flex flex-1 bg-white overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
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
            {dayNames.map((day) => (
              <div
                key={day}
                className="bg-gray-50 border-b border-r border-gray-200 px-4 py-2 text-center font-semibold text-gray-600 text-sm"
              >
                {day}
              </div>
            ))}

            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isOtherMonth = !isCurrentMonth(date);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`min-h-[120px] border-b border-r border-gray-200 p-2 cursor-pointer ${
                    isOtherMonth ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-blue-50 transition-colors`}
                >
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      isOtherMonth ? 'text-gray-400' : 'text-gray-700'
                    }`}
                  >
                    {date?.getDate()}
                    {dayEvents.length > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        {dayEvents.length} card{dayEvents.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => {
                      const content: MetaValueCalenderProps = JSON.parse(event.metaValue!!);
                      return (
                        <div
                          key={event.id}
                          className="bg-white rounded shadow-sm p-2 border-l-4 hover:shadow-md transition-shadow"
                          style={{ borderLeftColor: content.color.replace('bg-', '#') }}
                          onClick={() => handleDateClick(date)}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-8 h-1 rounded ${content.color} mt-1`}></div>
                            <div className="flex-1 text-xs text-gray-700 line-clamp-2">
                              {content.title}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showEventDetails && (
        <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{formatDate(selectedDate)}</h3>
              <button
                onClick={() => setShowEventDetails(false)}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                {eventsForSelectedDate.length} event{eventsForSelectedDate.length > 1 ? 's' : ''} on
                this date
              </p>

              <div className="space-y-3">
                {eventsForSelectedDate.map((event) => {
                  const content: MetaValueCalenderProps = JSON.parse(event.metaValue!!);
                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-lg shadow-sm p-4 border-l-4 hover:shadow-md transition-shadow"
                      style={{ borderLeftColor: content.color.replace('bg-', '#') }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${content.color} mt-1 flex-shrink-0`}
                        ></div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800 mb-1">
                            {content.title}
                          </h4>
                          {content.description && (
                            <p className="text-xs text-gray-600 mb-2">{content.description}</p>
                          )}
                          {content.memberIds && content.memberIds.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {content.memberIds.map((memberId) => {
                                const member = projectMembers.find((m) => m.userId === memberId);
                                if (!member) return null;
                                const initials = member.userName
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2);
                                return (
                                  <div
                                    key={memberId}
                                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                    title={member.userEmail}
                                  >
                                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">
                                      {initials}
                                    </div>
                                    <span>{member.userName}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                          title="Delete event"
                        >
                          <X size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCreateNewEvent}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} />
              Create New Event
            </button>
          </div>
        </div>
      )}
      <Dialog
        headerTitle={`Create Event - ${formatDate(selectedDate)}`}
        opened={isDialogOpen}
        onOpenedChanged={(e) => setIsDialogOpen(e.detail.value)}
      >
        <div className="p-6 w-[800px] max-w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Enter event title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Enter event description..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newEventPriority}
                  onChange={(e) => setNewEventPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label Color</label>
                <div className="flex gap-2">
                  {[
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-yellow-500',
                    'bg-orange-500',
                    'bg-red-500',
                    'bg-purple-500',
                    'bg-pink-500',
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewEventColor(color)}
                      className={`w-8 h-8 rounded-full ${color} ${
                        newEventColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Recurrence Type
                </label>
                <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recurrence"
                      value="single"
                      checked={recurrenceType === 'single'}
                      onChange={(e) =>
                        setRecurrenceType(e.target.value as 'single' | 'range' | 'daily')
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Single Day</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recurrence"
                      value="range"
                      checked={recurrenceType === 'range'}
                      onChange={(e) =>
                        setRecurrenceType(e.target.value as 'single' | 'range' | 'daily')
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Date Range</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recurrence"
                      value="daily"
                      checked={recurrenceType === 'daily'}
                      onChange={(e) =>
                        setRecurrenceType(e.target.value as 'single' | 'range' | 'daily')
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Every Day (Recurring)</span>
                  </label>
                </div>

                {recurrenceType === 'range' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate ? endDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                      min={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Settings
                </label>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="fullDay"
                      checked={isFullDay}
                      onChange={(e) => setIsFullDay(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="fullDay" className="ml-2 text-sm font-medium text-gray-700">
                      Full Day Event
                    </label>
                  </div>

                  {!isFullDay && (
                    <div className="grid grid-cols-2 gap-4">
                      <TimePicker
                        label="Start Time"
                        value={newEventStartTime}
                        onValueChanged={(e) => setNewEventStartTime(e.detail.value)}
                        step={60 * 30}
                        className="w-full"
                      />
                      <TimePicker
                        label="End Time"
                        value={newEventEndTime}
                        onValueChanged={(e) => setNewEventEndTime(e.detail.value)}
                        step={60 * 30}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Members
                </label>
                <div className="mb-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMemberIds(projectMembers.map((m) => m.userId))}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMemberIds([])}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
                <div className="h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2 bg-white">
                  {projectMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No members available</p>
                  ) : (
                    projectMembers.map((member) => (
                      <label
                        key={member.userId}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(member.userId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMemberIds([...selectedMemberIds, member.userId]);
                            } else {
                              setSelectedMemberIds(
                                selectedMemberIds.filter((id) => id !== member.userId)
                              );
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700">{member.userName}</div>
                          <div className="text-xs text-gray-500">{member.userEmail}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateEvent}
              disabled={!newEventTitle}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Create Event
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
