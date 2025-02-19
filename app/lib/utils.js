export function convertDate(dateString) {
  if (!dateString) {
    return "Present";
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Present";
  }

  return date.toISOString().split("T")[0];
}
