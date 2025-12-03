'use client';

import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { useAdminStore } from '@/stores/useAdminStore';
import { MessageSquare, Send, ArrowLeft, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import TemporalLogo from '@/components/ui/TemporalLogo';

export default function ContactPage() {
  const { darkMode } = useStore();
  const { tickets, addTicket, addTicketMessage } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');
  const [email, setEmail] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [foundTicket, setFoundTicket] = useState<typeof tickets[0] | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    addTicket({
      customerName: formData.name,
      customerEmail: formData.email,
      subject: formData.subject,
      status: 'open',
      priority: 'medium',
      messages: [{
        id: Math.random().toString(36).substring(2, 15),
        content: formData.message,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      }],
    });
    setSubmitted(true);
  };

  const handleFindTicket = () => {
    const found = tickets.find(
      t => t.ticketNumber.toLowerCase() === ticketNumber.toLowerCase() &&
           t.customerEmail.toLowerCase() === email.toLowerCase()
    );
    setFoundTicket(found || null);
  };

  const handleSendMessage = () => {
    if (!foundTicket || !newMessage.trim()) return;
    addTicketMessage(foundTicket.id, newMessage, false);
    setNewMessage('');
    // Refresh ticket
    const updated = tickets.find(t => t.id === foundTicket.id);
    if (updated) setFoundTicket(updated);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} className="text-yellow-500" />;
      case 'in_progress': return <Clock size={16} className="text-blue-500" />;
      case 'resolved': return <CheckCircle size={16} className="text-green-500" />;
      case 'closed': return <XCircle size={16} className="text-gray-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'En attente';
      case 'in_progress': return 'En cours de traitement';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <div className={`border-b py-6 ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link
            href="/"
            className={`flex items-center gap-2 transition-colors ${darkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            <ArrowLeft size={18} />
            RETOUR
          </Link>
          <Link href="/">
            <TemporalLogo size={40} />
          </Link>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="text-white" />
          </div>
          <h1
            className="text-4xl mb-2"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            CONTACTEZ-NOUS
          </h1>
          <p className={darkMode ? 'text-white/60' : 'text-black/60'}>
            Une question ? Créez un ticket ou consultez une demande existante.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8">
          <button
            onClick={() => { setActiveTab('new'); setFoundTicket(null); setSubmitted(false); }}
            className={`flex-1 py-4 text-center transition-all ${
              activeTab === 'new'
                ? 'bg-primary text-white'
                : darkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            NOUVEAU TICKET
          </button>
          <button
            onClick={() => { setActiveTab('existing'); setSubmitted(false); }}
            className={`flex-1 py-4 text-center transition-all ${
              activeTab === 'existing'
                ? 'bg-primary text-white'
                : darkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10'
            }`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            SUIVRE UN TICKET
          </button>
        </div>

        {/* New ticket form */}
        {activeTab === 'new' && !submitted && (
          <form onSubmit={handleNewTicket} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="VOTRE NOM"
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
                placeholder="VOTRE EMAIL"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                  darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              />
            </div>
            <input
              type="text"
              placeholder="SUJET"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            />
            <textarea
              placeholder="VOTRE MESSAGE"
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
              className="w-full py-4 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              <Send size={18} />
              ENVOYER
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
              TICKET ENVOYÉ
            </h2>
            <p className={`mb-6 ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
              Nous avons bien reçu votre demande. Vous recevrez une réponse par email.
            </p>
            <button
              onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
              className={`px-6 py-3 border transition-colors ${
                darkMode ? 'border-white/20 hover:border-primary hover:text-primary' : 'border-black/20 hover:border-primary hover:text-primary'
              }`}
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              CRÉER UN AUTRE TICKET
            </button>
          </div>
        )}

        {/* Find existing ticket */}
        {activeTab === 'existing' && !foundTicket && (
          <div className="space-y-6">
            <p className={`text-center ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
              Entrez votre email et numéro de ticket pour consulter votre demande.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="VOTRE EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                  darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              />
              <input
                type="text"
                placeholder="NUMÉRO DE TICKET (EX: TK-...)"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                className={`w-full px-4 py-4 bg-transparent border focus:outline-none focus:border-primary ${
                  darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                }`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              />
            </div>
            <button
              onClick={handleFindTicket}
              className="w-full py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              RECHERCHER
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
                Ticket {foundTicket.ticketNumber} • Créé le {new Date(foundTicket.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>

            {/* Messages */}
            <div className="p-6 max-h-96 overflow-y-auto space-y-4">
              {foundTicket.messages.map((msg) => (
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
                      {msg.isAdmin ? 'TEMPORAL SUPPORT' : 'VOUS'}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-black/30'}`}>
                      {new Date(msg.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className={darkMode ? 'text-white/80' : 'text-black/80'}>{msg.content}</p>
                </div>
              ))}
            </div>

            {/* Reply form */}
            {foundTicket.status !== 'closed' && (
              <div className={`p-6 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="AJOUTER UN MESSAGE..."
                    className={`flex-1 px-4 py-3 bg-transparent border focus:outline-none focus:border-primary ${
                      darkMode ? 'border-white/20 text-white placeholder-white/30' : 'border-black/20 text-black placeholder-black/30'
                    }`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-3 bg-primary text-white hover:bg-primary/80 transition-colors disabled:opacity-50"
                  >
                    <Send size={18} />
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
                RECHERCHER UN AUTRE TICKET
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
