export default async function handler(req: any, res: any) {
    return res.json({
        ok: true,
        method: req.method,
        url: req.url,
    });
}