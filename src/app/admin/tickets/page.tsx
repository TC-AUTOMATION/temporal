'use client';

import { useState } from 'react';
import { useAdminStore, Ticket } from '@/stores/useAdminStore';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function AdminTicketsPage() {
  const { tickets, updateTicketStatus, addTicketMessage } = useAdminStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} className="text-yellow-500" />;
      case 'in_progress': return <Clock size={16} className="text-blue-500" />;
      case 'resolved': return <CheckCircle size={16} className="text-green-500" />;
      case 'closed': return <XCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusLabel = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
    }
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    addTicketMessage(selectedTicket.id, replyMessage, true);
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
            className="text-3xl text-white"
            style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
          >
            TICKETS
          </h1>
          <p className="text-white/60 text-sm mt-1">Gérer les demandes clients</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary">
          <MessageSquare size={18} />
          <span style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
            {tickets.filter(t => t.status === 'open').length} EN ATTENTE
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
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(ticket.status)}
                    <span
                      className="text-white truncate"
                      style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                    >
                      {ticket.subject}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm truncate">{ticket.customerName} • {ticket.customerEmail}</p>
                  <p className="text-white/30 text-xs mt-1">{ticket.ticketNumber}</p>
                </div>
                <span className={`px-2 py-1 text-xs ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority.toUpperCase()}
                </span>
              </div>
            </button>
          ))}

          {tickets.length === 0 && (
            <div className="text-center py-12 text-white/40">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
                AUCUN TICKET
              </p>
            </div>
          )}
        </div>

        {/* Ticket detail */}
        {selectedTicket ? (
          <div className="border border-white/10 bg-white/5">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h2
                  className="text-xl text-white"
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
                  className="bg-white/10 border border-white/20 text-white px-3 py-1 text-sm"
                  style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                >
                  <option value="open" className="bg-black">OUVERT</option>
                  <option value="in_progress" className="bg-black">EN COURS</option>
                  <option value="resolved" className="bg-black">RÉSOLU</option>
                  <option value="closed" className="bg-black">FERMÉ</option>
                </select>
              </div>
              <p className="text-white/50 text-sm">
                {selectedTicket.customerName} • {selectedTicket.customerEmail}
              </p>
              <p className="text-white/30 text-xs mt-1">
                Créé le {new Date(selectedTicket.createdAt).toLocaleDateString('fr-FR')}
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
                      : 'bg-white/10 border-l-2 border-white/30 mr-4'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs text-white/60"
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {msg.isAdmin ? 'TEMPORAL SUPPORT' : selectedTicket.customerName}
                    </span>
                    <span className="text-xs text-white/30">
                      {new Date(msg.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{msg.content}</p>
                </div>
              ))}
            </div>

            {/* Reply */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Répondre..."
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-primary"
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
          <div className="border border-white/10 bg-white/5 flex items-center justify-center h-96">
            <p className="text-white/40" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}>
              SÉLECTIONNER UN TICKET
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
