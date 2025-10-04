import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react';
import { farmAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Operation {
  id: number;
  operation_type: string;
  start_date: string;
  end_date: string;
  notes?: string;
  personnel?: Array<{
    id: number;
    name: string;
    role: string;
    hourly_rate: number;
    PersonnelWork: { daily_hours: number };
  }>;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  personnel: string[];
  color: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and how many days in the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  useEffect(() => {
    if (user) {
      loadOperations();
    }
  }, [user, currentDate]);

  const loadOperations = async () => {
    try {
      setLoading(true);
      const response = await farmAPI.getOperations();
      setOperations(response.data);
    } catch (error) {
      console.error('Error loading operations:', error);
      setError('Failed to load operations');
    } finally {
      setLoading(false);
    }
  };

  // Convert operations to calendar events
  const getCalendarEvents = (): CalendarEvent[] => {
    return operations.map(operation => ({
      id: operation.id,
      title: operation.operation_type,
      start: new Date(operation.start_date),
      end: new Date(operation.end_date),
      personnel: operation.personnel ? operation.personnel.map(p => p.name) : [],
      color: getOperationColor(operation.operation_type)
    }));
  };

  const getOperationColor = (operationType: string): string => {
    const colors: { [key: string]: string } = {
      'Planting': 'bg-green-500',
      'Sowing': 'bg-green-400',
      'Transplanting': 'bg-green-600',
      'Fertilizing': 'bg-yellow-500',
      'Organic Fertilizing': 'bg-yellow-400',
      'Composting': 'bg-yellow-600',
      'Irrigation': 'bg-blue-500',
      'Watering': 'bg-blue-400',
      'Drip Irrigation': 'bg-blue-600',
      'Pest Control': 'bg-red-500',
      'Disease Treatment': 'bg-red-400',
      'Weed Control': 'bg-red-600',
      'Pruning': 'bg-purple-500',
      'Trimming': 'bg-purple-400',
      'Thinning': 'bg-purple-600',
      'Harvesting': 'bg-orange-500',
      'Picking': 'bg-orange-400',
      'Collection': 'bg-orange-600',
      'Soil Preparation': 'bg-amber-500',
      'Plowing': 'bg-amber-400',
      'Tilling': 'bg-amber-600',
      'Cultivation': 'bg-amber-700',
      'Equipment Maintenance': 'bg-gray-500',
      'Tool Cleaning': 'bg-gray-400',
      'Machinery Repair': 'bg-gray-600',
      'Monitoring': 'bg-indigo-500',
      'Inspection': 'bg-indigo-400',
      'Quality Control': 'bg-indigo-600'
    };
    return colors[operationType] || 'bg-slate-500';
  };

  // Check if an event occurs on a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const events = getCalendarEvents();
    return events.filter(event => {
      const eventStart = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
      const eventEnd = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i);
    calendarDays.push({ date, isCurrentMonth: false });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    calendarDays.push({ date, isCurrentMonth: true });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    calendarDays.push({ date, isCurrentMonth: false });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">Schedule and track farm activities</p>
        </div>
        <button 
          onClick={() => window.location.href = '/dashboard/operations'}
          className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Add Operation</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gradient-to-r from-rose-50 to-purple-50 p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={goToToday}
                className="text-sm bg-white text-rose-600 px-3 py-1 rounded-md hover:bg-rose-50 transition-colors border border-rose-200"
              >
                Today
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-rose-600 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-rose-600 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px mb-px">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 text-center font-semibold text-gray-600 text-sm py-3">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const events = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`bg-white min-h-[120px] p-2 ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {/* Date Number */}
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday
                          ? 'bg-rose-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                          : ''
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-1">
                    {events.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`${event.color} text-white text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity`}
                        title={`${event.title}${event.personnel.length > 0 ? ` - Personnel: ${event.personnel.join(', ')}` : ''}`}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="truncate">{event.title}</span>
                          {event.personnel.length > 0 && (
                            <Users className="h-2.5 w-2.5 flex-shrink-0" />
                          )}
                        </div>
                        {event.personnel.length > 0 && (
                          <div className="text-xs opacity-90 truncate mt-0.5">
                            {event.personnel.slice(0, 2).join(', ')}
                            {event.personnel.length > 2 && ` +${event.personnel.length - 2}`}
                          </div>
                        )}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Personnel assigned</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Timeline spans from start to end date</span>
            </div>
          </div>
        </div>

        {/* No Operations Message */}
        {operations.length === 0 && !loading && (
          <div className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-rose-600 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">No operations scheduled</p>
            <p className="text-sm text-gray-600 mt-1">Add your first operation to see it on the calendar</p>
          </div>
        )}
      </div>
    </div>
  );
}
