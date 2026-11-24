export function formatDate(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const formatDateDDMMYYYY = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function formatDateToMMDDYYYY(dateInput?: string | Date): string {
  if (!dateInput) return "-"; // handle missing date

  // If it's a Date object, use it directly; if string, convert to Date
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  // Check for invalid date
  if (isNaN(date.getTime())) return "-";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

// export function formatDateToMMDDYYYY(dateString?: string): string {
//   if (!dateString) return "-"; // handle missing date
//   const date = new Date(dateString);

//   // Check for invalid date
//   if (isNaN(date.getTime())) return "-";

//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   const year = date.getFullYear();

//   return `${month}/${day}/${year}`;
// }
