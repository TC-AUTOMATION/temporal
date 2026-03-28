'use client';

import { useState, useEffect } from 'react';
import { useAdminStore, Ticket } from '@/stores/useAdminStore';
import { useStore } from '@/stores/useStore';
import { MessageSquare, Send, Clock, Hourglass, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function AdminTicketsPage() {
  const { darkMode, language } = useStore();
  const { tickets, fetchTickets, updateTicketStatus, addTicketReply } = useAdminStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Translations
  const t = {
    title: 'TICKETS',
    subtitle: language === 'fr' ? 'Gérer les demandes clients' : 'Manage customer requests',
    pending: language === 'fr' ? 'EN ATTENTE' : 'PENDING',
    open: language === 'fr' ? 'Ouvert' : 'Open',
    inProgress: language === 'fr' ? 'En cours' : 'In progress',
    waitingCustomer: language === 'fr' ? 'Attente client' : 'Waiting customer',
    resolved: language === 'fr' ? 'Résolu' : 'Resolved',
    closed: language === 'fr' ? 'Fermé' : 'Closed',
    noTickets: language === 'fr' ? 'AUCUN TICKET' : 'NO TICKETS',
    selectTicket: language === 'fr' ? 'SÉLECTIONNER UN TICKET' : 'SELECT A TICKET',
    createdOn: language === 'fr' ? 'Créé le' : 'Created on',
    support: 'TEMPORAL SUPPORT',
    replyPlaceholder: language === 'fr' ? 'Répondre...' : 'Reply...',
    statusOpen: language === 'fr' ? 'OUVERT' : 'OPEN',
    statusInProgress: language === 'fr' ? 'EN COURS' : 'IN PROGRESS',
    statusWaitingCustomer: language === 'fr' ? 'ATTENTE CLIENT' : 'WAITING CUSTOMER',
    statusResolved: language === 'fr' ? 'RÉSOLU' : 'RESOLVED',
    statusClosed: language === 'fr' ? 'FERMÉ' : 'CLOSED',
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} className="text-yellow-500" />;
      case 'in_progress': return <Clock size={16} className="text-blue-500" />;
      case 'waiting_customer': return <Hourglass size={16} className="text-orange-500" />;
      case 'resolved': return <CheckCircle size={16} className="text-green-500" />;
      case 'closed': return <XCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusLabel = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return t.open;
      case 'in_progress': return t.inProgress;
      case 'waiting_customer': return t.waitingCustomer;
      case 'resolved': return t.resolved;
      case 'closed': return t.closed;
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    await addTicketReply(selectedTicket.id, replyMessage, true);
    setReplyMessage('');
    // Update ticket reference
    const updated = tickets.find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            {t.title}
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary">
          <MessageSquare size={18} />
          <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            {tickets.filter(ticket => ticket.status === 'open').length} {t.pending}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tickets list */}
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`w-full p-4 text-left border transition-all ${
                selectedTicket?.id === ticket.id
                  ? 'border-primary bg-primary/10'
                  : darkMode
                    ? 'border-white/10 bg-white/5 hover:border-white/20'
                    : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(ticket.status)}
                    <span
                      className={`truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      {ticket.subject}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{ticket.customerName} • {ticket.customerEmail}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{ticket.ticketNumber}</p>
                </div>
                <span className={`px-2 py-1 text-xs ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority.toUpperCase()}
                </span>
              </div>
            </button>
          ))}

          {tickets.length === 0 && (
            <div className={`text-center py-12 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                {t.noTickets}
              </p>
            </div>
          )}
        </div>

        {/* Ticket detail */}
        {selectedTicket ? (
          <div className={`border ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
            {/* Header */}
            <div className={`p-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <h2
                  className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  {selectedTicket.subject}
                </h2>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => {
                    updateTicketStatus(selectedTicket.id, e.target.value as Ticket['status']);
                    setSelectedTicket({ ...selectedTicket, status: e.target.value as Ticket['status'] });
                  }}
                  className={`px-3 py-1 text-sm border ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  <option value="open" className={darkMode ? 'bg-black' : ''}>{t.statusOpen}</option>
                  <option value="in_progress" className={darkMode ? 'bg-black' : ''}>{t.statusInProgress}</option>
                  <option value="waiting_customer" className={darkMode ? 'bg-black' : ''}>{t.statusWaitingCustomer}</option>
                  <option value="resolved" className={darkMode ? 'bg-black' : ''}>{t.statusResolved}</option>
                  <option value="closed" className={darkMode ? 'bg-black' : ''}>{t.statusClosed}</option>
                </select>
              </div>
              <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                {selectedTicket.customerName} • {selectedTicket.customerEmail}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                {t.createdOn} {new Date(selectedTicket.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
              </p>
            </div>

            {/* Messages */}
            <div className="p-4 h-64 overflow-y-auto space-y-4">
              {selectedTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 ${
                    msg.isAdmin
                      ? 'bg-primary/20 border-l-2 border-primary ml-4'
                      : darkMode
                        ? 'bg-white/10 border-l-2 border-white/30 mr-4'
                        : 'bg-gray-100 border-l-2 border-gray-300 mr-4'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {msg.isAdmin ? t.support : selectedTicket.customerName}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>{msg.content}</p>
                </div>
              ))}
            </div>

            {/* Reply */}
            <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={t.replyPlaceholder}
                  className={`flex-1 px-4 py-3 border focus:outline-none focus:border-primary ${
                    darkMode
                      ? 'bg-white/10 border-white/20 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  className="px-4 py-3 bg-primary text-white hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`border flex items-center justify-center h-96 ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
            <p className={darkMode ? 'text-white/40' : 'text-gray-400'} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              {t.selectTicket}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
