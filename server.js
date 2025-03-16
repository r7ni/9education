const express = require('express');
const path = require('path');
const { auth, requiresAuth } = require('express-openid-connect');

const app = express();
const PORT = process.env.PORT || 3000;

// Auth0 configuration – replace with your actual values or environment variables
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET || 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: process.env.CLIENT_ID || '0crpJBHiraOHB6qt5qckMSAmGKhfTumK',
  issuerBaseURL: process.env.ISSUER_BASE_URL || 'https://dev-zdlmwxjzoao1of8e.us.auth0.com'
};

app.use(auth(config));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Protected API endpoint returning profile data as JSON
app.get('/profile-data', requiresAuth(), (req, res) => {
  res.json(req.oidc.user);
});

// Serve pages
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});
app.get('/courses', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'courses.html'));
});
app.get('/profile', requiresAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});
app.get('/mycourses', requiresAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mycourses.html'));
});

// Placeholder route for course detail subpages
app.get('/course-detail', requiresAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'course-detail.html'));
});

app.use('/favicon', express.static(path.join(__dirname, 'public/favicon')));



// Add this middleware function to check if user is registered for a course
const requireCourseRegistration = (courseName) => {
  return (req, res, next) => {
    if (!req.oidc.isAuthenticated()) {
      return next();
    }
    
    const userIdentifier = req.oidc.user.email || req.oidc.user.sub;
    const registeredCookieName = `registered_${courseName.replace(/\s+/g, '_')}`;
    const isRegistered = req.cookies && req.cookies[registeredCookieName] === userIdentifier;
    
    if (!isRegistered) {
      // Let the client access the page but set a flag
      req.notRegistered = true;
    }
    
    next();
  };
};
// Add cookie-parser middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/courses/calculus-1', requiresAuth(), requireCourseRegistration('Calculus 1'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'courses', 'calculus-1.html'));
});
app.get('/courses/calculus-1/lecture1', requiresAuth(), requireCourseRegistration('Calculus 1'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'courses', 'calculus-1', 'lecture1.html'));
});
// Add a route to handle course registration
app.post('/register-course', requiresAuth(), (req, res) => {
  const { courseName } = req.body;
  const userIdentifier = req.oidc.user.email || req.oidc.user.sub;
  
  // Set a cookie to mark this user as registered for this course
  // In a real app, you'd store this in a database
  res.cookie(`registered_${courseName.replace(/\s+/g, '_')}`, userIdentifier, { 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true 
  });
  
  res.json({ success: true });
});
app.use('/courses/calculus-1', express.static(path.join(__dirname, 'public/courses/calculus-1')));

// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test login at: http://localhost:3000/login`);
  console.log(`Test logout at: http://localhost:3000/logout`);
});
