
export function getApiBaseUrl(): string {
    const host = window.location.hostname;

    if (host === 'localhost') {
        return 'http://localhost:8088';
    } else if (host === 'bogatyrev.org') {
        return 'https://api.bogatyrev.org';
    }

    // Fallback or throw error
    throw new Error(`Unknown host: ${host}`);
}

export async function fetchLexemes(word: string) {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/query?word=${encodeURIComponent(word)}`);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}

export async function fetchForms(inflectionId: number) {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/forms?inflection-id=${encodeURIComponent(inflectionId)}`);

    if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}
