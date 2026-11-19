const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

test('1. Web ThemeContext implements View Transitions circular reveal, CSS fallback, reduced-motion, overlap guard, and persistence', () => {
    const ctx = read('src/context/ThemeContext.jsx');

    // Persistence preserved
    assert.match(ctx, /const STORAGE_KEY = 'hangbug-theme'/, 'Preserves hangbug-theme localStorage key');
    assert.match(ctx, /localStorage\.setItem\(STORAGE_KEY, normalized\)/, 'Persists selected theme mode');

    // View Transitions API + atomic flushSync
    assert.match(ctx, /document\.startViewTransition/, 'Uses View Transitions API when supported');
    assert.match(ctx, /flushSync/, 'Uses React flushSync inside startViewTransition for zero-flash snapshot');
    assert.match(ctx, /--theme-reveal-x/, 'Computes circular reveal X coordinate');
    assert.match(ctx, /--theme-reveal-y/, 'Computes circular reveal Y coordinate');
    assert.match(ctx, /--theme-reveal-r/, 'Computes circular reveal max radius');

    // CSS fallback for unsupported browsers
    assert.match(ctx, /theme-css-transition/, 'Applies graceful CSS transition fallback class');
    assert.match(ctx, /hangbug-theme-reveal-overlay/, 'Renders GPU circular wave fallback overlay');

    // Overlap prevention and reduced-motion accessibility
    assert.match(ctx, /isTransitioningRef/, 'Guards against rapid repeated clicks causing overlapping animations');
    assert.match(ctx, /prefers-reduced-motion:\s*reduce/, 'Respects user prefers-reduced-motion preference');
});

test('2. Web ThemeToggle uses direct single-click icon button (no dropdown) with animated Sun & Moon and origin-aware reveals', () => {
    const toggle = read('src/components/ThemeToggle.jsx');
    const navbar = read('src/components/Navbar.jsx');
    const dashboardLayout = read('src/layouts/DashboardLayout.jsx');
    const seoHeader = read('src/components/seo/SeoHeader.jsx');
    const quiz = read('src/pages/quiz/Quiz.jsx');
    const settings = read('src/pages/settings/Settings.jsx');

    assert.match(toggle, /AnimatedThemeGlyph/, 'Defines AnimatedThemeGlyph for smooth Sun/Moon morphing');
    assert.match(toggle, /theme-toggle-motion/, 'Applies theme-toggle-motion GPU transition class');
    assert.match(toggle, /data-theme-toggle-trigger="true"/, 'Marks trigger button for origin resolution');
    assert.match(toggle, /variant = 'icon'/, 'Defaults ThemeToggle to direct-click icon button');
    assert.match(toggle, /onClick=\{\(e\) => toggleTheme\(e\)\}/, 'Originates direct icon button reveal from click event');
    assert.match(toggle, /onClick=\{\(e\) => setThemeMode\(opt\.id, e\)\}/, 'Originates segmented reveal from tapped option');
    assert.doesNotMatch(toggle, /role="menu"|aria-haspopup="menu"|menuitemradio/, 'Does not render a theme dropdown menu');
    assert.doesNotMatch(navbar, /variant="dropdown"/, 'Navbar does not use dropdown theme toggle');
    assert.doesNotMatch(dashboardLayout, /variant="dropdown"/, 'DashboardLayout does not use dropdown theme toggle');
    assert.doesNotMatch(seoHeader, /variant="dropdown"/, 'SeoHeader does not use dropdown theme toggle');
    assert.doesNotMatch(quiz, /variant="dropdown"/, 'Quiz header does not use dropdown theme toggle');
    assert.match(settings, /setThemeMode\(opt\.id,\s*e\)/, 'Passes click event from Settings theme cards');
});

test('3. Web CSS preserves existing Light & Dark palettes while adding GPU circular reveal and smooth surface transitions', () => {
    const css = read('src/index.css');

    // Existing Light Mode & Dark Mode primary tokens remain untouched
    assert.match(css, /--page-bg:\s*#FCFAF4;/, 'Preserves Light Mode page background');
    assert.match(css, /--card-bg:\s*#FFFFFF;/, 'Preserves Light Mode card background');
    assert.match(css, /--page-bg:\s*#0F1513;/, 'Preserves Dark Mode page background');
    assert.match(css, /--card-bg:\s*#18221E;/, 'Preserves Dark Mode card background');

    // View Transitions + Fallback keyframes & timing
    assert.match(css, /@keyframes hangbug-theme-reveal/, 'Defines View Transitions circular reveal keyframe');
    assert.match(css, /clip-path:\s*circle\(0px at var\(--theme-reveal-x/, 'Starts circular clip at toggle origin');
    assert.match(css, /transition-duration:\s*450ms\s*!important/, 'Animates Sun/Moon icons in 400-500ms window');
    assert.match(css, /transition-duration:\s*600ms\s*!important/, 'Animates theme surfaces in 500-700ms window');
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'Disables animations under prefers-reduced-motion');
});

test('4. Web navigation and all core pages connect to ThemeToggle and Footer', () => {
    const navbar = read('src/components/Navbar.jsx');
    const dashboardLayout = read('src/layouts/DashboardLayout.jsx');
    const landing = read('src/pages/Landing.jsx');
    const technologies = read('src/pages/quiz/Technologies.jsx');
    const gamesHub = read('src/pages/games/GamesHub.jsx');
    const leaderboard = read('src/pages/leaderboard/Leaderboard.jsx');
    const certificates = read('src/pages/certificates/Certificates.jsx');
    const certView = read('src/pages/certificates/CertificateView.jsx');
    const auth = read('src/pages/auth/Auth.jsx');
    const quiz = read('src/pages/quiz/Quiz.jsx');

    assert.match(navbar, /<ThemeToggle/, 'Navbar includes ThemeToggle');
    assert.match(dashboardLayout, /<ThemeToggle/, 'DashboardLayout includes ThemeToggle');
    assert.match(quiz, /<ThemeToggle/, 'Quiz header includes ThemeToggle');
    assert.match(landing, /<Navbar\s*\/>[\s\S]*<Footer\s*\/>/, 'Home page uses Navbar & Footer');
    assert.match(technologies, /Navbar[\s\S]*Footer/, 'Quizzes page uses Navbar & Footer');
    assert.match(gamesHub, /<Navbar\s*\/>[\s\S]*<Footer\s*\/>/, 'Games page uses Navbar & Footer');
    assert.match(leaderboard, /<Navbar\s*\/>[\s\S]*<Footer\s*\/>/, 'Leaderboard page uses Navbar & Footer');
    assert.match(certView, /<Navbar\s*\/>[\s\S]*<Footer\s*\/>/, 'Certificate verification page uses Navbar & Footer');
    assert.match(auth, /<Navbar\s*\/>[\s\S]*<Footer\s*\/>/, 'Auth (Login & Signup) uses Navbar & Footer');
    assert.ok(certificates.length > 0, 'Certificates dashboard page exists inside DashboardLayout');
});

test('5. Mobile Flutter app implements equivalent circular reveal viewport, animated Sun/Moon button, and preserves colors/persistence', () => {
    const mainDart = read('mobile/lib/main.dart');
    const overlayDart = read('mobile/lib/widgets/theme_transition_overlay.dart');
    const toggleDart = read('mobile/lib/widgets/animated_theme_toggle.dart');
    const colorsDart = read('mobile/lib/core/constants/app_colors.dart');
    const providerDart = read('mobile/lib/providers/theme_provider.dart');
    const settingsDart = read('mobile/lib/screens/profile/settings_screen.dart');
    const loginDart = read('mobile/lib/screens/auth/login_screen.dart');
    const registerDart = read('mobile/lib/screens/auth/register_screen.dart');
    const leaderboardDart = read('mobile/lib/screens/leaderboard/leaderboard_screen.dart');
    const leaderboardFullDart = read('mobile/lib/screens/leaderboard/leaderboard_full_screen.dart');
    const homeDart = read('mobile/lib/screens/home/home_screen.dart');
    const exploreDart = read('mobile/lib/screens/explore/explore_screen.dart');
    const gamesHubDart = read('mobile/lib/screens/games/games_hub_screen.dart');
    const certificatesDart = read('mobile/lib/screens/certificates/certificates_screen.dart');
    const profileDart = read('mobile/lib/screens/profile/profile_screen.dart');
    const quizDart = read('mobile/lib/screens/quiz/quiz_screen.dart');
    const adminDart = read('mobile/lib/screens/admin/admin_dashboard_screen.dart');

    // Colors & persistence preserved
    assert.match(colorsDart, /0xFFFCFAF4/, 'Preserves Mobile Light background color');
    assert.match(colorsDart, /0xFF0F1513/, 'Preserves Mobile Dark background color');
    assert.match(providerDart, /const String kThemeModeStorageKey = 'hangbug_theme_mode'/, 'Preserves Mobile SharedPreferences persistence key');

    // Transition viewport & animated toggle
    assert.match(mainDart, /ThemeTransitionViewport/, 'Mounts ThemeTransitionViewport at root of HangbugApp');
    assert.match(mainDart, /Duration\(milliseconds:\s*580\)/, 'Configures smooth MaterialApp themeAnimationDuration');
    assert.match(overlayDart, /Duration\(milliseconds:\s*600\)/, 'Configures ~600ms circular reveal');
    assert.match(overlayDart, /_isTransitioning/, 'Prevents overlapping circular reveal transitions on Mobile');
    assert.match(overlayDart, /disableAnimations/, 'Respects Flutter/OS reduced motion accessibility setting');
    assert.match(toggleDart, /Duration\(milliseconds:\s*450\)/, 'Animates Mobile Sun & Moon icon over 450ms');
    assert.match(toggleDart, /class AnimatedThemeToggleButton/, 'Provides reusable AnimatedThemeToggleButton');
    assert.doesNotMatch(toggleDart, /PopupMenuButton|DropdownButton/, 'Mobile theme toggle is a direct icon button, not a dropdown');

    // Wired across screens
    assert.match(loginDart, /AnimatedThemeToggleButton/, 'LoginScreen uses AnimatedThemeToggleButton');
    assert.match(registerDart, /AnimatedThemeToggleButton/, 'RegisterScreen uses AnimatedThemeToggleButton');
    assert.match(leaderboardDart, /AnimatedThemeToggleButton/, 'LeaderboardScreen uses AnimatedThemeToggleButton');
    assert.match(leaderboardFullDart, /AnimatedThemeToggleButton/, 'LeaderboardFullScreen uses AnimatedThemeToggleButton');
    assert.match(homeDart, /AnimatedThemeToggleButton/, 'HomeScreen uses AnimatedThemeToggleButton');
    assert.match(exploreDart, /AnimatedThemeToggleButton/, 'ExploreScreen uses AnimatedThemeToggleButton');
    assert.match(gamesHubDart, /AnimatedThemeToggleButton/, 'GamesHubScreen uses AnimatedThemeToggleButton');
    assert.match(certificatesDart, /AnimatedThemeToggleButton/, 'CertificatesScreen uses AnimatedThemeToggleButton');
    assert.match(profileDart, /AnimatedThemeToggleButton/, 'ProfileScreen uses AnimatedThemeToggleButton');
    assert.match(quizDart, /AnimatedThemeToggleButton/, 'QuizScreen uses AnimatedThemeToggleButton');
    assert.match(adminDart, /AnimatedThemeToggleButton/, 'AdminDashboardScreen uses AnimatedThemeToggleButton');
    assert.match(settingsDart, /ThemeTransitionViewport\.maybeOf/, 'SettingsScreen triggers circular reveal when switching theme');
});
