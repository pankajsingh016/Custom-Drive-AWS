// src/utils/formatDate.js
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
// File: src/utils/formatDate.js
// export const formatDate = (dateStr) => new Date(dateStr).toLocaleString();