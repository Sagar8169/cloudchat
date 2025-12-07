# ChatSlack - Real-time Chat & File Sharing Application

A full-featured real-time chat application built with Next.js, Firebase, and Razorpay. Features unlimited channels, large file sharing up to 10GB, and flexible subscription plans.

## Features

### Core Features
- **Real-time Messaging** - Instant messaging with live updates using Firebase Firestore
- **Unlimited Channels** - Create and organize conversations by topics
- **File Sharing** - Upload and share files with plan-based limits
- **User Authentication** - Secure email/password authentication with Firebase Auth
- **Dark/Light Mode** - Toggle between themes with persistent preferences
- **Responsive Design** - Mobile-first design that works on all devices

### Subscription Plans

#### Free Plan ($0/month)
- 50 MB file upload limit
- Unlimited channels
- Real-time messaging
- Basic file sharing
- Community support

#### Pro Plan ($19/month)
- 5 GB file upload limit
- Unlimited channels
- Real-time messaging
- Advanced file sharing
- Priority support
- Custom emoji reactions
- Message search

#### Team Plan ($39/month)
- 10 GB file upload limit
- Unlimited channels
- Real-time messaging
- Enterprise file sharing
- 24/7 priority support
- Custom emoji reactions
- Advanced message search
- Team analytics
- Admin controls

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Payments**: Razorpay
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase project
- A Razorpay account (test mode is fine for development)

### Installation

1. Clone the repository or download the code

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:

Create a `.env.local` file in the root directory (optional - Firebase config is already in the code):

\`\`\`env
# Razorpay (optional - already configured with test keys)
RAZORPAY_KEY_ID=rzp_test_RoR3OCkJF6aJL6
RAZORPAY_KEY_SECRET=bO4RxqhdizMlf1EPkRNHgvyH
\`\`\`

### Firebase Configuration

The Firebase configuration is already set up in `lib/firebase.ts`:

\`\`\`typescript
const firebaseConfig = {
  apiKey: "AIzaSyDg1MsnojbsqjyooUt2uGEbUqRHogy5ZTk",
  authDomain: "chatslack.firebaseapp.com",
  projectId: "chatslack",
  storageBucket: "chatslack.firebasestorage.app",
  messagingSenderId: "559568583292",
  appId: "1:559568583292:web:12ae50403b7b0b2d0aa7f9",
}
\`\`\`

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `chatslack`
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
4. Set up Firestore:
   - Go to Firestore Database
   - Create database in production mode
   - Rules are handled by the app
5. Set up Storage:
   - Go to Storage
   - Get started
   - Rules are configured for authenticated users

### Running the App

Start the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── create-order/      # Razorpay order creation
│   │   └── verify-payment/    # Payment verification
│   ├── auth/                  # Login/Signup pages
│   ├── chat/                  # Main chat interface
│   ├── checkout/              # Payment checkout page
│   ├── landing/               # Landing page
│   ├── pricing/               # Pricing page
│   └── layout.tsx             # Root layout
├── components/
│   ├── auth/                  # Authentication components
│   ├── chat/                  # Chat components
│   ├── file/                  # File upload components
│   └── ui/                    # Reusable UI components
├── contexts/
│   ├── auth-context.tsx       # Authentication context
│   └── theme-context.tsx      # Theme context
├── lib/
│   ├── firebase.ts            # Firebase configuration
│   ├── razorpay.ts            # Razorpay configuration
│   └── utils.ts               # Utility functions
└── middleware.ts              # Next.js middleware
\`\`\`

## Key Components

### Authentication
- `contexts/auth-context.tsx` - Manages user authentication state
- `components/auth/login-form.tsx` - Login form
- `components/auth/signup-form.tsx` - Signup form

### Chat
- `components/chat/chat-sidebar.tsx` - Channel list sidebar
- `components/chat/chat-header.tsx` - Chat header with theme toggle
- `components/chat/message-list.tsx` - Real-time message display
- `components/chat/message-input.tsx` - Message composition

### File Sharing
- `components/file/file-upload-dialog.tsx` - File upload with plan limits

### Payments
- `app/checkout/page.tsx` - Razorpay payment flow
- `app/api/create-order/route.ts` - Create Razorpay order
- `app/api/verify-payment/route.ts` - Verify payment signature

## Usage

### Creating an Account
1. Visit the app at `/auth`
2. Click "Sign up"
3. Enter your email, password, and display name
4. Click "Sign Up"

### Chatting
1. After login, you'll be redirected to `/chat`
2. Create a new channel using the "+" button
3. Select a channel to view messages
4. Type your message and press Enter or click Send

### Uploading Files
1. In a channel, click the paperclip icon
2. Select a file (must be within your plan's limit)
3. Click "Upload"
4. The file will be shared in the channel

### Upgrading Your Plan
1. Click your username in the header
2. Select "Upgrade Plan"
3. Choose Pro ($19) or Team ($39)
4. Complete payment with Razorpay
5. Your plan will be updated immediately

## Payment Testing

Use these Razorpay test cards:

**Success:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: 4000 0000 0000 0002

## Dark/Light Mode

Toggle theme by clicking the sun/moon icon in the chat header. Preference is saved to localStorage.

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables (if using custom values)
4. Deploy

### Production Checklist

- [ ] Update Firebase project to production settings
- [ ] Update Razorpay keys to live mode
- [ ] Configure Firebase Security Rules
- [ ] Set up proper CORS for Firebase Storage
- [ ] Enable Firebase Authentication production settings
- [ ] Test payment flow with live Razorpay account

## Security Notes

- Firebase configuration is exposed in client code (this is normal)
- Use Firebase Security Rules to protect data
- Razorpay secret key should be kept in environment variables
- Payment verification happens server-side for security

## Firestore Data Structure

### Collections

**users**
\`\`\`json
{
  "email": "user@example.com",
  "displayName": "John Doe",
  "plan": "free",
  "uploadLimit": 52428800,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
\`\`\`

**channels**
\`\`\`json
{
  "name": "general",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "createdBy": "userId"
}
\`\`\`

**messages**
\`\`\`json
{
  "text": "Hello world!",
  "userId": "userId",
  "userEmail": "user@example.com",
  "channelId": "channelId",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "fileUrl": "https://...",
  "fileName": "document.pdf",
  "fileSize": 1024000
}
\`\`\`

## License

This project is provided as-is for demonstration purposes.

## Support

For issues or questions, please check the Firebase and Razorpay documentation:
- [Firebase Docs](https://firebase.google.com/docs)
- [Razorpay Docs](https://razorpay.com/docs)
\`\`\`

```json file="" isHidden
