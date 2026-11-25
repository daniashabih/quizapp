import React from 'react';
import { Link } from 'react-router-dom';
import {
    FileText,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    BookOpen,
    ExternalLink
} from 'lucide-react';

export default function SeoContentSection({ data, onNavigate }) {
    const content = data?.content || {};
    const articles = content.bestPerformingArticles || [];
    const organicPages = content.organicPages || [];
    const decliningPages = content.decliningPages || [];
    const needsImprovement = content.contentNeedingImprovement || [];
    const missingMeta = content.missingMetaDescriptions || [];
    const titleIssues = content.duplicateOrMissingTitles || [];
    const techCoverage = Array.isArray(content.technologyCoverage) ? content.technologyCoverage : [];
    const emptyTechTracks = techCoverage.filter(c => c.isEnabled !== false && Number(c.questionCount || 0) === 0);
    const populatedTechTracks = techCoverage.filter(c => c.isEnabled !== false && Number(c.questionCount || 0) > 0);

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Overview Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                    <p className="text-xs font-semibold text-[#75817C] dark:text-[#8FA69C]">Published Blog Articles</p>
                    <p className="text-2xl font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mt-1.5">
                        {articles.length}
                    </p>
                    <p className="text-[11px] text-[#75817C] mt-1">Source: MongoDB BlogPosts</p>
                </div>

                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                    <p className="text-xs font-semibold text-[#75817C] dark:text-[#8FA69C]">Content Needing Improvement</p>
                    <p className={`text-2xl font-display font-bold mt-1.5 ${needsImprovement.length > 0 ? 'text-[#D19A45]' : 'text-[#2F806B]'}`}>
                        {needsImprovement.length}
                    </p>
                    <p className="text-[11px] text-[#75817C] mt-1">Thin depth or missing SEO metadata</p>
                </div>

                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                    <p className="text-xs font-semibold text-[#75817C] dark:text-[#8FA69C]">Missing Meta Descriptions</p>
                    <p className={`text-2xl font-display font-bold mt-1.5 ${missingMeta.length > 0 ? 'text-[#D19A45]' : 'text-[#2F806B]'}`}>
                        {missingMeta.length}
                    </p>
                    <p className="text-[11px] text-[#75817C] mt-1">Audited public pages &amp; posts</p>
                </div>

                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-4">
                    <p className="text-xs font-semibold text-[#75817C] dark:text-[#8FA69C]">Missing / Duplicate Titles</p>
                    <p className={`text-2xl font-display font-bold mt-1.5 ${titleIssues.length > 0 ? 'text-[#C96155]' : 'text-[#2F806B]'}`}>
                        {titleIssues.length}
                    </p>
                    <p className="text-[11px] text-[#75817C] mt-1">Cross-page title uniqueness check</p>
                </div>
            </div>

            {/* Best-Performing Blog Articles */}
            <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] overflow-hidden">
                <div className="p-5 border-b border-[#E4EAE6] dark:border-[#2A3832] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <BookOpen size={17} className="text-[#2F806B]" />
                        <div>
                            <h2 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Best-Performing Blog Articles &amp; Tutorials
                            </h2>
                            <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                Ranked by Google Search clicks (when GSC connected) and real Hangbug MongoDB article views
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/admin"
                        className="text-xs font-semibold text-[#193D35] dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
                    >
                        <span>Manage in Admin Blog</span>
                        <ExternalLink size={12} />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#F7F8F6] dark:bg-[#141D19] border-b border-[#E4EAE6] dark:border-[#2A3832] text-[#75817C] dark:text-[#8FA69C]">
                            <tr>
                                <th className="py-2.5 px-4 font-semibold">Article</th>
                                <th className="py-2.5 px-3 font-semibold">Category</th>
                                <th className="py-2.5 px-3 font-semibold text-right">App Views</th>
                                <th className="py-2.5 px-3 font-semibold text-right">GSC Clicks</th>
                                <th className="py-2.5 px-3 font-semibold text-right">GSC Impressions</th>
                                <th className="py-2.5 px-4 font-semibold">SEO Metadata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832]">
                            {articles.map((art) => (
                                <tr key={art.slug} className="hover:bg-[#F7F8F6]/70 dark:hover:bg-[#141D19]/70">
                                    <td className="py-3 px-4">
                                        <p className="font-semibold text-[#17221F] dark:text-[#F3F6F4]">{art.title}</p>
                                        <p className="font-mono text-[11px] text-[#75817C]">/blog/{art.slug}</p>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E5F2EC] text-[#193D35] dark:bg-[#1F352E] dark:text-emerald-300">
                                            {art.category}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-right font-semibold">{art.viewsCount.toLocaleString('en-US')}</td>
                                    <td className="py-3 px-3 text-right font-semibold text-[#193D35] dark:text-emerald-300">
                                        {art.gscClicks !== null ? art.gscClicks : 'GSC off'}
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        {art.gscImpressions !== null ? art.gscImpressions : 'GSC off'}
                                    </td>
                                    <td className="py-3 px-4">
                                        {art.hasSeoTitle && art.hasSeoDescription && art.seoKeywordsCount > 0 ? (
                                            <span className="inline-flex items-center gap-1 text-[#2F806B] font-semibold">
                                                <CheckCircle2 size={13} /> Complete
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[#B45309] font-semibold">
                                                <AlertTriangle size={13} /> Partial
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pages Receiving Organic Impressions / Clicks + Declining Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Organic Pages */}
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText size={16} className="text-[#2F806B]" />
                        <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            Top Pages by Organic Impressions &amp; Clicks
                        </h3>
                    </div>

                    {!content.gscConnected ? (
                        <div className="p-4 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-dashed border-[#E4EAE6] dark:border-[#2A3832] text-xs text-[#75817C] dark:text-[#8FA69C] space-y-2">
                            <p>Connect Google Search Console in Settings to see page-level organic clicks, impressions, and average position.</p>
                            <button
                                type="button"
                                onClick={() => onNavigate('settings')}
                                className="font-semibold text-[#193D35] dark:text-emerald-300 hover:underline cursor-pointer"
                            >
                                Configure Search Console →
                            </button>
                        </div>
                    ) : organicPages.length === 0 ? (
                        <p className="text-xs text-[#75817C]">No page-level Search Console traffic recorded in this date window yet.</p>
                    ) : (
                        <div className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832] max-h-72 overflow-y-auto text-xs">
                            {organicPages.slice(0, 15).map((p) => (
                                <div key={p.path} className="py-2.5 flex items-center justify-between gap-2">
                                    <span className="font-mono truncate text-[#17221F] dark:text-[#F3F6F4]">{p.path}</span>
                                    <div className="flex items-center gap-3 shrink-0 text-[11px]">
                                        <span><strong>{p.clicks}</strong> clicks</span>
                                        <span className="text-[#75817C]">{p.impressions} impr</span>
                                        <span className="text-[#2F806B]">Pos {p.position}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Declining Performance */}
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDown size={16} className="text-[#C96155]" />
                        <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                            Pages With Declining Performance
                        </h3>
                    </div>

                    {!content.gscConnected ? (
                        <div className="p-4 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-dashed border-[#E4EAE6] dark:border-[#2A3832] text-xs text-[#75817C] dark:text-[#8FA69C]">
                            {content.decliningExplanation}
                        </div>
                    ) : decliningPages.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[#E5F2EC]/50 dark:bg-[#1F352E]/50 text-xs text-[#193D35] dark:text-emerald-300 flex items-center gap-2">
                            <CheckCircle2 size={15} />
                            <span>{content.decliningExplanation}</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#E4EAE6] dark:divide-[#2A3832] text-xs">
                            {decliningPages.map((p) => (
                                <div key={p.path} className="py-2.5 flex items-center justify-between gap-2">
                                    <span className="font-mono truncate">{p.path}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FCEEED] text-[#B91C1C]">
                                        {p.clicksChangePct !== null ? `${p.clicksChangePct}% clicks` : `${p.impressionsChangePct}% impr`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Needing Improvement + Missing Meta / Title Issues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5">
                    <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mb-3">
                        Content Needing Improvement ({needsImprovement.length})
                    </h3>
                    {needsImprovement.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[#E5F2EC]/50 dark:bg-[#1F352E]/50 text-xs text-[#193D35] dark:text-emerald-300 flex items-center gap-2">
                            <CheckCircle2 size={15} />
                            <span>All audited pages and blog articles meet content depth and metadata checks.</span>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {needsImprovement.map((item, idx) => (
                                <div key={`${item.url}-${idx}`} className="p-3 rounded-xl bg-[#F7F8F6] dark:bg-[#141D19] border border-[#E4EAE6] dark:border-[#2A3832] text-xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono font-semibold text-[#193D35] dark:text-emerald-300">{item.url}</span>
                                        <span className="text-[10px] font-bold text-[#B45309]">{item.issue}</span>
                                    </div>
                                    <p className="text-[#75817C] dark:text-[#8FA69C] mt-1">{item.recommendation}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5">
                    <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4] mb-3">
                        Meta Description &amp; Title Audit
                    </h3>
                    {missingMeta.length === 0 && titleIssues.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[#E5F2EC]/50 dark:bg-[#1F352E]/50 text-xs text-[#193D35] dark:text-emerald-300 flex items-center gap-2">
                            <CheckCircle2 size={15} />
                            <span>Zero missing meta descriptions and zero missing or duplicate page titles detected.</span>
                        </div>
                    ) : (
                        <div className="space-y-2 text-xs">
                            {missingMeta.map((m, idx) => (
                                <div key={`meta-${idx}`} className="p-3 rounded-xl bg-[#FEF5E7] dark:bg-amber-950/30 border border-[#F8DFB6] dark:border-amber-800/40">
                                    <span className="font-mono font-semibold">{m.url}</span>
                                    <span className="ml-2 text-[#B45309]">Missing/short meta description ({m.currentLength} chars)</span>
                                </div>
                            ))}
                            {titleIssues.map((t, idx) => (
                                <div key={`title-${idx}`} className="p-3 rounded-xl bg-[#FCEEED] dark:bg-red-950/30 border border-[#F8C9C6] dark:border-red-800/40">
                                    <span className="font-mono font-semibold">{t.url}</span>
                                    <span className="ml-2 text-[#B91C1C]">{t.reason}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Technology Quiz Track Coverage */}
            {techCoverage.length > 0 && (
                <div className="bg-white dark:bg-[#18221E] rounded-2xl border border-[#E4EAE6] dark:border-[#2A3832] p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-display font-bold text-[#17221F] dark:text-[#F3F6F4]">
                                Technology Track Quiz Coverage ({populatedTechTracks.length} Populated · {emptyTechTracks.length} Empty)
                            </h3>
                            <p className="text-[11px] text-[#75817C] dark:text-[#8FA69C]">
                                Enabled MongoDB categories and live quiz question counts. Populate 0-question tracks via Questions Bank or AI Generator.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/admin?tab=questions"
                                className="px-3 py-1.5 rounded-xl border border-[#E4EAE6] dark:border-[#2A3832] bg-[#F7F8F6] dark:bg-[#141D19] text-xs font-semibold text-[#193D35] dark:text-emerald-300 hover:border-[#2F806B]"
                            >
                                Questions Bank
                            </Link>
                            <Link
                                to="/admin?tab=ai&count=15"
                                className="px-3 py-1.5 rounded-xl bg-[#193D35] hover:bg-[#2F806B] text-white text-xs font-semibold"
                            >
                                AI Generator
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
                        {techCoverage.filter(c => c.isEnabled !== false).map((cat) => {
                            const count = Number(cat.questionCount || 0);
                            const isEmpty = count === 0;
                            const isLow = count > 0 && count < 15;
                            return (
                                <div
                                    key={cat.id || cat.name}
                                    className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
                                        isEmpty
                                            ? 'bg-[#FEF5E7]/70 dark:bg-amber-950/25 border-[#F8DFB6] dark:border-amber-800/40'
                                            : isLow
                                                ? 'bg-[#F7F8F6] dark:bg-[#141D19] border-[#E4EAE6] dark:border-[#2A3832]'
                                                : 'bg-[#E5F2EC]/45 dark:bg-[#1F352E]/40 border-[#BBE0CE] dark:border-[#2A3832]'
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[#17221F] dark:text-[#F3F6F4] truncate">{cat.name}</p>
                                        <p className={`text-[11px] font-bold mt-0.5 ${
                                            isEmpty ? 'text-[#B45309]' : isLow ? 'text-[#75817C]' : 'text-[#2F806B]'
                                        }`}>
                                            {count} Qs
                                        </p>
                                    </div>
                                    {isEmpty && (
                                        <Link
                                            to={`/admin?tab=ai&topic=${encodeURIComponent(cat.name)}&count=15`}
                                            className="text-[11px] font-semibold text-[#193D35] dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
                                        >
                                            <span>Fill via AI</span>
                                            <ExternalLink size={10} />
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
