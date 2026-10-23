const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

// We can test route handlers directly or by mounting them on an express instance
const User = require('../api/_models/userModel');
const adminRoutes = require('../api/_routes/adminRoutes');
const userRoutes = require('../api/_routes/userRoutes');

// Mock Prisma for deterministic, isolated unit testing of route logic and model normalization
const prisma = require('../api/_config/prisma');

test('Role Management: Model Layer Normalization', async () => {
    // 1. User.create normalizes role
    const origCreate = prisma.user.create;
    let capturedCreateData = null;
    prisma.user.create = async ({ data }) => {
        capturedCreateData = data;
        return { id: 'u_1', ...data, createdAt: new Date(), updatedAt: new Date() };
    };

    try {
        const u1 = await User.create('Test User', 'test1@example.com', 'hashedpass', 'ADMIN');
        assert.equal(u1.role, 'admin');
        assert.equal(capturedCreateData.role, 'admin');

        const u2 = await User.create('Test User 2', 'test2@example.com', 'hashedpass', 'candidate');
        assert.equal(u2.role, 'user', 'Legacy candidate role must normalize to user');
        assert.equal(capturedCreateData.role, 'user');

        const u3 = await User.create('Test User 3', 'test3@example.com', 'hashedpass', undefined);
        assert.equal(u3.role, 'user');
        assert.equal(capturedCreateData.role, 'user');
    } finally {
        prisma.user.create = origCreate;
    }

    // 2. User.getAll normalizes legacy roles from database
    const origFindMany = prisma.user.findMany;
    prisma.user.findMany = async () => [
        { id: '1', name: 'Admin One', email: 'admin@example.com', role: 'admin', isVerified: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Legacy Candidate', email: 'cand@example.com', role: 'candidate', isVerified: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: 'Uppercase Admin', email: 'upadmin@example.com', role: 'ADMIN', isVerified: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '4', name: 'Regular User', email: 'user@example.com', role: 'user', isVerified: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    try {
        const all = await User.getAll();
        assert.equal(all.length, 4);
        assert.equal(all[0].role, 'admin');
        assert.equal(all[1].role, 'user', 'Legacy candidate must normalize to user');
        assert.equal(all[2].role, 'admin', 'Uppercase ADMIN must normalize to admin');
        assert.equal(all[3].role, 'user');
    } finally {
        prisma.user.findMany = origFindMany;
    }

    // 3. User.findById normalizes role
    const origFindUnique = prisma.user.findUnique;
    prisma.user.findUnique = async ({ where }) => {
        if (where.id === 'cand_id') {
            return { id: 'cand_id', name: 'Cand', email: 'c@c.com', role: 'candidate', isVerified: true, createdAt: new Date(), updatedAt: new Date() };
        }
        return null;
    };

    try {
        const found = await User.findById('cand_id');
        assert.equal(found.role, 'user');
    } finally {
        prisma.user.findUnique = origFindUnique;
    }
});

// Helper to simulate express request / response
function mockReqRes({ body = {}, params = {}, user = null, headers = {}, cookies = {} } = {}) {
    const req = {
        body,
        params,
        user,
        headers,
        cookies
    };
    let statusCode = 200;
    let jsonResponse = null;

    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            jsonResponse = data;
            return this;
        },
        get statusCode() {
            return statusCode;
        },
        get data() {
            return jsonResponse;
        }
    };

    return { req, res };
}

// Extract route handler directly from express router stack
function getRouteHandler(router, method, path) {
    const layer = router.stack.find(l => {
        if (!l.route) return false;
        const hasMethod = l.route.methods[method.toLowerCase()];
        return hasMethod && l.route.path === path;
    });
    if (!layer) throw new Error(`Route ${method.toUpperCase()} ${path} not found on router`);
    // Return the last handler in route stack (after route-level middlewares)
    return layer.route.stack[layer.route.stack.length - 1].handle;
}

test('Role Update API: Input Validation & Enum Enforcement', async () => {
    const handler = getRouteHandler(adminRoutes, 'put', '/users/:id/role');

    // Invalid role: 'candidate'
    {
        const { req, res } = mockReqRes({
            params: { id: 'user_1' },
            body: { role: 'candidate' },
            user: { id: 'admin_1', role: 'admin' }
        });
        await handler(req, res);
        assert.equal(res.statusCode, 400);
        assert.equal(res.data.success, false);
        assert.equal(res.data.message, 'Role must be user or admin');
    }

    // Invalid role: 'moderator'
    {
        const { req, res } = mockReqRes({
            params: { id: 'user_1' },
            body: { role: 'moderator' },
            user: { id: 'admin_1', role: 'admin' }
        });
        await handler(req, res);
        assert.equal(res.statusCode, 400);
        assert.equal(res.data.message, 'Role must be user or admin');
    }

    // Missing role
    {
        const { req, res } = mockReqRes({
            params: { id: 'user_1' },
            body: {},
            user: { id: 'admin_1', role: 'admin' }
        });
        await handler(req, res);
        assert.equal(res.statusCode, 400);
        assert.equal(res.data.message, 'Role must be user or admin');
    }
});

test('Role Update API: USER -> ADMIN Promotion', async () => {
    const handler = getRouteHandler(adminRoutes, 'put', '/users/:id/role');

    const origFindUnique = prisma.user.findUnique;
    const origUpdate = prisma.user.update;

    let updatedArgs = null;
    prisma.user.findUnique = async ({ where }) => {
        if (where.id === 'user_123') {
            return { id: 'user_123', name: 'Jane Candidate', email: 'jane@example.com', role: 'user' };
        }
        return null;
    };
    prisma.user.update = async (args) => {
        updatedArgs = args;
        return {
            id: args.where.id,
            name: 'Jane Candidate',
            email: 'jane@example.com',
            role: args.data.role
        };
    };

    try {
        const { req, res } = mockReqRes({
            params: { id: 'user_123' },
            body: { role: 'admin' },
            user: { id: 'admin_1', role: 'admin' }
        });

        await handler(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.data.success, true);
        assert.equal(res.data.user.role, 'admin');
        assert.equal(updatedArgs.where.id, 'user_123');
        assert.equal(updatedArgs.data.role, 'admin');
    } finally {
        prisma.user.findUnique = origFindUnique;
        prisma.user.update = origUpdate;
    }
});

test('Role Update API: Case-Insensitive Promotion (e.g. "ADMIN")', async () => {
    const handler = getRouteHandler(adminRoutes, 'put', '/users/:id/role');

    const origFindUnique = prisma.user.findUnique;
    const origUpdate = prisma.user.update;

    let updatedArgs = null;
    prisma.user.findUnique = async ({ where }) => {
        if (where.id === 'user_123') {
            return { id: 'user_123', name: 'Jane Candidate', email: 'jane@example.com', role: 'user' };
        }
        return null;
    };
    prisma.user.update = async (args) => {
        updatedArgs = args;
        return {
            id: args.where.id,
            name: 'Jane Candidate',
            email: 'jane@example.com',
            role: args.data.role
        };
    };

    try {
        const { req, res } = mockReqRes({
            params: { id: 'user_123' },
            body: { role: '  ADMIN  ' },
            user: { id: 'admin_1', role: 'admin' }
        });

        await handler(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.data.success, true);
        assert.equal(res.data.user.role, 'admin');
        assert.equal(updatedArgs.data.role, 'admin');
    } finally {
        prisma.user.findUnique = origFindUnique;
        prisma.user.update = origUpdate;
    }
});

test('Role Update API: ADMIN -> USER Demotion (Multiple Admins)', async () => {
    const handler = getRouteHandler(adminRoutes, 'put', '/users/:id/role');

    const origFindUnique = prisma.user.findUnique;
    const origCount = prisma.user.count;
    const origUpdate = prisma.user.update;

    let updatedArgs = null;
    prisma.user.findUnique = async ({ where }) => {
        if (where.id === 'admin_target') {
            return { id: 'admin_target', name: 'Secondary Admin', email: 'sec@example.com', role: 'admin' };
        }
        return null;
    };
    // 2 admins exist
    prisma.user.count = async () => 2;
    prisma.user.update = async (args) => {
        updatedArgs = args;
        return {
            id: args.where.id,
            name: 'Secondary Admin',
            email: 'sec@example.com',
            role: args.data.role
        };
    };

    try {
        const { req, res } = mockReqRes({
            params: { id: 'admin_target' },
            body: { role: 'user' },
            user: { id: 'primary_admin', role: 'admin' }
        });

        await handler(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.data.success, true);
        assert.equal(res.data.user.role, 'user');
        assert.equal(updatedArgs.where.id, 'admin_target');
        assert.equal(updatedArgs.data.role, 'user');
    } finally {
        prisma.user.findUnique = origFindUnique;
        prisma.user.count = origCount;
        prisma.user.update = origUpdate;
    }
});

test('Role Update API: Safeguard - Prevent Self-Demotion', async () => {
    const handler = getRouteHandler(adminRoutes, 'put', '/users/:id/role');

    const origFindUnique = prisma.user.findUnique;
    prisma.user.findUnique = async ({ where }) => {
        if (where.id === 'my_admin_id') {
            return { id: 'my_admin_id', name: 'Current Admin', email: 'me@example.com', role: 'admin' };
        }
        return null;
    };

    try {
        const { req, res } = mockReqRes({
            params: { id: 'my_admin_id' },
            body: { role: 'user' },
            user: { id: 'my_admin_id', role: 'admin' }
        });

        await handler(req, res);

        assert.equal(res.statusCode, 400);
        assert.equal(res.data.success, false);
        assert.match(res.data.message, /Cannot demote your own administrator account/i);
    } finally {
        prisma.user.findUnique = origFindUnique;
    }
});

test('Role Update API: Safeguard - Prevent Demoting the Last System Admin', async () => {
    const handler = getRouteHandler(adminRoutes, 'put', '/users/:id/role');

    const origFindUnique = prisma.user.findUnique;
    const origCount = prisma.user.count;

    prisma.user.findUnique = async ({ where }) => {
        if (where.id === 'sole_admin') {
            return { id: 'sole_admin', name: 'Sole Admin', email: 'sole@example.com', role: 'admin' };
        }
        return null;
    };
    // Only 1 admin in system
    prisma.user.count = async () => 1;

    try {
        const { req, res } = mockReqRes({
            params: { id: 'sole_admin' },
            body: { role: 'user' },
            // Even if an external admin context tried it:
            user: { id: 'external_actor', role: 'admin' }
        });

        await handler(req, res);

        assert.equal(res.statusCode, 400);
        assert.equal(res.data.success, false);
        assert.match(res.data.message, /Cannot demote the last remaining administrator account/i);
    } finally {
        prisma.user.findUnique = origFindUnique;
        prisma.user.count = origCount;
    }
});

test('Role Update API: User Not Found', async () => {
    const handler = getRouteHandler(adminRoutes, 'put', '/users/:id/role');

    const origFindUnique = prisma.user.findUnique;
    prisma.user.findUnique = async () => null;

    try {
        const { req, res } = mockReqRes({
            params: { id: 'nonexistent_id' },
            body: { role: 'admin' },
            user: { id: 'admin_1', role: 'admin' }
        });

        await handler(req, res);

        assert.equal(res.statusCode, 404);
        assert.equal(res.data.success, false);
        assert.equal(res.data.message, 'User not found');
    } finally {
        prisma.user.findUnique = origFindUnique;
    }
});

test('User Delete API: Safeguard - Prevent Self-Deletion and Last Admin Deletion', async () => {
    const handler = getRouteHandler(adminRoutes, 'delete', '/users/:id');

    const origFindUnique = prisma.user.findUnique;
    const origCount = prisma.user.count;

    prisma.user.findUnique = async ({ where }) => {
        if (where.id === 'admin_me') {
            return { id: 'admin_me', name: 'Me', email: 'me@example.com', role: 'admin' };
        }
        if (where.id === 'admin_last') {
            return { id: 'admin_last', name: 'Last Admin', email: 'last@example.com', role: 'admin' };
        }
        return null;
    };
    prisma.user.count = async () => 1;

    try {
        // Self-deletion attempt
        {
            const { req, res } = mockReqRes({
                params: { id: 'admin_me' },
                user: { id: 'admin_me', role: 'admin' }
            });
            await handler(req, res);
            assert.equal(res.statusCode, 400);
            assert.match(res.data.message, /Cannot delete your own administrator account/i);
        }

        // Last admin deletion attempt
        {
            const { req, res } = mockReqRes({
                params: { id: 'admin_last' },
                user: { id: 'other_operator', role: 'admin' }
            });
            await handler(req, res);
            assert.equal(res.statusCode, 400);
            assert.match(res.data.message, /Cannot delete the last remaining administrator account/i);
        }
    } finally {
        prisma.user.findUnique = origFindUnique;
        prisma.user.count = origCount;
    }
});

test('User Routes (/api/users/:id/role) Parity with Admin Routes', async () => {
    const handler = getRouteHandler(userRoutes, 'put', '/:id/role');

    // 1. Rejects invalid role
    {
        const { req, res } = mockReqRes({
            params: { id: 'u1' },
            body: { role: 'candidate' },
            user: { id: 'adm', role: 'admin' }
        });
        await handler(req, res);
        assert.equal(res.statusCode, 400);
        assert.equal(res.data.message, 'Role must be user or admin');
    }

    // 2. USER -> ADMIN
    const origFindUnique = prisma.user.findUnique;
    const origUpdate = prisma.user.update;
    prisma.user.findUnique = async () => ({ id: 'u1', name: 'U1', email: 'u1@ex.com', role: 'user' });
    prisma.user.update = async ({ data }) => ({ id: 'u1', name: 'U1', email: 'u1@ex.com', role: data.role });

    try {
        const { req, res } = mockReqRes({
            params: { id: 'u1' },
            body: { role: 'admin' },
            user: { id: 'adm', role: 'admin' }
        });
        await handler(req, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.data.user.role, 'admin');
    } finally {
        prisma.user.findUnique = origFindUnique;
        prisma.user.update = origUpdate;
    }
});
