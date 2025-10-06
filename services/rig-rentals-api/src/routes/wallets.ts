import { Router } from 'express';
import { z } from 'zod';
import { getClient } from '../services/supabase';
import { createBitcoinWallet } from '../chains/bitcoin';
import { encryptMaybe } from '../util/crypto';

const router = Router();

const postSchema = z.object({
  solanaOwner: z.string().min(32),
  chain: z.enum(['Bitcoin', 'Fairbrix']).default('Bitcoin'),
  storePrivateKey: z.boolean().optional().default(false),
});

router.post('/', async (req, res) => {
  const parse = postSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { solanaOwner, chain, storePrivateKey } = parse.data;

  const supabase = getClient();
  const table = (supabase as any).from('mining_wallets');
  // Check existing
  const { data: existing, error: existingErr } = await table
    .select('*')
    .eq('solana_owner', solanaOwner)
    .eq('chain', chain)
    .maybeSingle();
  if (existingErr) return res.status(500).json({ error: existingErr.message });
  if (existing) return res.json(existing);

  // Create via adapter
  let address = '';
  let privateKey: string | undefined;
  if (chain === 'Bitcoin') {
    const w = createBitcoinWallet();
    address = w.address;
    privateKey = w.privateKeyWIF;
  } else if (chain === 'Fairbrix') {
    // Placeholder: reuse bitcoin adapter for address format similarity in mock
    const w = createBitcoinWallet();
    address = w.address;
    privateKey = w.privateKeyWIF;
  }

  const private_key_enc = storePrivateKey && privateKey ? encryptMaybe(privateKey) : null;
  const { data, error } = await table
    .insert({ solana_owner: solanaOwner, chain, address, private_key_enc } as any)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.get('/:solanaOwner', async (req, res) => {
  const { solanaOwner } = req.params;
  const supabase = getClient();
  const table = (supabase as any).from('mining_wallets');
  const { data, error } = await table
    .select('*')
    .eq('solana_owner', solanaOwner);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

export default router;
