// Small shared date-bucketing helpers. Used to figure out which
// "today" / "this week" / "this month" bucket a given moment falls
// into, so running counters (e.g. staff revenue) know when to reset.

const startOfDay = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const startOfWeek = (date = new Date()) => {
  const value = startOfDay(date);
  const day = value.getDay();
  // Monday is treated as the first day of the week.
  const diff = value.getDate() - day + (day === 0 ? -6 : 1);
  value.setDate(diff);
  return value;
};

const startOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

module.exports = { startOfDay, startOfWeek, startOfMonth };
