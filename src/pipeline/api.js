import { base44 } from "@/api/base44Client";

export async function pipelineApi(action, payload = {}) {
  try {
    const response = await base44.functions.invoke("pipeline-api", { action, ...payload });
    const data = response?.data ?? response;
    if (data?.error) {
      const error = new Error(data.error);
      error.details = data.details;
      throw error;
    }
    return data;
  } catch (error) {
    const body = error?.response?.data;
    const message = body?.error || error?.message || "Pipeline request failed.";
    const wrapped = new Error(message);
    wrapped.details = body?.details || error?.details;
    throw wrapped;
  }
}

export async function submitPipelineInquiry(payload) {
  try {
    const response = await base44.functions.invoke("submit-pipeline-inquiry", payload);
    const data = response?.data ?? response;
    if (data?.error) throw new Error(data.error);
    return data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error?.message || "Request could not be submitted.");
  }
}

export function csvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const source = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if (char === "\n" && !quoted) {
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]))
  );
}

export function downloadFile(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function calendarIcs(appointment) {
  const date = String(appointment.date || "").replaceAll("-", "");
  const start = String(appointment.start_time || "09:00").replace(":", "") + "00";
  const end = String(appointment.end_time || appointment.start_time || "09:30").replace(":", "") + "00";
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const clean = (value) => String(value || "").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MooreTech Commercial Pipeline//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${appointment.id || crypto.randomUUID()}@mooretechsolutions`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${appointment.time_zone || "America/Chicago"}:${date}T${start}`,
    `DTEND;TZID=${appointment.time_zone || "America/Chicago"}:${date}T${end}`,
    `SUMMARY:${clean(appointment.appointment_title || "Qualified sales appointment")}`,
    `DESCRIPTION:${clean(appointment.qualification_summary || "")}`,
    `LOCATION:${clean(appointment.location_or_link || "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(appointment) {
  const date = String(appointment.date || "").replaceAll("-", "");
  const start = String(appointment.start_time || "09:00").replace(":", "") + "00";
  const end = String(appointment.end_time || appointment.start_time || "09:30").replace(":", "") + "00";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: appointment.appointment_title || "Qualified sales appointment",
    dates: `${date}T${start}/${date}T${end}`,
    details: appointment.qualification_summary || "",
    location: appointment.location_or_link || "",
    ctz: appointment.time_zone || "America/Chicago",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
