const {
    DEFAULT_DOMAIN,
    normalizeDomain,
    getProjectConfig,
    sanitizeConfigForClient,
    saveProjectConfig,
    verifySearchConsoleServiceAccount,
    resolveDateRange,
    fetchSearchConsolePerformance,
    inspectUrlInSearchConsole,
    fetchGa4Performance,
    runPageSpeedInsights,
    buildPageSpeedDashboardView,
    redactPageSpeedApiKey,
    fetchOpenPageRankData,
    getBacklinksData,
    importGscBacklinks,
    clearGscBacklinks,
    getAiVisibilityData,
    testIntegrationConnection,
    getSnapshot
} = require('../_services/seoIntegrationService');
const {
    runFullSeoAudit,
    getLatestAndPreviousAuditRuns,
    buildPrioritizedRecommendations,
    toggleRecommendationState,
    inspectTargetUrlLive
} = require('../_services/seoAuditService');
const {
    listCompetitors,
    addCompetitor,
    refreshCompetitor,
    deleteCompetitor
} = require('../_services/seoCompetitorService');

function buildOverviewMetrics({ config, latestAudit, previousAudit, gscData, ga4Data, backlinksData }) {
    const technicalIssuesCount = latestAudit ? (latestAudit.criticalCount + latestAudit.warningCount) : 0;
    const prevTechnicalIssuesCount = previousAudit ? (previousAudit.criticalCount + previousAudit.warningCount) : null;

    const healthTrend = latestAudit && previousAudit
        ? Number((latestAudit.overallScore - previousAudit.overallScore).toFixed(1))
        : null;
    const issuesTrend = prevTechnicalIssuesCount !== null
        ? technicalIssuesCount - prevTechnicalIssuesCount
        : null;

    // Organic Traffic: verified GA4 organic sessions > verified GSC clicks > unavailable
    let organicTrafficMetric;
    if (ga4Data?.connected && ga4Data.summary) {
        organicTrafficMetric = {
            key: 'organicTraffic',
            label: 'Organic Traffic',
            explanation: 'Sessions originating from organic search engines via Google Analytics 4.',
            available: true,
            value: ga4Data.summary.organicSessions,
            formattedValue: ga4Data.summary.organicSessions.toLocaleString('en-US'),
            trend: ga4Data.summary.sessionsChangePct,
            trendUnit: '%',
            isEstimated: false,
            source: 'Google Analytics 4 Data API',
            updatedAt: ga4Data.syncedAt
        };
    } else if (gscData?.connected && gscData.summary) {
        organicTrafficMetric = {
            key: 'organicTraffic',
            label: 'Organic Search Clicks',
            explanation: 'Clicks from Google Search results measured by Google Search Console.',
            available: true,
            value: gscData.summary.totalClicks,
            formattedValue: gscData.summary.totalClicks.toLocaleString('en-US'),
            trend: gscData.summary.clicksChangePct,
            trendUnit: '%',
            isEstimated: false,
            source: 'Google Search Console',
            updatedAt: gscData.syncedAt
        };
    } else {
        organicTrafficMetric = {
            key: 'organicTraffic',
            label: 'Organic Traffic',
            explanation: 'Visits arriving from unpaid search engine results.',
            available: false,
            value: null,
            formattedValue: 'Not connected',
            unavailabilityReason: 'Connect Google Analytics 4 Data API or Google Search Console in Settings to view verified organic traffic.',
            trend: null,
            isEstimated: false,
            source: 'GA4 / Google Search Console',
            updatedAt: null
        };
    }

    // Indexed Pages: GSC sitemap indexed count if available, else explain clearly alongside crawlable count
    const gscSubmittedIndexed = (gscData?.sitemaps || []).reduce((sum, sm) => {
        const contentsSum = (sm.contents || []).reduce((cSum, c) => cSum + Number(c.indexed || 0), 0);
        return sum + contentsSum;
    }, 0);
    const crawlIndexableCount = (latestAudit?.summary?.urlInventory || []).filter(u => u.httpStatus === 200 && !u.isNoindex).length;

    const indexedPagesMetric = gscData?.connected && gscSubmittedIndexed > 0
        ? {
            key: 'indexedPages',
            label: 'Indexed Pages',
            explanation: 'Pages submitted via sitemap and confirmed indexed in Google Search Console.',
            available: true,
            value: gscSubmittedIndexed,
            formattedValue: gscSubmittedIndexed.toLocaleString('en-US'),
            trend: null,
            isEstimated: false,
            source: 'Google Search Console Sitemaps',
            updatedAt: gscData.syncedAt
        }
        : {
            key: 'indexedPages',
            label: 'Indexed Pages (Google)',
            explanation: 'Pages verified as indexed in Google Search results.',
            available: false,
            value: null,
            secondaryValue: crawlIndexableCount,
            formattedValue: 'GSC Not Connected',
            unavailabilityReason: `Google Search Console is not connected yet. Hangbug crawler verified ${crawlIndexableCount} indexable canonical URLs ready for Google indexing.`,
            trend: null,
            isEstimated: false,
            source: 'Google Search Console (Required)',
            updatedAt: latestAudit?.createdAt || null
        };

    // Ranking Keywords
    const rankingKeywordsMetric = gscData?.connected && gscData.summary
        ? {
            key: 'rankingKeywords',
            label: 'Ranking Keywords',
            explanation: 'Distinct search queries generating impressions for Hangbug in Google Search.',
            available: true,
            value: gscData.summary.rankingKeywordsCount,
            formattedValue: gscData.summary.rankingKeywordsCount.toLocaleString('en-US'),
            trend: null,
            isEstimated: false,
            source: 'Google Search Console',
            updatedAt: gscData.syncedAt
        }
        : {
            key: 'rankingKeywords',
            label: 'Ranking Keywords',
            explanation: 'Queries where Hangbug appears in Google Search results.',
            available: false,
            value: null,
            formattedValue: 'Not connected',
            unavailabilityReason: 'Connect Google Search Console in Settings to measure actual ranking search queries and positions.',
            trend: null,
            isEstimated: false,
            source: 'Google Search Console / Keyword Provider',
            updatedAt: null
        };

    // Referring Domains & Backlinks
    const oprConnected = Boolean(backlinksData?.openPageRank?.connected);
    const gscImportAvailable = Boolean(backlinksData?.gscLinksImport?.available);
    const refDomainsVal = backlinksData?.summary?.referringDomains;
    const refDomainsAvailable = Boolean(backlinksData?.connected && refDomainsVal !== null && refDomainsVal !== undefined);
    const gscTotalBacklinks = backlinksData?.gscLinksImport?.summary?.totalBacklinks ?? backlinksData?.summary?.totalBacklinks ?? null;
    const backlinksAvailable = Boolean(gscImportAvailable && gscTotalBacklinks !== null && gscTotalBacklinks !== undefined);

    const referringDomainsMetric = refDomainsAvailable
        ? {
            key: 'referringDomains',
            label: 'Referring Domains',
            explanation: 'The number of linking domains reported by the selected data provider.',
            available: true,
            value: refDomainsVal,
            formattedValue: Number(refDomainsVal).toLocaleString('en-US'),
            trend: null,
            isEstimated: oprConnected,
            source: oprConnected ? 'OpenPageRank API' : 'GSC Links CSV Import',
            updatedAt: backlinksData.syncedAt
        }
        : {
            key: 'referringDomains',
            label: 'Referring Domains',
            explanation: 'The number of linking domains reported by the selected data provider.',
            available: false,
            value: null,
            formattedValue: backlinksData?.openPageRank?.connectionStatus || 'Not connected',
            unavailabilityReason: backlinksData?.reason || 'Connect OpenPageRank in Settings or import a Google Search Console Links CSV report.',
            trend: null,
            isEstimated: false,
            source: 'OpenPageRank / GSC Links CSV',
            updatedAt: null
        };

    const backlinksMetric = backlinksAvailable
        ? {
            key: 'backlinks',
            label: 'Imported GSC Links',
            explanation: 'External links reported in your manually imported Google Search Console Links CSV snapshot.',
            available: true,
            value: gscTotalBacklinks,
            formattedValue: Number(gscTotalBacklinks).toLocaleString('en-US'),
            trend: null,
            isEstimated: false,
            source: 'GSC Links CSV (Manual Import)',
            updatedAt: backlinksData?.gscLinksImport?.importedAt || backlinksData.syncedAt
        }
        : oprConnected && backlinksData?.openPageRank?.score !== null && backlinksData?.openPageRank?.score !== undefined
            ? {
                key: 'backlinks',
                label: 'OpenPageRank Score',
                explanation: "An external estimate of your website's authority based on its link graph. It is not a Google ranking score.",
                available: true,
                value: backlinksData.openPageRank.score,
                formattedValue: `${backlinksData.openPageRank.score}/10`,
                trend: backlinksData?.openPageRank?.historySummary?.monthOverMonthChange ?? null,
                trendUnit: '',
                isEstimated: true,
                source: 'OpenPageRank API',
                updatedAt: backlinksData.openPageRank.syncedAt
            }
            : {
                key: 'backlinks',
                label: 'OpenPageRank Score',
                explanation: "An external estimate of your website's authority based on its link graph. It is not a Google ranking score.",
                available: false,
                value: null,
                formattedValue: backlinksData?.openPageRank?.connectionStatus || 'Not Configured',
                unavailabilityReason: backlinksData?.reason || 'Configure OpenPageRank in Settings or import a Google Search Console Links CSV export.',
                trend: null,
                isEstimated: false,
                source: 'OpenPageRank API',
                updatedAt: null
            };

    const lastUpdateCandidates = [latestAudit?.createdAt, gscData?.syncedAt, ga4Data?.syncedAt].filter(Boolean);
    const lastDataUpdate = lastUpdateCandidates.sort().reverse()[0] || new Date().toISOString();

    return {
        domain: config.domain,
        siteUrl: config.siteUrl,
        lastDataUpdate,
        metrics: [
            {
                key: 'overallSeoHealth',
                label: 'Overall SEO Health',
                explanation: 'Weighted 0–100 composite across Technical, On-page, Content, Indexing, and Internal Linking.',
                available: Boolean(latestAudit),
                value: latestAudit ? latestAudit.overallScore : null,
                formattedValue: latestAudit ? `${latestAudit.overallScore}/100` : 'Not audited',
                trend: healthTrend,
                trendUnit: ' pts',
                isEstimated: false,
                source: latestAudit?.source || 'Hangbug Audit Engine',
                updatedAt: latestAudit?.createdAt || null
            },
            organicTrafficMetric,
            indexedPagesMetric,
            rankingKeywordsMetric,
            referringDomainsMetric,
            backlinksMetric,
            {
                key: 'technicalIssues',
                label: 'Technical & On-Page Issues',
                explanation: 'Active Critical issues and Warnings identified by the Hangbug SEO crawler.',
                available: Boolean(latestAudit),
                value: latestAudit ? technicalIssuesCount : null,
                formattedValue: latestAudit ? String(technicalIssuesCount) : 'Not audited',
                trend: issuesTrend,
                trendUnit: '',
                invertTrendGood: true,
                isEstimated: false,
                source: latestAudit?.source || 'Hangbug SEO Crawler',
                updatedAt: latestAudit?.createdAt || null
            }
        ]
    };
}

function buildIndexingOverview({ gscData, latestAudit }) {
    const inventory = latestAudit?.summary?.urlInventory || [];
    const crawlIndexable = inventory.filter(u => u.httpStatus === 200 && !u.isNoindex).length;
    const crawlNotIndexed = inventory.filter(u => u.isNoindex || u.httpStatus === 404).length;
    const crawlErrors = inventory.filter(u => u.httpStatus >= 400 || u.httpStatus === 0).length;
    const redirectChecks = latestAudit?.summary?.technicalReport?.redirectChains?.items || [];
    const redirectCount = redirectChecks.filter(r => r.redirectHops > 0).length;
    const sitemapUrlCount = latestAudit?.summary?.sitemapUrlCount || 0;

    const gscSitemaps = gscData?.sitemaps || [];
    const gscIndexedTotal = gscSitemaps.reduce(
        (sum, sm) => sum + (sm.contents || []).reduce((s, c) => s + Number(c.indexed || 0), 0),
        0
    );
    const gscSubmittedTotal = gscSitemaps.reduce(
        (sum, sm) => sum + (sm.contents || []).reduce((s, c) => s + Number(c.submitted || 0), 0),
        0
    );
    const gscSitemapErrors = gscSitemaps.reduce((sum, sm) => sum + Number(sm.errors || 0), 0);

    return {
        gscConnected: Boolean(gscData?.connected),
        source: gscData?.connected
            ? 'Google Search Console + Hangbug Crawler'
            : 'Hangbug Crawler Indexability Audit (Google Search Console Not Connected)',
        updatedAt: gscData?.syncedAt || latestAudit?.createdAt || null,
        explanation: gscData?.connected
            ? 'Showing verified Google Search Console sitemap index status alongside live Hangbug route crawlability.'
            : 'Google Search Console is not connected yet, so verified Google index counts are unavailable. Below are Hangbug’s live crawlability, redirect, error, and sitemap checks.',
        summary: {
            indexedPages: {
                value: gscData?.connected ? (gscIndexedTotal > 0 ? gscIndexedTotal : null) : null,
                crawlableReadyCount: crawlIndexable,
                label: gscData?.connected ? 'Indexed in Google (GSC Sitemap)' : 'Indexed in Google',
                status: gscData?.connected ? 'Verified' : 'Not connected',
                explanation: gscData?.connected
                    ? `${gscIndexedTotal} of ${gscSubmittedTotal || sitemapUrlCount} submitted sitemap URLs reported indexed by GSC.`
                    : `${crawlIndexable} canonical URLs passed crawlability checks; connect GSC for live Google index counts.`
            },
            notIndexedPages: {
                value: gscData?.connected && gscSubmittedTotal > 0 ? Math.max(0, gscSubmittedTotal - gscIndexedTotal) : null,
                crawlNoindexCount: crawlNotIndexed,
                status: gscData?.connected ? 'Verified' : 'Not connected',
                explanation: gscData?.connected
                    ? 'Submitted URLs not currently confirmed indexed in GSC sitemap summary.'
                    : `${crawlNotIndexed} audited URL(s) carry noindex or error status; connect GSC to view Google's Excluded pages.`
            },
            redirects: {
                value: redirectCount,
                status: redirectCount > 0 ? 'Active 301 Rules' : 'None checked',
                explanation: 'Canonical alias routes verified to perform clean 301 permanent redirects.'
            },
            errors: {
                value: gscData?.connected ? (crawlErrors + gscSitemapErrors) : crawlErrors,
                status: crawlErrors === 0 ? 'Good' : 'Critical',
                explanation: crawlErrors === 0
                    ? 'Zero HTTP 4xx/5xx crawl errors across audited public URLs.'
                    : `${crawlErrors} audited URL(s) returned HTTP error codes.`
            },
            sitemapStatus: {
                status: sitemapUrlCount > 0 ? (gscSitemapErrors > 0 ? 'Needs attention' : 'Good') : 'Critical',
                urlCount: sitemapUrlCount,
                gscSitemaps,
                explanation: sitemapUrlCount > 0
                    ? `sitemap.xml is live with ${sitemapUrlCount} clean canonical URL(s).`
                    : 'sitemap.xml could not be parsed or contains 0 URLs.'
            }
        },
        urlInventory: inventory,
        redirectChecks
    };
}

exports.getSeoDashboard = async (req, res) => {
    try {
        const domain = normalizeDomain(req.query.domain || DEFAULT_DOMAIN);
        const rangeParam = String(req.query.range || '28d').trim();
        const customStart = String(req.query.startDate || '').trim();
        const customEnd = String(req.query.endDate || '').trim();
        const dateRange = resolveDateRange(rangeParam, customStart, customEnd);

        const config = await getProjectConfig(domain);

        const [gscData, ga4Data, backlinksData, auditHistoryData, competitors, pagespeedSnap] = await Promise.all([
            fetchSearchConsolePerformance(config, dateRange),
            fetchGa4Performance(config, dateRange),
            getBacklinksData(config),
            getLatestAndPreviousAuditRuns(domain),
            listCompetitors(domain),
            getSnapshot(domain, 'pagespeed')
        ]);

        // Run a baseline non-destructive local/live audit automatically ONLY if no audit run exists yet
        let latestAudit = auditHistoryData.latest;
        const previousAudit = auditHistoryData.previous;
        if (!latestAudit) {
            latestAudit = await runFullSeoAudit({
                domain,
                config,
                gscData,
                useLiveHttp: false // Fast deterministic initial audit on first open; user clicks "Run New Audit" for full live HTTP crawl
            });
        }

        const aiVisibility = await getAiVisibilityData(config, latestAudit?.summary?.aiReadinessChecks || []);
        const recommendations = await buildPrioritizedRecommendations(domain, latestAudit, gscData);
        const overview = buildOverviewMetrics({
            config,
            latestAudit,
            previousAudit,
            gscData,
            ga4Data,
            backlinksData
        });
        const indexing = buildIndexingOverview({ gscData, latestAudit });

        const targetKeywords = latestAudit?.summary?.targetContentKeywords || [];
        const measuredQueries = gscData?.connected ? (gscData.topQueries || []) : [];

        // Enrich content report with fresh GSC data if GSC is connected
        const baseContent = latestAudit?.summary?.contentReport || {};
        const gscPagesMap = new Map((gscData?.topPages || []).map(p => [p.path, p]));
        const enrichedArticles = (baseContent.bestPerformingArticles || []).map(a => {
            const gscMatch = gscPagesMap.get(`/blog/${a.slug}`);
            return gscMatch
                ? { ...a, gscClicks: gscMatch.clicks, gscImpressions: gscMatch.impressions, gscPosition: gscMatch.position }
                : a;
        });

        const hangbugTopics = [
            ...(baseContent.technologyCoverage || []).map(t => t.name),
            ...targetKeywords.map(k => k.keyword)
        ];

        const pageSpeedView = buildPageSpeedDashboardView({
            config,
            pagespeedSnap,
            latestAudit
        });
        const activeCwvReport = pageSpeedView.mobile || pageSpeedView.desktop || null;

        res.json({
            success: true,
            data: {
                project: sanitizeConfigForClient(
                    config,
                    gscData ? {
                        authenticated: Boolean(gscData.authenticated || gscData.connected),
                        authStatus: gscData.authStatus || (gscData.connected ? 'Authenticated' : undefined),
                        selectedProperty: gscData.property || config.gscProperty,
                        propertyVerified: Boolean(gscData.connected),
                        permissionLevel: gscData.permissionLevel || null,
                        availableProperties: gscData.availableProperties || [],
                        message: gscData.reason || ''
                    } : null,
                    ga4Data ? {
                        connected: Boolean(ga4Data.connected),
                        propertyId: ga4Data.propertyId || config.ga4PropertyId,
                        resourceName: ga4Data.resourceName || '',
                        measurementId: ga4Data.measurementId || config.ga4MeasurementId,
                        serviceAccountEmail: ga4Data.serviceAccountEmail || config.googleServiceAccountEmail,
                        errorCategory: ga4Data.errorCategory || null,
                        syncedAt: ga4Data.syncedAt || null,
                        message: ga4Data.reason || ''
                    } : null,
                    backlinksData?.openPageRank || null
                ),
                overview,
                healthScore: latestAudit?.scoreBreakdown || null,
                searchPerformance: gscData,
                analyticsOverview: ga4Data,
                indexing,
                keywords: {
                    gscConnected: Boolean(gscData?.connected),
                    keywordProviderConnected: config.keywordProvider !== 'none' && Boolean(config.keywordProviderKey),
                    measuredQueries,
                    targetContentKeywords: targetKeywords,
                    researchKeywords: [],
                    explanation: gscData?.connected
                        ? 'Measured Search Console queries show real Google impressions, clicks, CTR, and position. Target Content Keywords come from Hangbug page & blog metadata.'
                        : 'Google Search Console is not connected, so real query impressions and positions are unavailable. Target Content Keywords currently configured across Hangbug pages are shown below.'
                },
                audit: {
                    id: latestAudit?.id || null,
                    status: latestAudit?.status || 'completed',
                    source: latestAudit?.source || 'Hangbug SEO Inspector',
                    pagesScanned: latestAudit?.pagesScanned || 0,
                    criticalCount: latestAudit?.criticalCount || 0,
                    warningCount: latestAudit?.warningCount || 0,
                    opportunityCount: latestAudit?.opportunityCount || 0,
                    passedCount: latestAudit?.passedCount || 0,
                    durationMs: latestAudit?.durationMs || 0,
                    createdAt: latestAudit?.createdAt || null,
                    issues: latestAudit?.issues || [],
                    history: auditHistoryData.history || []
                },
                content: {
                    ...baseContent,
                    bestPerformingArticles: enrichedArticles,
                    organicPages: gscData?.connected ? (gscData.topPages || []) : [],
                    decliningPages: gscData?.connected ? (gscData.decliningPages || []) : [],
                    gscConnected: Boolean(gscData?.connected)
                },
                technical: {
                    ...(latestAudit?.summary?.technicalReport || {}),
                    pageSpeed: pageSpeedView,
                    coreWebVitals: activeCwvReport
                        ? {
                            status: [
                                activeCwvReport.coreWebVitals?.lcp?.status,
                                activeCwvReport.coreWebVitals?.cls?.status,
                                activeCwvReport.coreWebVitals?.inp?.status
                            ].includes('Critical')
                                ? 'Critical'
                                : [
                                    activeCwvReport.coreWebVitals?.lcp?.status,
                                    activeCwvReport.coreWebVitals?.cls?.status,
                                    activeCwvReport.coreWebVitals?.inp?.status
                                ].includes('Needs attention')
                                    ? 'Needs attention'
                                    : 'Good',
                            metrics: activeCwvReport.coreWebVitals,
                            checkedAt: activeCwvReport.checkedAt,
                            explanation: 'Measured Core Web Vitals (LCP, CLS, INP/TBT, FCP, TTFB) from Google PageSpeed Insights.'
                        }
                        : (latestAudit?.summary?.technicalReport?.coreWebVitals || { status: 'Not checked', metrics: null }),
                    source: latestAudit?.source || 'Hangbug Technical SEO Inspector',
                    updatedAt: latestAudit?.createdAt || null
                },
                backlinks: backlinksData,
                aiVisibility,
                competitors: {
                    items: competitors,
                    hangbugTopicsCount: Array.from(new Set(hangbugTopics)).length,
                    thirdPartyConnected: Boolean(backlinksData?.openPageRank?.connected),
                    explanation: 'Competitor comparisons combine direct public crawls (titles, sitemaps, topic coverage) with verified third-party APIs when configured. No competitor statistics are estimated without a connected provider.'
                },
                recommendations
            }
        });
    } catch (error) {
        console.error('[SEO Dashboard Controller Error]:', redactPageSpeedApiKey(error?.message || 'Dashboard load error'));
        res.status(500).json({
            success: false,
            message: redactPageSpeedApiKey(error?.message || 'Unable to load SEO dashboard data.')
        });
    }
};

exports.runAudit = async (req, res) => {
    try {
        const domain = normalizeDomain(req.body?.domain || req.query.domain || DEFAULT_DOMAIN);
        const useLiveHttp = req.body?.useLiveHttp !== false;
        const config = await getProjectConfig(domain);
        const dateRange = resolveDateRange('28d');
        const gscData = await fetchSearchConsolePerformance(config, dateRange).catch(() => null);

        const auditRun = await runFullSeoAudit({
            domain,
            config,
            gscData,
            useLiveHttp
        });

        res.json({
            success: true,
            message: `SEO audit completed (${auditRun.pagesScanned} pages analyzed).`,
            audit: auditRun
        });
    } catch (error) {
        console.error('[SEO Run Audit Error]:', redactPageSpeedApiKey(error?.message || 'Audit error'));
        res.status(500).json({
            success: false,
            message: redactPageSpeedApiKey(error?.message || 'Failed to run SEO audit.')
        });
    }
};

exports.runPageSpeed = async (req, res) => {
    try {
        const domain = normalizeDomain(req.body?.domain || DEFAULT_DOMAIN);
        const targetUrl = String(req.body?.url || '').trim();
        const strategy = String(req.body?.strategy || 'mobile').toLowerCase() === 'desktop' ? 'desktop' : 'mobile';
        const forceRefresh = Boolean(req.body?.forceRefresh);
        const config = await getProjectConfig(domain);

        const result = await runPageSpeedInsights(config, targetUrl || config.siteUrl, strategy, {
            forceRefresh
        });
        const fromCache = Boolean(result?.fromCache);
        const deduplicated = Boolean(result?.deduplicated);

        res.json({
            success: true,
            fromCache,
            deduplicated,
            cacheStatus: result?.cacheStatus || (fromCache ? 'cached' : 'fresh'),
            message: fromCache
                ? `Loaded cached ${strategy} PageSpeed report (valid for 24 hours).`
                : `Live ${strategy} PageSpeed check completed.`,
            pagespeed: result
        });
    } catch (error) {
        const safeMessage = redactPageSpeedApiKey(error?.userMessage || error?.message || 'PageSpeed Insights request failed.');
        const safeTechnical = redactPageSpeedApiKey(error?.technicalDetail || error?.message || '');
        console.error('[SEO PageSpeed Error]:', safeTechnical || safeMessage);
        res.status(error?.status || error?.httpStatus || 500).json({
            success: false,
            errorCategory: error?.errorCategory || 'api_error',
            isQuotaError: Boolean(error?.isQuotaError),
            isDailyQuota: Boolean(error?.isDailyQuota),
            retryable: Boolean(error?.retryable),
            message: safeMessage,
            userMessage: safeMessage,
            technicalDetail: safeTechnical,
            nextRetryAt: error?.nextRetryAt || null,
            projectNumber: error?.projectNumber || null,
            hasCachedReport: Boolean(error?.hasCachedReport),
            cachedReport: error?.cachedReport || null,
            pagespeed: error?.pagespeed || null
        });
    }
};

exports.inspectUrl = async (req, res) => {
    try {
        const domain = normalizeDomain(req.body?.domain || DEFAULT_DOMAIN);
        const targetUrl = String(req.body?.url || '/').trim();
        const config = await getProjectConfig(domain);

        const [crawlInspection, gscInspection] = await Promise.all([
            inspectTargetUrlLive(config, targetUrl),
            inspectUrlInSearchConsole(config, targetUrl.startsWith('http') ? targetUrl : `${config.siteUrl}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`)
        ]);

        res.json({
            success: true,
            inspection: {
                crawl: crawlInspection,
                gsc: gscInspection,
                inspectedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to inspect URL.'
        });
    }
};

exports.toggleRecommendation = async (req, res) => {
    try {
        const { recKey } = req.params;
        const domain = normalizeDomain(req.body?.domain || DEFAULT_DOMAIN);
        const isCompleted = Boolean(req.body?.isCompleted);
        const title = String(req.body?.title || '').trim();
        const priority = String(req.body?.priority || 'Medium').trim();
        const notes = req.body?.notes !== undefined ? String(req.body.notes) : undefined;

        const saved = await toggleRecommendationState({
            domain,
            recKey,
            title,
            priority,
            isCompleted,
            userEmail: req.user?.email || '',
            notes
        });

        res.json({
            success: true,
            message: isCompleted ? 'Recommendation marked as completed.' : 'Recommendation reopened.',
            recommendation: saved
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Could not update recommendation status.'
        });
    }
};

exports.getCompetitors = async (req, res) => {
    try {
        const domain = normalizeDomain(req.query.domain || DEFAULT_DOMAIN);
        const items = await listCompetitors(domain);
        res.json({ success: true, competitors: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCompetitor = async (req, res) => {
    try {
        const domain = normalizeDomain(req.body?.domain || DEFAULT_DOMAIN);
        const competitorDomain = req.body?.competitorDomain;
        const label = req.body?.label || '';
        const notes = req.body?.notes || '';
        const config = await getProjectConfig(domain);

        const item = await addCompetitor({
            domain,
            competitorDomain,
            label,
            notes,
            hangbugTopics: ['html', 'css', 'javascript', 'react', 'php', 'laravel', 'mysql', 'mongodb', 'flutter', 'dart', 'python', 'c#', 'sql', 'quizzes', 'coding games', 'certificates'],
            config
        });

        res.status(201).json({
            success: true,
            message: `Added and analyzed ${item.competitorDomain}.`,
            competitor: item
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Unable to add competitor.'
        });
    }
};

exports.refreshCompetitor = async (req, res) => {
    try {
        const { id } = req.params;
        const domain = normalizeDomain(req.body?.domain || req.query.domain || DEFAULT_DOMAIN);
        const config = await getProjectConfig(domain);

        const item = await refreshCompetitor({
            domain,
            id,
            hangbugTopics: ['html', 'css', 'javascript', 'react', 'php', 'laravel', 'mysql', 'mongodb', 'flutter', 'dart', 'python', 'c#', 'sql', 'quizzes', 'coding games', 'certificates'],
            config
        });

        res.json({
            success: true,
            message: `Refreshed public SEO snapshot for ${item.competitorDomain}.`,
            competitor: item
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Unable to refresh competitor.'
        });
    }
};

exports.removeCompetitor = async (req, res) => {
    try {
        const { id } = req.params;
        const domain = normalizeDomain(req.query.domain || DEFAULT_DOMAIN);
        await deleteCompetitor({ domain, id });
        res.json({ success: true, message: 'Competitor removed.' });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Unable to remove competitor.'
        });
    }
};

exports.getSeoSettings = async (req, res) => {
    try {
        const domain = normalizeDomain(req.query.domain || DEFAULT_DOMAIN);
        const config = await getProjectConfig(domain);
        const [verification, ga4Res, oprRes] = await Promise.all([
            verifySearchConsoleServiceAccount(config),
            fetchGa4Performance(config, resolveDateRange('7d')).catch(() => null),
            fetchOpenPageRankData(config).catch(() => null)
        ]);
        if (verification.propertyVerified && verification.selectedProperty && config.rawGscProperty !== verification.selectedProperty) {
            await saveProjectConfig(domain, { gscProperty: verification.selectedProperty });
        }
        const ga4Ver = ga4Res ? {
            connected: Boolean(ga4Res.connected),
            propertyId: ga4Res.propertyId || config.ga4PropertyId,
            resourceName: ga4Res.resourceName || '',
            measurementId: ga4Res.measurementId || config.ga4MeasurementId,
            serviceAccountEmail: ga4Res.serviceAccountEmail || config.googleServiceAccountEmail,
            errorCategory: ga4Res.errorCategory || null,
            syncedAt: ga4Res.syncedAt || null,
            message: ga4Res.reason || ''
        } : null;
        res.json({
            success: true,
            settings: sanitizeConfigForClient(config, verification, ga4Ver, oprRes)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSeoSettings = async (req, res) => {
    try {
        const domain = normalizeDomain(req.body?.domain || req.query.domain || DEFAULT_DOMAIN);
        const saved = await saveProjectConfig(domain, req.body || {});
        const merged = await getProjectConfig(saved.domain || domain);
        const [verification, ga4Res, oprRes] = await Promise.all([
            verifySearchConsoleServiceAccount(merged),
            fetchGa4Performance(merged, resolveDateRange('7d')).catch(() => null),
            fetchOpenPageRankData(merged).catch(() => null)
        ]);
        if (verification.propertyVerified && verification.selectedProperty && merged.rawGscProperty !== verification.selectedProperty) {
            await saveProjectConfig(domain, { gscProperty: verification.selectedProperty });
        }
        const ga4Ver = ga4Res ? {
            connected: Boolean(ga4Res.connected),
            propertyId: ga4Res.propertyId || merged.ga4PropertyId,
            resourceName: ga4Res.resourceName || '',
            measurementId: ga4Res.measurementId || merged.ga4MeasurementId,
            serviceAccountEmail: ga4Res.serviceAccountEmail || merged.googleServiceAccountEmail,
            errorCategory: ga4Res.errorCategory || null,
            syncedAt: ga4Res.syncedAt || null,
            message: ga4Res.reason || ''
        } : null;
        res.json({
            success: true,
            message: 'SEO integration & crawler settings saved.',
            settings: sanitizeConfigForClient(merged, verification, ga4Ver, oprRes)
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Unable to save SEO settings.'
        });
    }
};

exports.testSeoIntegration = async (req, res) => {
    try {
        const domain = normalizeDomain(req.body?.domain || DEFAULT_DOMAIN);
        const target = String(req.body?.target || '').trim().toLowerCase();
        const result = await testIntegrationConnection(domain, target, {
            apiKey: req.body?.apiKey
        });
        res.json({
            success: result.ok,
            result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Integration test failed.'
        });
    }
};

exports.importBacklinks = async (req, res) => {
    try {
        const domain = normalizeDomain(req.body?.domain || DEFAULT_DOMAIN);
        const csvText = req.body?.csvText || '';
        const fileName = req.body?.fileName || '';
        const reportDate = req.body?.reportDate || '';
        const items = req.body?.items || [];
        const hasCsvInput = Boolean(csvText && String(csvText).trim());
        const saved = await importGscBacklinks(
            domain,
            hasCsvInput || fileName || reportDate
                ? { csvText, fileName, reportDate, items }
                : items
        );
        const domCount = saved.summary?.referringDomains ?? 0;
        const targetCount = saved.summary?.targetPagesCount ?? 0;
        const linksCount = saved.summary?.totalBacklinks ?? 0;
        res.json({
            success: true,
            message: `Imported Google Search Console Links report (${domCount} external linking domain(s), ${targetCount} target page(s), ${linksCount} link(s)).`,
            backlinks: saved
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to import backlinks.'
        });
    }
};

exports.clearImportedBacklinks = async (req, res) => {
    try {
        const domain = normalizeDomain(req.body?.domain || req.query.domain || DEFAULT_DOMAIN);
        await clearGscBacklinks(domain);
        res.json({
            success: true,
            message: 'Cleared imported Google Search Console Links CSV report.'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Unable to clear imported GSC Links report.'
        });
    }
};
