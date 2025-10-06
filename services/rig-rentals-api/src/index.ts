import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import walletsRouter from './routes/wallets';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/wallets', walletsRouter);

const port = parseInt(process.env.PORT || '4001', 10);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[rig-rentals-api] listening on :${port}`);
});
