import slugify from 'slugify';

export function createSlug(title: string): string {
    const base = slugify(title, {
        lower: true,
        strict: true,
        trim: true,
    });

    // Add random suffix to ensure uniqueness if needed, 
    // but for SEO we prefer clean slugs. 
    // We'll handle uniqueness at DB level or append generic ID if collision.
    return base;
}
