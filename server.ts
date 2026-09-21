import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store seeded for demo
let customers = [
  {
    id: 'cust_001',
    name: 'Sanju Kumar',
    email: 'customer@roadside.demo',
    phone: '+91 98765 43210',
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    password: 'password123',
  },
  {
    id: 'cust_002',
    name: 'Priya Sharma',
    email: 'priya@roadside.demo',
    phone: '+91 98123 45678',
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    password: 'password123',
  },
];

let mechanicsUsers = [
  {
    id: 'mech_user_001',
    name: 'Ravi Kumar',
    email: 'mechanic@roadside.demo',
    phone: '+91 98480 22334',
    role: 'MECHANIC',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=80',
    password: 'password123',
    shopId: 'mech_001',
  },
  {
    id: 'mech_user_002',
    name: 'K. Venkatesh',
    email: 'venkatesh@roadside.demo',
    phone: '+91 98485 55667',
    role: 'MECHANIC',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    password: 'password123',
    shopId: 'mech_002',
  },
];

let workshops = [
  {
    id: 'mech_001',
    ownerId: 'mech_user_001',
    shopName: 'Balaji Motor Works & Multi-Brand Garage',
    ownerName: 'Ravi Kumar',
    phone: '+91 98480 22334',
    email: 'balaji.motors@roadside.demo',
    address: 'Near Benz Circle, MG Road, Vijayawada',
    city: 'Vijayawada',
    coords: { lat: 16.5062, lng: 80.648 },
    rating: 4.8,
    reviewsCount: 342,
    yearsOfExperience: 14,
    isVerified: true,
    isAvailable: true,
    description: 'Certified multi-brand car & SUV roadside rescue specialist with hydraulic towing crane & computerized battery diagnostics.',
    imageUrl: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80',
    supportedVehicles: ['Car', 'SUV', 'Van'],
    supportedProblems: ['BATTERY', 'ENGINE', 'FLAT TYRE', 'OVERHEATING', 'BRAKE', 'ELECTRICAL'],
    skills: ['ECU Scanning', 'Bosch Certified Jumpstart', 'Hydraulic Jack Tyre Replacement', 'Radiator Flush'],
    services: [
      { id: 's1', name: 'Onsite Battery Jumpstart', description: 'Heavy-duty jumper cables & load check', price: 350, estimatedMinutes: 15 },
      { id: 's2', name: 'Tubeless Flat Tyre Repair', description: 'Plug puncture repair + portable air refill', price: 250, estimatedMinutes: 20 },
      { id: 's3', name: 'Engine Breakdown Triage', description: 'OBD-II error codes diagnosis & alternator check', price: 500, estimatedMinutes: 30 },
      { id: 's4', name: 'Flatbed Towing Service', description: 'Up to 10 km towing to workshop', price: 1200, estimatedMinutes: 45 },
    ],
    pricingRange: { min: 300, max: 800 },
    emergencyAvailable: true,
  },
  {
    id: 'mech_002',
    ownerId: 'mech_user_002',
    shopName: 'Express 24/7 Mobile Mechanic Hub',
    ownerName: 'K. Venkatesh',
    phone: '+91 98485 55667',
    email: 'express.hub@roadside.demo',
    address: 'Governorpet, Beside Modern Supermarket, Vijayawada',
    city: 'Vijayawada',
    coords: { lat: 16.5135, lng: 80.632 },
    rating: 4.9,
    reviewsCount: 512,
    yearsOfExperience: 18,
    isVerified: true,
    isAvailable: true,
    description: 'Fastest 15-minute emergency response unit in central Vijayawada. Equipped with mobile tyre changer, spare batteries, and emergency fuel cans.',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    supportedVehicles: ['Car', 'Bike', 'SUV', 'Truck', 'Van'],
    supportedProblems: ['BATTERY', 'ENGINE', 'FLAT TYRE', 'FUEL', 'OVERHEATING', 'BRAKE', 'ELECTRICAL', 'ACCIDENT', 'OTHER'],
    skills: ['Mobile Tyre Mounting', 'Fuel Delivery', 'Brake Fluid Bleed', 'Emergency Towing'],
    services: [
      { id: 's5', name: 'Emergency 5L Fuel Delivery', description: 'Petrol/Diesel brought directly to stranded spot', price: 400, estimatedMinutes: 15 },
      { id: 's6', name: 'Instant Puncture Seal', description: 'Puncture plug + digital nitrogen refill', price: 200, estimatedMinutes: 15 },
      { id: 's7', name: 'Rapid Battery Boost', description: '12V / 24V jumpstart booster pack', price: 300, estimatedMinutes: 12 },
    ],
    pricingRange: { min: 250, max: 700 },
    emergencyAvailable: true,
  },
  {
    id: 'mech_003',
    ownerId: 'mech_user_003',
    shopName: 'Krishna Auto Care & Two-Wheeler Doctors',
    ownerName: 'Suresh Babu',
    phone: '+91 98488 99887',
    email: 'krishna.autocare@roadside.demo',
    address: 'Eluru Road, Near Kanaka Durga Flyover, Vijayawada',
    city: 'Vijayawada',
    coords: { lat: 16.518, lng: 80.6195 },
    rating: 4.6,
    reviewsCount: 198,
    yearsOfExperience: 9,
    isVerified: true,
    isAvailable: true,
    description: 'Specialized in Royal Enfield, KTM, Honda, and all 2-wheelers as well as compact hatchbacks. Chain link, puncture, and clutch breakdown experts.',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    supportedVehicles: ['Bike', 'Car'],
    supportedProblems: ['FLAT TYRE', 'ENGINE', 'BATTERY', 'BRAKE', 'OTHER'],
    skills: ['Motorcycle Chain Repair', 'Carburetor & Fuel Injector Cleaning', 'Tube Replacement'],
    services: [
      { id: 's8', name: 'Bike Tube Replacement', description: 'New heavy-duty tube with fitment', price: 350, estimatedMinutes: 20 },
      { id: 's9', name: 'Bike Onsite Chain Fix', description: 'Chain link replacement & lubrication', price: 200, estimatedMinutes: 15 },
    ],
    pricingRange: { min: 150, max: 500 },
    emergencyAvailable: false,
  },
  {
    id: 'mech_004',
    ownerId: 'mech_user_004',
    shopName: 'Apex Precision Car Spa & Mechanical Works',
    ownerName: 'Mohammad Imran',
    phone: '+91 98492 11223',
    email: 'apex.carspa@roadside.demo',
    address: 'Autonagar Gate No. 2, Vijayawada',
    city: 'Vijayawada',
    coords: { lat: 16.495, lng: 80.672 },
    rating: 4.7,
    reviewsCount: 276,
    yearsOfExperience: 12,
    isVerified: true,
    isAvailable: true,
    description: 'Heavy vehicle & luxury car specialist with high-tonnage recovery crane and German car scanner tools.',
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    supportedVehicles: ['Car', 'SUV', 'Truck', 'Van'],
    supportedProblems: ['ENGINE', 'OVERHEATING', 'BRAKE', 'ACCIDENT', 'OTHER'],
    skills: ['Heavy Vehicle Towing', 'Brake Booster Overhaul', 'Radiator Leak Welding'],
    services: [
      { id: 's10', name: 'Highway Heavy Towing', description: 'Heavy flatbed crane recovery for SUV/Truck', price: 1800, estimatedMinutes: 40 },
    ],
    pricingRange: { min: 450, max: 1500 },
    emergencyAvailable: true,
  },
];

let vehicles = [
  {
    id: 'veh_001',
    userId: 'cust_001',
    type: 'Car',
    brand: 'Hyundai',
    model: 'Creta SX(O)',
    year: 2022,
    fuelType: 'Petrol',
    registrationNumber: 'AP 16 AB 1234',
    color: '#E2E8F0',
    isDefault: true,
  },
  {
    id: 'veh_002',
    userId: 'cust_001',
    type: 'Bike',
    brand: 'Royal Enfield',
    model: 'Classic 350',
    year: 2021,
    fuelType: 'Petrol',
    registrationNumber: 'AP 16 ZX 8901',
    color: '#1E293B',
    isDefault: false,
  },
  {
    id: 'veh_003',
    userId: 'cust_001',
    type: 'SUV',
    brand: 'Tata',
    model: 'Nexon EV Empowered',
    year: 2023,
    fuelType: 'Electric',
    registrationNumber: 'AP 16 EV 9999',
    color: '#0284C7',
    isDefault: false,
  },
];

let requests: any[] = [];

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ROAD//SIDE API Backend',
    timestamp: new Date().toISOString(),
  });
});

// 1. Auth: Customer Login
app.post('/api/auth/customer/login', (req, res) => {
  const { identifier, password } = req.body;
  const user = customers.find(
    (c) => c.email.toLowerCase() === (identifier || '').toLowerCase() || c.phone.includes(identifier || '')
  );

  if (!user) {
    return res.status(401).json({ error: 'No customer account found with this email or phone number.' });
  }

  // Demo accepts matching password or demo quick-login
  if (password && password !== user.password && password !== 'demo') {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token: 'jwt_cust_' + user.id });
});

// 2. Auth: Customer Registration
app.post('/api/auth/customer/register', (req, res) => {
  const { name, email, phone, password, vehicle } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required.' });
  }

  const existing = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser = {
    id: 'cust_' + Date.now(),
    name,
    email,
    phone,
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    password: password || 'password123',
  };

  customers.push(newUser);

  if (vehicle) {
    vehicles.push({
      id: 'veh_' + Date.now(),
      userId: newUser.id,
      type: vehicle.type || 'Car',
      brand: vehicle.brand || 'Maruti Suzuki',
      model: vehicle.model || 'Swift',
      year: vehicle.year || 2022,
      fuelType: vehicle.fuelType || 'Petrol',
      registrationNumber: vehicle.registrationNumber || 'AP 16 XY 1234',
      color: vehicle.color || '#E23744',
      isDefault: true,
    });
  }

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token: 'jwt_cust_' + newUser.id });
});

// 3. Auth: Mechanic Workshop Owner Login
app.post('/api/auth/mechanic/login', (req, res) => {
  const { identifier, password } = req.body;
  const user = mechanicsUsers.find(
    (m) => m.email.toLowerCase() === (identifier || '').toLowerCase() || m.phone.includes(identifier || '')
  );

  if (!user) {
    return res.status(401).json({ error: 'No verified workshop partner found with this email or phone.' });
  }

  if (password && password !== user.password && password !== 'demo') {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const workshop = workshops.find((w) => w.id === user.shopId) || workshops[0];
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, workshop, token: 'jwt_mech_' + user.id });
});

// 4. Auth: Mechanic Workshop Registration
app.post('/api/auth/mechanic/register', (req, res) => {
  const { shopName, ownerName, email, phone, address, city, password, supportedVehicles, services } = req.body;

  if (!shopName || !ownerName || !email || !phone) {
    return res.status(400).json({ error: 'Shop Name, Owner Name, Email, and Phone are required.' });
  }

  const newShopId = 'mech_' + Date.now();
  const newUser = {
    id: 'mech_user_' + Date.now(),
    name: ownerName,
    email,
    phone,
    role: 'MECHANIC',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=80',
    password: password || 'password123',
    shopId: newShopId,
  };

  const newWorkshop = {
    id: newShopId,
    ownerId: newUser.id,
    shopName,
    ownerName,
    phone,
    email,
    address: address || 'Vijayawada Central',
    city: city || 'Vijayawada',
    coords: { lat: 16.508, lng: 80.64 },
    rating: 5.0,
    reviewsCount: 1,
    yearsOfExperience: 5,
    isVerified: true,
    isAvailable: true,
    description: 'Certified emergency roadside partner workshop.',
    imageUrl: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=800&q=80',
    supportedVehicles: supportedVehicles || ['Car', 'Bike', 'SUV'],
    supportedProblems: ['BATTERY', 'FLAT TYRE', 'ENGINE', 'TOWING', 'FUEL'],
    skills: ['Mobile Onsite Repair', 'Battery Jumpstart', 'Puncture Fix'],
    services: services || [
      { id: 's_new_1', name: 'Onsite Triage & Inspection', description: 'Diagnostic inspection', price: 300, estimatedMinutes: 20 },
    ],
    pricingRange: { min: 250, max: 750 },
    emergencyAvailable: true,
  };

  mechanicsUsers.push(newUser);
  workshops.push(newWorkshop);

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, workshop: newWorkshop, token: 'jwt_mech_' + newUser.id });
});

// 5. Workshops list with filtering
app.get('/api/mechanics', (req, res) => {
  const { search, problem, vehicle, minRating, emergencyOnly } = req.query;

  let results = [...workshops];

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (w) =>
        w.shopName.toLowerCase().includes(q) ||
        w.ownerName.toLowerCase().includes(q) ||
        w.address.toLowerCase().includes(q) ||
        w.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (problem) {
    results = results.filter((w) => w.supportedProblems.includes(String(problem) as any));
  }

  if (vehicle) {
    results = results.filter((w) => w.supportedVehicles.includes(String(vehicle) as any));
  }

  if (minRating) {
    results = results.filter((w) => w.rating >= Number(minRating));
  }

  if (emergencyOnly === 'true') {
    results = results.filter((w) => w.emergencyAvailable);
  }

  res.json({ mechanics: results, count: results.length });
});

// 6. Workshop single details
app.get('/api/mechanics/:id', (req, res) => {
  const workshop = workshops.find((w) => w.id === req.params.id);
  if (!workshop) return res.status(404).json({ error: 'Workshop not found' });
  res.json({ workshop });
});

// 7. Workshop status toggle
app.patch('/api/mechanics/:id/status', (req, res) => {
  const workshop = workshops.find((w) => w.id === req.params.id);
  if (!workshop) return res.status(404).json({ error: 'Workshop not found' });

  if (req.body.isAvailable !== undefined) {
    workshop.isAvailable = Boolean(req.body.isAvailable);
  }
  if (req.body.emergencyAvailable !== undefined) {
    workshop.emergencyAvailable = Boolean(req.body.emergencyAvailable);
  }

  res.json({ workshop });
});

// 8. Vehicles
app.get('/api/vehicles', (req, res) => {
  const userId = req.query.userId || 'cust_001';
  const userVehicles = vehicles.filter((v) => v.userId === userId);
  res.json({ vehicles: userVehicles });
});

app.post('/api/vehicles', (req, res) => {
  const newVehicle = {
    id: 'veh_' + Date.now(),
    userId: req.body.userId || 'cust_001',
    type: req.body.type || 'Car',
    brand: req.body.brand || 'Unknown',
    model: req.body.model || 'Model',
    year: req.body.year || 2022,
    fuelType: req.body.fuelType || 'Petrol',
    registrationNumber: req.body.registrationNumber || 'AP 16 AA 0000',
    color: req.body.color || '#E23744',
    isDefault: Boolean(req.body.isDefault),
  };
  vehicles.push(newVehicle);
  res.status(201).json({ vehicle: newVehicle });
});

app.delete('/api/vehicles/:id', (req, res) => {
  vehicles = vehicles.filter((v) => v.id !== req.params.id);
  res.json({ success: true });
});

// 9. Assistance Requests
app.get('/api/requests', (req, res) => {
  const { customerId, mechanicId } = req.query;
  let filtered = [...requests];
  if (customerId) filtered = filtered.filter((r) => r.customerId === customerId);
  if (mechanicId) filtered = filtered.filter((r) => r.mechanicId === mechanicId);
  res.json({ requests: filtered });
});

app.post('/api/requests', (req, res) => {
  const newReq = {
    id: 'req_' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'PENDING',
    paymentStatus: 'PENDING',
    ...req.body,
  };
  requests.unshift(newReq);
  res.status(201).json({ request: newReq });
});

app.patch('/api/requests/:id/status', (req, res) => {
  const target = requests.find((r) => r.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Request not found' });

  target.status = req.body.status;
  target.updatedAt = new Date().toISOString();
  if (req.body.finalPrice) target.finalPrice = req.body.finalPrice;
  if (req.body.serviceNotes) target.serviceNotes = req.body.serviceNotes;

  res.json({ request: target });
});

app.post('/api/requests/:id/payment', (req, res) => {
  const target = requests.find((r) => r.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Request not found' });

  target.paymentStatus = 'PAID';
  target.paymentMethod = req.body.method;
  target.transactionId = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
  target.invoiceNumber = 'INV-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
  target.paidAt = new Date().toISOString();
  target.paymentBreakdown = req.body;

  res.json({ request: target });
});

// ================= VITE INTEGRATION =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ROAD//SIDE Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
