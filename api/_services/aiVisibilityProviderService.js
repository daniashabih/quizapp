const axios = require('axios');

const API_BASE_URL = 'https://api.dataforseo.com/v3';
const REQUEST_TIMEOUT_MS = 42000;
const MODEL_LOOKUP_TIMEOUT_MS = 8000;
const AI_VISIBILITY_PROMPT = 'Which websites offer interactive free coding quiz practice and certificates? Include source links where available.';
const MAX_EXCERPT_LENGTH = 600;

const LLM_PLATFORMS = [
    {
        id: 'chatgpt',
        name: 'ChatGPT',
        endpoint: 'ai_optimization/chat_gpt/llm_responses',
        options: {
            web_search: true,
            force_web_search: true,
            web_search_country_iso_code: 'US'
        }
    },
    {
        id: 'gemini',
        name: 'Google Gemini',
        endpoint: 'ai_optimization/gemini/llm_responses',
        options: { web_search: true }
    },
    {
        id: 'perplexity',
        name: 'Perplexity',
        endpoint: 'ai_optimization/perplexity/llm_responses',
        modelPrefix: 'sonar',
        options: { web_search_country_iso_code: 'US' }
    }
];

function getCredentials(env = process.env) {
    const login = String(env.DATAFORSEO_LOGIN || '').trim();
    const password = String(env.DATAFORSEO_PASSWORD || '').trim();
    return login && password ? { username: login, password } : null;
}

function isConfigured(env = process.env) {
    return Boolean(getCredentials(env));
}

function getTaskResults(payload, context) {
    if (!payload || Number(payload.status_code) >= 40000) {
        throw new Error(payload?.status_message || `${context} failed.`);
    }

    const task = Array.isArray(payload.tasks) ? payload.tasks[0] : null;
    if (!task || Number(task.status_code) >= 40000) {
        throw new Error(task?.status_message || `${context} returned no successful task.`);
    }

    const results = Array.isArray(task.result) ? task.result : [];
    if (results.length === 0) {
        throw new Error(`${context} returned no results.`);
    }
    return results;
}

function getTaskResult(payload, context) {
    return getTaskResults(payload, context)[0];
}

async function getDataForSeo(path, credentials, timeout = REQUEST_TIMEOUT_MS) {
    const response = await axios.get(`${API_BASE_URL}/${path}`, {
        auth: credentials,
        timeout,
        headers: { Accept: 'application/json' }
    });
    return response.data;
}

async function postDataForSeoTask(path, task, credentials) {
    const response = await axios.post(`${API_BASE_URL}/${path}`, [task], {
        auth: credentials,
        timeout: REQUEST_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
    });
    return response.data;
}

async function getWebSearchModel(platform, credentials) {
    const payload = await getDataForSeo(
        `${platform.endpoint}/models`,
        credentials,
        MODEL_LOOKUP_TIMEOUT_MS
    );
    const availableModels = getTaskResults(payload, `${platform.name} model lookup`);
    const eligibleModels = availableModels.filter((model) => {
        if (!model?.model_name) return false;
        if (platform.modelPrefix) {
            return model.model_name.toLowerCase().startsWith(platform.modelPrefix);
        }
        return model.web_search_supported === true && model.reasoning !== true;
    });
    const selectedModel = eligibleModels[0];

    if (!selectedModel) {
        throw new Error(`No supported web-search model is available for ${platform.name}.`);
    }
    return selectedModel.model_name;
}

function collectResponseContent(items = []) {
    const text = [];
    const annotations = [];
    const visit = (value) => {
        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }
        if (!value || typeof value !== 'object') return;

        if (typeof value.text === 'string') text.push(value.text);
        if (Array.isArray(value.annotations)) annotations.push(...value.annotations);
        Object.entries(value).forEach(([key, child]) => {
            if (key !== 'text' && key !== 'annotations') visit(child);
        });
    };
    visit(items);
    return { text: text.join('\n').trim(), annotations };
}

function getHttpUrls(value) {
    const found = [];
    const visit = (item) => {
        if (Array.isArray(item)) {
            item.forEach(visit);
            return;
        }
        if (!item || typeof item !== 'object') return;
        Object.entries(item).forEach(([key, child]) => {
            if (['url', 'link', 'href', 'source_url'].includes(key.toLowerCase()) && typeof child === 'string') {
                try {
                    const parsed = new URL(child);
                    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                        found.push({
                            title: String(item.title || item.name || parsed.hostname),
                            url: parsed.toString()
                        });
                    }
                } catch {
                    // Ignore non-URL provider fields.
                }
            } else if (child && typeof child === 'object') {
                visit(child);
            }
        });
    };
    visit(value);
    return found.filter((citation, index, list) =>
        list.findIndex((entry) => entry.url === citation.url) === index
    );
}

function isHangbugUrl(rawUrl, domain) {
    try {
        const hostname = new URL(rawUrl).hostname.toLowerCase();
        const rootDomain = String(domain || 'www.hangbug.com').toLowerCase().replace(/^www\./, '');
        return hostname === rootDomain || hostname.endsWith(`.${rootDomain}`);
    } catch {
        return false;
    }
}

function buildMeasurement({ id, name, responseText, citations, modelName, prompt, domain, checkedAt }) {
    if (!responseText) {
        throw new Error(`${name} returned no readable response text.`);
    }
    const hangbugCitations = citations
        .filter((citation) => isHangbugUrl(citation.url, domain))
        .slice(0, 10);
    const mentionsHangbug = /hangbug/i.test(responseText)
        || hangbugCitations.length > 0;

    return {
        id,
        name,
        status: 'Measured',
        mentions: mentionsHangbug ? 1 : 0,
        citedPages: new Set(hangbugCitations.map((citation) => {
            const url = new URL(citation.url);
            return `${url.hostname}${url.pathname}`;
        })).size,
        samplesChecked: 1,
        checkedAt,
        reason: '',
        evidence: [{
            prompt,
            model: modelName,
            mentions: mentionsHangbug,
            citations: hangbugCitations,
            responseExcerpt: responseText.slice(0, MAX_EXCERPT_LENGTH)
        }]
    };
}

async function fetchLlmMeasurement(platform, domain, credentials, checkedAt) {
    const modelName = await getWebSearchModel(platform, credentials);
    const payload = await postDataForSeoTask(`${platform.endpoint}/live`, {
        user_prompt: AI_VISIBILITY_PROMPT,
        model_name: modelName,
        max_output_tokens: 512,
        ...platform.options
    }, credentials);
    const result = getTaskResult(payload, `${platform.name} live response`);
    const content = collectResponseContent(result.items || []);
    const citations = getHttpUrls(content.annotations);
    return buildMeasurement({
        id: platform.id,
        name: platform.name,
        responseText: content.text,
        citations,
        modelName: result.model_name || modelName,
        prompt: AI_VISIBILITY_PROMPT,
        domain,
        checkedAt
    });
}

async function fetchGoogleAiOverview(domain, credentials, checkedAt) {
    const payload = await postDataForSeoTask('serp/google/organic/live/advanced', {
        keyword: AI_VISIBILITY_PROMPT,
        location_code: 2840,
        language_code: 'en',
        device: 'desktop',
        load_async_ai_overview: true
    }, credentials);
    const result = getTaskResult(payload, 'Google AI Overview search');
    const items = Array.isArray(result.items) ? result.items : [];
    const overview = items.find((item) => String(item?.type || '').toLowerCase() === 'ai_overview');

    if (!overview) {
        return {
            id: 'ai-overviews',
            name: 'Google AI Overviews',
            status: 'No AI Overview returned',
            mentions: null,
            citedPages: null,
            samplesChecked: 0,
            checkedAt,
            reason: 'Google did not return an AI Overview for the monitored query.',
            evidence: []
        };
    }

    const content = collectResponseContent([overview]);
    const citations = getHttpUrls(overview);
    return buildMeasurement({
        id: 'ai-overviews',
        name: 'Google AI Overviews',
        responseText: content.text || JSON.stringify(overview),
        citations,
        modelName: 'Google Search',
        prompt: AI_VISIBILITY_PROMPT,
        domain,
        checkedAt
    });
}

async function refreshDataForSeoVisibility(domain) {
    const credentials = getCredentials();
    if (!credentials) {
        throw new Error('DataForSEO is not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in the server environment.');
    }

    const checkedAt = new Date().toISOString();
    const outcomes = await Promise.allSettled([
        ...LLM_PLATFORMS.map((platform) =>
            fetchLlmMeasurement(platform, domain, credentials, checkedAt)
        ),
        fetchGoogleAiOverview(domain, credentials, checkedAt)
    ]);
    const platforms = outcomes.map((outcome, index) => {
        const platform = index < LLM_PLATFORMS.length
            ? LLM_PLATFORMS[index]
            : { id: 'ai-overviews', name: 'Google AI Overviews' };
        if (outcome.status === 'fulfilled') return outcome.value;
        return {
            id: platform.id,
            name: platform.name,
            status: 'Unavailable',
            mentions: null,
            citedPages: null,
            samplesChecked: 0,
            checkedAt,
            reason: outcome.reason?.message || 'Live provider request failed.',
            evidence: []
        };
    });

    if (!platforms.some((platform) => platform.status === 'Measured' || platform.status === 'No AI Overview returned')) {
        const failures = platforms.map((platform) => `${platform.name}: ${platform.reason}`).join(' ');
        throw new Error(`DataForSEO could not complete any live visibility checks. ${failures}`);
    }

    const successfulCount = platforms.filter((platform) =>
        platform.status === 'Measured' || platform.status === 'No AI Overview returned'
    ).length;
    return {
        connected: true,
        provider: 'DataForSEO',
        source: 'DataForSEO live AI responses and Google SERP',
        checkedAt,
        successfulChecks: successfulCount,
        totalChecks: platforms.length,
        explanation: 'Live sample checks from DataForSEO. Each available AI platform received one monitored query; mentions and citations describe these samples, not total consumer search volume.',
        prompt: AI_VISIBILITY_PROMPT,
        platforms
    };
}

async function testDataForSeoConnection() {
    const credentials = getCredentials();
    if (!credentials) {
        return {
            ok: false,
            provider: 'DataForSEO',
            configured: false,
            message: 'Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in the server environment.'
        };
    }

    const payload = await getDataForSeo('appendix/user_data', credentials);
    getTaskResults(payload, 'DataForSEO authentication');
    return {
        ok: true,
        provider: 'DataForSEO',
        configured: true,
        message: 'DataForSEO credentials authenticated. This test does not run paid visibility queries.'
    };
}

module.exports = {
    AI_VISIBILITY_PROMPT,
    buildMeasurement,
    fetchGoogleAiOverview,
    getCredentials,
    getHttpUrls,
    getTaskResult,
    getTaskResults,
    isConfigured,
    refreshDataForSeoVisibility,
    testDataForSeoConnection
};
