import { google } from 'googleapis';
import multer from 'multer';
import stream from 'stream';

const upload = multer({ storage: multer.memoryStorage() });

function runMiddleware(req: any, res: any, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await runMiddleware(req, res, upload.single('image'));

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
            return res.status(500).json({
                success: false,
                message:
                    'Vui lòng cấu hình GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET và GOOGLE_REFRESH_TOKEN.',
            });
        }

        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            'https://developers.google.com/oauthplayground'
        );

        oauth2Client.setCredentials({
            refresh_token: refreshToken,
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        const fileMetadata: { name: string; parents?: string[] } = {
            name: req.file.originalname,
        };

        if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
            fileMetadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
        }

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: {
                mimeType: req.file.mimetype,
                body: bufferStream,
            },
            fields: 'id',
        });

        const fileId = response.data.id;
        if (!fileId) {
            throw new Error('No file ID returned');
        }

        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        return res.json({ success: true, url: imageUrl });
    } catch (error: any) {
        console.error('Drive upload error:', error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Upload failed',
        });
    }
}