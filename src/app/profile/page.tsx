'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { useAuthStore, Order } from '@/stores/useAuthStore';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import TemporalLogo from '@/components/ui/TemporalLogo';
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
  Shield
} from 'lucide-react';

type Tab = 'profile' | 'orders' | 'addresses' | 'settings';

export default function ProfilePage() {
  const router = useRouter();
  const { language, darkMode } = useStore();
  const { user, isAuthenticated, logout, updateProfile, getUserOrders } = useAuthStore();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'France'
  });

  // Mock orders for demo
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'TP-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      items: [
        { id: '1', name: 'Veste Temporal Noire', price: 189, quantity: 1, size: 'M', color: 'Noir', image: '/clothes/veste-face-noire.png' }
      ],
      total: 189,
      shippingAddress: { street: '123 Rue Example', city: 'Paris', postalCode: '75001', country: 'France' },
      trackingNumber: 'TR123456789FR'
    },
    {
      id: '2',
      orderNumber: 'TP-2024-002',
      date: '2024-02-20',
      status: 'shipped',
      items: [
        { id: '2', name: 'T-Shirt Temporal Logo', price: 49, quantity: 2, size: 'L', color: 'Blanc', image: '/clothes/veste-face-noire.png' }
      ],
      total: 98,
      shippingAddress: { street: '123 Rue Example', city: 'Paris', postalCode: '75001', country: 'France' },
      trackingNumber: 'TR987654321FR'
    },
    {
      id: '3',
      orderNumber: 'TP-2024-003',
      date: '2024-03-01',
      status: 'confirmed',
      items: [
        { id: '3', name: 'Pantalon Cargo Temporal', price: 129, quantity: 1, size: 'M', color: 'Noir', image: '/clothes/veste-face-noire.png' }
      ],
      total: 129,
      shippingAddress: { street: '123 Rue Example', city: 'Paris', postalCode: '75001', country: 'France' }
    }
  ]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        postalCode: user.address?.postalCode || '',
        country: user.address?.country || 'France'
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSaveProfile = () => {
    updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country
      }
    });
    setIsEditing(false);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={18} />;
      case 'confirmed': return <CheckCircle className="text-blue-500" size={18} />;
      case 'shipped': return <Truck className="text-purple-500" size={18} />;
      case 'delivered': return <PackageCheck className="text-green-500" size={18} />;
      case 'cancelled': return <X className="text-red-500" size={18} />;
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
    }
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'MON PROFIL', icon: User },
    { id: 'orders' as Tab, label: 'MES COMMANDES', icon: Package },
    { id: 'addresses' as Tab, label: 'MES ADRESSES', icon: MapPin },
    { id: 'settings' as Tab, label: 'PARAMÈTRES', icon: Settings }
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
          <TemporalLogo size={40} />
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 ${
            darkMode ? 'bg-white/10 hover:bg-red-500/20 text-white' : 'bg-black/5 hover:bg-red-500/20 text-black'
          }`}
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
        >
          <LogOut size={16} />
          DÉCONNEXION
        </button>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
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
                  : 'BIENVENUE'}
              </h1>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                <Mail size={14} />
                {user.email}
              </p>
              {user.isAdmin && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                  <Shield size={14} />
                  <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>ADMINISTRATEUR</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Membre depuis</p>
              <p className="text-lg" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
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
                  INFORMATIONS PERSONNELLES
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white transition-all hover:scale-105"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                  >
                    <Edit2 size={16} />
                    MODIFIER
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      <X size={16} />
                      ANNULER
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white transition-all hover:scale-105"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      <Save size={16} />
                      ENREGISTRER
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    PRÉNOM
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
                    NOM
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
                    EMAIL
                  </label>
                  <p className="text-lg flex items-center gap-2">
                    <Mail size={16} className="text-muted-foreground" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    TÉLÉPHONE
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
              <h2
                className="text-2xl mb-6"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                MES COMMANDES
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={60} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Aucune commande pour le moment</p>
                  <Link href="/shop">
                    <button
                      className="px-6 py-3 rounded-full bg-primary text-white transition-all hover:scale-105"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      DÉCOUVRIR LA COLLECTION
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                        darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Commande</p>
                          <p className="text-lg font-semibold" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                            {order.orderNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p>{new Date(order.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-xl text-primary" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                            {order.total}€
                          </p>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className={`border-t pt-4 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Taille: {item.size} • Couleur: {item.color} • Qté: {item.quantity}
                              </p>
                            </div>
                            <p className="text-primary" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                              {item.price}€
                            </p>
                          </div>
                        ))}
                      </div>

                      {order.trackingNumber && (
                        <div className={`mt-4 pt-4 border-t flex items-center justify-between ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                          <p className="text-sm text-muted-foreground">
                            Numéro de suivi: <span className="text-primary">{order.trackingNumber}</span>
                          </p>
                          <button
                            className="flex items-center gap-1 text-primary text-sm hover:underline"
                            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                          >
                            SUIVRE MON COLIS
                            <ChevronRight size={14} />
                          </button>
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
                  MES ADRESSES
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Main address */}
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Home size={18} className="text-primary" />
                    <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>ADRESSE PRINCIPALE</span>
                  </div>
                  {formData.street ? (
                    <>
                      <p>{formData.street}</p>
                      <p>{formData.postalCode} {formData.city}</p>
                      <p>{formData.country}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Aucune adresse enregistrée</p>
                  )}
                  <button
                    onClick={() => { setActiveTab('profile'); setIsEditing(true); }}
                    className="mt-4 text-primary text-sm hover:underline flex items-center gap-1"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    <Edit2 size={14} />
                    MODIFIER
                  </button>
                </div>

                {/* Add new address */}
                <button
                  className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-primary ${
                    darkMode ? 'border-white/20' : 'border-black/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                    <MapPin size={20} className="text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    AJOUTER UNE ADRESSE
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2
                className="text-2xl mb-6"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                PARAMÈTRES
              </h2>

              <div className="space-y-4">
                {/* Newsletter */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                  <div>
                    <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>NEWSLETTER</p>
                    <p className="text-sm text-muted-foreground">Recevoir les dernières news et offres exclusives</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Language */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                  <div>
                    <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>LANGUE</p>
                    <p className="text-sm text-muted-foreground">Choisir la langue d'affichage</p>
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
                      <p className="text-red-400" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>SUPPRIMER MON COMPTE</p>
                      <p className="text-sm text-muted-foreground">Cette action est irréversible</p>
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm transition-all hover:bg-red-600"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      SUPPRIMER
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
                    ESPACE ADMINISTRATEUR
                  </p>
                  <p className="text-sm text-muted-foreground">Gérer les produits, commandes et paramètres</p>
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
