import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Plus, Trash2, Save, X, Edit2, Users,
    ShieldCheck, Search, BookOpen, FolderOpen, Upload, Download, FileText, Layers,
    ChevronDown, Sparkles, Sliders, Clock, Percent, Shuffle, HelpCircle, AlertCircle,
    CheckCircle2, RefreshCw, Bot, BarChart3, TrendingUp, Award, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';

const defaultQuizOptions = {
    timePerQuestion: 60, // seconds
    passingScore: 70, // percentage
    maxQuestions: 10,
    randomizeQuestions: true,
    shuffleOptions: false,
    instantFeedback: true,
    allowRetries: true,
    negativeMarking: false,
    showExplanations: true
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [period, setPeriod] = useState('30d');

    // Analytics State
    const [adminData, setAdminData] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [analyticsError, setAnalyticsError] = useState(null);

    // Questions State
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

    // Quiz Options State
    const [quizOptions, setQuizOptions] = useState(() => {
        try {
            const saved = localStorage.getItem('quiz_options');
            return saved ? { ...defaultQuizOptions, ...JSON.parse(saved) } : defaultQuizOptions;
        } catch {
            return defaultQuizOptions;
        }
    });

    // Question Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [category, setCategory] = useState('');
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [difficulty, setDifficulty] = useState('beginner');
    const [explanation, setExplanation] = useState('');

    // Import / Export State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    // Category Management State
    const [newCategory, setNewCategory] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);

    // AI Generation State
    const [aiTopic, setAiTopic] = useState('');
    const [aiDifficulty, setAiDifficulty] = useState('beginner');
    const [aiCount, setAiCount] = useState(5);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        setLoadingAnalytics(true);
        setAnalyticsError(null);
        try {
            const res = await dashboardService.getAdminDashboard(period);
            if (res.success && res.data) {
                setAdminData(res.data);
            } else {
                throw new Error(res.message || 'Failed to load admin metrics');
            }
        } catch (err) {
            console.error('[Admin Analytics Error]:', err);
            setAnalyticsError('Unable to load admin dashboard data.');
        } finally {
            setLoadingAnalytics(false);
        }
    }, [period]);

    const fetchQuestions = async () => {
        try {
            const qRes = await axios.get('/questions');
            if (Array.isArray(qRes.data)) {
                setQuestions(qRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch questions:', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const cRes = await axios.get('/categories');
            if (Array.isArray(cRes.data)) {
                setCategories(cRes.data);
                if (cRes.data.length > 0) {
                    setCategory(prev => prev || cRes.data[0].name);
                    setAiTopic(prev => prev || cRes.data[0].name);
                }
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/auth/users');
            if (res.data?.users && Array.isArray(res.data.users)) {
                setAllUsers(res.data.users);
            } else if (Array.isArray(res.data)) {
                setAllUsers(res.data);
            }
        } catch { /* silent */ }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchAnalytics();
        fetchQuestions();
        fetchCategories();
        if (activeTab === 'users') fetchUsers();
    }, [user, navigate, activeTab, fetchAnalytics]);

    const handleSaveQuizOptions = (e) => {
        e.preventDefault();
        try {
            localStorage.setItem('quiz_options', JSON.stringify(quizOptions));
            toast.success("Quiz options and rules saved successfully!");
        } catch {
            toast.error("Failed to save quiz options.");
        }
    };

    const openQuestionModal = (question = null) => {
        if (question) {
            setEditingQuestionId(question.id);
            setCategory(question.category);
            setQuestionText(question.question_text);
            let parsedOptions = question.options;
            if (typeof parsedOptions === 'string') {
                try { parsedOptions = JSON.parse(parsedOptions); } catch { parsedOptions = ['', '', '', '']; }
            }
            setOptions(Array.isArray(parsedOptions) && parsedOptions.length >= 2 ? parsedOptions : ['', '', '', '']);
            setCorrectAnswer(question.correct_answer || '');
            setDifficulty(question.difficulty || 'beginner');
            setExplanation(question.explanation || '');
        } else {
            setEditingQuestionId(null);
            setQuestionText('');
            setOptions(['', '', '', '']);
            setCorrectAnswer('');
            setDifficulty('beginner');
            setExplanation('');
            if (categories.length > 0) setCategory(categories[0].name);
        }
        setIsFormOpen(true);
    };

    const handleOptionChange = (index, value) => {
        const newOpts = [...options];
        const oldValue = newOpts[index];
        newOpts[index] = value;
        setOptions(newOpts);
        if (correctAnswer === oldValue) {
            setCorrectAnswer(value);
        }
    };

    const handleAddOption = () => {
        if (options.length >= 6) return toast.info("Maximum 6 options allowed per question.");
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index) => {
        if (options.length <= 2) return toast.info("At least 2 options are required.");
        const removedValue = options[index];
        const newOpts = options.filter((_, idx) => idx !== index);
        setOptions(newOpts);
        if (correctAnswer === removedValue) {
            setCorrectAnswer('');
        }
    };

    const handleSubmitQuestion = async (e) => {
        e.preventDefault();
        const validOptions = options.map(o => o.trim()).filter(Boolean);
        if (validOptions.length < 2) {
            return toast.error("Please provide at least 2 valid options.");
        }
        if (!correctAnswer || !validOptions.includes(correctAnswer)) {
            return toast.error("Please select a valid correct answer from the options.");
        }

        try {
            const payload = {
                category,
                question_text: questionText,
                options: validOptions,
                correct_answer: correctAnswer,
                difficulty,
                explanation
            };
            if (editingQuestionId) {
                await axios.put(`/questions/${editingQuestionId}`, payload);
                toast.success("Question updated successfully.");
            } else {
                await axios.post('/questions', payload);
                toast.success("Question created successfully.");
            }
            setIsFormOpen(false);
            fetchQuestions();
            fetchAnalytics();
        } catch { toast.error("Failed to save question."); }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm("Delete this question permanently?")) return;
        try {
            await axios.delete(`/questions/${id}`);
            toast.success("Question deleted.");
            fetchQuestions();
            fetchAnalytics();
        } catch { toast.error("Failed to delete."); }
    };

    const handleAddOrUpdateCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            if (editingCategoryId) {
                const res = await axios.put(`/categories/${editingCategoryId}`, { name: newCategory.trim() });
                toast.success(res.data?.message || "Category updated.");
            } else {
                const res = await axios.post('/categories', { name: newCategory.trim() });
                toast.success(res.data?.message || "Category created.");
            }
            setNewCategory('');
            setEditingCategoryId(null);
            await fetchCategories();
            fetchAnalytics();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save category.");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            const res = await axios.delete(`/categories/${id}`);
            toast.success(res.data?.message || "Category deleted.");
            await fetchCategories();
            fetchAnalytics();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete category.");
        }
    };

    const handleGenerateAiQuestions = async (e) => {
        e.preventDefault();
        if (!aiTopic) return toast.error("Please enter or select a topic.");
        setIsGeneratingAi(true);
        try {
            const res = await axios.post('/questions/generate', {
                topic: aiTopic,
                difficulty: aiDifficulty,
                count: Number(aiCount)
            });
            toast.success(res.data.message || `Generated ${aiCount} questions for ${aiTopic}!`);
            fetchQuestions();
            fetchAnalytics();
            setActiveTab('questions');
        } catch (err) {
            toast.error(err.response?.data?.message || "AI generation failed. Please try again.");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleImportQuestions = async (e) => {
        e.preventDefault();
        if (!importFile) return toast.error("Please select a file.");
        const formData = new FormData();
        formData.append('file', importFile);
        setIsImporting(true);
        try {
            const res = await axios.post('/questions/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(res.data.message);
            setIsImportModalOpen(false);
            setImportFile(null);
            fetchQuestions();
            fetchAnalytics();
        } catch (error) {
            toast.error(error.response?.data?.message || "Import failed.");
        } finally {
            setIsImporting(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['category', 'question', 'option1', 'option2', 'option3', 'option4', 'correct_answer', 'difficulty'];
        const sampleRows = [
            ['JavaScript', 'What is the type of NaN?', 'number', 'string', 'undefined', 'object', 'number', 'beginner'],
            ['Python', 'Which keyword defines a function?', 'func', 'define', 'def', 'function', 'def', 'beginner']
        ];
        const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'questions_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportQuestions = async (format) => {
        try {
            const response = await axios.get(`/questions/export?format=${format}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `questions_export.${format}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(`Exported as ${format.toUpperCase()}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Export failed.");
        }
    };

    const filteredQuestions = questions.filter(q => {
        const matchesCategory = selectedCategoryFilter === 'all' || q.category === selectedCategoryFilter;
        const matchesSearch = q.question_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const difficultyBadge = (d) => {
        const map = {
            expert: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
            intermediate: 'bg-[#EAF5F2] text-black border-[#D4EBE5]',
            beginner: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
        };
        return map[d] || map.beginner;
    };

    const stats = adminData?.stats || {
        totalUsers: 0,
        totalTechnologies: 0,
        totalQuestions: 0,
        totalAttempts: 0,
        totalCertificates: 0,
        passedAttempts: 0,
        failedAttempts: 0,
        averageScore: 0
    };

    const userGrowth = adminData?.userGrowth || [];
    const quizActivity = adminData?.quizActivity || [];
    const popularTechnologies = adminData?.popularTechnologies || [];
    const recentUsers = adminData?.recentUsers || [];
    const recentAttempts = adminData?.recentAttempts || [];

    const maxGrowthUsers = Math.max(...userGrowth.map(g => g.users), 1);
    const maxActivityAttempts = Math.max(...quizActivity.map(a => a.attempts), 1);

    return (
        <div className="animate-fade-up max-w-7xl mx-auto space-y-6">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="badge-emerald mb-2 inline-flex items-center gap-1.5">
                        <ShieldCheck size={12} /> Admin Control Center
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--foreground)]">
                        Admin <span className="text-gradient">Quiz Suite & Analytics</span>
                    </h1>
                    <p className="text-sm text-[var(--foreground-muted)] mt-1">
                        Real-time database metrics, questions bank, AI generation, and candidate activity.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <button onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)} className="btn-secondary text-xs py-2">
                            <Download size={14} /> Export <ChevronDown size={12} />
                        </button>
                        {isExportDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-40 glass rounded-2xl shadow-xl z-50 overflow-hidden border border-[var(--card-border)] animate-scale-in">
                                <button onClick={() => { handleExportQuestions('csv'); setIsExportDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all flex items-center gap-2">
                                    <FileText size={14} /> Export as CSV
                                </button>
                                <button onClick={() => { handleExportQuestions('xlsx'); setIsExportDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all flex items-center gap-2 border-t border-[var(--card-border)]">
                                    <Layers size={14} /> Export as XLSX
                                </button>
                                <button onClick={() => { handleExportQuestions('docx'); setIsExportDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all flex items-center gap-2 border-t border-[var(--card-border)]">
                                    <FileText size={14} /> Export as DOCX
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary text-xs py-2">
                        <Upload size={14} /> Import File
                    </button>
                    <button onClick={() => openQuestionModal(null)} className="btn-primary text-xs py-2">
                        <Plus size={14} /> New Question
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[var(--card-border)] overflow-x-auto pb-1">
                {[
                    { id: 'overview', label: 'Analytics & Overview', icon: BarChart3 },
                    { id: 'questions', label: 'Questions Bank', icon: BookOpen, count: stats.totalQuestions || questions.length },
                    { id: 'settings', label: 'Quiz Rules & Options', icon: Sliders },
                    { id: 'ai', label: 'AI Generator', icon: Bot, highlight: true },
                    { id: 'categories', label: 'Categories', icon: FolderOpen, count: stats.totalTechnologies || categories.length },
                    { id: 'users', label: 'User Directory', icon: Users, count: stats.totalUsers || allUsers.length }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id === 'users') fetchUsers();
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                isSelected
                                    ? 'bg-black text-white shadow-md'
                                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'
                            }`}
                        >
                            <Icon size={15} className={tab.highlight ? 'text-[#D19A45]' : ''} />
                            {tab.label}
                            {tab.count !== undefined && tab.count !== null && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)]'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* TAB 0: ANALYTICS & OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Period Filter & Refresh Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Metrics Period:</span>
                            <div className="flex items-center bg-[var(--muted-bg)] p-1 rounded-xl border border-[var(--card-border)]">
                                {[
                                    { id: '7d', label: 'Last 7 Days' },
                                    { id: '30d', label: 'Last 30 Days' },
                                    { id: 'year', label: 'Last Year' }
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setPeriod(p.id)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                            period === p.id
                                                ? 'bg-[#193D35] text-white shadow-xs'
                                                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={fetchAnalytics}
                            disabled={loadingAnalytics}
                            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                        >
                            <RefreshCw size={13} className={loadingAnalytics ? 'animate-spin' : ''} />
                            Refresh Live DB
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="card p-4 rounded-2xl flex items-center gap-3.5 group hover:-translate-y-0.5 transition-all duration-300">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#193D35] to-[#42665B] flex items-center justify-center shadow-lg shrink-0">
                                <Users size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xl font-display font-extrabold text-[var(--foreground)]">{stats.totalUsers}</p>
                                <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Total Users</p>
                            </div>
                        </div>

                        <div className="card p-4 rounded-2xl flex items-center gap-3.5 group hover:-translate-y-0.5 transition-all duration-300">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#42665B] to-[#193D35] flex items-center justify-center shadow-lg shrink-0">
                                <FolderOpen size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xl font-display font-extrabold text-[var(--foreground)]">{stats.totalTechnologies}</p>
                                <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Technologies</p>
                            </div>
                        </div>

                        <div className="card p-4 rounded-2xl flex items-center gap-3.5 group hover:-translate-y-0.5 transition-all duration-300">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#193D35] to-[#D19A45] flex items-center justify-center shadow-lg shrink-0">
                                <BookOpen size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xl font-display font-extrabold text-[var(--foreground)]">{stats.totalQuestions}</p>
                                <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Total Questions</p>
                            </div>
                        </div>

                        <div className="card p-4 rounded-2xl flex items-center gap-3.5 group hover:-translate-y-0.5 transition-all duration-300">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D19A45] to-[#42665B] flex items-center justify-center shadow-lg shrink-0">
                                <Activity size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xl font-display font-extrabold text-[var(--foreground)]">{stats.totalAttempts}</p>
                                <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Quiz Attempts</p>
                            </div>
                        </div>

                        <div className="card p-4 rounded-2xl flex items-center gap-3.5 group hover:-translate-y-0.5 transition-all duration-300">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#193D35] to-[#42665B] flex items-center justify-center shadow-lg shrink-0">
                                <Award size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xl font-display font-extrabold text-[var(--foreground)]">{stats.totalCertificates}</p>
                                <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Certificates</p>
                            </div>
                        </div>

                        <div className="card p-4 rounded-2xl flex items-center gap-3.5 group hover:-translate-y-0.5 transition-all duration-300">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#42665B] to-[#193D35] flex items-center justify-center shadow-lg shrink-0">
                                <CheckCircle2 size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xl font-display font-extrabold text-[var(--foreground)]">{stats.passedAttempts}</p>
                                <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Passed Quizzes</p>
                            </div>
                        </div>

                        <div className="card p-4 rounded-2xl flex items-center gap-3.5 group hover:-translate-y-0.5 transition-all duration-300">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#193D35] to-[#D19A45] flex items-center justify-center shadow-lg shrink-0">
                                <BarChart3 size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xl font-display font-extrabold text-[var(--foreground)]">{stats.averageScore}%</p>
                                <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Average Score</p>
                            </div>
                        </div>

                        <div className="card p-4 rounded-2xl flex items-center gap-3.5 group hover:-translate-y-0.5 transition-all duration-300">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D19A45] to-[#42665B] flex items-center justify-center shadow-lg shrink-0">
                                <TrendingUp size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xl font-display font-extrabold text-[var(--foreground)]">
                                    {stats.totalAttempts > 0 ? Math.round((stats.passedAttempts / stats.totalAttempts) * 100) : 0}%
                                </p>
                                <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Pass Rate</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Growth Chart */}
                        <div className="card p-6 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={16} className="text-[#193D35]" />
                                    <h3 className="text-sm font-bold text-[var(--foreground)]">User Registration Growth</h3>
                                </div>
                                <span className="text-[10px] font-medium text-[var(--foreground-muted)]">{userGrowth.length} data points</span>
                            </div>

                            {userGrowth.length > 0 ? (
                                <div className="flex items-end gap-1 h-36 pt-4 overflow-x-auto no-scrollbar">
                                    {userGrowth.map((g) => {
                                        const pct = (g.users / maxGrowthUsers) * 100;
                                        return (
                                            <div key={g.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-[12px] group relative">
                                                <div className="w-full rounded-md bg-[var(--muted-bg)] relative h-28 flex items-end">
                                                    <div
                                                        className="w-full bg-[#193D35] rounded-md transition-all group-hover:bg-[#42665B]"
                                                        style={{ height: `${pct}%`, minHeight: g.users > 0 ? '6px' : '0' }}
                                                    />
                                                </div>
                                                <div className="absolute -top-7 px-2 py-0.5 bg-black text-white text-[9px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                                    {g.date}: {g.users} users
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-[var(--foreground-muted)] py-10 text-center">No user registration data in this period.</p>
                            )}
                        </div>

                        {/* Quiz Activity Chart */}
                        <div className="card p-6 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-[#193D35]" />
                                    <h3 className="text-sm font-bold text-[var(--foreground)]">Quiz Activity Timeline</h3>
                                </div>
                                <span className="text-[10px] font-medium text-[var(--foreground-muted)]">{quizActivity.length} data points</span>
                            </div>

                            {quizActivity.length > 0 ? (
                                <div className="flex items-end gap-1 h-36 pt-4 overflow-x-auto no-scrollbar">
                                    {quizActivity.map((a) => {
                                        const pct = (a.attempts / maxActivityAttempts) * 100;
                                        return (
                                            <div key={a.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-[12px] group relative">
                                                <div className="w-full rounded-md bg-[var(--muted-bg)] relative h-28 flex items-end">
                                                    <div
                                                        className="w-full bg-[#D19A45] rounded-md transition-all group-hover:bg-[#E2D0A6]"
                                                        style={{ height: `${pct}%`, minHeight: a.attempts > 0 ? '6px' : '0' }}
                                                    />
                                                </div>
                                                <div className="absolute -top-7 px-2 py-0.5 bg-black text-white text-[9px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                                    {a.date}: {a.attempts} attempts
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-[var(--foreground-muted)] py-10 text-center">No quiz activity in this period.</p>
                            )}
                        </div>
                    </div>

                    {/* Popular Technologies Breakdown */}
                    <div className="card p-6 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
                            <div className="flex items-center gap-2">
                                <Layers size={16} className="text-[#193D35]" />
                                <h3 className="text-sm font-bold text-[var(--foreground)]">Popular Technologies by Attempts</h3>
                            </div>
                            <span className="text-xs text-[var(--foreground-muted)] font-medium">Ranked by real candidate test volume</span>
                        </div>

                        {popularTechnologies.length === 0 ? (
                            <div className="text-center py-10 text-xs text-[var(--foreground-muted)]">
                                No quiz attempts recorded yet. Candidates will populate this list as tests are taken.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {popularTechnologies.map((tech) => (
                                    <div key={tech.category} className="p-4 rounded-xl bg-[var(--muted-bg)]/40 border border-[var(--card-border)] space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-[var(--foreground)]">{tech.category}</span>
                                            <span className="badge-emerald text-[10px] font-extrabold">{tech.attempts} attempts</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-[var(--foreground-muted)]">
                                            <span>Average: <strong>{tech.averageScore}%</strong></span>
                                            <span>Pass Rate: <strong>{tech.passRate}%</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity: 2 Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Attempts */}
                        <div className="card overflow-hidden rounded-2xl shadow-sm">
                            <div className="p-4 border-b border-[var(--card-border)] bg-[var(--muted-bg)]/40 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-[var(--foreground)]">Recent Quiz Attempts</h3>
                                <span className="text-[10px] text-[var(--foreground-muted)]">Live from MongoDB</span>
                            </div>
                            <div className="divide-y divide-[var(--card-border)] max-h-80 overflow-y-auto">
                                {recentAttempts.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-[var(--foreground-muted)]">No quiz attempts yet.</div>
                                ) : recentAttempts.map(ra => (
                                    <div key={ra.id} className="p-3.5 flex items-center justify-between hover:bg-[var(--muted-bg)]/30 transition-colors text-xs">
                                        <div>
                                            <p className="font-bold text-[var(--foreground)]">{ra.userName}</p>
                                            <p className="text-[10px] text-[var(--foreground-muted)]">{ra.category} · {new Date(ra.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold ${ra.passed ? 'text-[#193D35]' : 'text-red-500'}`}>{ra.percentage}%</span>
                                            <p className="text-[10px] text-[var(--foreground-muted)]">{ra.score}/{ra.total}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Users */}
                        <div className="card overflow-hidden rounded-2xl shadow-sm">
                            <div className="p-4 border-b border-[var(--card-border)] bg-[var(--muted-bg)]/40 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-[var(--foreground)]">Recent User Signups</h3>
                                <span className="text-[10px] text-[var(--foreground-muted)]">Live from MongoDB</span>
                            </div>
                            <div className="divide-y divide-[var(--card-border)] max-h-80 overflow-y-auto">
                                {recentUsers.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-[var(--foreground-muted)]">No users found.</div>
                                ) : recentUsers.map(ru => (
                                    <div key={ru.id} className="p-3.5 flex items-center justify-between hover:bg-[var(--muted-bg)]/30 transition-colors text-xs">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-[#193D35] flex items-center justify-center text-white font-bold text-xs">
                                                {ru.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--foreground)]">{ru.name}</p>
                                                <p className="text-[10px] text-[var(--foreground-muted)]">{ru.email}</p>
                                            </div>
                                        </div>
                                        <span className={`badge text-[9px] uppercase ${ru.role === 'admin' ? 'badge-error' : 'badge-emerald'}`}>
                                            {ru.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 1: QUESTIONS BANK */}
            {activeTab === 'questions' && (
                <div className="space-y-5">
                    {/* Search & Category Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Filter questions..."
                                    className="input-field pl-10 text-xs py-2.5"
                                />
                            </div>

                            <select
                                value={selectedCategoryFilter}
                                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                                className="input-field text-xs py-2.5 min-w-[140px]"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>

                        <span className="text-xs text-[var(--foreground-muted)] font-medium">
                            Showing {filteredQuestions.length} of {questions.length} questions
                        </span>
                    </div>

                    {/* Questions Table */}
                    <div className="card overflow-hidden rounded-2xl shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[var(--card-border)] bg-[var(--muted-bg)]/60">
                                        {['Category', 'Difficulty', 'Question Text', 'Correct Option', 'Actions'].map(h => (
                                            <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--card-border)]">
                                    {filteredQuestions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-[var(--foreground-muted)]">
                                                No questions matching filter. <button onClick={() => openQuestionModal(null)} className="text-black font-bold hover:underline">Add one now</button>
                                            </td>
                                        </tr>
                                    ) : filteredQuestions.map((q) => (
                                        <tr key={q.id} className="hover:bg-[var(--muted-bg)]/40 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="badge-emerald text-[10px] font-semibold">{q.category}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge border text-[10px] ${difficultyBadge(q.difficulty)}`}>
                                                    {q.difficulty || 'beginner'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-md">
                                                <p className="text-xs text-[var(--foreground)] font-medium line-clamp-2">{q.question_text}</p>
                                                {q.explanation && (
                                                    <p className="text-[11px] text-[var(--foreground-muted)] italic mt-0.5 truncate">
                                                        💡 {q.explanation}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="px-2.5 py-1 rounded-lg bg-[var(--muted-bg)] text-black font-bold text-xs font-mono border border-[var(--card-border)]">
                                                    {q.correct_answer}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => openQuestionModal(q)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-black hover:bg-[var(--muted-bg)] transition-all">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: QUIZ RULES & OPTIONS */}
            {activeTab === 'settings' && (
                <form onSubmit={handleSaveQuizOptions} className="card p-6 rounded-2xl space-y-6 max-w-4xl">
                    <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
                        <div>
                            <h2 className="text-lg font-display font-bold text-[var(--foreground)] flex items-center gap-2">
                                <Sliders size={18} className="text-black" /> Global Quiz Options & Rules
                            </h2>
                            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                                Configure time limits, passing score thresholds, shuffling, and candidate feedback settings.
                            </p>
                        </div>
                        <button type="submit" className="btn-primary text-xs px-5 py-2">
                            <Save size={14} /> Save Quiz Options
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl bg-[var(--muted-bg)]/40 border border-[var(--card-border)] space-y-2">
                            <label className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
                                <Clock size={15} className="text-black" /> Timer Limit Per Question
                            </label>
                            <p className="text-[11px] text-[var(--foreground-muted)]">Seconds allocated to candidates for each question.</p>
                            <select
                                value={quizOptions.timePerQuestion}
                                onChange={(e) => setQuizOptions({ ...quizOptions, timePerQuestion: Number(e.target.value) })}
                                className="input-field text-xs"
                            >
                                <option value={30}>30 Seconds (Fast Speed)</option>
                                <option value={45}>45 Seconds</option>
                                <option value={60}>60 Seconds (Standard)</option>
                                <option value={90}>90 Seconds (Relaxed)</option>
                                <option value={120}>120 Seconds (Extended)</option>
                            </select>
                        </div>

                        <div className="p-4 rounded-xl bg-[var(--muted-bg)]/40 border border-[var(--card-border)] space-y-2">
                            <label className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
                                <Percent size={15} className="text-black" /> Minimum Passing Percentage
                            </label>
                            <p className="text-[11px] text-[var(--foreground-muted)]">Score required to pass and earn certificates.</p>
                            <select
                                value={quizOptions.passingScore}
                                onChange={(e) => setQuizOptions({ ...quizOptions, passingScore: Number(e.target.value) })}
                                className="input-field text-xs"
                            >
                                <option value={50}>50% - Basic Pass</option>
                                <option value={60}>60% - Moderate</option>
                                <option value={70}>70% - Standard (Recommended)</option>
                                <option value={80}>80% - High Standard</option>
                                <option value={90}>90% - Expert Level</option>
                            </select>
                        </div>

                        <div className="p-4 rounded-xl bg-[var(--muted-bg)]/40 border border-[var(--card-border)] space-y-2">
                            <label className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
                                <BookOpen size={15} className="text-black" /> Questions Per Quiz Session
                            </label>
                            <p className="text-[11px] text-[var(--foreground-muted)]">Number of questions drawn into each test run.</p>
                            <select
                                value={quizOptions.maxQuestions}
                                onChange={(e) => setQuizOptions({ ...quizOptions, maxQuestions: Number(e.target.value) })}
                                className="input-field text-xs"
                            >
                                <option value={5}>5 Questions (Short Quiz)</option>
                                <option value={10}>10 Questions (Standard)</option>
                                <option value={15}>15 Questions (Detailed)</option>
                                <option value={20}>20 Questions (Full Test)</option>
                                <option value={999}>Unlimited (All Category Questions)</option>
                            </select>
                        </div>

                        <div className="p-4 rounded-xl bg-[var(--muted-bg)]/40 border border-[var(--card-border)] space-y-3">
                            <span className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
                                <Shuffle size={15} className="text-black" /> Question Shuffling & Randomization
                            </span>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={quizOptions.randomizeQuestions}
                                        onChange={(e) => setQuizOptions({ ...quizOptions, randomizeQuestions: e.target.checked })}
                                        className="rounded border-[var(--card-border)] text-black focus:ring-[black]"
                                    />
                                    Randomize Question Order
                                </label>
                                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={quizOptions.shuffleOptions}
                                        onChange={(e) => setQuizOptions({ ...quizOptions, shuffleOptions: e.target.checked })}
                                        className="rounded border-[var(--card-border)] text-black focus:ring-[black]"
                                    />
                                    Shuffle Answer Choice Positions
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[var(--card-border)] pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--muted-bg)]/30 border border-[var(--card-border)] cursor-pointer hover:border-[black] transition-all">
                            <div>
                                <span className="text-xs font-bold text-[var(--foreground)] block">Instant Answer Feedback</span>
                                <span className="text-[11px] text-[var(--foreground-muted)]">Show correct/incorrect popup immediately upon answer selection.</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={quizOptions.instantFeedback}
                                onChange={(e) => setQuizOptions({ ...quizOptions, instantFeedback: e.target.checked })}
                                className="w-4 h-4 rounded border-[var(--card-border)] text-black"
                            />
                        </label>

                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--muted-bg)]/30 border border-[var(--card-border)] cursor-pointer hover:border-[black] transition-all">
                            <div>
                                <span className="text-xs font-bold text-[var(--foreground)] block">Show Explanations</span>
                                <span className="text-[11px] text-[var(--foreground-muted)]">Provide explanations for questions on the result summary page.</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={quizOptions.showExplanations}
                                onChange={(e) => setQuizOptions({ ...quizOptions, showExplanations: e.target.checked })}
                                className="w-4 h-4 rounded border-[var(--card-border)] text-black"
                            />
                        </label>

                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--muted-bg)]/30 border border-[var(--card-border)] cursor-pointer hover:border-[black] transition-all">
                            <div>
                                <span className="text-xs font-bold text-[var(--foreground)] block">Allow Quiz Retries</span>
                                <span className="text-[11px] text-[var(--foreground-muted)]">Permit candidates to re-attempt tests after completion.</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={quizOptions.allowRetries}
                                onChange={(e) => setQuizOptions({ ...quizOptions, allowRetries: e.target.checked })}
                                className="w-4 h-4 rounded border-[var(--card-border)] text-black"
                            />
                        </label>

                        <label className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--muted-bg)]/30 border border-[var(--card-border)] cursor-pointer hover:border-[black] transition-all">
                            <div>
                                <span className="text-xs font-bold text-[var(--foreground)] block">Negative Marking</span>
                                <span className="text-[11px] text-[var(--foreground-muted)]">Deduct points for incorrect attempts to discourage guessing.</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={quizOptions.negativeMarking}
                                onChange={(e) => setQuizOptions({ ...quizOptions, negativeMarking: e.target.checked })}
                                className="w-4 h-4 rounded border-[var(--card-border)] text-black"
                            />
                        </label>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" className="btn-primary text-xs px-6 py-2.5">
                            <Save size={15} /> Save All Quiz Settings
                        </button>
                    </div>
                </form>
            )}

            {/* TAB 3: AI GENERATOR */}
            {activeTab === 'ai' && (
                <div className="card p-6 rounded-2xl space-y-6 max-w-3xl">
                    <div className="flex items-center gap-3 pb-4 border-b border-[var(--card-border)]">
                        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-display font-bold text-[var(--foreground)]">
                                AI Quiz Generator
                            </h2>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Automatically construct high-quality multiple choice questions using AI.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleGenerateAiQuestions} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="input-label">Target Category / Topic</label>
                            <input
                                type="text"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder="e.g. JavaScript Async/Await, Python Data Structures, SQL Joins..."
                                className="input-field text-xs py-2.5"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="input-label">Difficulty Level</label>
                                <select
                                    value={aiDifficulty}
                                    onChange={(e) => setAiDifficulty(e.target.value)}
                                    className="input-field text-xs py-2.5"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="input-label">Number of Questions to Generate</label>
                                <select
                                    value={aiCount}
                                    onChange={(e) => setAiCount(Number(e.target.value))}
                                    className="input-field text-xs py-2.5"
                                >
                                    <option value={3}>3 Questions</option>
                                    <option value={5}>5 Questions (Recommended)</option>
                                    <option value={10}>10 Questions</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)] text-xs space-y-1 text-[var(--foreground-muted)]">
                            <p className="font-semibold text-[var(--foreground)] flex items-center gap-1">
                                <Bot size={14} className="text-black" /> How it works:
                            </p>
                            <p>The AI creates relevant multiple choice questions with 4 distinct options and auto-saves them into your question bank under <strong className="text-[var(--foreground)]">{aiTopic || 'selected topic'}</strong>.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isGeneratingAi}
                            className="btn-primary w-full justify-center text-xs py-3"
                        >
                            {isGeneratingAi ? (
                                <span className="flex items-center gap-2">
                                    <RefreshCw size={15} className="animate-spin" /> Generating Questions with AI...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles size={15} /> Generate & Save Questions
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* TAB 4: CATEGORIES */}
            {activeTab === 'categories' && (
                <div className="card p-6 rounded-2xl space-y-6 max-w-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)]">
                        <div>
                            <h2 className="text-lg font-display font-bold text-[var(--foreground)]">Category Management</h2>
                            <p className="text-xs text-[var(--foreground-muted)]">Add or rename quiz topics.</p>
                        </div>
                        <button
                            type="button"
                            onClick={fetchCategories}
                            title="Refresh Categories from DB"
                            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw size={13} /> Sync DB
                        </button>
                    </div>

                    <form onSubmit={handleAddOrUpdateCategory} className="flex gap-3">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name (e.g. React.js, Go, Rust)..."
                            className="input-field flex-1 text-xs py-2.5"
                            required
                        />
                        <button type="submit" className="btn-primary shrink-0 text-xs px-5 py-2.5">
                            {editingCategoryId ? <><Save size={14} /> Update</> : <><Plus size={14} /> Add Category</>}
                        </button>
                    </form>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {categories.length === 0 ? (
                            <div className="text-center py-10 text-xs text-[var(--foreground-muted)] space-y-2 border border-dashed border-[var(--card-border)] rounded-xl">
                                <FolderOpen size={32} className="mx-auto text-[var(--foreground-muted)]/40" />
                                <p className="font-bold text-[var(--foreground)] text-sm">No categories found</p>
                                <p className="text-[11px]">Add a category using the field above or click 'Sync DB'.</p>
                            </div>
                        ) : (
                            categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-3.5 card rounded-xl hover:bg-[var(--muted-bg)] transition-colors">
                                    <span className="text-xs font-bold text-[var(--foreground)]">{cat.name}</span>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => { setEditingCategoryId(cat.id); setNewCategory(cat.name); }} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-black hover:bg-[var(--muted-bg)] transition-all">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* TAB 5: USERS DIRECTORY */}
            {activeTab === 'users' && (
                <div className="card overflow-hidden rounded-2xl shadow-sm">
                    <div className="p-4 border-b border-[var(--card-border)] bg-[var(--muted-bg)]/40 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-[var(--foreground)]">Registered Users ({allUsers.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--card-border)] bg-[var(--muted-bg)]/60">
                                    {['User Name', 'Email', 'Role', 'Joined Date'].map(h => (
                                        <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]">
                                {allUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-xs text-[var(--foreground-muted)]">No users loaded.</td>
                                    </tr>
                                ) : allUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-[var(--muted-bg)]/30 transition-colors">
                                        <td className="px-6 py-3.5 text-xs font-bold text-[var(--foreground)]">{u.name || 'User'}</td>
                                        <td className="px-6 py-3.5 text-xs text-[var(--foreground-muted)] font-mono">{u.email}</td>
                                        <td className="px-6 py-3.5">
                                            <span className={`badge text-[10px] uppercase ${u.role === 'admin' ? 'badge-error' : 'badge-emerald'}`}>
                                                {u.role || 'candidate'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-[var(--foreground-muted)]">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL: ADD / EDIT QUESTION */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="card rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">
                        <div className="flex items-center justify-between p-5 border-b border-[var(--card-border)] shrink-0">
                            <h2 className="text-base font-display font-bold text-[var(--foreground)]">
                                {editingQuestionId ? 'Edit Question' : 'Add New Question'}
                            </h2>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--muted-bg)]">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitQuestion} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="input-label">Category</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field text-xs py-2">
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="input-label">Difficulty</label>
                                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field text-xs py-2">
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="input-label">Question Text</label>
                                <textarea
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    className="input-field text-xs min-h-[70px] resize-none"
                                    placeholder="Enter question prompt..."
                                    required
                                />
                            </div>

                            {/* Dynamic Options List */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="input-label">Answer Options (Select radio for Correct Answer)</label>
                                    <button
                                        type="button"
                                        onClick={handleAddOption}
                                        className="text-[11px] font-bold text-black hover:text-black flex items-center gap-1"
                                    >
                                        <Plus size={13} /> Add Option
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {options.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="correctAnswerSelect"
                                                checked={correctAnswer === opt && opt.trim() !== ''}
                                                onChange={() => setCorrectAnswer(opt)}
                                                className="w-4 h-4 text-black focus:ring-[black] cursor-pointer"
                                                title="Mark as correct answer"
                                            />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                placeholder={`Option ${String.fromCharCode(65 + idx)}...`}
                                                className="input-field text-xs py-2 flex-1"
                                                required
                                            />
                                            {options.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveOption(idx)}
                                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="input-label">Answer Explanation / Hint (Optional)</label>
                                <input
                                    type="text"
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    placeholder="Provide educational context for candidates..."
                                    className="input-field text-xs py-2"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary text-xs px-4">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary text-xs px-5">
                                    <Save size={14} /> {editingQuestionId ? 'Update' : 'Create'} Question
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: IMPORT CSV */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
                        <div className="flex items-center justify-between p-5 border-b border-[var(--card-border)]">
                            <h2 className="text-base font-display font-bold text-[var(--foreground)]">Import Questions</h2>
                            <button onClick={() => { setIsImportModalOpen(false); setImportFile(null); }} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--muted-bg)]">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleImportQuestions} className="p-6 space-y-4">
                            <div className="p-3.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground-muted)] space-y-2">
                                <p>Upload a CSV, XLSX, or DOCX document containing question columns.</p>
                                <button type="button" onClick={downloadTemplate} className="text-xs font-bold text-black hover:underline flex items-center gap-1">
                                    <Download size={12} /> Download Sample Template
                                </button>
                            </div>
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls,.docx,.doc"
                                onChange={(e) => setImportFile(e.target.files[0])}
                                className="input-field text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-black"
                            />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setIsImportModalOpen(false); setImportFile(null); }} className="btn-secondary flex-1 justify-center text-xs">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isImporting || !importFile} className="btn-primary flex-1 justify-center text-xs">
                                    {isImporting ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />} Import
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
