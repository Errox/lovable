# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Supabase**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Setup Database**
   
   Run the migration in Supabase SQL Editor:
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Copy and paste the content from `supabase/migrations/20240101000000_initial_schema.sql`
   - Execute the SQL

4. **Deploy Edge Functions**
   
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Deploy functions
   supabase functions deploy send-message
   supabase functions deploy receive-message
   ```

5. **Enable Real-time**
   
   In Supabase Dashboard:
   - Go to Database → Replication
   - Enable real-time for the `messages` table

6. **Run Development Server**
   ```bash
   npm run dev
   ```

## Testing the Integration

### Test Incoming Messages (n8n → Chat)

You can test the incoming webhook with curl:

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/receive-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{"message": "Hello from n8n!"}'
```

### Test Outgoing Messages (Chat → n8n)

1. Set up a webhook in n8n or use a test endpoint like webhook.site
2. Copy the webhook URL
3. In the chat app, click the settings icon (⚙️)
4. Paste the webhook URL
5. Click Save
6. Send a message in the chat
7. Check your n8n workflow or webhook.site to see the message

## n8n Workflow Configuration

### Receiving Messages from Chat (Outgoing)

Create a Webhook node in n8n:
- Method: POST
- Path: /chat-webhook (or your choice)
- Response Mode: When Last Node Finishes
- Expected data: `{ "message": "user text" }`

### Sending Messages to Chat (Incoming)

Add an HTTP Request node after processing:
- Method: POST
- URL: `https://your-project.supabase.co/functions/v1/receive-message`
- Authentication: None
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer your-anon-key`
- Body JSON:
  ```json
  {
    "message": "{{ $json.response }}"
  }
  ```

## Troubleshooting

### Messages not appearing
- Check browser console for errors
- Verify Supabase credentials in `.env`
- Ensure real-time is enabled for messages table
- Check RLS policies are created correctly

### Can't send messages
- Verify n8n webhook URL is configured
- Check that edge function is deployed
- Look at browser network tab for failed requests
- Verify n8n webhook is accessible

### Edge functions not working
- Ensure functions are deployed: `supabase functions list`
- Check function logs: `supabase functions logs send-message`
- Verify environment variables in Supabase dashboard

## Production Deployment

### Frontend
You can deploy the frontend to:
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod`
- Supabase Hosting (if available)
- Any static hosting service

### Environment Variables
Make sure to set these in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Build Command
```bash
npm run build
```

### Output Directory
```
dist/
```
