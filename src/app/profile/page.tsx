'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { useAuthStore, Order } from '@/stores/useAuthStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import TemporalLogoStatic from '@/components/ui/TemporalLogoStatic';
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  ChevronRight,
  Mail,
  Phone,
  Home,
  Shield,
  Loader2,
  RefreshCw,
  XCircle,
  AlertCircle,
  MessageSquare,
  Send,
  Copy,
  Check
} from 'lucide-react';

type Tab = 'profile' | 'orders' | 'addresses' | 'tickets' | 'settings';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  replies: Array<{
    id: string;
    message: string;
    isAdmin: boolean;
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { language, darkMode } = useStore();
  const { user, isAuthenticated, logout, updateProfile, getUserOrders, isLoading: authLoading, error: authError, clearError } = useAuthStore();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketFormData, setTicketFormData] = useState({ subject: '', message: '' });
  const [newReply, setNewReply] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    newsletter: true,
  });
  const [addressFormData, setAddressFormData] = useState({
    label: '',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: '',
    isDefault: false,
  });

  // Verify session with server on mount — syncs Zustand store with actual cookie state
  useEffect(() => {
    if (isAuthenticated) {
      const { fetchCurrentUser } = useAuthStore.getState();
      fetchCurrentUser().then((user) => {
        if (!user) {
          // Cookie expired or invalid — store was cleared by fetchCurrentUser
          router.push('/login');
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        newsletter: user.newsletter ?? true,
      });
    }
  }, [user]);

  // Fetch orders when tab changes to orders
  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated) {
      fetchOrders();
    }
  }, [activeTab, isAuthenticated]);

  // Fetch addresses when tab changes to addresses
  useEffect(() => {
    if (activeTab === 'addresses' && isAuthenticated) {
      fetchAddresses();
    }
  }, [activeTab, isAuthenticated]);

  // Fetch tickets when tab changes to tickets
  useEffect(() => {
    if (activeTab === 'tickets' && isAuthenticated) {
      fetchTickets();
    }
  }, [activeTab, isAuthenticated]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const userOrders = await getUserOrders();
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const response = await fetch('/api/users/me/addresses', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both array and { data: array } response formats
        setAddresses(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setAddressesLoading(false);
    }
  };

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const response = await fetch('/api/tickets', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketFormData.subject.trim() || !ticketFormData.message.trim()) return;

    setTicketSubmitting(true);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(ticketFormData),
      });

      if (response.ok) {
        await fetchTickets();
        setShowTicketForm(false);
        setTicketFormData({ subject: '', message: '' });
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !newReply.trim()) return;

    setTicketSubmitting(true);
    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: newReply }),
      });

      if (response.ok) {
        await fetchTickets();
        setNewReply('');
        // Refresh selected ticket
        const updated = tickets.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setTicketSubmitting(false);
    }
  };

  const copyTicketNumber = (ticketNumber: string) => {
    navigator.clipboard.writeText(ticketNumber);
    setCopiedTicket(ticketNumber);
    setTimeout(() => setCopiedTicket(''), 2000);
  };

  const getTicketStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'open') return <AlertCircle size={14} className="text-yellow-500" />;
    if (s === 'in_progress') return <Clock size={14} className="text-blue-500" />;
    if (s === 'waiting_customer') return <Clock size={14} className="text-orange-500" />;
    if (s === 'resolved') return <CheckCircle size={14} className="text-green-500" />;
    if (s === 'closed') return <XCircle size={14} className="text-gray-500" />;
    return null;
  };

  const getTicketStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (language === 'fr') {
      if (s === 'open') return 'Ouvert';
      if (s === 'in_progress') return 'En traitement';
      if (s === 'waiting_customer') return 'En attente';
      if (s === 'resolved') return 'Résolu';
      if (s === 'closed') return 'Clôturé';
    } else {
      if (s === 'open') return 'Open';
      if (s === 'in_progress') return 'In Progress';
      if (s === 'waiting_customer') return 'Awaiting';
      if (s === 'resolved') return 'Resolved';
      if (s === 'closed') return 'Closed';
    }
    return status;
  };

  const handleSaveAddress = async () => {
    setIsSaving(true);
    try {
      const url = editingAddress
        ? `/api/users/me/addresses/${editingAddress.id}`
        : '/api/users/me/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(addressFormData),
      });

      if (response.ok) {
        await fetchAddresses();
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressFormData({
          label: '',
          firstName: '',
          lastName: '',
          street: '',
          city: '',
          postalCode: '',
          country: 'France',
          phone: '',
          isDefault: false,
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm(language === 'fr' ? 'Supprimer cette adresse ?' : 'Delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/me/addresses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setAddressFormData({
      label: address.label || '',
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    clearError();
    const success = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      newsletter: formData.newsletter,
    });
    setIsSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return <Clock className="text-yellow-500" size={18} />;
      case 'CONFIRMED': return <CheckCircle className="text-blue-500" size={18} />;
      case 'PREPARING': return <Package className="text-orange-500" size={18} />;
      case 'SHIPPED': return <Truck className="text-purple-500" size={18} />;
      case 'DELIVERED': return <PackageCheck className="text-green-500" size={18} />;
      case 'CANCELLED': return <XCircle className="text-red-500" size={18} />;
      case 'REFUNDED': return <AlertCircle className="text-gray-500" size={18} />;
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'CONFIRMED': return 'Confirmed';
      case 'PREPARING': return 'Preparing';
      case 'SHIPPED': return 'Shipped';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      case 'REFUNDED': return 'Refunded';
    }
  };

  const getPaymentStatusLabel = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'PAID': return 'Paid';
      case 'FAILED': return 'Failed';
      case 'REFUNDED': return 'Refunded';
    }
  };

  const tabs = [
    { id: 'profile' as Tab, label: t.myProfile, icon: User },
    { id: 'orders' as Tab, label: t.myOrdersTab, icon: Package },
    { id: 'addresses' as Tab, label: t.myAddresses, icon: MapPin },
    { id: 'tickets' as Tab, label: t.myTickets, icon: MessageSquare },
    { id: 'settings' as Tab, label: t.settings, icon: Settings }
  ];

  return (
    <div className={`min-h-screen relative ${darkMode ? 'dark bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              <ArrowLeft size={18} />
            </button>
          </Link>
          <TemporalLogoStatic size={40} />
        </div>
        <button
          onClick={handleLogout}
          disabled={authLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 disabled:opacity-50 ${
            darkMode ? 'bg-white/10 hover:bg-red-500/20 text-white' : 'bg-black/5 hover:bg-red-500/20 text-black'
          }`}
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          {authLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          {t.logout}
        </button>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Error message */}
        {authError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{authError}</span>
            <button onClick={clearError} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {/* User header */}
        <div className={`rounded-2xl p-6 mb-8 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
              <User size={40} className="text-primary" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1
                className="text-3xl mb-1"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : 'WELCOME'}
              </h1>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                <Mail size={14} />
                {user.email}
              </p>
              {user.isAdmin && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                  <Shield size={14} />
                  <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>{t.administrator}</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">{t.memberSince}</p>
              <p className="text-lg" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : darkMode
                      ? 'bg-white/5 hover:bg-white/10'
                      : 'bg-black/5 hover:bg-black/10'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '0.85rem' }}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-2xl"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.personalInformation}
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white transition-all hover:scale-105"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    <Edit2 size={16} />
                    {t.edit}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      <X size={16} />
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white transition-all hover:scale-105 disabled:opacity-50"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {t.save}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.firstName.toUpperCase()}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-primary ${
                        darkMode
                          ? 'bg-white/5 border-white/20 text-white'
                          : 'bg-black/5 border-black/10 text-black'
                      }`}
                    />
                  ) : (
                    <p className="text-lg">{formData.firstName || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.lastName.toUpperCase()}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-primary ${
                        darkMode
                          ? 'bg-white/5 border-white/20 text-white'
                          : 'bg-black/5 border-black/10 text-black'
                      }`}
                    />
                  ) : (
                    <p className="text-lg">{formData.lastName || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.email.toUpperCase()}
                  </label>
                  <p className="text-lg flex items-center gap-2">
                    <Mail size={16} className="text-muted-foreground" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.phone.toUpperCase()}
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+33 6 00 00 00 00"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-primary ${
                        darkMode
                          ? 'bg-white/5 border-white/20 text-white placeholder:text-white/40'
                          : 'bg-black/5 border-black/10 text-black placeholder:text-black/40'
                      }`}
                    />
                  ) : (
                    <p className="text-lg flex items-center gap-2">
                      <Phone size={16} className="text-muted-foreground" />
                      {formData.phone || '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-2xl"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.myOrdersTab}
                </h2>
                <button
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
                  }`}
                >
                  <RefreshCw size={16} className={ordersLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={60} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">{t.noOrdersYet}</p>
                  <Link href="/shop">
                    <button
                      className="px-6 py-3 rounded-full bg-primary text-white transition-all hover:scale-105"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {t.discoverCollectionButton}
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 rounded-xl border transition-all ${
                        darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t.orderLabel}</p>
                          <p className="text-lg font-semibold" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                            {order.orderNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.dateLabel}</p>
                          <p>{new Date(order.createdAt).toLocaleDateString('en-US')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.paymentLabel}</p>
                          <span className={`text-sm ${order.paymentStatus === 'PAID' ? 'text-green-500' : 'text-yellow-500'}`}>
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{t.total}</p>
                          <p className="text-xl text-primary" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                            {order.total}€
                          </p>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className={`border-t pt-4 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 mb-2">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                              <Package size={20} className="text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.size && `Size: ${item.size}`}
                                {item.color && ` • Color: ${item.color}`}
                                {` • Qty: ${item.quantity}`}
                              </p>
                            </div>
                            <p className="text-primary" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                              {item.unitPrice}€
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Order summary */}
                      <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{order.subtotal}€</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>{order.shippingCost === 0 ? 'Free' : `${order.shippingCost}€`}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-500">Discount</span>
                            <span className="text-green-500">-{order.discount}€</span>
                          </div>
                        )}
                      </div>

                      {order.trackingNumber && (
                        <div className={`mt-4 pt-4 border-t flex items-center justify-between ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                          <p className="text-sm text-muted-foreground">
                            Tracking number: <span className="text-primary">{order.trackingNumber}</span>
                          </p>
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary text-sm hover:underline"
                              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                            >
                              {t.trackPackage}
                              <ChevronRight size={14} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-2xl"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {t.myAddresses}
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => {
                      setShowAddressForm(true);
                      setEditingAddress(null);
                      setAddressFormData({
                        label: '',
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        street: '',
                        city: '',
                        postalCode: '',
                        country: 'France',
                        phone: user?.phone || '',
                        isDefault: addresses.length === 0,
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white transition-all hover:scale-105"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    <MapPin size={16} />
                    {t.addAddress}
                  </button>
                )}
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                  <h3 className="text-lg mb-4" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                    {editingAddress ? t.editAddress : t.newAddress}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t.addressLabel}
                      value={addressFormData.label}
                      onChange={(e) => setAddressFormData({ ...addressFormData, label: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-primary ${
                        darkMode ? 'bg-white/5 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'
                      }`}
                    />
                    <div></div>
                    <input
                      type="text"
                      placeholder="First name"
                      value={addressFormData.firstName}
                      onChange={(e) => setAddressFormData({ ...addressFormData, firstName: e.target.value })}
                      required
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-primary ${
                        darkMode ? 'bg-white/5 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={addressFormData.lastName}
                      onChange={(e) => setAddressFormData({ ...addressFormData, lastName: e.target.value })}
                      required
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-primary ${
                        darkMode ? 'bg-white/5 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Street address"
                      value={addressFormData.street}
                      onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                      required
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-primary md:col-span-2 ${
                        darkMode ? 'bg-white/5 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Postal code"
                      value={addressFormData.postalCode}
                      onChange={(e) => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                      required
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-primary ${
                        darkMode ? 'bg-white/5 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={addressFormData.city}
                      onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                      required
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-primary ${
                        darkMode ? 'bg-white/5 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'
                      }`}
                    />
                    <select
                      value={addressFormData.country}
                      onChange={(e) => setAddressFormData({ ...addressFormData, country: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-primary ${
                        darkMode ? 'bg-white/5 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'
                      }`}
                    >
                      <option>France</option>
                      <option>Belgique</option>
                      <option>Suisse</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={addressFormData.phone}
                      onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-primary ${
                        darkMode ? 'bg-white/5 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'
                      }`}
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressFormData.isDefault}
                      onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Set as default address</span>
                  </label>
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                      disabled={isSaving}
                      className={`flex-1 py-3 rounded-lg transition-all ${
                        darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleSaveAddress}
                      disabled={isSaving}
                      className="flex-1 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : t.saveAddress}
                    </button>
                  </div>
                </div>
              )}

              {/* Loading */}
              {addressesLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-primary" />
                </div>
              )}

              {/* Addresses list */}
              {!addressesLoading && !showAddressForm && (
                <div className="grid md:grid-cols-2 gap-4">
                  {addresses.length === 0 ? (
                    <div className="col-span-2 text-center py-12">
                      <MapPin size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">{t.noAddresses}</p>
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 rounded-xl border transition-all ${
                          address.isDefault
                            ? 'border-primary bg-primary/10'
                            : darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {address.label && (
                              <p className="text-xs text-primary mb-1" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                                {address.label}
                              </p>
                            )}
                            <p className="font-medium">{address.firstName} {address.lastName}</p>
                          </div>
                          {address.isDefault && (
                            <span className="px-2 py-1 rounded bg-primary text-white text-xs" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                              {t.defaultBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{address.street}</p>
                        <p className="text-sm text-muted-foreground">{address.postalCode} {address.city}</p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                        {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
                            }`}
                            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="flex-1 py-2 rounded-lg text-sm bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-all"
                            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                          >
                            {t.delete}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-2xl"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {language === 'fr' ? 'MES TICKETS' : 'MY TICKETS'}
                </h2>
                <button
                  onClick={() => { setShowTicketForm(true); setSelectedTicket(null); }}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  <MessageSquare size={16} />
                  {language === 'fr' ? 'NOUVEAU TICKET' : 'NEW TICKET'}
                </button>
              </div>

              {/* Loading */}
              {ticketsLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {/* Create Ticket Form */}
              {showTicketForm && (
                <div className={`p-6 mb-6 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                  <h3
                    className="text-lg mb-4"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {language === 'fr' ? 'CRÉER UN TICKET' : 'CREATE A TICKET'}
                  </h3>
                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm text-muted-foreground">
                        {language === 'fr' ? 'Sujet' : 'Subject'}
                      </label>
                      <input
                        type="text"
                        value={ticketFormData.subject}
                        onChange={(e) => setTicketFormData({ ...ticketFormData, subject: e.target.value })}
                        placeholder={language === 'fr' ? 'Décrivez brièvement votre demande' : 'Briefly describe your request'}
                        required
                        className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                          darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm text-muted-foreground">
                        {language === 'fr' ? 'Message' : 'Message'}
                      </label>
                      <textarea
                        value={ticketFormData.message}
                        onChange={(e) => setTicketFormData({ ...ticketFormData, message: e.target.value })}
                        placeholder={language === 'fr' ? 'Expliquez votre demande en détail...' : 'Explain your request in detail...'}
                        required
                        rows={4}
                        className={`w-full px-4 py-3 bg-transparent border focus:outline-none focus:border-primary resize-none ${
                          darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                        }`}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setShowTicketForm(false); setTicketFormData({ subject: '', message: '' }); }}
                        className={`flex-1 py-3 border transition-colors ${
                          darkMode ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'
                        }`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                      >
                        {language === 'fr' ? 'ANNULER' : 'CANCEL'}
                      </button>
                      <button
                        type="submit"
                        disabled={ticketSubmitting}
                        className="flex-1 py-3 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                      >
                        {ticketSubmitting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <Send size={16} />
                            {language === 'fr' ? 'ENVOYER' : 'SEND'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Selected Ticket Detail */}
              {selectedTicket && (
                <div className={`mb-6 border ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                  <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-primary font-mono text-sm">{selectedTicket.ticketNumber}</span>
                        <button
                          onClick={() => copyTicketNumber(selectedTicket.ticketNumber)}
                          className="p-1 hover:bg-white/10 transition-colors"
                        >
                          {copiedTicket === selectedTicket.ticketNumber ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                      <p className="font-medium">{selectedTicket.subject}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {getTicketStatusIcon(selectedTicket.status)}
                        <span className="text-sm">{getTicketStatusLabel(selectedTicket.status)}</span>
                      </div>
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className={`p-2 transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-4 max-h-80 overflow-y-auto space-y-3">
                    {/* Initial message */}
                    <div className={`p-3 ${darkMode ? 'bg-white/5 border-l-2 border-white/30' : 'bg-black/5 border-l-2 border-black/30'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{language === 'fr' ? 'Vous' : 'You'}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(selectedTicket.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </span>
                      </div>
                      <p className="text-sm">{selectedTicket.message}</p>
                    </div>

                    {/* Replies */}
                    {selectedTicket.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-3 ${
                          reply.isAdmin
                            ? 'bg-primary/10 border-l-2 border-primary ml-4'
                            : darkMode ? 'bg-white/5 border-l-2 border-white/30' : 'bg-black/5 border-l-2 border-black/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {reply.isAdmin ? 'Temporal Support' : (language === 'fr' ? 'Vous' : 'You')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                          </span>
                        </div>
                        <p className="text-sm">{reply.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply form */}
                  {selectedTicket.status.toLowerCase() !== 'closed' && (
                    <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          placeholder={language === 'fr' ? 'Votre réponse...' : 'Your reply...'}
                          className={`flex-1 px-4 py-2 bg-transparent border focus:outline-none focus:border-primary ${
                            darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                          }`}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                        />
                        <button
                          onClick={handleSendReply}
                          disabled={!newReply.trim() || ticketSubmitting}
                          className="px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {ticketSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tickets List */}
              {!ticketsLoading && !showTicketForm && !selectedTicket && (
                <div className="space-y-3">
                  {tickets.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {language === 'fr' ? 'Aucun ticket' : 'No tickets'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === 'fr'
                          ? 'Créez un ticket pour contacter notre support'
                          : 'Create a ticket to contact our support'}
                      </p>
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full p-4 rounded-xl border text-left transition-all hover:border-primary ${
                          darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-mono text-sm">{ticket.ticketNumber}</span>
                            {getTicketStatusIcon(ticket.status)}
                            <span className="text-xs text-muted-foreground">
                              {getTicketStatusLabel(ticket.status)}
                            </span>
                          </div>
                          <ChevronRight size={16} className="text-muted-foreground" />
                        </div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(ticket.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                          {ticket.replies.length > 0 && (
                            <span className="ml-2">• {ticket.replies.length} {language === 'fr' ? 'réponse(s)' : 'reply(ies)'}</span>
                          )}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2
                className="text-2xl mb-6"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.settings}
              </h2>

              <div className="space-y-4">
                {/* Newsletter */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                  <div>
                    <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>{t.newsletterSetting}</p>
                    <p className="text-sm text-muted-foreground">{t.newsletterSettingDesc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.newsletter}
                      onChange={async (e) => {
                        const newValue = e.target.checked;
                        setFormData(prev => ({ ...prev, newsletter: newValue }));
                        await updateProfile({ newsletter: newValue });
                      }}
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Language */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                  <div>
                    <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>{t.languageSetting}</p>
                    <p className="text-sm text-muted-foreground">{t.languageSettingDesc}</p>
                  </div>
                  <select
                    className={`px-4 py-2 rounded-lg border ${
                      darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'
                    }`}
                    defaultValue={language}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Delete account */}
                <div className={`p-4 rounded-xl border border-red-500/30 bg-red-500/10`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-400" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>{t.deleteAccount}</p>
                      <p className="text-sm text-muted-foreground">{t.deleteAccountWarning}</p>
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm transition-all hover:bg-red-600"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin link for admin users */}
        {user.isAdmin && (
          <Link href="/admin">
            <div className={`mt-6 p-4 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer`}>
              <div className="flex items-center gap-3">
                <Shield size={24} className="text-primary" />
                <div>
                  <p className="text-primary" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.adminArea}
                  </p>
                  <p className="text-sm text-muted-foreground">{t.adminAreaDesc}</p>
                </div>
              </div>
              <ChevronRight size={24} className="text-primary" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
