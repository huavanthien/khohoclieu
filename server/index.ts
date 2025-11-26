
import express from 'express';
import cors from 'cors';
import { SERVER_RESOURCES, SERVER_USERS, SERVER_CATEGORIES, SERVER_REVIEWS } from './data';
import { Resource, User, Category, UserStatus, ResourceStatus, Review } from '../src/types';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Render assigns a dynamic port, we must use process.env.PORT
const PORT = process.env.PORT || 5000;

app.use(cors() as any);
app.use(express.json() as any);

// In-memory database simulation
let resources: Resource[] = [...SERVER_RESOURCES];
let users: User[] = [...SERVER_USERS];
let categories: Category[] = [...SERVER_CATEGORIES];
let reviews: Review[] = [...SERVER_REVIEWS];

// --- AUTH ROUTES ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (user) {
    if (user.status === UserStatus.Inactive) {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }
    return res.json(user);
  }
  res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
});

app.post('/api/auth/register', (req, res) => {
  const data = req.body;
  if (users.find(u => u.email === data.email)) {
    return res.status(400).json({ message: 'Email đã tồn tại' });
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    ...data,
    joinDate: new Date().toISOString().split('T')[0],
    status: UserStatus.Active,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`
  };
  
  users.push(newUser);
  res.json(newUser);
});

app.put('/api/users/:id/profile', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex > -1) {
    users[userIndex] = { ...users[userIndex], name };
    return res.json(users[userIndex]);
  }
  res.status(404).json({ message: 'User not found' });
});

// --- RESOURCE ROUTES ---
app.get('/api/resources', (req, res) => {
  res.json(resources);
});

app.post('/api/resources', (req, res) => {
  const newResource = req.body;
  const resourceWithId = { ...newResource, id: Date.now().toString(), avgRating: 0, reviewCount: 0 };
  resources.unshift(resourceWithId);
  res.json(resourceWithId);
});

app.put('/api/resources/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const index = resources.findIndex(r => r.id === id);
  if (index > -1) {
    resources[index] = { ...resources[index], status };
    res.json(resources[index]);
  } else {
    res.status(404).json({ message: 'Resource not found' });
  }
});

app.delete('/api/resources/:id', (req, res) => {
  const { id } = req.params;
  resources = resources.filter(r => r.id !== id);
  res.json({ success: true });
});

// --- REVIEW ROUTES ---
app.get('/api/resources/:id/reviews', (req, res) => {
  const { id } = req.params;
  const resourceReviews = reviews.filter(r => r.resourceId === id);
  res.json(resourceReviews);
});

app.post('/api/resources/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { userId, userName, userAvatar, rating, comment } = req.body;

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    resourceId: id,
    userId,
    userName,
    userAvatar,
    rating,
    comment,
    date: new Date().toISOString().split('T')[0]
  };

  reviews.unshift(newReview);

  // Update resource average rating
  const resourceIndex = resources.findIndex(r => r.id === id);
  if (resourceIndex > -1) {
    const resourceReviews = reviews.filter(r => r.resourceId === id);
    const totalRating = resourceReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / resourceReviews.length).toFixed(1));
    
    resources[resourceIndex] = {
      ...resources[resourceIndex],
      avgRating,
      reviewCount: resourceReviews.length
    };
  }

  res.json(newReview);
});

// --- USER MANAGEMENT ROUTES (ADMIN) ---
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const index = users.findIndex(u => u.id === id);
  if (index > -1) {
    users[index] = { ...users[index], ...updates };
    res.json(users[index]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  users = users.filter(u => u.id !== id);
  res.json({ success: true });
});

// --- CATEGORY ROUTES ---
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const newCat = { ...req.body, id: `cat-${Date.now()}` };
  categories.unshift(newCat);
  res.json(newCat);
});

app.put('/api/categories/:id', (req, res) => {
   const { id } = req.params;
   const updates = req.body;
   const index = categories.findIndex(c => c.id === id);
   if (index > -1) {
      categories[index] = { ...categories[index], ...updates };
      res.json(categories[index]);
   } else {
      res.status(404).json({message: 'Category not found'});
   }
});

app.delete('/api/categories/:id', (req, res) => {
   const { id } = req.params;
   categories = categories.filter(c => c.id !== id);
   res.json({success: true});
});

// --- STATS ROUTE ---
app.get('/api/stats', (req, res) => {
  res.json({
     totalViews: resources.reduce((sum, r) => sum + r.views, 0),
     totalDownloads: resources.reduce((sum, r) => sum + r.downloads, 0),
     approvedResources: resources.filter(r => r.status === ResourceStatus.Approved).length,
     totalUsers: users.length,
     resourcesCount: resources.length
  });
});

// --- STATIC FILES SERVING (For Production/Render) ---
// Serve static files from the 'dist' directory (built by Vite)
// Use path.resolve for better reliability
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath) as any);

// Catch-all route to handle client-side routing
app.get('*', (req, res) => {
  // Check if requesting API that doesn't exist to avoid returning HTML for API 404s
  if (req.path.startsWith('/api')) {
     return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
