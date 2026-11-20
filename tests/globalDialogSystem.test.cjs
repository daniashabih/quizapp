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

function stripJsComments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:\\])\/\/.*$/gm, '$1');
}

test('1. Web Global Dialog Service: supports all 6 types, promises, confirm/cancel, prompt, and sequential queue', async () => {
    const servicePath = path.join(ROOT, 'src/services/dialogService.js');
    assert.ok(fs.existsSync(servicePath), 'src/services/dialogService.js exists');

    const { dialog } = await import(`file://${servicePath.replace(/\\/g, '/')}`);
    dialog.closeAll();
    assert.equal(dialog.getSnapshot(), null, 'Starts with no active dialog');

    // Confirm -> true
    const p1 = dialog.confirmDelete({
        title: 'Delete Question?',
        message: 'Remove question permanently.',
        itemName: 'JS Closures Q1',
    });
    let snap = dialog.getSnapshot();
    assert.equal(snap.type, 'delete');
    assert.equal(snap.itemName, 'JS Closures Q1');
    assert.equal(snap.permanent, true);
    assert.match(snap.permanentNotice, /permanent/i);
    await dialog.confirmActive();
    assert.equal(await p1, true, 'Confirming delete dialog resolves to true');

    // Cancel -> false
    const p2 = dialog.warning({
        title: 'Demote Admin?',
        message: 'This will remove admin privileges.',
    });
    snap = dialog.getSnapshot();
    assert.equal(snap.type, 'warning');
    assert.equal(snap.showCancel, true);
    dialog.cancelActive();
    assert.equal(await p2, false, 'Cancelling warning dialog resolves to false');

    // Prompt -> value on submit, null on cancel
    const p3 = dialog.prompt({
        title: 'Rename Track',
        inputLabel: 'Name',
        defaultValue: 'React',
    });
    assert.equal(dialog.getSnapshot().type, 'prompt');
    await dialog.confirmActive('React.js');
    assert.equal(await p3, 'React.js', 'Submitting prompt resolves entered value');

    const p4 = dialog.prompt({ title: 'Enter Note' });
    dialog.cancelActive();
    assert.equal(await p4, null, 'Cancelling prompt resolves null');

    // Success, Error, Info alert dialogs
    for (const variant of ['success', 'error', 'info']) {
        const p = dialog[variant]({ title: `Title ${variant}`, message: `Body ${variant}` });
        assert.equal(dialog.getSnapshot().type, variant);
        assert.equal(dialog.getSnapshot().showCancel, false);
        await dialog.confirmActive();
        assert.equal(await p, true);
    }

    // Queueing two dialogs sequentially
    const q1 = dialog.info({ title: 'First' });
    const q2 = dialog.success({ title: 'Second' });
    assert.equal(dialog.getSnapshot().title, 'First');
    await dialog.confirmActive();
    assert.equal(await q1, true);
    assert.equal(dialog.getSnapshot().title, 'Second');
    await dialog.confirmActive();
    assert.equal(await q2, true);
    assert.equal(dialog.getSnapshot(), null);
});

test('2. Web Global Dialog Service: async onConfirm loading state, duplicate-submit guard, and error retention', async () => {
    const servicePath = path.join(ROOT, 'src/services/dialogService.js');
    const { dialog } = await import(`file://${servicePath.replace(/\\/g, '/')}`);
    dialog.closeAll();

    let callCount = 0;
    let shouldFail = true;
    let releasePromise;

    const p = dialog.confirmDelete({
        title: 'Delete Book?',
        message: 'Delete book permanently.',
        onConfirm: async () => {
            callCount += 1;
            await new Promise((resolve) => {
                releasePromise = resolve;
            });
            if (shouldFail) {
                throw new Error('Network connection error');
            }
        },
    });

    // Trigger confirm twice concurrently -> second call must be ignored while loading
    const confirmPromise1 = dialog.confirmActive();
    assert.equal(dialog.getSnapshot().isLoading, true, 'Sets isLoading=true during async action');
    const confirmPromise2 = dialog.confirmActive();
    dialog.cancelActive(); // Cancel must also be ignored while loading
    assert.ok(dialog.getSnapshot(), 'Dialog cannot be cancelled while loading');

    releasePromise();
    await Promise.all([confirmPromise1, confirmPromise2]);

    assert.equal(callCount, 1, 'Duplicate submission prevented while loading');
    const afterFail = dialog.getSnapshot();
    assert.ok(afterFail, 'Dialog stays open when async operation fails');
    assert.equal(afterFail.isLoading, false, 'Clears loading state on error');
    assert.equal(afterFail.error, 'Network connection error', 'Captures error message for inline display');

    // Retry and succeed
    shouldFail = false;
    const retryPromise = dialog.confirmActive();
    releasePromise();
    await retryPromise;

    assert.equal(await p, true, 'Resolves true once retry succeeds');
    assert.equal(dialog.getSnapshot(), null, 'Dialog closes cleanly after success');
});

test('3. Web Global Dialog UI, CSS, Provider & Accessibility wiring', () => {
    const jsx = fs.readFileSync(path.join(ROOT, 'src/components/GlobalDialog.jsx'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'src/styles/global-dialog.css'), 'utf8');
    const ctx = fs.readFileSync(path.join(ROOT, 'src/context/DialogContext.jsx'), 'utf8');
    const app = fs.readFileSync(path.join(ROOT, 'src/App.jsx'), 'utf8');

    assert.match(jsx, /createPortal/, 'Renders dialog through React portal');
    assert.match(jsx, /aria-modal="true"/, 'Sets aria-modal="true"');
    assert.match(jsx, /e\.key === 'Escape'/, 'Supports Escape key dismissal');
    assert.match(jsx, /e\.key === 'Tab'/, 'Implements keyboard focus trap');
    assert.match(jsx, /e\.key === 'Enter'/, 'Supports Enter key confirmation');
    assert.match(jsx, /document\.body\.style\.overflow = 'hidden'/, 'Locks body scroll while open');

    assert.match(css, /backdrop-filter:\s*blur/, 'Applies blurred backdrop overlay');
    assert.match(css, /\.dark\s+\.hb-dialog-card/, 'Supports dark theme dialog surface');
    assert.match(css, /@media\s*\(max-width:\s*640px\)/, 'Includes mobile responsive rules');

    assert.match(ctx, /DialogProvider/, 'Exports DialogProvider');
    assert.match(ctx, /useDialog/, 'Exports useDialog hook');
    assert.match(ctx, /<HangbugDialogViewport\s*\/>/, 'Mounts HangbugDialogViewport in DialogProvider');

    assert.match(app, /import '\.\/styles\/global-dialog\.css'/, 'App.jsx imports global-dialog.css');
    assert.match(app, /<DialogProvider>/, 'App.jsx mounts DialogProvider globally');
});

test('4. Project-Wide Web Audit: ZERO native browser alert(), confirm(), or prompt() calls remain', () => {
    const webFiles = [
        ...walkFiles(path.join(ROOT, 'src'), (name) => /\.(js|jsx|ts|tsx)$/.test(name)),
        ...walkFiles(path.join(ROOT, 'public'), (name) => /\.(js|html)$/.test(name)),
        path.join(ROOT, 'index.html'),
    ];

    const nativeDialogRegex = /(?:^|[^\w$.])(?:window\.)?(?:alert|confirm|prompt)\s*\(/;

    for (const file of webFiles) {
        if (!fs.existsSync(file)) continue;
        const raw = fs.readFileSync(file, 'utf8');
        const cleaned = file.endsWith('.html') ? raw : stripJsComments(raw);
        const rel = path.relative(ROOT, file);
        assert.doesNotMatch(
            cleaned,
            nativeDialogRegex,
            `${rel} must not contain native browser alert(), confirm(), or prompt() calls`
        );
    }
});

test('5. Mobile Global Dialog System: centralized HangbugDialog widget and screen migrations', () => {
    const dialogDartPath = path.join(ROOT, 'mobile/lib/widgets/hangbug_dialog.dart');
    assert.ok(fs.existsSync(dialogDartPath), 'mobile/lib/widgets/hangbug_dialog.dart exists');

    const dialogDart = fs.readFileSync(dialogDartPath, 'utf8');
    assert.match(dialogDart, /enum\s+HangbugDialogType/, 'Defines HangbugDialogType enum');
    for (const variant of ['success', 'error', 'warning', 'info', 'delete', 'prompt']) {
        assert.match(dialogDart, new RegExp(`\\b${variant}\\b`), `Supports ${variant} dialog type on Mobile`);
    }
    assert.match(dialogDart, /BackdropFilter/, 'Applies blurred backdrop on Mobile dialogs');
    assert.match(dialogDart, /PopScope/, 'Protects in-flight async dialogs from accidental back navigation');

    const migratedScreens = [
        'mobile/lib/screens/admin/admin_categories_screen.dart',
        'mobile/lib/screens/admin/admin_knowledge_base_screen.dart',
        'mobile/lib/screens/admin/admin_questions_screen.dart',
        'mobile/lib/screens/admin/admin_users_screen.dart',
        'mobile/lib/screens/explore/explore_screen.dart',
        'mobile/lib/screens/profile/profile_screen.dart',
        'mobile/lib/screens/profile/settings_screen.dart',
        'mobile/lib/screens/quiz/quiz_screen.dart',
    ];

    for (const relPath of migratedScreens) {
        const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
        assert.match(content, /HangbugDialog\./, `${relPath} uses centralized HangbugDialog`);
        assert.doesNotMatch(content, /\bAlertDialog\s*\(/, `${relPath} must not use raw AlertDialog`);
    }
});
