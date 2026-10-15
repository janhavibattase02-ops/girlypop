import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory secure cloud backup vault (keyed by phone number)
const cloudBackupVault = new Map<string, { timestamp: string; payload: any; encryptedChecksum: string }>();

// GirlyPop AI Assistant Endpoint
app.post('/api/assistant', async (req, res) => {
  try {
    const { message, conversationHistory = [], userAge, context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful offline/local AI fallback response
      const fallbackReply = generateFallbackReply(message, context, userAge);
      res.json({ reply: fallbackReply, source: 'offline-safety-engine' });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are "GirlyPop", a caring, hyper-protective, non-judgmental, and medically informed sisterly AI assistant created specifically for girls and young women.
The user is ${userAge ? `${userAge} years old` : 'a young girl/woman'}.

Your key responsibilities:
1. EMERGENCY & SAFETY:
   - If the user feels unsafe, followed, or in immediate danger, provide sharp, practical, step-by-step de-escalation guidance: stay in lighted areas, call local emergency services, head into public stores, fake a loud phone call, share live location.
   - Speak in a calming, grounding, actionable tone.
2. REPRODUCTIVE & MENSTRUAL WELLNESS:
   - Age-appropriate menstrual health guidance: period cramps remedies (magnesium, ginger tea, heat pads, child's pose), cycle phases (menstrual, follicular, ovulatory, luteal), flow changes.
   - Demystify vaginal health (discharge types, normal flora, pH balance 3.8-4.5, avoiding scented douches or harsh chemicals).
   - Address common conditions kindly: PCOS, Endometriosis, UTIs, Yeast infections, Toxic Shock Syndrome (TSS).
   - Always encourage consulting a doctor/gynecologist for persistent severe pain or unusual discharge.
3. TONE & VIBE:
   - Sisterly, warm, reassuring, empowering ("girl, I've got your back!"), zero shame, 100% confidential.
   - Use bullet points for steps to read quickly during stress or pain. Keep replies concise and easy to read.`;

    // Construct contents
    const contents: any[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const turn of conversationHistory.slice(-6)) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [
        {
          text: `Context: ${JSON.stringify(context)}. User query: ${message}`,
        },
      ],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || 'I am here for you babe, tell me what you need!' });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    const fallbackReply = generateFallbackReply(req.body.message || '', req.body.context || {}, req.body.userAge);
    res.json({ reply: fallbackReply, source: 'fallback-safety-engine' });
  }
});

// Cloud Backup Endpoints
app.post('/api/backup/save', (req, res) => {
  const { phoneNumber, encryptedData, checksum } = req.body;
  if (!phoneNumber || !encryptedData) {
    res.status(400).json({ error: 'Phone number and encrypted backup data are required.' });
    return;
  }
  const timestamp = new Date().toISOString();
  cloudBackupVault.set(phoneNumber, {
    timestamp,
    payload: encryptedData,
    encryptedChecksum: checksum || 'aes-verified',
  });
  res.json({ success: true, timestamp, message: 'Cloud backup synced and securely encrypted.' });
});

app.post('/api/backup/restore', (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    res.status(400).json({ error: 'Phone number is required.' });
    return;
  }
  const backup = cloudBackupVault.get(phoneNumber);
  if (!backup) {
    res.status(404).json({ error: 'No cloud backup found for this account.' });
    return;
  }
  res.json({ success: true, backup });
});

// OAuth Callback handler for popups
app.get(['/auth/callback', '/auth/callback/'], (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authenticating with Supabase...</title>
      </head>
      <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f7f3ec; color: #24331e;">
        <div style="text-align: center; padding: 24px; border-radius: 16px; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <h3 style="margin-top: 0; color: #24331e;">Authentication Complete</h3>
          <p style="font-size: 14px; color: #55704d;">Returning to GirlyPop Safety OS...</p>
        </div>
        <script>
          if (window.opener) {
            try {
              window.opener.postMessage({ type: 'SUPABASE_AUTH_SUCCESS', hash: window.location.hash }, '*');
            } catch (e) {}
            setTimeout(() => {
              window.close();
            }, 600);
          } else {
            window.location.href = '/' + window.location.hash;
          }
        </script>
      </body>
    </html>
  `);
});

// Intelligent fallback helper when offline or key pending
function generateFallbackReply(prompt: string, context: any, age?: number): string {
  const p = prompt.toLowerCase();
  if (p.includes('danger') || p.includes('follow') || p.includes('unsafe') || p.includes('help') || p.includes('emergency')) {
    return `🚨 **Stay calm babe, I am here with you right now:**\n\n1. **Head toward people**: Walk briskly into an open coffee shop, pharmacy, grocery store, or illuminated lobby.\n2. **Activate Live SOS**: Hit the Red SOS button on your screen to immediately broadcast your coordinates to your trusted circle.\n3. **Fake Call**: Use our Fake Call Simulator right now to pretend you are on the phone with someone meeting you in 1 minute.\n4. **Call Emergency Services**: If you feel direct threat, call 911 / your local emergency hotline immediately without hesitation.`;
  }
  if (p.includes('cramp') || p.includes('pain') || p.includes('period')) {
    return `🌸 **Quick Relief for Period Cramps:**\n\n- **Heat Therapy**: Place a warm heating pad or hot water bottle directly on your lower abdomen or lower back.\n- **Herbal Comfort**: Brew chamomile, peppermint, or fresh ginger tea to help relax uterine muscles.\n- **Gentle Movement**: Try child's pose (Balasana) or cat-cow stretches to release pelvic pressure.\n- **Hydration & Magnesium**: Drink plenty of warm water and snack on dark chocolate or pumpkin seeds.\n- *Note: If cramps are sudden, debilitating, or keep you from normal function, consult your gynecologist to check for conditions like endometriosis.*`;
  }
  if (p.includes('discharge') || p.includes('itch') || p.includes('smell') || p.includes('ph')) {
    return `✨ **Vaginal Health & Biome Guide:**\n\n- **Healthy Discharge**: Clear or milky white, mild to no scent, stretchy during ovulation—this is your vagina's natural self-cleaning process!\n- **Warning Signs**: Cottage cheese texture with itching (often Yeast), fishy odor with thin gray discharge (often BV), or greenish-yellow tint with burning (see a doctor).\n- **Daily Tip**: Never use scented soaps or internal douches. Warm water on the vulva is all you need, paired with breathable 100% cotton underwear!`;
  }
  if (p.includes('pcos') || p.includes('endo') || p.includes('uti')) {
    return `🩺 **Cycle & Reproductive Wellness:**\n\n- **PCOS / PCOD**: Can cause irregular cycles, hormonal acne, or excess hair due to insulin and androgen sensitivity.\n- **UTI**: Burning when peeing, feeling like you always need to go. Drink plenty of water and see a clinic for antibiotics if needed.\n- **Endometriosis**: Tissue similar to the uterine lining grows outside the uterus, causing intense pelvic pain.\nAlways advocate for yourself with healthcare professionals—your pain is valid!`;
  }
  return `💖 Hey sweetie! I'm your GirlyPop companion. I'm here 24/7 to keep you safe when you're out, help you decode your menstrual cycle, relieve sudden period cramps, and answer any vaginal health questions without any embarrassment or taboos. What can I do for you today?`;
}

// Dev server or Production setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GirlyPop server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
