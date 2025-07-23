import { format, getTime, formatDistanceToNow } from "date-fns";

// ----------------------------------------------------------------------

export function fDate(date: string | number | Date) {
  return format(new Date(date), "dd MMMM yyyy");
}

export function fDateTime(date: string | number | Date) {
  return format(new Date(date), "dd MMM yyyy p");
}

export function fTimestamp(date: string | number | Date) {
  return getTime(new Date(date));
}

export function fToNow(date: string | number | Date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
}
