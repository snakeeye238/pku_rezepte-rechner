const blockedPublicPaths = new Set([
    '/.gitignore',
    '/README.md',
    '/package.json',
    '/package-lock.json',
    '/wrangler.jsonc'
]);

const replacements = [
    {
        label: 'DOCX export',
        from: `                        buildMetricCardsTable(docxApi, totals, state.portions)\n`,
        to: `                        buildMetricCardsTable(docxApi, totals, state.portions),\n                        sectionHeading('Spezielle Menge'),\n                        infoParagraph(\`Gewählte Menge: \${formatExportWeight(state.specialAmount)}\`),\n                        buildMetricCardsTable(docxApi, totals, totals.weight > 0 ? totals.weight / state.specialAmount : 1)\n`
    },
    {
        label: 'PDF metric setup',
        from: `            const portionMetricCards = getExportMetricCards(totals, state.portions);\n`,
        to: `            const portionMetricCards = getExportMetricCards(totals, state.portions);\n            const specialMetricCards = getExportMetricCards(totals, totals.weight > 0 ? totals.weight / state.specialAmount : 1);\n`
    },
    {
        label: 'PDF export',
        from: `            y = addSectionTitle('Portionen', y);\n            y = addInfoLine(\`Anzahl Portionen: \${state.portions}   |   Gewicht pro Portion: \${formatExportWeight(totals.weight / state.portions)}\`, y + 2);\n            drawPdfMetricCards(doc, portionMetricCards, y + 1);\n\n            return doc.output('blob');\n`,
        to: `            y = addSectionTitle('Portionen', y);\n            y = addInfoLine(\`Anzahl Portionen: \${state.portions}   |   Gewicht pro Portion: \${formatExportWeight(totals.weight / state.portions)}\`, y + 2);\n            y = drawPdfMetricCards(doc, portionMetricCards, y + 1) + exportVisualConfig.pdf.sectionGap;\n\n            y = addSectionTitle('Spezielle Menge', y);\n            y = addInfoLine(\`Gewählte Menge: \${formatExportWeight(state.specialAmount)}\`, y + 2);\n            drawPdfMetricCards(doc, specialMetricCards, y + 1);\n\n            return doc.output('blob');\n`
    }
];

const patchHtml = (html) => replacements.reduce((result, replacement) => {
    if (!result.includes(replacement.from)) {
        console.warn(`Export patch not applied: ${replacement.label}`);
        return result;
    }
    return result.replace(replacement.from, replacement.to);
}, html);

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

    const response = await context.next();
    const contentType = response.headers.get('content-type') || '';

    if (context.request.method !== 'GET' || !contentType.toLowerCase().includes('text/html')) {
        return response;
    }

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-cache');

    return new Response(patchHtml(await response.text()), {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
