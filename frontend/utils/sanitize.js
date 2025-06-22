export function sanitize (chartId, rows) {
    return chartId.startsWith('hourly-')
        ? rows.filter(r => r.hour >= 5)   // keep 5 AM-23 PM
        : rows;
}
