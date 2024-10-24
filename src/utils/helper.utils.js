export const adjustDateToNepalTimezone = (date) => {
  let formattedDate = "";
  if (typeof date === "string") {
    date = new Date(date);
    formattedDate = new Date(
      date.toISOString().replace(/T\d{2}:\d{2}:\d{2}\.\d{3}Z/, "T00:00:00Z")
    );
    // formattedDate.setDate(formattedDate.getDate() + 1)
    return formattedDate;
  }
  const nepalOffsetMinutes = 5 * 60 + 45;
  const utcOffsetMinutes = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() + utcOffsetMinutes + nepalOffsetMinutes);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
};
