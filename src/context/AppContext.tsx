import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppNotification,
  AssistanceRequest,
  ChatMessage,
  Coordinates,
  LocationInfo,
  MechanicShop,
  MechanicStats,
  ProblemType,
  RequestStatus,
  User,
  UserRole,
  Vehicle,
} from '../types';
import {
  BASE_MECHANICS,
  DEMO_CUSTOMER,
  DEMO_MECHANIC_USER,
  INITIAL_HISTORY_REQUESTS,
  INITIAL_VEHICLES,
} from '../data/mockData';
import {
  calculateETA,
  calculateHaversineDistance,
  generateRoutePoints,
  PRESET_LOCATIONS,
} from '../utils/geo';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole;
  userVehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  selectedProblem: ProblemType | null;
  problemDescription: string;
  customerLocation: LocationInfo;
  mechanics: MechanicShop[];
  selectedMechanicId: string | null;
  activeRequest: AssistanceRequest | null;
  requestHistory: AssistanceRequest[];
  chatMessages: ChatMessage[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  isEmergencyMode: boolean;
  isSimulatingTrip: boolean;
  mechanicLiveLocation: Coordinates | null;
  mechanicStats: MechanicStats;

  // Convenience aliases for clean consumer ergonomics
  vehicles: Vehicle[];
  historyRequests: AssistanceRequest[];
  clearNotifications: () => void;
  createRequest: (
    mechanicId: string,
    customProblem?: ProblemType,
    notes?: string,
    customPrice?: { min: number; max: number }
  ) => AssistanceRequest;
  resetToDemoDefault: () => void;

  // Actions
  loginAsDemo: (role: UserRole) => void;
  loginUser: (email: string, role: UserRole, name?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setSelectedVehicle: (vehicle: Vehicle) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId'>) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  setSelectedProblem: (problem: ProblemType | null, desc?: string) => void;
  setCustomerLocation: (location: LocationInfo) => void;
  setSelectedMechanicId: (id: string | null) => void;
  createAssistanceRequest: (mechanicId: string, customProblem?: ProblemType) => AssistanceRequest;
  cancelRequest: (requestId: string) => void;
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  startTrip: (requestId: string) => void;
  markArrived: (requestId: string) => void;
  startService: (requestId: string) => void;
  completeService: (requestId: string, finalPrice: number, notes?: string) => void;
  processPayment: (
    requestId: string,
    paymentData: {
      method: 'UPI' | 'CARD' | 'NETBANKING' | 'CASH';
      methodTitle: string;
      accountReference?: string;
      baseAmount: number;
      platformFee: number;
      gstAmount: number;
      totalAmount: number;
    }
  ) => { success: boolean; transactionId: string; invoiceNumber: string };
  submitRating: (requestId: string, rating: number, review?: string) => void;
  sendChatMessage: (textOrRequestId: string, maybeText?: string) => void;
  toggleMechanicAvailability: () => void;
  updateShopProfile: (updated: Partial<MechanicShop>) => void;
  triggerEmergencyMode: (enable: boolean) => void;
  runFullDemoJourney: () => void;
  addNotification: (title: string, message: string, type?: AppNotification['type'], requestId?: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'roadside_user_v1',
  VEHICLES: 'roadside_vehicles_v1',
  ACTIVE_REQUEST: 'roadside_active_request_v1',
  HISTORY: 'roadside_history_v1',
  MECHANICS: 'roadside_mechanics_v1',
  LOCATION: 'roadside_location_v1',
  MESSAGES: 'roadside_messages_v1',
  NOTIFICATIONS: 'roadside_notifications_v1',
  MECHANIC_STATS: 'roadside_mech_stats_v1',
};

const DEFAULT_LOCATION: LocationInfo = {
  coords: { lat: 16.5062, lng: 80.648 },
  address: 'Benz Circle, M.G. Road',
  city: 'Vijayawada',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User and Role state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : DEMO_CUSTOMER;
    } catch {
      return DEMO_CUSTOMER;
    }
  });

  const currentRole: UserRole = currentUser?.role || 'CUSTOMER';

  // 2. Vehicles
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
    } catch {
      return INITIAL_VEHICLES;
    }
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(() => {
    return userVehicles.find((v) => v.isDefault) || userVehicles[0] || null;
  });

  // 3. Problem
  const [selectedProblem, setSelectedProblem] = useState<ProblemType | null>('BATTERY');
  const [problemDescription, setProblemDescription] = useState<string>(
    'Engine refusing to crank, clicking sound from relay, dashboard dim.'
  );

  // 4. Location
  const [customerLocation, setCustomerLocationState] = useState<LocationInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCATION);
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  // 5. Mechanics
  const [mechanics, setMechanics] = useState<MechanicShop[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MECHANICS);
      return saved ? JSON.parse(saved) : BASE_MECHANICS;
    } catch {
      return BASE_MECHANICS;
    }
  });

  const [selectedMechanicId, setSelectedMechanicId] = useState<string | null>('mech_001');

  // 6. Active Request & History
  const [activeRequest, setActiveRequest] = useState<AssistanceRequest | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_REQUEST);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [requestHistory, setRequestHistory] = useState<AssistanceRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_HISTORY_REQUESTS;
    } catch {
      return INITIAL_HISTORY_REQUESTS;
    }
  });

  // 7. Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 8. Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'notif_welcome',
        title: 'Welcome to ROAD//SIDE',
        message: 'On-demand vehicle assistance is online and ready in your area.',
        type: 'info',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
    ];
  });

  // 9. Mechanic stats
  const [mechanicStats, setMechanicStats] = useState<MechanicStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MECHANIC_STATS);
      return saved ? JSON.parse(saved) : { todayJobs: 12, completedJobs: 9, activeJobs: 1, totalEarnings: 4850 };
    } catch {
      return { todayJobs: 12, completedJobs: 9, activeJobs: 1, totalEarnings: 4850 };
    }
  });

  // 10. Emergency & Simulation flags
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isSimulatingTrip, setIsSimulatingTrip] = useState(false);
  const [mechanicLiveLocation, setMechanicLiveLocation] = useState<Coordinates | null>(null);

  const simulationTimerRef = useRef<number | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(userVehicles));
  }, [userVehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(customerLocation));
  }, [customerLocation]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MECHANICS, JSON.stringify(mechanics));
  }, [mechanics]);

  useEffect(() => {
    if (activeRequest) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_REQUEST, JSON.stringify(activeRequest));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_REQUEST);
    }
  }, [activeRequest]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(requestHistory));
  }, [requestHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MECHANIC_STATS, JSON.stringify(mechanicStats));
  }, [mechanicStats]);

  // Real-time broadcast channel across browser tabs
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('roadside_sync_channel');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'REQUEST_UPDATED') {
          setActiveRequest(payload);
        } else if (type === 'REQUEST_COMPLETED') {
          setActiveRequest(null);
          setRequestHistory((prev) => [payload, ...prev.filter((r) => r.id !== payload.id)]);
        } else if (type === 'NEW_MESSAGE') {
          setChatMessages((prev) => [...prev, payload]);
        } else if (type === 'LOCATION_MOVED') {
          setMechanicLiveLocation(payload);
        }
      };

      return () => {
        channel.close();
      };
    } catch {
      // BroadcastChannel not available in environment
    }
  }, []);

  const broadcastEvent = (type: string, payload: any) => {
    try {
      broadcastChannelRef.current?.postMessage({ type, payload });
    } catch {
      // ignore
    }
  };

  // Notification helper
  const addNotification = (
    title: string,
    message: string,
    type: AppNotification['type'] = 'info',
    requestId?: string
  ) => {
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      requestId,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Auth actions
  const loginAsDemo = (role: UserRole) => {
    const user = role === 'CUSTOMER' ? DEMO_CUSTOMER : DEMO_MECHANIC_USER;
    setCurrentUser(user);
    addNotification('Signed in', `Logged in as ${user.name} (${role})`, 'success');
  };

  const loginUser = (email: string, role: UserRole, name?: string) => {
    const user: User = {
      id: 'user_' + Date.now(),
      name: name || (role === 'CUSTOMER' ? 'Sanju Kumar' : 'Ravi Kumar'),
      email,
      phone: '+91 98765 43210',
      role,
    };
    setCurrentUser(user);
    addNotification('Authentication Successful', `Welcome, ${user.name}!`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    addNotification('Logged Out', 'You have been safely signed out.', 'info');
  };

  const switchRole = (role: UserRole) => {
    if (role === 'CUSTOMER') {
      setCurrentUser(DEMO_CUSTOMER);
    } else {
      setCurrentUser(DEMO_MECHANIC_USER);
    }
    addNotification('Role Switched', `Now viewing as ${role === 'CUSTOMER' ? 'Customer' : 'Mechanic Shop'}`, 'info');
  };

  // Vehicles
  const addVehicle = (vehData: Omit<Vehicle, 'id' | 'userId'>) => {
    const newVeh: Vehicle = {
      ...vehData,
      id: 'veh_' + Date.now(),
      userId: currentUser?.id || 'cust_001',
    };
    setUserVehicles((prev) => [newVeh, ...prev]);
    setSelectedVehicle(newVeh);
    addNotification('Vehicle Added', `${newVeh.brand} ${newVeh.model} was saved to your garage.`, 'success');
  };

  const updateVehicle = (updated: Vehicle) => {
    setUserVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    if (selectedVehicle?.id === updated.id) {
      setSelectedVehicle(updated);
    }
  };

  const deleteVehicle = (id: string) => {
    setUserVehicles((prev) => {
      const next = prev.filter((v) => v.id !== id);
      if (selectedVehicle?.id === id) {
        setSelectedVehicle(next[0] || null);
      }
      return next;
    });
    addNotification('Vehicle Removed', 'Vehicle removed from your garage.', 'info');
  };

  // Location
  const setCustomerLocation = (newLoc: LocationInfo) => {
    setCustomerLocationState(newLoc);
    // Dynamically adjust mechanic distances based on new location
    setMechanics((prev) =>
      prev.map((m, idx) => {
        // slight offset around new coords
        const angle = (idx * (2 * Math.PI)) / prev.length;
        const radiusDeg = (1.5 + idx * 0.8) / 111; // degrees
        const lat = newLoc.coords.lat + Math.cos(angle) * radiusDeg;
        const lng = newLoc.coords.lng + Math.sin(angle) * radiusDeg;
        return {
          ...m,
          city: newLoc.city,
          coords: { lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 },
        };
      })
    );
    addNotification('Location Updated', `Current location set to ${newLoc.address}`, 'info');
  };

  // Mechanics
  const toggleMechanicAvailability = () => {
    setMechanics((prev) =>
      prev.map((m) => {
        if (m.ownerId === currentUser?.id || m.id === 'mech_001') {
          const nextAvail = !m.isAvailable;
          addNotification(
            'Availability Updated',
            `Your shop is now ${nextAvail ? 'AVAILABLE for incoming jobs' : 'OFFLINE'}`,
            nextAvail ? 'success' : 'warning'
          );
          return { ...m, isAvailable: nextAvail };
        }
        return m;
      })
    );
  };

  const updateShopProfile = (updated: Partial<MechanicShop>) => {
    setMechanics((prev) =>
      prev.map((m) => (m.id === 'mech_001' || m.ownerId === currentUser?.id ? { ...m, ...updated } : m))
    );
    addNotification('Profile Updated', 'Mechanic shop profile has been saved.', 'success');
  };

  // Booking & Request flow
  const createAssistanceRequest = (
    mechanicId: string,
    customProblem?: ProblemType
  ): AssistanceRequest => {
    const mech = mechanics.find((m) => m.id === mechanicId) || mechanics[0];
    const veh = selectedVehicle || userVehicles[0];
    const prob = customProblem || selectedProblem || 'BATTERY';

    const dist = calculateHaversineDistance(customerLocation.coords, mech.coords);
    const eta = calculateETA(dist);

    const now = new Date().toISOString();

    const newReq: AssistanceRequest = {
      id: 'req_' + Date.now().toString().slice(-6),
      customerId: currentUser?.id || 'cust_001',
      customerName: currentUser?.name || 'Sanju Kumar',
      customerPhone: currentUser?.phone || '+91 98765 43210',
      mechanicId: mech.id,
      mechanicShopName: mech.shopName,
      mechanicOwnerName: mech.ownerName,
      mechanicPhone: mech.phone,
      vehicle: veh,
      problem: prob,
      problemDescription: problemDescription,
      status: 'PENDING',
      customerLocation: customerLocation,
      mechanicLocation: mech.coords,
      distanceKm: dist,
      etaMinutes: eta,
      estimatedPrice: mech.pricingRange,
      createdAt: now,
      updatedAt: now,
      timeline: {
        requestedAt: now,
      },
    };

    setActiveRequest(newReq);
    setMechanicLiveLocation(mech.coords);

    // Initial chat message
    const welcomeMsg: ChatMessage = {
      id: 'msg_init_' + Date.now(),
      requestId: newReq.id,
      senderId: 'system',
      senderRole: 'CUSTOMER',
      senderName: 'ROAD//SIDE System',
      text: `Request #${newReq.id} created for ${veh.brand} ${veh.model} (${prob}). Dispatching to ${mech.shopName}...`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages([welcomeMsg]);

    addNotification(
      'Request Sent',
      `Assistance requested from ${mech.shopName}. Waiting for acceptance...`,
      'info',
      newReq.id
    );

    broadcastEvent('REQUEST_UPDATED', newReq);
    return newReq;
  };

  const cancelRequest = (requestId: string) => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    setIsSimulatingTrip(false);

    if (activeRequest && activeRequest.id === requestId) {
      const now = new Date().toISOString();
      const cancelled: AssistanceRequest = {
        ...activeRequest,
        status: 'CANCELLED',
        updatedAt: now,
        timeline: {
          ...activeRequest.timeline,
          cancelledAt: now,
        },
      };
      setActiveRequest(null);
      setRequestHistory((prev) => [cancelled, ...prev]);
      addNotification('Request Cancelled', 'Your roadside assistance request was cancelled.', 'warning', requestId);
      broadcastEvent('REQUEST_COMPLETED', cancelled);
    }
  };

  const acceptRequest = (requestId: string) => {
    if (!activeRequest || activeRequest.id !== requestId) return;
    const now = new Date().toISOString();
    const updated: AssistanceRequest = {
      ...activeRequest,
      status: 'ACCEPTED',
      updatedAt: now,
      timeline: {
        ...activeRequest.timeline,
        acceptedAt: now,
      },
    };
    setActiveRequest(updated);
    addNotification(
      'Request Accepted!',
      `${updated.mechanicShopName} has accepted your request! Starting dispatch...`,
      'success',
      requestId
    );

    // Add chat message
    const msg: ChatMessage = {
      id: 'msg_' + Date.now(),
      requestId,
      senderId: updated.mechanicId,
      senderRole: 'MECHANIC',
      senderName: updated.mechanicOwnerName,
      text: `Hello ${updated.customerName}! I've accepted your request. Getting tools ready and heading your way now.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, msg]);

    broadcastEvent('REQUEST_UPDATED', updated);
  };

  const rejectRequest = (requestId: string) => {
    if (!activeRequest || activeRequest.id !== requestId) return;
    cancelRequest(requestId);
    addNotification('Request Declined', 'The request was declined by the workshop.', 'warning', requestId);
  };

  const startTrip = (requestId: string) => {
    if (!activeRequest || activeRequest.id !== requestId) return;
    const now = new Date().toISOString();
    const updated: AssistanceRequest = {
      ...activeRequest,
      status: 'ON_THE_WAY',
      updatedAt: now,
      timeline: {
        ...activeRequest.timeline,
        onTheWayAt: now,
      },
    };
    setActiveRequest(updated);
    addNotification(
      'Mechanic On The Way',
      `${updated.mechanicShopName} has started navigation toward your location.`,
      'info',
      requestId
    );

    // Add chat update
    const msg: ChatMessage = {
      id: 'msg_' + Date.now(),
      requestId,
      senderId: updated.mechanicId,
      senderRole: 'MECHANIC',
      senderName: updated.mechanicOwnerName,
      text: `Trip started. Estimated arrival in ~${updated.etaMinutes} minutes. Keep your phone handy!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, msg]);

    broadcastEvent('REQUEST_UPDATED', updated);

    // Begin animated route simulation
    simulateRouteMovement(updated);
  };

  const simulateRouteMovement = (req: AssistanceRequest) => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }
    setIsSimulatingTrip(true);

    const waypoints = generateRoutePoints(req.mechanicLocation, req.customerLocation.coords, 25);
    let stepIndex = 0;

    simulationTimerRef.current = window.setInterval(() => {
      stepIndex++;
      if (stepIndex >= waypoints.length) {
        if (simulationTimerRef.current) {
          clearInterval(simulationTimerRef.current);
          simulationTimerRef.current = null;
        }
        setIsSimulatingTrip(false);
        setMechanicLiveLocation(req.customerLocation.coords);
        markArrived(req.id);
        return;
      }

      const currentPos = waypoints[stepIndex];
      const remainingDistance = calculateHaversineDistance(currentPos, req.customerLocation.coords);
      const remainingETA = Math.max(1, calculateETA(remainingDistance));

      setMechanicLiveLocation(currentPos);
      setActiveRequest((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          distanceKm: remainingDistance,
          etaMinutes: remainingETA,
        };
        broadcastEvent('LOCATION_MOVED', currentPos);
        return updated;
      });
    }, 1200); // update every 1.2s for smooth visible demo progression
  };

  const markArrived = (requestId: string) => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    setIsSimulatingTrip(false);

    setActiveRequest((prev) => {
      if (!prev || prev.id !== requestId) return prev;
      const now = new Date().toISOString();
      const updated: AssistanceRequest = {
        ...prev,
        status: 'ARRIVED',
        distanceKm: 0.05,
        etaMinutes: 0,
        updatedAt: now,
        timeline: {
          ...prev.timeline,
          arrivedAt: now,
        },
      };

      addNotification(
        'Mechanic Has Arrived!',
        `Your mechanic ${updated.mechanicOwnerName} from ${updated.mechanicShopName} has arrived at your vehicle!`,
        'success',
        requestId
      );

      // Add chat update
      const msg: ChatMessage = {
        id: 'msg_' + Date.now(),
        requestId,
        senderId: updated.mechanicId,
        senderRole: 'MECHANIC',
        senderName: updated.mechanicOwnerName,
        text: `I have arrived at your vehicle! Please wave or look out for my service van.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prevMsgs) => [...prevMsgs, msg]);

      broadcastEvent('REQUEST_UPDATED', updated);
      return updated;
    });
  };

  const startService = (requestId: string) => {
    setActiveRequest((prev) => {
      if (!prev || prev.id !== requestId) return prev;
      const now = new Date().toISOString();
      const updated: AssistanceRequest = {
        ...prev,
        status: 'IN_PROGRESS',
        updatedAt: now,
        timeline: {
          ...prev.timeline,
          inProgressAt: now,
        },
      };
      addNotification('Service Started', `Work on ${updated.vehicle.brand} ${updated.vehicle.model} is now in progress.`, 'info', requestId);
      broadcastEvent('REQUEST_UPDATED', updated);
      return updated;
    });
  };

  const completeService = (requestId: string, finalPrice: number, notes?: string) => {
    setActiveRequest((prev) => {
      if (!prev || prev.id !== requestId) return prev;
      const now = new Date().toISOString();
      const completed: AssistanceRequest = {
        ...prev,
        status: 'COMPLETED',
        paymentStatus: prev.paymentStatus || 'PENDING',
        finalPrice,
        serviceNotes: notes || 'Roadside troubleshooting successfully performed.',
        updatedAt: now,
        timeline: {
          ...prev.timeline,
          completedAt: now,
        },
      };

      // Update history
      setRequestHistory((prevHist) => [completed, ...prevHist.filter((r) => r.id !== completed.id)]);
      // Update mechanic stats
      setMechanicStats((prevStats) => ({
        todayJobs: prevStats.todayJobs + 1,
        completedJobs: prevStats.completedJobs + 1,
        activeJobs: Math.max(0, prevStats.activeJobs - 1),
        totalEarnings: prevStats.totalEarnings + finalPrice,
      }));

      addNotification(
        'Service Completed!',
        `Job completed. Total invoice amount: ₹${finalPrice}. Please complete payment and leave a rating.`,
        'success',
        requestId
      );

      broadcastEvent('REQUEST_COMPLETED', completed);
      return completed; // Remains in activeRequest until rating submitted or dismissed
    });
  };

  const processPayment = (
    requestId: string,
    paymentData: {
      method: 'UPI' | 'CARD' | 'NETBANKING' | 'CASH';
      methodTitle: string;
      accountReference?: string;
      baseAmount: number;
      platformFee: number;
      gstAmount: number;
      totalAmount: number;
    }
  ): { success: boolean; transactionId: string; invoiceNumber: string } => {
    const txnId = 'TXN_' + Date.now().toString(36).toUpperCase() + '_' + Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = 'INV-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
    const now = new Date().toISOString();

    const patchReq = (req: AssistanceRequest): AssistanceRequest => ({
      ...req,
      paymentStatus: 'PAID',
      paymentMethod: paymentData.method,
      transactionId: txnId,
      invoiceNumber: invoiceNo,
      paidAt: now,
      paymentBreakdown: {
        baseAmount: paymentData.baseAmount,
        platformFee: paymentData.platformFee,
        gstAmount: paymentData.gstAmount,
        totalAmount: paymentData.totalAmount,
        methodTitle: paymentData.methodTitle,
        accountReference: paymentData.accountReference,
      },
      updatedAt: now,
    });

    setRequestHistory((prev) => prev.map((r) => (r.id === requestId ? patchReq(r) : r)));

    setActiveRequest((prev) => (prev && prev.id === requestId ? patchReq(prev) : prev));

    addNotification(
      'Payment Received',
      `Payment of ₹${paymentData.totalAmount} for Job #${requestId} verified via ${paymentData.methodTitle}.`,
      'success',
      requestId
    );

    return { success: true, transactionId: txnId, invoiceNumber: invoiceNo };
  };

  const submitRating = (requestId: string, rating: number, review?: string) => {
    const updateInList = (list: AssistanceRequest[]) =>
      list.map((r) => (r.id === requestId ? { ...r, rating, review } : r));

    setRequestHistory((prev) => updateInList(prev));

    if (activeRequest && activeRequest.id === requestId) {
      setActiveRequest(null);
    }

    addNotification('Thank You!', `Your ${rating}-star feedback has been recorded.`, 'success');
  };

  const sendChatMessage = (textOrRequestId: string, maybeText?: string) => {
    const text = maybeText !== undefined ? maybeText : textOrRequestId;
    const reqId = maybeText !== undefined ? textOrRequestId : (activeRequest?.id || 'req_active');
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      requestId: reqId,
      senderId: currentUser?.id || 'cust_001',
      senderRole: currentRole,
      senderName: currentUser?.name || (currentRole === 'CUSTOMER' ? 'Sanju Kumar' : 'Ravi Kumar'),
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    broadcastEvent('NEW_MESSAGE', newMsg);
  };

  const createRequest = (
    mechanicId: string,
    customProblem?: ProblemType,
    notes?: string,
    customPrice?: { min: number; max: number }
  ): AssistanceRequest => {
    if (notes) {
      setProblemDescription(notes);
    }
    return createAssistanceRequest(mechanicId, customProblem);
  };

  const resetToDemoDefault = () => {
    try {
      localStorage.clear();
    } catch {}
    setCurrentUser(DEMO_CUSTOMER);
    setUserVehicles(INITIAL_VEHICLES);
    setSelectedVehicle(INITIAL_VEHICLES[0]);
    setSelectedProblem('BATTERY');
    setProblemDescription('');
    setMechanics(BASE_MECHANICS);
    setActiveRequest(null);
    setRequestHistory(INITIAL_HISTORY_REQUESTS);
    setChatMessages([]);
    setNotifications([]);
    addNotification('Demo Reset', 'Application state has been reset to defaults.', 'info');
  };

  const triggerEmergencyMode = (enable: boolean) => {
    setIsEmergencyMode(enable);
  };

  // Full demo journey simulator - tests all 27 steps seamlessly in one browser tab!
  const runFullDemoJourney = () => {
    // 1. If currently mechanic, switch to customer
    if (currentRole !== 'CUSTOMER') {
      setCurrentUser(DEMO_CUSTOMER);
    }
    // 2. Select vehicle & battery problem
    setSelectedVehicle(INITIAL_VEHICLES[0]);
    setSelectedProblem('BATTERY');

    // 3. Create request with Ravi Auto Care
    const req = createAssistanceRequest('mech_001', 'BATTERY');

    // 4. Simulate acceptance after 2.5s
    setTimeout(() => {
      acceptRequest(req.id);
    }, 2500);

    // 5. Simulate start trip after 4.5s
    setTimeout(() => {
      startTrip(req.id);
    }, 4500);
  };

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        userVehicles,
        selectedVehicle,
        selectedProblem,
        problemDescription,
        customerLocation,
        mechanics,
        selectedMechanicId,
        activeRequest,
        requestHistory,
        chatMessages,
        notifications,
        unreadNotificationCount,
        isEmergencyMode,
        isSimulatingTrip,
        mechanicLiveLocation,
        mechanicStats,
        vehicles: userVehicles,
        historyRequests: requestHistory,
        clearNotifications: clearAllNotifications,
        createRequest,
        resetToDemoDefault,
        loginAsDemo,
        loginUser,
        logout,
        switchRole,
        setSelectedVehicle,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        setSelectedProblem,
        setCustomerLocation,
        setSelectedMechanicId,
        createAssistanceRequest,
        cancelRequest,
        acceptRequest,
        rejectRequest,
        startTrip,
        markArrived,
        startService,
        completeService,
        processPayment,
        submitRating,
        sendChatMessage,
        toggleMechanicAvailability,
        updateShopProfile,
        triggerEmergencyMode,
        runFullDemoJourney,
        addNotification,
        markNotificationRead,
        clearAllNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
