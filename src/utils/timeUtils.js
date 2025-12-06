export const formatTime = (timeString, language) => {
    if (!timeString) return '';
    if (language !== 'fa') return timeString;

    return timeString
        .replace(/\b(minutes?|mins?)\b/gi, 'دقیقه')
        .replace(/\b(hours?|hrs?)\b/gi, 'ساعت')
        .replace(/\d+/g, (d) => new Intl.NumberFormat('fa-IR').format(d));
};
