# Parafit Clone

A fitness tracking application built with Next.js, Supabase, and OneSignal for push notifications.

## Features

- **Dashboard**: Water tracking, weight logging, meal planning
- **Recipes**: Searchable recipe database with nutritional info
- **Meal Planning**: Daily meal scheduling and management
- **Settings**: User profile and notification preferences
- **Push Notifications**: OneSignal integration for meal and water reminders
- **Admin CMS**: Recipe and meal plan management
- **PWA**: Progressive Web App with offline support
- **Analytics**: User interaction tracking

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Push Notifications**: OneSignal
- **Charts**: Recharts (client-only)
- **Icons**: Lucide React
- **PWA**: Service Worker, Manifest

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Supabase account
- OneSignal account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd parafit-clone
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id

# Optional: Supabase Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm start
```

## Vercel Deployment

### Build Optimizations

The project is optimized for Vercel deployment with:

- **Node.js 20+**: Specified in `package.json` engines
- **TypeScript**: `skipLibCheck: true` for faster builds
- **ESLint**: `ignoreDuringBuilds: true` for CI/CD
- **Dynamic Imports**: Charts and OneSignal components use `{ ssr: false }`
- **Client Boundaries**: All browser APIs are properly fenced

### Environment Variables

Set these in your Vercel dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Build Commands

Vercel will automatically detect Next.js and use:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### OneSignal Setup

1. **Create OneSignal App**:
   - Go to [OneSignal Dashboard](https://app.onesignal.com/)
   - Create a new web push app
   - Note your App ID

2. **Configure Web Push Settings**:
   - Add `localhost:3000` for development
   - Add your Vercel domain for production
   - Configure allowed origins

3. **Service Worker Setup**:
   - OneSignal service workers are automatically configured
   - They coexist with PWA workers without conflicts
   - Files: `OneSignalSDKWorker.js` and `OneSignalSDKUpdaterWorker.js`

4. **Environment Variable**:
   ```env
   NEXT_PUBLIC_ONESIGNAL_APP_ID=your_app_id_here
   ```

### Database Setup

1. **Create Supabase Project**:
   - Go to [Supabase Dashboard](https://supabase.com/)
   - Create a new project
   - Get your project URL and anon key

2. **Run Database Migrations**:
   - The app will automatically create tables on first run
   - Tables: profiles, recipes, plans, plan_days, track_water, track_weight, reminders, messages

3. **Row Level Security (RLS)**:
   - All tables use RLS for user isolation
   - Public content (recipes, plans) is viewable by all authenticated users
   - Private content is only accessible by the owner

4. **Supabase Storage Setup** (Required for Admin CMS):
   - Go to Storage section in your Supabase dashboard
   - Create a new bucket called `images`
   - Set bucket to **Public** (uncheck "Private bucket")
   - Set RLS policy to allow authenticated users to upload:
   ```sql
   CREATE POLICY "Allow authenticated uploads" ON storage.objects
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   
   CREATE POLICY "Allow public viewing" ON storage.objects
   FOR SELECT USING (bucket_id = 'images');
   ```
   - This enables image uploads for recipe creation in the admin CMS

## Project Structure

```
parafit-clone/
├── app/                    # Next.js app directory
│   ├── (app)/            # Protected app routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── recipes/      # Recipe management
│   │   ├── plan/         # Meal planning
│   │   ├── support/      # User support chat
│   │   └── settings/     # User settings
│   ├── (auth)/           # Authentication routes
│   ├── admin/            # Admin-only routes
│   │   ├── support/      # Admin support management
│   │   ├── recipes/      # Recipe CMS
│   │   └── plans/        # Meal plan builder
│   ├── api/              # REST API routes
│   └── auth/             # Auth callback routes
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── public/                # Static assets and service workers
└── db/                    # Database schema documentation
```

## API Routes

- `GET/PATCH /api/me` - User profile management
- `GET/POST /api/recipes` - Recipe CRUD operations
- `GET/PATCH/DELETE /api/recipes/[id]` - Individual recipe operations
- `GET/POST /api/plans` - Meal plan management
- `GET/PATCH/DELETE /api/plans/[id]` - Individual plan operations
- `POST /api/plan-days` - Plan day bulk operations
- `GET/POST /api/track/water` - Water intake tracking
- `GET/POST /api/track/weight` - Weight tracking
- `GET/POST /api/reminders` - Notification reminders
- `GET/POST /api/messages` - User messages
- `GET /api/admin/check` - Admin role verification

## Admin CMS Features

### Recipe Management (`/admin/recipes`)
- **Data Table**: Search, sort, and filter recipes
- **Create/Edit Modal**: Full recipe form with image upload
- **Image Storage**: Supabase Storage integration for recipe images
- **Bulk Operations**: Create, update, and delete recipes
- **Public/Private Toggle**: Control recipe visibility

### Meal Plan Builder (`/admin/plans`)
- **Plan Creation**: Set name, goal, and daily calorie targets
- **Day Management**: Add/remove days dynamically
- **Meal Assignment**: Drag & drop recipe assignment to meal slots
- **Recipe Search**: Find recipes by name and calories
- **Bulk Save**: Save all plan days at once

### Support Management (`/admin/support`)
- **User Conversations**: View all user support chats
- **Real-time Chat**: Live message updates with Supabase Realtime
- **Admin Replies**: Respond to user messages as support staff
- **Online Status**: Track user activity and presence

## OneSignal Integration

### Features
- **Automatic Initialization**: SDK initializes on app load
- **Permission Handling**: Polite permission requests with fallback UI
- **User Identification**: Links notifications to user profile
- **Dynamic Tags**: Updates meal and water reminder times
- **Service Worker**: Handles push notifications without PWA conflicts

### Implementation Details
- **Hook**: `useOneSignal()` for SDK management
- **Context**: `OneSignalProvider` for app-wide state
- **Banner**: `OneSignalBanner` for permission denied states
- **Tags**: Automatic tag updates when reminders change

### Service Worker Coexistence
- OneSignal workers load after PWA workers
- No conflicts between notification systems
- Proper fallback handling for different permission states

## PWA (Progressive Web App) Features

### Core PWA Capabilities
- **Installable**: Add to home screen on supported devices
- **Offline Support**: App shell and static assets cached
- **App-like Experience**: Standalone mode with custom theme
- **Background Sync**: Handle offline actions when connection returns
- **Push Notifications**: Native notification support

### Service Worker Strategy
- **App Shell Routes**: Cache-first for `/dashboard`, `/recipes`, `/plan`, `/settings`, `/support`
- **Static Assets**: Cache-first for images, CSS, JS, and manifest files
- **API Requests**: Network-first with fallback to cache
- **Dynamic Content**: Network-first for user-generated content

### Caching Strategy
```
App Shell Routes: Cache First
├── /dashboard
├── /recipes  
├── /plan
├── /settings
└── /support

Static Assets: Cache First
├── CSS/JS files
├── Images and icons
├── Manifest and config
└── Font files

API Requests: Network First
├── User data
├── Recipe content
├── Meal plans
└── Tracking data
```

### Service Worker Lifecycle
1. **Install**: Precache app shell and static assets
2. **Activate**: Clean up old caches and take control
3. **Fetch**: Handle requests with appropriate caching strategy
4. **Update**: Detect new versions and prompt user to reload

### PWA Manifest Configuration
```json
{
  "name": "Parafit Clone",
  "short_name": "Parafit",
  "start_url": "/dashboard",
  "display": "standalone",
  "theme_color": "#00B887",
  "background_color": "#0E1114",
  "icons": [192x192, 512x512]
}
```

### Install Experience
- **Before Install Prompt**: Captures install event for custom UI
- **Install Banner**: Gentle prompt when app can be installed
- **Installation Detection**: Tracks if app is already installed
- **Update Notifications**: Alerts when new versions are available

### Offline Functionality
- **App Shell**: Core navigation and UI available offline
- **Cached Data**: Previously viewed content accessible offline
- **Graceful Degradation**: Fallback UI for offline states
- **Background Sync**: Queue actions for when connection returns

## Service Worker Coexistence Documentation

### Registration Order
The app uses a specific service worker registration order to ensure OneSignal and PWA workers don't conflict:

1. **PWA Service Worker** (`/sw.js`) - Registered first
   - Handles app shell caching
   - Manages offline functionality
   - Controls update notifications

2. **OneSignal Service Workers** - Registered second
   - `OneSignalSDKWorker.js` - Main notification worker
   - `OneSignalSDKUpdaterWorker.js` - Update worker

### Conflict Prevention
- **Separate Scopes**: PWA worker at root `/`, OneSignal workers at specific paths
- **Message Passing**: Workers communicate via postMessage API
- **Update Handling**: PWA worker coordinates with OneSignal during updates
- **Cache Management**: Separate cache names prevent conflicts

### Update Flow
```
1. New PWA version deployed
2. Service worker detects update
3. Shows "New version available" toast
4. User clicks update/reload
5. PWA worker activates new version
6. OneSignal workers continue functioning
7. App reloads with new version
```

### Best Practices
- **Never Unregister**: Keep service workers registered for consistent behavior
- **Update Coordination**: PWA worker handles app updates, OneSignal handles notifications
- **Cache Isolation**: Separate cache names for different worker types
- **Error Handling**: Graceful fallbacks if any worker fails

### Troubleshooting
- **Clear Caches**: Use browser dev tools to clear service worker caches
- **Unregister Workers**: Temporarily unregister to test without PWA features
- **Check Console**: Monitor service worker registration and update logs
- **Network Tab**: Verify caching behavior in browser dev tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.