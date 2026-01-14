# Chat Interface met n8n Webhook Integratie

Een WhatsApp-achtige chat interface die berichten kan versturen naar en ontvangen van een n8n webhook endpoint.

## Features

- 💬 WhatsApp-achtige chat interface met groene header
- 📤 Berichten van de gebruiker rechts uitgelijnd (groen)
- 📥 Inkomende berichten links uitgelijnd (wit)
- 🎨 Moderne, minimalistische styling met afgeronde hoeken
- 📅 Datum-dividers tussen berichten van verschillende dagen
- ⚡ Auto-scroll naar nieuwste bericht
- 🔄 Real-time updates via Supabase
- ⚙️ Configureerbare n8n webhook URL via settings dialog
- 🗑️ Knop om chat te wissen

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Real-time + Edge Functions)
- **UI Icons**: Lucide React
- **Styling**: Pure CSS met WhatsApp-geïnspireerd design

## Database Schema

### Conversations Table
```sql
- id (UUID, primary key)
- session_id (TEXT, altijd "default")
- metadata (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Messages Table
```sql
- id (UUID, primary key)
- conversation_id (UUID, foreign key)
- content (TEXT)
- direction (TEXT: "incoming" of "outgoing")
- status (TEXT: "pending", "delivered", "failed")
- created_at (TIMESTAMP)
```

## Edge Functions

### 1. send-message
Verstuurt berichten naar n8n webhook endpoint.

**Input:**
```json
{
  "message_id": "uuid",
  "content": "bericht tekst",
  "n8n_endpoint": "https://optional-url.com/webhook"
}
```

**Output naar n8n:**
```json
{
  "message": "bericht tekst"
}
```

### 2. receive-message
Ontvangt berichten van n8n en slaat ze op in de database.

**Input van n8n:**
```json
{
  "message": "antwoord tekst"
}
```

**Endpoint:** `/functions/v1/receive-message`

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Maak een `.env` file aan gebaseerd op `.env.example`:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Setup Supabase

#### Database Migration
Voer de migration uit in de Supabase SQL editor:
```bash
supabase/migrations/20240101000000_initial_schema.sql
```

Of handmatig in de Supabase dashboard:
- Ga naar SQL Editor
- Kopieer en voer de SQL uit vanuit `supabase/migrations/20240101000000_initial_schema.sql`

#### Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy edge functions
supabase functions deploy send-message
supabase functions deploy receive-message
```

#### Enable Real-time
In Supabase Dashboard:
1. Ga naar Database → Replication
2. Enable real-time voor de `messages` table

### 4. Run Development Server
```bash
npm run dev
```

De app draait nu op `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
```

## Gebruik

### Settings Configureren
1. Klik op het tandwiel icoon in de header
2. Voer je n8n webhook URL in (voor outgoing messages)
3. Kopieer de incoming webhook URL voor n8n configuratie
4. Klik op Save

### n8n Workflow Setup

#### Voor Incoming Messages (van n8n naar chat):
1. Voeg een HTTP Request node toe in je n8n workflow
2. Configureer als POST request naar: `{SUPABASE_URL}/functions/v1/receive-message`
3. Headers:
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer {SUPABASE_ANON_KEY}`
4. Body:
   ```json
   {
     "message": "{{ $json.response }}"
   }
   ```

#### Voor Outgoing Messages (van chat naar n8n):
1. Maak een Webhook node in n8n
2. Kopieer de webhook URL
3. Plak deze in de chat settings
4. De webhook ontvangt berichten in dit formaat:
   ```json
   {
     "message": "user message text"
   }
   ```

## Project Structure

```
lovable/
├── src/
│   ├── components/
│   │   ├── Chat.tsx           # Hoofd chat component
│   │   ├── MessageBubble.tsx  # Individuele bericht bubble
│   │   ├── DateDivider.tsx    # Datum scheidingslijnen
│   │   └── SettingsDialog.tsx # Settings modal
│   ├── hooks/
│   │   ├── useMessages.ts     # Message management hook
│   │   └── useSettings.ts     # Settings management hook
│   ├── lib/
│   │   └── supabase.ts        # Supabase client configuratie
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── functions/
│   │   ├── send-message/      # Edge function voor outgoing
│   │   └── receive-message/   # Edge function voor incoming
│   └── migrations/
│       └── 20240101000000_initial_schema.sql
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Styling Kenmerken

- **Header**: Groen (#25D366) zoals WhatsApp
- **Outgoing messages**: Lichtgroen (#dcf8c6)
- **Incoming messages**: Wit
- **Background**: WhatsApp-achtig patroon
- **Afgeronde hoeken**: Modern design
- **Responsive**: Werkt op desktop en mobiel

## Security

- RLS (Row Level Security) policies voor publieke toegang
- Geen authenticatie vereist (zoals gespecificeerd)
- Webhook URLs worden lokaal opgeslagen (localStorage)

## License

ISC
