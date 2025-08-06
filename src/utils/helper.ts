export function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
}

export function generateSlug(title: string): string {
    if (!title) return '';
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with hyphens
        .replace(/[^\w\-]+/g, '')      // Remove all non-word chars except hyphens
        .replace(/\-\-+/g, '-')        // Replace multiple hyphens with single hyphen
        .replace(/^-+/, '')            // Trim hyphens from start
        .replace(/-+$/, '');           // Trim hyphens from end
}
