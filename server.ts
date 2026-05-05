import { createApp } from './server/app.js';

const port = Number(process.env.PORT || 3000);
const app = await createApp();

app.listen(port, () => {
    console.log(`Khói Lam dev server running at http://localhost:${port}`);
});
