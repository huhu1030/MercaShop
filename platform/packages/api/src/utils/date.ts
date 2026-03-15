export function getCurrentDateTimeEuro(): string {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const formattedDate = formatter.format(date);
  const parts = formattedDate.match(/\d+/g);
  if (!parts || parts.length < 5) return '';
  const [day, month, year, hour, minute] = parts;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}
