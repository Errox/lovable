# Architecture Documentation

## Overview

This chat application follows a modern serverless architecture using Supabase as the backend and React for the frontend. The system integrates with n8n workflows via webhooks for bidirectional communication.

## System Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│             │         │                  │         │             │
│   Browser   │◄───────►│  Supabase        │◄───────►│     n8n     │
│   (React)   │         │  (Backend)       │         │  Workflows  │
│             │         │                  │         │             │
└─────────────┘         └──────────────────┘         └─────────────┘
                               │
                               │
                        ┌──────┴──────┐
                        │             │
                   ┌────▼────┐   ┌───▼────┐
                   │Database │   │  Edge  │
                   │(Postgres│   │Functions│
                   └─────────┘   └────────┘
```

## Components

### Frontend (React + TypeScript)

**Main Components:**
- `Chat.tsx`: Main container managing the chat interface
- `MessageBubble.tsx`: Individual message display
- `DateDivider.tsx`: Date separators between messages
- `SettingsDialog.tsx`: Configuration modal for webhook URLs

**Hooks:**
- `useMessages.ts`: Manages message state, real-time subscriptions, and CRUD operations
- `useSettings.ts`: Manages n8n webhook URL configuration via localStorage

**Features:**
- Real-time message updates via Supabase subscriptions
- Auto-scroll to latest message
- WhatsApp-inspired UI design
- Responsive layout

### Backend (Supabase)

**Database Tables:**

1. **conversations**
   - Stores conversation metadata
   - Single default conversation (session_id = "default")
   - Auto-updates timestamp

2. **messages**
   - Stores all chat messages
   - Direction: "incoming" (from n8n) or "outgoing" (from user)
   - Status: "pending", "delivered", or "failed"
   - Real-time enabled for instant updates

**Edge Functions:**

1. **send-message**
   - Receives outgoing messages from the frontend
   - Forwards to n8n webhook endpoint
   - Updates message status based on delivery result
   - Handles webhook URL from settings or environment

2. **receive-message**
   - Webhook endpoint for n8n to send messages
   - Creates conversation if it doesn't exist
   - Inserts incoming message with "delivered" status
   - Triggers real-time update to frontend

**Security:**
- Row Level Security (RLS) enabled
- Public policies (no authentication required as per spec)
- CORS configured for cross-origin requests

### Integration (n8n)

**Outgoing Flow (Chat → n8n):**
1. User types message in chat
2. Frontend inserts message with "pending" status
3. Frontend calls `send-message` edge function
4. Edge function posts to n8n webhook
5. n8n processes message
6. Edge function updates status to "delivered" or "failed"

**Incoming Flow (n8n → Chat):**
1. n8n workflow generates response
2. HTTP Request node posts to `receive-message` endpoint
3. Edge function inserts message as "incoming"
4. Real-time subscription pushes to frontend
5. Message appears instantly in chat

## Data Flow

### Sending a Message

```
User Input
    │
    ▼
React State Update
    │
    ▼
Supabase Insert (status: pending)
    │
    ├─► Real-time Update ──► UI Update
    │
    ▼
Edge Function: send-message
    │
    ▼
HTTP POST to n8n
    │
    ▼
Supabase Update (status: delivered/failed)
    │
    ▼
Real-time Update ──► UI Update (status indicator)
```

### Receiving a Message

```
n8n Workflow
    │
    ▼
HTTP POST to receive-message
    │
    ▼
Edge Function Processing
    │
    ├─► Get/Create Conversation
    │
    ▼
Supabase Insert (direction: incoming)
    │
    ▼
Real-time Subscription
    │
    ▼
React State Update
    │
    ▼
UI Update (new message appears)
```

## Real-time Updates

The application uses Supabase's real-time capabilities:

1. **Subscription Setup**: On component mount, subscribes to `messages` table changes
2. **Event Handling**: 
   - INSERT: Adds new message to state
   - UPDATE: Updates existing message (e.g., status change)
   - DELETE: Removes message from state
3. **Auto-cleanup**: Unsubscribes on component unmount

## State Management

**Local State:**
- Message input text
- UI flags (settings dialog, menu visibility)

**Server State (via hooks):**
- Messages array (synced with database)
- Conversation ID
- Loading states

**Persistent State:**
- n8n webhook URL (localStorage)

## Styling Philosophy

The UI follows WhatsApp's design principles:
- **Color Scheme**: 
  - Primary: #25D366 (WhatsApp green)
  - Outgoing: #dcf8c6 (light green)
  - Incoming: white
  - Background: #e5ddd5 (beige pattern)
- **Typography**: System fonts for native feel
- **Spacing**: Generous padding for touch-friendly UI
- **Shadows**: Subtle for depth
- **Animations**: Smooth transitions, no jarring effects

## Performance Considerations

1. **Real-time Efficiency**: Subscription filters by conversation_id
2. **Auto-scroll**: Uses smooth behavior for better UX
3. **Message Grouping**: Groups by date client-side
4. **Minimal Re-renders**: Proper React hooks dependencies
5. **Image Optimization**: SVG icons for crisp display

## Security Considerations

1. **Public Access**: No authentication (as specified)
   - Consider adding auth for production use
2. **Input Validation**: Frontend validates non-empty messages
3. **Error Handling**: Try-catch blocks for all async operations
4. **CORS**: Configured in edge functions
5. **Environment Variables**: Sensitive data in .env files

## Deployment Strategy

**Development:**
- Local development with Vite dev server
- Points to remote Supabase instance
- Edge functions can be tested locally with Supabase CLI

**Production:**
- Frontend: Static build deployed to CDN (Vercel, Netlify)
- Backend: Supabase managed infrastructure
- Edge functions: Deployed to Supabase edge network
- Database: PostgreSQL on Supabase

## Monitoring & Debugging

**Frontend:**
- Browser DevTools console for errors
- Network tab for API calls
- React DevTools for component state

**Backend:**
- Supabase Dashboard for database queries
- Edge function logs: `supabase functions logs`
- Real-time subscriptions panel

## Future Enhancements

Potential improvements:
1. User authentication and multi-user support
2. Message editing and deletion
3. File/image attachments
4. Typing indicators
5. Read receipts
6. Message search
7. Conversation history pagination
8. Push notifications
9. End-to-end encryption
10. Emoji picker and reactions
