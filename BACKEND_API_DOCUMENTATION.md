
# Artswarit Backend API Documentation

## Overview
This document outlines the complete backend API structure for the Artswarit platform, built using Supabase Edge Functions.

## Base Configuration
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Edge Functions**: Deno-based serverless functions

## API Endpoints

### 1. User Management API (`/functions/user-management`)

#### Update Profile
```typescript
POST /functions/user-management
{
  "action": "update_profile",
  "data": {
    "userId": "uuid",
    "updates": {
      "full_name": "string",
      "bio": "string",
      "location": "string",
      "website": "string"
    }
  }
}
```

#### Reset Password
```typescript
POST /functions/user-management
{
  "action": "reset_password",
  "data": {
    "email": "string"
  }
}
```

#### Get User Stats
```typescript
POST /functions/user-management
{
  "action": "get_user_stats",
  "data": {
    "userId": "uuid"
  }
}
```

#### Delete Account
```typescript
POST /functions/user-management
{
  "action": "delete_account",
  "data": {
    "userId": "uuid"
  }
}
```

### 2. Monetization API (`/functions/monetization`)

#### Send Tip
```typescript
POST /functions/monetization
{
  "action": "send_tip",
  "data": {
    "fromUserId": "uuid",
    "toUserId": "uuid",
    "amount": number,
    "artworkId": "uuid (optional)",
    "message": "string (optional)"
  }
}
```

#### Create Subscription
```typescript
POST /functions/monetization
{
  "action": "create_subscription",
  "data": {
    "userId": "uuid",
    "artistId": "uuid",
    "tier": "basic|premium|enterprise",
    "amount": number
  }
}
```

#### Get Earnings
```typescript
POST /functions/monetization
{
  "action": "get_earnings",
  "data": {
    "userId": "uuid",
    "period": "week|month|year"
  }
}
```

#### Withdraw Funds
```typescript
POST /functions/monetization
{
  "action": "withdraw_funds",
  "data": {
    "userId": "uuid",
    "amount": number,
    "paymentMethod": "string"
  }
}
```

### 3. Social Features API (`/functions/social-features`)

#### Follow User
```typescript
POST /functions/social-features
{
  "action": "follow_user",
  "data": {
    "followerId": "uuid",
    "followingId": "uuid"
  }
}
```

#### Unfollow User
```typescript
POST /functions/social-features
{
  "action": "unfollow_user",
  "data": {
    "followerId": "uuid",
    "followingId": "uuid"
  }
}
```

#### Get Followers
```typescript
POST /functions/social-features
{
  "action": "get_followers",
  "data": {
    "userId": "uuid",
    "limit": number,
    "offset": number
  }
}
```

#### Like Artwork
```typescript
POST /functions/social-features
{
  "action": "like_artwork",
  "data": {
    "userId": "uuid",
    "artworkId": "uuid"
  }
}
```

#### Add Comment
```typescript
POST /functions/social-features
{
  "action": "add_comment",
  "data": {
    "userId": "uuid",
    "artworkId": "uuid",
    "content": "string",
    "parentId": "uuid (optional)"
  }
}
```

### 4. Notifications API (`/functions/notifications`)

#### Send Notification
```typescript
POST /functions/notifications
{
  "action": "send_notification",
  "data": {
    "userId": "uuid",
    "title": "string",
    "message": "string",
    "type": "info|success|warning|error",
    "metadata": object
  }
}
```

#### Get Notifications
```typescript
POST /functions/notifications
{
  "action": "get_notifications",
  "data": {
    "userId": "uuid",
    "limit": number,
    "offset": number,
    "unreadOnly": boolean
  }
}
```

#### Mark as Read
```typescript
POST /functions/notifications
{
  "action": "mark_read",
  "data": {
    "notificationId": "uuid",
    "userId": "uuid"
  }
}
```

## Database Schema

### Core Tables
- **profiles**: User profile information
- **artworks**: Artwork metadata and content
- **artwork_likes**: Like relationships
- **artwork_feedback**: Comments and feedback
- **follows**: Follow relationships
- **notifications**: User notifications
- **transactions**: Financial transactions
- **subscriptions**: User subscriptions
- **withdrawals**: Withdrawal requests

### Authentication
- Uses Supabase Auth with email/password and OAuth providers
- JWT tokens for API authentication
- Row-Level Security (RLS) policies for data access control

## Frontend Integration

### React Hooks
- `useUserManagement`: User profile and account management
- `useMonetization`: Tips, subscriptions, and earnings
- `useSocialFeatures`: Follow, like, and comment functionality
- `useNotifications`: Real-time notification system
- `useArtworks`: Artwork management and display

### Real-time Features
- Live notifications using Supabase Realtime
- Real-time like and comment updates
- Live follower count updates

## Security Features
- Row-Level Security (RLS) on all tables
- JWT verification for protected endpoints
- Input validation and sanitization
- CORS configuration for web app integration

## Error Handling
All endpoints return standardized error responses:
```typescript
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Rate Limiting
- Authentication required for most endpoints
- Built-in Supabase rate limiting
- Custom rate limiting can be implemented per function

## Deployment
- Edge functions auto-deploy with code changes
- Environment variables managed through Supabase dashboard
- Secrets stored securely in Supabase vault

## Development Notes
- All functions use CORS headers for web app compatibility
- Comprehensive logging for debugging
- Service role key used for administrative operations
- Real-time subscriptions automatically clean up on disconnect

## Usage Examples

### Frontend Hook Usage
```typescript
// User Management
const { updateProfile, getUserStats } = useUserManagement();
await updateProfile(userId, { bio: "New bio" });

// Monetization
const { sendTip, getEarnings } = useMonetization();
await sendTip(artistId, 10, artworkId, "Great work!");

// Social Features
const { followUser, addComment } = useSocialFeatures();
await followUser(artistId);
await addComment(artworkId, "Amazing artwork!");

// Notifications
const { notifications, markAsRead } = useNotifications();
await markAsRead(notificationId);
```

This backend implementation provides a complete foundation for the Artswarit platform with proper authentication, monetization, social features, and real-time capabilities.
