'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import {
  Search,
  Eye,
  UserX,
  UserCheck,
  X,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  MapPin,
  MessageSquare,
  ChevronDown,
  Shield,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  Users as UsersIcon,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isAdmin: boolean;
  isActive: boolean;
  newsletter: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  ticketCount: number;
  addressCount: number;
}

interface UserDetails extends User {
  totalSpent: number;
  orders: Array<{
    id: string;
    orderNumber: string;
    total: string;
    status: string;
    paymentStatus: string;
    createdAt: string;
    items: Array<{
      productName: string;
      quantity: number;
    }>;
  }>;
  tickets: Array<{
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
  addresses: Array<{
    id: string;
    label: string | null;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
}

export default function UsersPage() {
  const { darkMode, language } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    isActive: true,
    isAdmin: false,
    newsletter: false,
  });

  // Translations
  const t = {
    users: language === 'fr' ? 'UTILISATEURS' : 'USERS',
    searchPlaceholder: language === 'fr' ? 'Rechercher par email ou nom...' : 'Search by email or name...',
    allStatuses: language === 'fr' ? 'TOUS LES STATUTS' : 'ALL STATUSES',
    active: language === 'fr' ? 'Actif' : 'Active',
    inactive: language === 'fr' ? 'Inactif' : 'Inactive',
    email: 'Email',
    name: language === 'fr' ? 'Nom' : 'Name',
    status: language === 'fr' ? 'Statut' : 'Status',
    role: language === 'fr' ? 'Rôle' : 'Role',
    orders: language === 'fr' ? 'Commandes' : 'Orders',
    joined: language === 'fr' ? 'Inscrit' : 'Joined',
    actions: language === 'fr' ? 'Actions' : 'Actions',
    details: language === 'fr' ? 'DÉTAILS' : 'DETAILS',
    noUsers: language === 'fr' ? 'AUCUN UTILISATEUR TROUVÉ' : 'NO USERS FOUND',
    admin: language === 'fr' ? 'Administrateur' : 'Administrator',
    customer: language === 'fr' ? 'Client' : 'Customer',
    verified: language === 'fr' ? 'Vérifié' : 'Verified',
    notVerified: language === 'fr' ? 'Non vérifié' : 'Not verified',
    userDetails: language === 'fr' ? 'DÉTAILS UTILISATEUR' : 'USER DETAILS',
    phone: language === 'fr' ? 'Téléphone' : 'Phone',
    memberSince: language === 'fr' ? 'Membre depuis' : 'Member since',
    totalSpent: language === 'fr' ? 'Total dépensé' : 'Total spent',
    orderHistory: language === 'fr' ? 'HISTORIQUE COMMANDES' : 'ORDER HISTORY',
    tickets: language === 'fr' ? 'Tickets' : 'Tickets',
    addresses: language === 'fr' ? 'Adresses' : 'Addresses',
    close: language === 'fr' ? 'FERMER' : 'CLOSE',
    edit: language === 'fr' ? 'MODIFIER' : 'EDIT',
    save: language === 'fr' ? 'SAUVEGARDER' : 'SAVE',
    cancel: language === 'fr' ? 'ANNULER' : 'CANCEL',
    deactivate: language === 'fr' ? 'Désactiver' : 'Deactivate',
    activate: language === 'fr' ? 'Activer' : 'Activate',
    makeAdmin: language === 'fr' ? 'Rendre admin' : 'Make admin',
    removeAdmin: language === 'fr' ? 'Retirer admin' : 'Remove admin',
    newsletter: language === 'fr' ? 'Newsletter' : 'Newsletter',
    accountStatus: language === 'fr' ? 'STATUT DU COMPTE' : 'ACCOUNT STATUS',
    permissions: language === 'fr' ? 'PERMISSIONS' : 'PERMISSIONS',
    noOrders: language === 'fr' ? 'Aucune commande' : 'No orders',
    noTickets: language === 'fr' ? 'Aucun ticket' : 'No tickets',
    noAddresses: language === 'fr' ? 'Aucune adresse' : 'No addresses',
    previous: language === 'fr' ? 'Précédent' : 'Previous',
    next: language === 'fr' ? 'Suivant' : 'Next',
    of: language === 'fr' ? 'sur' : 'of',
    totalUsers: language === 'fr' ? 'utilisateurs' : 'users',
    activeUsers: language === 'fr' ? 'UTILISATEURS ACTIFS' : 'ACTIVE USERS',
    inactiveUsers: language === 'fr' ? 'UTILISATEURS INACTIFS' : 'INACTIVE USERS',
    admins: language === 'fr' ? 'ADMINISTRATEURS' : 'ADMINISTRATORS',
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedUser(data.data.user);
        setEditData({
          isActive: data.data.user.isActive,
          isAdmin: data.data.user.isAdmin,
          newsletter: data.data.user.newsletter,
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh user details
        await fetchUserDetails(selectedUser.id);
        // Refresh users list
        await fetchUsers();
        setEditMode(false);
      } else {
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchUsers();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
        <CheckCircle size={12} />
        {t.active}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border bg-red-500/20 text-red-400 border-red-500/30">
        <UserX size={12} />
        {t.inactive}
      </span>
    );
  };

  const getRoleBadge = (isAdmin: boolean) => {
    return isAdmin ? (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border bg-purple-500/20 text-purple-400 border-purple-500/30">
        <Shield size={12} />
        {t.admin}
      </span>
    ) : (
      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-500/20 text-gray-400">
        {t.customer}
      </span>
    );
  };

  const stats = {
    total,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.isAdmin).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20">
              <UsersIcon size={20} className="text-blue-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {total}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/20">
              <UserCheck size={20} className="text-green-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {stats.active}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20">
              <UserX size={20} className="text-red-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {stats.inactive}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.inactiveUsers}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20">
              <Shield size={20} className="text-purple-400" />
            </div>
            <div>
              <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                {stats.admins}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{t.admins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
          <input
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:border-primary transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/40' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`appearance-none px-4 py-3 pr-10 border rounded-xl focus:outline-none focus:border-primary transition-colors cursor-pointer ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
          >
            <option value="all" className={darkMode ? 'bg-black' : 'bg-white'}>{t.allStatuses}</option>
            <option value="active" className={darkMode ? 'bg-black' : 'bg-white'}>{t.active.toUpperCase()}</option>
            <option value="inactive" className={darkMode ? 'bg-black' : 'bg-white'}>{t.inactive.toUpperCase()}</option>
          </select>
          <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
        </div>
      </div>

      {/* Users Table */}
      <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.email}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.name}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.joined}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.orders}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.status}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.role}</th>
                <th className={`text-left p-4 text-xs uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.actions}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
              {users.map((user) => (
                <tr key={user.id} className={`transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <p className={darkMode ? 'text-white' : 'text-gray-900'}>{user.email}</p>
                      {user.emailVerified && (
                        <span title={t.verified}>
                          <CheckCircle size={14} className="text-green-400" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : '-'}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className={darkMode ? 'text-white/70' : 'text-gray-600'}>
                      {new Date(user.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className={darkMode ? 'text-white' : 'text-gray-900'} style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      {user.orderCount}
                    </p>
                  </td>
                  <td className="p-4">{getStatusBadge(user.isActive)}</td>
                  <td className="p-4">{getRoleBadge(user.isAdmin)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => fetchUserDetails(user.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors ${darkMode ? 'bg-white/5 text-white/70' : 'bg-gray-100 text-gray-700'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '0.8rem' }}
                    >
                      <Eye size={14} />
                      {t.details}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !isLoading && (
          <div className="p-12 text-center">
            <UsersIcon size={48} className={`mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
            <p className={darkMode ? 'text-white/40' : 'text-gray-400'} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              {t.noUsers}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
              Page {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  page === 1
                    ? darkMode
                      ? 'bg-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : darkMode
                      ? 'bg-white/5 text-white hover:bg-white/10'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {t.previous}
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  page === totalPages
                    ? darkMode
                      ? 'bg-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : darkMode
                      ? 'bg-white/5 text-white hover:bg-white/10'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {t.next}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  {t.userDetails}
                </h2>
                <p className="text-sm text-white/50">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEditMode(false);
                }}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail size={16} className="text-primary" />
                    <p className="text-xs text-white/50">{t.email}</p>
                  </div>
                  <p className="text-white text-sm">{selectedUser.email}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone size={16} className="text-primary" />
                    <p className="text-xs text-white/50">{t.phone}</p>
                  </div>
                  <p className="text-white text-sm">{selectedUser.phone || '-'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-primary" />
                    <p className="text-xs text-white/50">{t.memberSince}</p>
                  </div>
                  <p className="text-white text-sm">
                    {new Date(selectedUser.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart size={16} className="text-primary" />
                    <p className="text-xs text-white/50">{t.totalSpent}</p>
                  </div>
                  <p className="text-white text-sm" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                    {selectedUser.totalSpent.toFixed(2)}€
                  </p>
                </div>
              </div>

              {/* Edit Mode */}
              {editMode ? (
                <div className="space-y-4">
                  <h3 className="text-sm text-white/50" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                    {t.accountStatus}
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={editData.isActive}
                        onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 checked:bg-primary"
                      />
                      <div>
                        <p className="text-white">{t.active}</p>
                        <p className="text-xs text-white/50">
                          {language === 'fr' ? 'Utilisateur peut se connecter' : 'User can sign in'}
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={editData.isAdmin}
                        onChange={(e) => setEditData({ ...editData, isAdmin: e.target.checked })}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 checked:bg-primary"
                      />
                      <div>
                        <p className="text-white">{t.admin}</p>
                        <p className="text-xs text-white/50">
                          {language === 'fr' ? 'Accès au panneau admin' : 'Access to admin panel'}
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={editData.newsletter}
                        onChange={(e) => setEditData({ ...editData, newsletter: e.target.checked })}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 checked:bg-primary"
                      />
                      <div>
                        <p className="text-white">{t.newsletter}</p>
                        <p className="text-xs text-white/50">
                          {language === 'fr' ? 'Recevoir les emails marketing' : 'Receive marketing emails'}
                        </p>
                      </div>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={updateUser}
                      className="flex-1 py-3 bg-primary hover:bg-primary/80 rounded-xl text-white transition-colors"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {t.save}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditData({
                          isActive: selectedUser.isActive,
                          isAdmin: selectedUser.isAdmin,
                          newsletter: selectedUser.newsletter,
                        });
                      }}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {getStatusBadge(selectedUser.isActive)}
                  {getRoleBadge(selectedUser.isAdmin)}
                  {selectedUser.newsletter && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400">
                      {t.newsletter}
                    </span>
                  )}
                </div>
              )}

              {/* Order History */}
              <div>
                <h3 className="text-sm text-white/50 mb-3" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  {t.orderHistory} ({selectedUser.orderCount})
                </h3>
                {selectedUser.orders.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.orders.map((order) => (
                      <div key={order.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-medium" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                              {order.orderNumber}
                            </p>
                            <p className="text-xs text-white/50">
                              {new Date(order.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                            </p>
                          </div>
                          <p className="text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                            {Number(order.total).toFixed(2)}€
                          </p>
                        </div>
                        <p className="text-sm text-white/70">
                          {order.items.length} {order.items.length > 1 ? 'articles' : 'article'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">{t.noOrders}</p>
                )}
              </div>

              {/* Addresses */}
              <div>
                <h3 className="text-sm text-white/50 mb-3" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                  {t.addresses} ({selectedUser.addressCount})
                </h3>
                {selectedUser.addresses.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.addresses.map((address) => (
                      <div key={address.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin size={14} className="text-primary" />
                          <p className="text-white text-sm font-medium">{address.label || 'Adresse'}</p>
                          {address.isDefault && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              {language === 'fr' ? 'Par défaut' : 'Default'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/70">
                          {address.street}, {address.postalCode} {address.city}, {address.country}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">{t.noAddresses}</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex-1 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl text-primary transition-colors flex items-center justify-center gap-2"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  <Edit size={16} />
                  {t.edit}
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEditMode(false);
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
