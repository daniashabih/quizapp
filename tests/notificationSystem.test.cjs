const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function walkFiles(dir, extFilter) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...walkFiles(fullPath, extFilter));
        } else if (!extFilter || extFilter(entry.name)) {
            results.push(fullPath);
        }
    }
    return results;
}

test('1. Web Notification Service: supports success, error, warning, info, loading, deduplication, and stack limits', async () => {
    const servicePath = path.join(ROOT, 'src/services/notificationService.js');
    assert.ok(fs.existsSync(servicePath), 'src/services/notificationService.js exists');

    const mod = await import(`file://${servicePath.replace(/\\/g, '/')}`);
    const { notify, toast } = mod;

    assert.ok(notify, 'notify is exported');
    assert.equal(notify, toast, 'toast is exported as a drop-in alias for notify');

    notify.clear();
    assert.equal(notify.getSnapshot().length, 0, 'Starts with empty toast stack');

    // Test all 5 types
    const idSuccess = notify.success({ title: "You're all set!", description: 'Welcome back to Hangbug.', duration: 0 });
    const idError = notify.error({ title: 'Sign-in failed', description: 'Invalid credentials.', duration: 0 });
    const idWarn = notify.warning({ title: 'Action required', description: 'Please complete all required fields.', duration: 0 });
    const idInfo = notify.info({ title: 'Progress saved', description: 'Your quiz progress has been saved.', duration: 0 });

    let stack = notify.getSnapshot();
    assert.equal(stack.length, 4, 'All 4 notifications are queued in stack');
    assert.equal(stack.find((t) => t.id === idSuccess).type, 'success');
    assert.equal(stack.find((t) => t.id === idError).type, 'error');
    assert.equal(stack.find((t) => t.id === idWarn).type, 'warning');
    assert.equal(stack.find((t) => t.id === idInfo).type, 'info');

    // Test duplicate prevention (same type + title + description)
    const dupId = notify.success({ title: "You're all set!", description: 'Welcome back to Hangbug.', duration: 0 });
    assert.equal(dupId, idSuccess, 'Duplicate notification returns existing toast ID instead of creating duplicate');

    // Test loading -> update transition
    notify.clear();
    const loadingId = notify.loading({ title: 'Signing you in...', description: 'Verifying your Hangbug account credentials.' });
    stack = notify.getSnapshot();
    assert.equal(stack.length, 1);
    assert.equal(stack[0].type, 'loading');

    notify.update(loadingId, {
        type: 'success',
        title: "You're all set!",
        description: 'Welcome back to Hangbug.',
        duration: 0,
    });
    stack = notify.getSnapshot();
    assert.equal(stack[0].type, 'success');
    assert.equal(stack[0].title, "You're all set!");
    assert.equal(stack[0].description, 'Welcome back to Hangbug.');

    notify.clear();
});

test('2. Web Notification UI & Styles: custom icons, rounded corners (16px), glassmorphism, light/dark themes, and no progress bar', () => {
    const customToastJsx = fs.readFileSync(path.join(ROOT, 'src/components/CustomToast.jsx'), 'utf8');
    const customToastCss = fs.readFileSync(path.join(ROOT, 'src/styles/custom-toast.css'), 'utf8');
    const appJsx = fs.readFileSync(path.join(ROOT, 'src/App.jsx'), 'utf8');

    assert.match(customToastJsx, /HangbugToastViewport/, 'Defines HangbugToastViewport component');
    assert.match(customToastJsx, /CustomToastIcon/, 'Defines custom SVG icons for notification types');
    assert.match(appJsx, /<HangbugToastViewport\s*\/>/, 'App.jsx mounts HangbugToastViewport');
    assert.doesNotMatch(appJsx, /react-toastify/, 'App.jsx does not import react-toastify');

    assert.match(customToastCss, /border-radius:\s*16px/, 'Uses 16px rounded corners (within 14-18px requirement)');
    assert.match(customToastCss, /backdrop-filter:\s*blur/, 'Supports subtle glassmorphism');
    assert.match(customToastCss, /\.dark\s+\.hb-toast/, 'Supports dark theme styling');
    assert.doesNotMatch(customToastCss, /\.hb-toast-progress\s*\{/, 'Does not include unnecessary progress bars');
});

test('3. Web Global Integration: zero react-toastify imports remain and authentication uses redesigned notifications', () => {
    const webFiles = walkFiles(path.join(ROOT, 'src'), (name) => /\.(js|jsx)$/.test(name));
    for (const file of webFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const rel = path.relative(ROOT, file);
        assert.doesNotMatch(content, /from\s+['"]react-toastify['"]/, `${rel} must not import from react-toastify`);
    }

    const authContext = fs.readFileSync(path.join(ROOT, 'src/context/AuthContext.jsx'), 'utf8');
    assert.match(authContext, /title:\s*["']You're all set!["']/, 'AuthContext login uses "You\'re all set!" title');
    assert.match(authContext, /description:\s*["']Welcome back to Hangbug\.["']/, 'AuthContext login uses "Welcome back to Hangbug." description');
    assert.match(authContext, /Signing you in\.\.\./, 'AuthContext login shows loading state "Signing you in..."');
    assert.match(authContext, /Session expired/, 'AuthContext handles session expiration notification');
});

test('4. Mobile Notification System: centralized service, custom toast widget, and zero legacy showSnackBar calls', () => {
    const mobileServicePath = path.join(ROOT, 'mobile/lib/services/notification_service.dart');
    const mobileWidgetPath = path.join(ROOT, 'mobile/lib/widgets/hangbug_toast.dart');
    const mobileMainPath = path.join(ROOT, 'mobile/lib/main.dart');
    const mobileAuthProviderPath = path.join(ROOT, 'mobile/lib/providers/auth_provider.dart');

    assert.ok(fs.existsSync(mobileServicePath), 'mobile/lib/services/notification_service.dart exists');
    assert.ok(fs.existsSync(mobileWidgetPath), 'mobile/lib/widgets/hangbug_toast.dart exists');

    const serviceDart = fs.readFileSync(mobileServicePath, 'utf8');
    assert.match(serviceDart, /enum\s+HangbugNotificationType\s*\{\s*success,\s*error,\s*warning,\s*info,\s*loading,?\s*\}/, 'Defines all 5 notification types on Mobile');
    assert.match(serviceDart, /class\s+AppNotificationService/, 'Defines centralized AppNotificationService');

    const widgetDart = fs.readFileSync(mobileWidgetPath, 'utf8');
    assert.match(widgetDart, /class\s+HangbugNotificationViewport/, 'Defines HangbugNotificationViewport overlay');
    assert.match(widgetDart, /BorderRadius\.circular\(16\)/, 'Uses 16px rounded corners on Mobile');
    assert.match(widgetDart, /BackdropFilter/, 'Uses BackdropFilter glassmorphism on Mobile');

    const mainDart = fs.readFileSync(mobileMainPath, 'utf8');
    assert.match(mainDart, /HangbugNotificationViewport/, 'main.dart mounts HangbugNotificationViewport globally');

    const authProviderDart = fs.readFileSync(mobileAuthProviderPath, 'utf8');
    assert.match(authProviderDart, /You're all set!/, 'Mobile AuthProvider uses "You\'re all set!" title');
    assert.match(authProviderDart, /Welcome back to Hangbug\./, 'Mobile AuthProvider uses "Welcome back to Hangbug." description');
    assert.match(authProviderDart, /Signing you in\.\.\./, 'Mobile AuthProvider shows "Signing you in..." loading notification');
    assert.match(authProviderDart, /Session expired/, 'Mobile AuthProvider handles session expiration notification');

    const dartFiles = walkFiles(path.join(ROOT, 'mobile/lib'), (name) => name.endsWith('.dart'));
    for (const file of dartFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const rel = path.relative(ROOT, file);
        assert.doesNotMatch(content, /showSnackBar\s*\(/, `${rel} must use AppNotificationService instead of showSnackBar`);
    }
});
