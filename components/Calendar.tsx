import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  let startWeekday = firstDay.getDay() - 1;
  if (startWeekday < 0)
    startWeekday = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { day: number; currentMonth: boolean; dateKey: string }[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    days.push({ day: dayNumber, currentMonth: false, dateKey: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}` });
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
    days.push({ day: dayNumber, currentMonth: true, dateKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}` });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let dayNumber = 1; dayNumber <= remaining; dayNumber++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      days.push({ day: dayNumber, currentMonth: false, dateKey: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}` });
    }
  }

  return days;
}

interface CalendarProps {
  viewMonth: number;
  viewYear: number;
  selectedDate: string;
  todayKey: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
}

export function Calendar({ viewMonth, viewYear, selectedDate, todayKey, onPrevMonth, onNextMonth, onSelectDate }: CalendarProps) {
  const theme = useTheme();
  const calendarDays = getCalendarDays(viewYear, viewMonth);

  return (
    <>
      <View style={styles.calendarHeader}>
        <IconButton icon="chevron-left" onPress={onPrevMonth} iconColor={theme.colors.primary} size={20} />
        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <IconButton icon="chevron-right" onPress={onNextMonth} iconColor={theme.colors.primary} size={20} />
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((dayLabel) => (
          <View key={dayLabel} style={styles.weekdayCell}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
              {dayLabel}
            </Text>
          </View>
        ))}
      </View>

      {Array.from({ length: calendarDays.length / 7 }, (_, row) => (
        <View key={row} style={styles.calendarRow}>
          {calendarDays.slice(row * 7, row * 7 + 7).map((item, idx) => {
            const isSelected = item.dateKey === selectedDate;
            const isToday = item.dateKey === todayKey;
            return (
              <Pressable
                key={idx}
                onPress={() => onSelectDate(item.dateKey)}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: theme.colors.primary, borderRadius: 10 },
                  isToday && !isSelected && { borderWidth: 1.5, borderColor: theme.colors.primary, borderRadius: 10 },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={{
                    color: isSelected
                      ? theme.colors.onPrimary
                      : item.currentMonth
                        ? theme.colors.onBackground
                        : theme.colors.onSurfaceVariant,
                    fontWeight: isToday || isSelected ? 'bold' : 'normal',
                    opacity: item.currentMonth ? 1 : 0.3,
                  }}
                >
                  {item.day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  calendarRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  dayCell: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
});
