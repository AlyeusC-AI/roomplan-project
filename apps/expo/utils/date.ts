/**
 * Format a date into a human-readable string
 * @param date Date to format
 * @param format Optional format specifier
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } else {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

/**
 * Calculate a due date by adding days to a start date
 * @param startDate The starting date
 * @param days Number of days to add
 * @returns New date with days added
 */
export function calculateDueDate(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  result.setDate(result.getDate() + days);
  return result;
} 