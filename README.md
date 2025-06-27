# PollX: Social Polling Platform

## Project Overview
PollX is a modern social polling platform where users can create, share, and engage with polls. The platform allows for easy poll creation, voting, and result visualization across various categories like tech, entertainment, and politics.

### Key Features
- **Poll Management**: Create and customize polls with multiple options (2-4 options)
- **Real-time Voting**: Vote on polls with real-time result updates via Socket.IO
- **Interactive Comments**: Comment on polls with real-time commenting system
- **Heart System**: Give hearts (likes) to comments with instant feedback
- **Category Browsing**: Browse polls by categories (Technology, Sports, Entertainment, etc.)
- **User Authentication**: Secure JWT-based authentication with Google OAuth support
- **Real-time Updates**: All actions (voting, commenting, hearts) update instantly across all clients
- **Responsive Design**: Beautiful, modern UI with TailwindCSS and Framer Motion animations
- **User Dashboard**: Personal dashboard with poll statistics and management

## Technical Stack
- **Frontend**: React.js with Vite, TailwindCSS, Framer Motion
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for live updates
- **Authentication**: JWT with local and Google OAuth (Passport.js)
- **Styling**: TailwindCSS with responsive design
- **Deployment**: Render (Backend), Netlify (Frontend)

## Development Timeline

### Days 1-3: Planning & Setup
- **Day 1**: Create wireframes and set up GitHub project with readme
- **Day 2**: Design database schema and set up project structure
- **Day 3**: Initialize backend and frontend applications

### Days 4-6: Backend Development
- **Day 4**: Implement user authentication (JWT + Google OAuth)
- **Day 5**: Create poll CRUD APIs with robust validation
- **Day 6**: Implement real-time voting, commenting, and heart system with Socket.IO

### Days 7-9: Frontend Development
- **Day 7**: Set up authentication UI with Google OAuth integration
- **Day 8**: Create poll creation/display components with real-time updates
- **Day 9**: Implement commenting system with hearts and live notifications

### Days 10-12: Enhancement & Polish
- **Day 10**: Add advanced UI animations and responsive design
- **Day 11**: Implement real-time features and Socket.IO optimization
- **Day 12**: Deploy application and comprehensive testing

## Real-time Features
- **Live Voting**: See poll results update instantly as votes come in
- **Real-time Comments**: Comments appear immediately across all clients
- **Heart Notifications**: Heart actions on comments sync instantly
- **Live Poll Creation**: New polls appear in feeds without refresh
- **Socket.IO Integration**: Robust WebSocket connection with reconnection handling

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/google` - Google OAuth login
- `POST /auth/logout` - User logout

### Polls
- `GET /polls` - Get all polls (with category filtering)
- `POST /polls` - Create new poll (protected)
- `GET /polls/my-polls` - Get user's polls (protected)
- `GET /polls/voted-polls` - Get polls user voted on (protected)
- `POST /polls/:pollId/vote` - Vote on poll (protected)

### Comments
- `POST /polls/:pollId/comments` - Add comment (protected)
- `GET /polls/:pollId/comments` - Get poll comments
- `POST /polls/:pollId/comments/:commentId/heart` - Toggle heart (protected)

## Future Enhancements
- **AI-powered Poll Generation**: Natural language prompts to create polls
- **Advanced Analytics**: Detailed poll performance and engagement metrics
- **Social Sharing**: Integration with Twitter, Facebook, LinkedIn
- **Poll Templates**: Pre-built poll templates for common use cases
- **Moderation Tools**: Admin dashboard for content management
- **Push Notifications**: Browser notifications for poll interactions

## Project Status
✅ **Production Ready** - Full-featured social polling platform with real-time capabilities

## Deployed URLs
- **Backend API**: https://s76-rahulrr-capstone-pollx.onrender.com
- **Frontend App**: [To be deployed]

## Installation & Development

### Prerequisites
- Node.js (v16+)
- MongoDB
- Git

### Backend Setup
```bash
cd server
npm install
npm start
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Environment Variables
Create `.env` files in both server and client directories with necessary configurations.

# Deployed Frontend url
https://pollx.netlify.app/
