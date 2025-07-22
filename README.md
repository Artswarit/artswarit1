
# Artswarit - Full-Stack Art Platform

Artswarit is a comprehensive platform connecting artists with clients, featuring artwork uploads, commissions, messaging, and premium memberships.

## 🚀 Features

### Authentication & User Management
- **Email/Password Authentication** - Secure user registration and login
- **Google OAuth Integration** - Quick social login option
- **Role-based Access Control** - Artist, Client, Admin, and Premium roles
- **Profile Management** - Complete user profile system with avatars and portfolios

### Content Management
- **Artwork Upload System** - Support for images, videos, and audio files
- **Storage Integration** - Secure file storage with Supabase Storage
- **Category System** - Organized artwork categorization
- **Search & Filtering** - Advanced artwork discovery features

### Social Features
- **Like/Unlike System** - Engagement tracking for artworks
- **Following System** - Users can follow their favorite artists
- **Feedback System** - Comments and ratings on artworks
- **Artist Profiles** - Public profile pages with portfolio display

### Business Features
- **Commission Management** - Project tracking and management
- **Messaging System** - Direct communication between artists and clients
- **Premium Memberships** - Subscription-based premium features
- **Payment Integration** - Ready for Stripe integration
- **Admin Dashboard** - Content moderation and platform management

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Radix UI** - Accessible component primitives

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Robust relational database
- **Row Level Security (RLS)** - Database-level security policies
- **Real-time Subscriptions** - Live updates for messaging and notifications

### Storage & Media
- **Supabase Storage** - File upload and management
- **Image Optimization** - Automatic image processing
- **CDN Delivery** - Fast media delivery worldwide

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Supabase account

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/artswarit.git
cd artswarit
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
The Supabase configuration is already set up in `src/integrations/supabase/client.ts`. The project is connected to:
- **Project URL**: `https://sqdzemlcqesgjsybbhte.supabase.co`
- **Anon Key**: Pre-configured for development

### 4. Database Schema
The database is already configured with the following tables:
- `profiles` - User profile information
- `artworks` - Artwork metadata and references
- `artwork_likes` - Like/unlike relationships
- `artwork_feedback` - Comments and ratings
- `follows` - User following relationships
- `projects` - Commission projects
- `conversations` - Messaging conversations
- `messages` - Individual messages
- `notifications` - User notifications
- `subscribers` - Premium membership data
- `transactions` - Payment and earning records

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 API Integration

### Authentication API
All authentication is handled through Supabase Auth:

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { signUp, signIn, signOut, user, loading } = useAuth();

// Sign up a new user
await signUp(email, password, { full_name: name, role: 'artist' });

// Sign in existing user
await signIn(email, password);

// Sign out
await signOut();
```

### Database Operations
Database operations use Supabase client with automatic RLS:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Fetch artworks
const { data, error } = await supabase
  .from('artworks')
  .select('*, profiles(full_name)')
  .eq('approval_status', 'approved');

// Upload artwork
const { data, error } = await supabase
  .from('artworks')
  .insert([artworkData]);
```

### File Upload
File uploads are handled through Supabase Storage:

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('artworks')
  .upload(`${userId}/${fileName}`, file);

// Get public URL
const { data } = supabase.storage
  .from('artworks')
  .getPublicUrl(filePath);
```

## 🔐 Security Features

### Row Level Security (RLS)
Database access is secured with RLS policies:
- Users can only modify their own data
- Public read access for approved content
- Admin override capabilities

### Input Validation
All forms include comprehensive validation:
- Required field validation
- Email format validation
- Password strength requirements
- File type and size restrictions

### Error Handling
Robust error handling throughout the application:
- User-friendly error messages
- Automatic retry mechanisms
- Network error detection
- Graceful fallbacks

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:

```bash
npm run build
```

### Backend Configuration
The backend is already deployed on Supabase. For custom deployments:
1. Set up Supabase project
2. Configure authentication providers
3. Set up storage buckets
4. Deploy database schema

## 📱 Usage Guide

### For Artists
1. **Sign Up** as an artist
2. **Complete Profile** with bio, location, and portfolio
3. **Upload Artworks** with proper categorization
4. **Manage Commissions** through the project system
5. **Communicate** with clients via messaging
6. **Upgrade** to Premium for additional features

### For Clients
1. **Sign Up** as a client
2. **Browse Artworks** using search and filters
3. **Follow Artists** you're interested in
4. **Commission Projects** by contacting artists
5. **Provide Feedback** on completed works

### For Admins
1. **Access Admin Dashboard** with admin role
2. **Moderate Content** and user reports
3. **Manage Users** and permissions
4. **Monitor Platform** analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Mobile app development
- Advanced analytics dashboard
- AI-powered artwork recommendations
- NFT marketplace integration
- Video streaming for live art sessions
- Advanced payment processing
- Multi-language support
