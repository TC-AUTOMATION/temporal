'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { MessageSquare, Send, ArrowLeft, Clock, CheckCircle, AlertCircle, XCircle, Loader2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import TemporalLogoStatic from '@/components/ui/TemporalLogoStatic';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { translations } from '@/lib/translations';

interface TicketMessage {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
  };
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  guestEmail?: string;
  guestName?: string;
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  replies: TicketMessage[];
}

export default function ContactPage() {
  const { darkMode, language } = useStore();
  const { user, isAuthenticated } = useAuthStore();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');
  const [searchEmail, setSearchEmail] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    orderId: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);

  // Pre-fill form if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
      }));
    }
  }, [isAuthenticated, user]);

  // Fetch user's tickets if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserTickets();
    }
  }, [isAuthenticated]);

  const fetchUserTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setUserTickets(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  const handleNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = isAuthenticated
        ? {
            subject: formData.subject,
            message: formData.message,
            orderId: formData.orderId || undefined,
          }
        : {
            email: formData.email,
            name: formData.name,
            subject: formData.subject,
            message: formData.message,
            orderId: formData.orderId || undefined,
          };

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du ticket');
      }

      setCreatedTicketNumber(data.data.ticketNumber);
      setSubmitted(true);

      // Refresh user tickets if authenticated
      if (isAuthenticated) {
        fetchUserTickets();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindTicket = async () => {
    if (!ticketNumber.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ ticketNumber: ticketNumber.trim() });
      if (searchEmail) {
        params.append('email', searchEmail);
      }

      const response = await fetch(`/api/tickets?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ticket non trouvé');
      }

      if (data.data && data.data.length > 0) {
        setFoundTicket(data.data[0]);
      } else {
        setError('Aucun ticket trouvé avec ce numéro');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!foundTicket || !newMessage.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/tickets/${foundTicket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      setNewMessage('');

      // Refresh ticket
      const ticketResponse = await fetch(`/api/tickets?ticketNumber=${foundTicket.ticketNumber}`);
      const ticketData = await ticketResponse.json();
      if (ticketData.data && ticketData.data.length > 0) {
        setFoundTicket(ticketData.data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const copyTicketNumber = () => {
    navigator.clipboard.writeText(createdTicketNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'open') return <AlertCircle size={16} className="text-yellow-500" />;
    if (s === 'in_progress') return <Clock size={16} className="text-blue-500" />;
    if (s === 'waiting_customer') return <Clock size={16} className="text-orange-500" />;
    if (s === 'resolved') return <CheckCircle size={16} className="text-green-500" />;
    if (s === 'closed') return <XCircle size={16} className="text-gray-500" />;
    return null;
  };

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (language === 'fr') {
      if (s === 'open') return 'Ouvert';
      if (s === 'in_progress') return 'En traitement';
      if (s === 'waiting_customer') return 'En attente de réponse';
      if (s === 'resolved') return 'Résolu';
      if (s === 'closed') return 'Clôturé';
    } else {
      if (s === 'open') return 'Open';
      if (s === 'in_progress') return 'In Progress';
      if (s === 'waiting_customer') return 'Awaiting Response';
      if (s === 'resolved') return 'Resolved';
      if (s === 'closed') return 'Closed';
    }
    return status;
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <Header />
        <Sidebar />

        <div className="max-w-4xl mx-auto px-4 py-12 pt-24">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-white" />
            </div>
            <h1
              className="text-4xl mb-2"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'SUPPORT CLIENT' : 'CUSTOMER SUPPORT'}
            </h1>
            <p className={darkMode ? 'text-white/60' : 'text-black/60'}>
              {language === 'fr'
                ? 'Une question ? Créez un ticket ou suivez une demande existante.'
                : 'Have a question? Create a ticket or track an existing request.'}
            </p>
            {isAuthenticated && (
              <p className={`text-sm mt-2 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                {language === 'fr' ? 'Connecté en tant que' : 'Logged in as'} {user?.email}
              </p>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-center">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex mb-8">
            <button
              onClick={() => { setActiveTab('new'); setFoundTicket(null); setSubmitted(false); setError(''); }}
              className={`flex-1 py-4 text-center transition-all ${
                activeTab === 'new'
                  ? 'bg-primary text-white'
                  : darkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'NOUVEAU TICKET' : 'NEW TICKET'}
            </button>
            <button
              onClick={() => { setActiveTab('existing'); setSubmitted(false); setError(''); }}
              className={`flex-1 py-4 text-center transition-all ${
                activeTab === 'existing'
                  ? 'bg-primary text-white'
                  : darkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'SUIVRE UN TICKET' : 'TRACK A TICKET'}
            </button>
          </div>

          {/* New ticket form */}
          {activeTab === 'new' && !submitted && (
            <form onSubmit={handleNewTicket} className="space-y-6">
              {!isAuthenticated && (
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={language === 'fr' ? 'VOTRE NOM' : 'YOUR NAME'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                      darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  />
                  <input
                    type="email"
                    placeholder={language === 'fr' ? 'VOTRE EMAIL' : 'YOUR EMAIL'}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                      darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={language === 'fr' ? 'SUJET' : 'SUBJECT'}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                    darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                />
                <input
                  type="text"
                  placeholder={language === 'fr' ? 'N° DE COMMANDE (OPTIONNEL)' : 'ORDER NUMBER (OPTIONAL)'}
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                    darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                />
              </div>

              <textarea
                placeholder={language === 'fr' ? 'VOTRE MESSAGE' : 'YOUR MESSAGE'}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary resize-none ${
                  darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    {language === 'fr' ? 'ENVOYER' : 'SEND'}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Submitted confirmation */}
          {activeTab === 'new' && submitted && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-white" />
              </div>
              <h2
                className="text-2xl mb-2"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {language === 'fr' ? 'TICKET CRÉÉ' : 'TICKET CREATED'}
              </h2>
              <p className={`mb-4 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                {language === 'fr'
                  ? 'Nous avons bien reçu votre demande. Conservez votre numéro de ticket :'
                  : 'We have received your request. Save your ticket number:'}
              </p>

              {/* Ticket number with copy button */}
              <div className={`inline-flex items-center gap-3 px-6 py-4 mb-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'}`}>
                <span
                  className="text-2xl text-primary font-bold tracking-widest"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  {createdTicketNumber}
                </span>
                <button
                  onClick={copyTicketNumber}
                  className={`p-2 transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                  title={language === 'fr' ? 'Copier' : 'Copy'}
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>

              <p className={`mb-6 text-sm ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                {language === 'fr'
                  ? 'Vous recevrez une réponse par email. Vous pouvez également suivre votre ticket avec ce numéro.'
                  : 'You will receive a response by email. You can also track your ticket with this number.'}
              </p>

              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '', orderId: '' }); }}
                className={`px-6 py-3 border transition-colors ${
                  darkMode ? 'border-white/20 hover:border-primary hover:text-primary' : 'border-black/20 hover:border-primary hover:text-primary'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {language === 'fr' ? 'CRÉER UN AUTRE TICKET' : 'CREATE ANOTHER TICKET'}
              </button>
            </div>
          )}

          {/* Find existing ticket */}
          {activeTab === 'existing' && !foundTicket && (
            <div className="space-y-6">
              {/* User's tickets list */}
              {isAuthenticated && userTickets.length > 0 && (
                <div className={`p-6 border ${darkMode ? 'border-white/10' : 'border-black/10'} mb-8`}>
                  <h3
                    className="text-lg mb-4"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {language === 'fr' ? 'VOS TICKETS' : 'YOUR TICKETS'}
                  </h3>
                  <div className="space-y-3">
                    {userTickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setFoundTicket(ticket)}
                        className={`w-full p-4 text-left flex items-center justify-between transition-colors ${
                          darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
                        }`}
                      >
                        <div>
                          <span className="text-primary text-sm font-mono">{ticket.ticketNumber}</span>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                            {new Date(ticket.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <span className="text-sm">{getStatusLabel(ticket.status)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className={`text-center ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                {language === 'fr'
                  ? 'Entrez votre numéro de ticket pour voir votre demande.'
                  : 'Enter your ticket number to view your request.'}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder={language === 'fr' ? 'N° DE TICKET (EX: TK-...)' : 'TICKET NUMBER (E.G., TK-...)'}
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                    darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                />
                <input
                  type="email"
                  placeholder={language === 'fr' ? 'VOTRE EMAIL (OPTIONNEL)' : 'YOUR EMAIL (OPTIONAL)'}
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                    darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                />
              </div>
              <button
                onClick={handleFindTicket}
                disabled={isLoading || !ticketNumber.trim()}
                className="w-full py-4 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  language === 'fr' ? 'RECHERCHER' : 'SEARCH'
                )}
              </button>
            </div>
          )}

          {/* Display found ticket */}
          {activeTab === 'existing' && foundTicket && (
            <div className={`border ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
              {/* Ticket header */}
              <div className={`p-6 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h2
                    className="text-xl"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  >
                    {foundTicket.subject}
                  </h2>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(foundTicket.status)}
                    <span className="text-sm">{getStatusLabel(foundTicket.status)}</span>
                  </div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
                  {language === 'fr' ? 'Ticket' : 'Ticket'} {foundTicket.ticketNumber} • {language === 'fr' ? 'Créé le' : 'Created on'} {new Date(foundTicket.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                </p>
              </div>

              {/* Messages */}
              <div className="p-6 max-h-96 overflow-y-auto space-y-4">
                {/* Initial message */}
                <div className={`p-4 ${darkMode ? 'bg-white/5 border-l-2 border-white/30 mr-4' : 'bg-black/5 border-l-2 border-black/30 mr-4'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs ${darkMode ? 'text-white/60' : 'text-black/60'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {language === 'fr' ? 'VOUS' : 'YOU'}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                      {new Date(foundTicket.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </span>
                  </div>
                  <p className={darkMode ? 'text-white/80' : 'text-black/80'}>{foundTicket.message}</p>
                </div>

                {/* Replies */}
                {foundTicket.replies.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 ${
                      msg.isAdmin
                        ? 'bg-primary/10 border-l-2 border-primary ml-4'
                        : darkMode ? 'bg-white/5 border-l-2 border-white/30 mr-4' : 'bg-black/5 border-l-2 border-black/30 mr-4'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs ${darkMode ? 'text-white/60' : 'text-black/60'}`}
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                      >
                        {msg.isAdmin ? 'TEMPORAL SUPPORT' : (language === 'fr' ? 'VOUS' : 'YOU')}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                        {new Date(msg.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                      </span>
                    </div>
                    <p className={darkMode ? 'text-white/80' : 'text-black/80'}>{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply form */}
              {foundTicket.status.toLowerCase() !== 'closed' && (
                <div className={`p-6 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={language === 'fr' ? 'AJOUTER UN MESSAGE...' : 'ADD A MESSAGE...'}
                      className={`flex-1 px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                        darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                      }`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      className="px-4 py-3 bg-primary text-white hover:bg-primary/80 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Back button */}
              <div className={`p-6 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <button
                  onClick={() => setFoundTicket(null)}
                  className={`w-full py-3 border transition-colors ${
                    darkMode ? 'border-white/20 hover:border-primary hover:text-primary' : 'border-black/20 hover:border-primary hover:text-primary'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
                >
                  {language === 'fr' ? 'RECHERCHER UN AUTRE TICKET' : 'SEARCH FOR ANOTHER TICKET'}
                </button>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
