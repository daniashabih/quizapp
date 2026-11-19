import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import usePageSeo from '../../hooks/usePageSeo';
import seoService from '../../services/seoService';
import { toast } from '../../services/notificationService';
import SeoSidebar from '../../components/seo/SeoSidebar';
import SeoHeader from '../../components/seo/SeoHeader';
import SeoIssueDetailModal from '../../components/seo/SeoIssueDetailModal';
import SeoOverviewSection from '../../components/seo/SeoOverviewSection';
import SeoSearchPerformanceSection from '../../components/seo/SeoSearchPerformanceSection';
import SeoKeywordsSection from '../../components/seo/SeoKeywordsSection';
import SeoAuditSection from '../../components/seo/SeoAuditSection';
import SeoIndexingSection from '../../components/seo/SeoIndexingSection';
import SeoContentSection from '../../components/seo/SeoContentSection';
import SeoTechnicalSection from '../../components/seo/SeoTechnicalSection';
import SeoBacklinksSection from '../../components/seo/SeoBacklinksSection';
import SeoAiVisibilitySection from '../../components/seo/SeoAiVisibilitySection';
import SeoCompetitorsSection from '../../components/seo/SeoCompetitorsSection';
import SeoRecommendationsSection from '../../components/seo/SeoRecommendationsSection';
import SeoSettingsSection from '../../components/seo/SeoSettingsSection';
import { SEO_NAV_ITEMS } from '../../components/seo/seoUtils';

export default function SeoDashboard() {
    usePageSeo({
        title: 'SEO & Growth Studio — Hangbug',
        noindex: true
    });

    const { section } = useParams();
    const navigate = useNavigate();

    const validSection = SEO_NAV_ITEMS.some(item => item.id === section) ? section : 'overview';
    const [activeSection, setActiveSection] = useState(validSection);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const [domain, setDomain] = useState('www.hangbug.com');
    const [dateRange, setDateRange] = useState('28d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [auditing, setAuditing] = useState(false);
    const [error, setError] = useState('');
    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        if (section && SEO_NAV_ITEMS.some(item => item.id === section)) {
            setActiveSection(section);
        } else if (!section) {
            setActiveSection('overview');
        }
    }, [section]);

    const handleSelectSection = (nextSection) => {
        setActiveSection(nextSection);
        navigate(nextSection === 'overview' ? '/dashboard/seo' : `/dashboard/seo/${nextSection}`);
    };

    const fetchDashboard = useCallback(async ({ silent = false, overrideRange, overrideStart, overrideEnd } = {}) => {
        if (silent) setRefreshing(true);
        else setLoading(true);
        setError('');

        try {
            const res = await seoService.getDashboard({
                domain,
                range: overrideRange ?? dateRange,
                startDate: overrideStart ?? customStart,
                endDate: overrideEnd ?? customEnd
            });
            if (res?.success && res?.data) {
                setDashboardData(res.data);
            } else {
                throw new Error(res?.message || 'Unable to load SEO dashboard');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Failed to load Hangbug SEO & Growth data.';
            setError(msg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [domain, dateRange, customStart, customEnd]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const handleRunAudit = async () => {
        setAuditing(true);
        try {
            const res = await seoService.runAudit({ domain, useLiveHttp: true });
            if (res?.success) {
                toast.success(res.message || 'Live SEO Audit completed!');
                await fetchDashboard({ silent: true });
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'SEO Audit failed.');
        } finally {
            setAuditing(false);
        }
    };

    const handleChangeDateRange = (nextRange) => {
        setDateRange(nextRange);
        if (nextRange !== 'custom') {
            fetchDashboard({ silent: true, overrideRange: nextRange });
        }
    };

    const handleApplyCustomRange = (start, end) => {
        setCustomStart(start);
        setCustomEnd(end);
        setDateRange('custom');
        fetchDashboard({ silent: true, overrideRange: 'custom', overrideStart: start, overrideEnd: end });
    };

    const activeNavMeta = SEO_NAV_ITEMS.find(i => i.id === activeSection) || SEO_NAV_ITEMS[0];
    const auditBadgeCount = (dashboardData?.audit?.criticalCount || 0) + (dashboardData?.audit?.warningCount || 0);
    const pendingRecsCount = (dashboardData?.recommendations?.items || []).filter(r => !r.isCompleted).length;

    const renderSection = () => {
        if (!dashboardData) return null;

        switch (activeSection) {
            case 'overview':
                return (
                    <SeoOverviewSection
                        data={dashboardData}
                        onNavigate={handleSelectSection}
                        onInspectIssue={setSelectedIssue}
                    />
                );
            case 'search-performance':
                return (
                    <SeoSearchPerformanceSection
                        data={dashboardData}
                        dateRange={dateRange}
                        customStart={customStart}
                        customEnd={customEnd}
                        onChangeDateRange={handleChangeDateRange}
                        onApplyCustomRange={handleApplyCustomRange}
                        onNavigate={handleSelectSection}
                    />
                );
            case 'keywords':
                return (
                    <SeoKeywordsSection
                        data={dashboardData}
                        onNavigate={handleSelectSection}
                    />
                );
            case 'audit':
                return (
                    <SeoAuditSection
                        data={dashboardData}
                        isAuditing={auditing}
                        onRunAudit={handleRunAudit}
                        onInspectIssue={setSelectedIssue}
                    />
                );
            case 'indexing':
                return (
                    <SeoIndexingSection
                        data={dashboardData}
                        domain={domain}
                        onNavigate={handleSelectSection}
                    />
                );
            case 'content':
                return (
                    <SeoContentSection
                        data={dashboardData}
                        onNavigate={handleSelectSection}
                    />
                );
            case 'technical':
                return (
                    <SeoTechnicalSection
                        data={dashboardData}
                        domain={domain}
                        onDataUpdated={() => fetchDashboard({ silent: true })}
                    />
                );
            case 'backlinks':
                return (
                    <SeoBacklinksSection
                        data={dashboardData}
                        domain={domain}
                        onDataUpdated={() => fetchDashboard({ silent: true })}
                        onNavigate={handleSelectSection}
                    />
                );
            case 'ai-visibility':
                return (
                    <SeoAiVisibilitySection
                        data={dashboardData}
                        onNavigate={handleSelectSection}
                    />
                );
            case 'competitors':
                return (
                    <SeoCompetitorsSection
                        data={dashboardData}
                        domain={domain}
                        onDataUpdated={() => fetchDashboard({ silent: true })}
                    />
                );
            case 'recommendations':
                return (
                    <SeoRecommendationsSection
                        data={dashboardData}
                        domain={domain}
                        onDataUpdated={() => fetchDashboard({ silent: true })}
                    />
                );
            case 'settings':
                return (
                    <SeoSettingsSection
                        domain={domain}
                        onDataUpdated={() => fetchDashboard({ silent: true })}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F7F8F6] dark:bg-[#0F1513] text-[#17221F] dark:text-[#F3F6F4] antialiased overflow-x-hidden">
            {/* Hangbug SEO Sidebar */}
            <SeoSidebar
                activeSection={activeSection}
                onSelectSection={handleSelectSection}
                auditBadgeCount={auditBadgeCount}
                pendingRecsCount={pendingRecsCount}
                domain={domain}
                mobileOpen={mobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
            />

            {/* Main Workspace */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
                <SeoHeader
                    currentDomain={domain}
                    availableDomains={['www.hangbug.com', 'hangbug.com']}
                    activeSectionLabel={activeNavMeta.label}
                    lastUpdated={dashboardData?.overview?.lastDataUpdate}
                    isAuditing={auditing}
                    isRefreshing={refreshing}
                    onDomainChange={(nextDom) => {
                        setDomain(nextDom);
                        toast.info(`Switched active property to ${nextDom}`);
                    }}
                    onRunAudit={handleRunAudit}
                    onRefresh={() => fetchDashboard({ silent: true })}
                    onOpenMobileMenu={() => setMobileSidebarOpen(true)}
                />

                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto min-w-0">
                    {error && (
                        <div className="mb-5 p-4 rounded-2xl bg-[#FCEEED] dark:bg-red-950/40 border border-[#F8C9C6] dark:border-red-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-[#B91C1C] dark:text-red-300">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => fetchDashboard()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#18221E] border border-[#F8C9C6] font-semibold cursor-pointer"
                            >
                                <RefreshCw size={12} />
                                <span>Retry</span>
                            </button>
                        </div>
                    )}

                    {loading && !dashboardData ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center">
                            <Loader2 size={32} className="animate-spin text-[#193D35] dark:text-emerald-400 mb-3" />
                            <p className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Analyzing Hangbug SEO &amp; Growth Metrics...
                            </p>
                            <p className="text-xs text-[#75817C] dark:text-[#8FA69C] mt-1">
                                Inspecting crawl health, content metadata, and connected Google data sources.
                            </p>
                        </div>
                    ) : (
                        renderSection()
                    )}
                </main>

                <footer className="border-t border-[#E4EAE6] dark:border-[#2A3832] bg-white dark:bg-[#141D19] px-4 sm:px-6 lg:px-8 py-3.5 text-[11px] text-[#75817C] dark:text-[#8FA69C] mt-auto">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                        <span>Hangbug SEO &amp; Growth Studio · Original Analytics &amp; Technical Audit Platform</span>
                        <span>All metrics reflect verified integrations and live Hangbug crawler checks only.</span>
                    </div>
                </footer>
            </div>

            {/* Plain-English 6-Part SEO Issue Detail Modal */}
            <SeoIssueDetailModal
                issue={selectedIssue}
                siteUrl={dashboardData?.project?.siteUrl || 'https://www.hangbug.com'}
                onClose={() => setSelectedIssue(null)}
            />
        </div>
    );
}
