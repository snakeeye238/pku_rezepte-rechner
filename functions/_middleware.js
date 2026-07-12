const blockedPublicPaths = new Set([
    '/.gitignore',
    '/README.md',
    '/package.json',
    '/package-lock.json',
    '/wrangler.jsonc'
]);

export async function onRequest(context) {
    const pathname = new URL(context.request.url).pathname;
    if (blockedPublicPaths.has(pathname) || pathname.startsWith('/migrations/')) {
        return new Response('Not Found', {
            status: 404,
            headers: {
                'Cache-Control': 'no-store',
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Content-Type-Options': 'nosniff'
            }
        });
    }
    return context.next();
}
