
# Artswarit - Digital Art Platform

Artswarit is a comprehensive digital art platform that connects artists with clients, featuring artwork showcasing, commission management, and community engagement features.

## 🚀 Features

### Authentication & User Management
- **Email/Password Authentication**: Secure user registration and login
- **Email Verification**: Mandatory email verification for account activation
- **Google OAuth**: Social login integration
- **Role-based Access**: Artist, Client, and Admin roles
- **Profile Management**: Comprehensive user profiles with portfolio support

### Artist Features
- **Portfolio Management**: Upload and manage artwork collections
- **Commission System**: Accept and manage client commissions
- **Earnings Dashboard**: Track revenue and payment history
- **Profile Approval System**: Admin moderation for artist profiles
- **AI Content Detection**: Automated content verification

### Client Features
- **Art Discovery**: Browse and search artwork collections
- **Artist Following**: Follow favorite artists
- **Commission Requests**: Request custom artwork from artists
- **Saved Collections**: Bookmark favorite artworks and artists

### Admin Features
- **User Management**: Approve/reject artist profiles
- **Content Moderation**: Review and approve artwork submissions
- **Platform Analytics**: Monitor platform usage and engagement

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **Radix UI** for component primitives

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** database
- **Row Level Security (RLS)** for data protection
- **Supabase Auth** for authentication
- **Supabase Storage** for file uploads

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/artswarit.git
cd artswarit
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Supabase**
- Create a new Supabase project at [supabase.com](https://supabase.com)
- Copy your project URL and anon key from the project settings
- The Supabase configuration is already set in `src/integrations/supabase/client.ts`

4. **Run the development server**
```bash
npm run dev
```

## 📊 Database Schema

The platform uses the following main database tables:

### Core Tables
- **profiles**: User profile information and metadata
- **artworks**: Artist portfolio pieces and submissions
- **projects**: Commission projects between artists and clients
- **transactions**: Payment and financial records

### Engagement Tables
- **artwork_likes**: User likes on artworks
- **artwork_feedback**: Comments and reviews
- **follows**: Artist-client follow relationships
- **saved_artists**: Client bookmarks of artists

### Communication
- **conversations**: Chat threads between users
- **messages**: Individual chat messages
- **notifications**: System and user notifications

## 🔐 Authentication Flow

### Sign Up Process
1. User fills registration form (email, password, role)
2. System sends verification email via Supabase Auth
3. User clicks verification link to activate account
4. Artist accounts require admin approval before full access
5. Approved users can access their respective dashboards

### Sign In Process
1. User enters email and password
2. System validates credentials via Supabase Auth
3. Email verification status is checked
4. Role-based redirect to appropriate dashboard

### Protected Routes
- Authentication required for all dashboard pages
- Role-based access control (artists vs clients vs admins)
- Email verification requirement for platform access

## 🎨 Artist Workflow

### Getting Started
1. **Sign up** with artist role
2. **Verify email** via confirmation link
3. **Complete profile** with bio, portfolio, and contact info
4. **Wait for admin approval** (24-48 hours)
5. **Access artist dashboard** after approval

### Managing Artwork
- Upload artwork with titles, descriptions, and tags
- Set pricing and availability
- Track views, likes, and engagement
- Manage featured and pinned content

### Commission Management
- Receive commission requests from clients
- Set project timelines and pricing
- Communicate with clients via built-in messaging
- Track project progress and payments

## 👥 Client Workflow

### Discovering Art
- Browse featured artwork on homepage
- Search by categories, tags, and artists
- Filter by price, style, and availability
- View detailed artwork pages with artist info

### Engaging with Artists
- Follow favorite artists for updates
- Like and comment on artwork
- Save artists and artworks to collections
- Request custom commissions

## 🔧 API Integration

### Authentication API
```typescript
// Sign up
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: redirectUrl, data: userData }
});

// Sign in
const { error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Sign out
const { error } = await supabase.auth.signOut();
```

### Profile Management
```typescript
// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Update profile
const { error } = await supabase
  .from('profiles')
  .update(updates)
  .eq('id', userId);
```

### Artwork Management
```typescript
// Upload artwork
const { data, error } = await supabase
  .from('artworks')
  .insert({
    title,
    description,
    image_url,
    artist_id,
    category,
    tags
  });

// Get artworks
const { data: artworks } = await supabase
  .from('artworks')
  .select('*, profiles!artworks_artist_id_fkey(full_name, avatar_url)')
  .eq('approval_status', 'approved');
```

### Engagement Features
```typescript
// Like artwork
const { error } = await supabase
  .from('artwork_likes')
  .insert({ artwork_id, user_id });

// Follow artist
const { error } = await supabase
  .from('follows')
  .insert({ artist_id, client_id });
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
The app uses Supabase configuration that's already integrated. For custom deployments:

1. Update Supabase project settings
2. Configure authentication providers
3. Set up email templates for verification
4. Configure storage buckets for file uploads

## 🧪 Testing

### Test User Accounts
For development testing, you can create test accounts:

**Test Artist Account:**
- Email: artist@test.com
- Role: Artist
- Status: Requires email verification and admin approval

**Test Client Account:**
- Email: client@test.com  
- Role: Client
- Status: Requires email verification only

### Full Platform Testing
1. **Registration Flow**: Sign up → verify email → login
2. **Artist Workflow**: Profile completion → admin approval → dashboard access
3. **Content Upload**: Artwork upload → admin approval → public visibility
4. **Engagement**: Browse art → like → follow → commission request
5. **Communication**: Messaging between artists and clients

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 🔍 Troubleshooting

### Common Issues

**Authentication Problems:**
- Ensure Supabase URL configuration in authentication settings
- Check email verification settings in Supabase dashboard
- Verify redirect URLs in Supabase Auth settings

**Profile Access Issues:**
- Confirm email verification status
- Check account approval status for artists
- Verify role-based permissions

**File Upload Issues:**
- Check Supabase storage bucket configuration
- Verify RLS policies for storage access
- Ensure proper file type and size limits

## 📧 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in `/docs` folder
- Review Supabase logs for backend issues

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the digital art community**
