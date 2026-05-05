import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ViteDevServer } from 'vite';

type ApiHandler = (req: express.Request, res: express.Response) => unknown | Promise<unknown>;
type HandlerLoader = () => Promise<{ default: ApiHandler }>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const registerApi = (app: express.Express, route: string, loadHandler: HandlerLoader) => {
    app.all(route, async (req, res, next) => {
        try {
            const { default: handler } = await loadHandler();
            await handler(req, res);
        } catch (error) {
            next(error);
        }
    });
};

export const createApp = async () => {
    const app = express();

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    registerApi(app, '/api/auth', () => import('../api/auth.js'));
    registerApi(app, '/api/batches', () => import('../api/batches.js'));
    registerApi(app, '/api/combos', () => import('../api/combos.js'));
    registerApi(app, '/api/coupons', () => import('../api/coupons.js'));
    registerApi(app, '/api/gifts', () => import('../api/gifts.js'));
    registerApi(app, '/api/health', () => import('../api/health.js'));
    registerApi(app, '/api/orders', () => import('../api/orders.js'));
    registerApi(app, '/api/products', () => import('../api/products.js'));
    registerApi(app, '/api/upload', () => import('../api/upload.js'));

    if (process.env.NODE_ENV === 'production') {
        const distDir = path.join(rootDir, 'dist');
        app.use(express.static(distDir));
        app.get('*', (_req, res) => {
            res.sendFile(path.join(distDir, 'index.html'));
        });
        return app;
    }

    let vite: ViteDevServer | undefined;
    try {
        const { createServer } = await import('vite');
        vite = await createServer({
            root: rootDir,
            appType: 'spa',
            server: { middlewareMode: true },
        });
        app.use(vite.middlewares);
    } catch (error) {
        console.error('Vite middleware failed to start:', error);
        throw error;
    }

    app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        vite?.ssrFixStacktrace(error as Error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ success: false, message });
    });

    return app;
};

export default createApp;
