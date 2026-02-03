'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trophy, Save, Eye, EyeOff, ImageIcon } from 'lucide-react';
import { useAdminStore, Contest } from '@/stores/useAdminStore';
import { useStore } from '@/stores/useStore';

export default function AdminContestsPage() {
  const { contests, updateContest } = useAdminStore();
  const { darkMode, language } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Contest>>({});
  const [saved, setSaved] = useState(false);

  const handleEdit = (contest: Contest) => {
    setEditingId(contest.id);
    setFormData({ ...contest });
  };

  const handleSave = () => {
    if (editingId && formData) {
      updateContest(editingId, formData);
      setEditingId(null);
      setFormData({});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const toggleActive = (contest: Contest) => {
    updateContest(contest.id, { isActive: !contest.isActive });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Trophy className="text-primary" size={24} />
          </div>
          <div>
            <h2
              className="text-xl"
              style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em' }}
            >
              {language === 'fr' ? 'GESTION DES CONCOURS' : 'CONTESTS MANAGEMENT'}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
              {language === 'fr'
                ? 'Modifiez les concours affichés sur la page d\'accueil'
                : 'Edit the contests displayed on the homepage'}
            </p>
          </div>
        </div>

        {saved && (
          <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
            {language === 'fr' ? 'Modifications enregistrées !' : 'Changes saved!'}
          </div>
        )}
      </div>

      {/* Contests Grid */}
      <div className="grid gap-6">
        {contests.map((contest) => (
          <div
            key={contest.id}
            className={`rounded-2xl border overflow-hidden ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            {/* Contest Header with Prize Image */}
            <div
              className={`p-4 flex items-center justify-between ${
                contest.id === '1' ? 'bg-primary' : darkMode ? 'bg-white/10' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Prize Image Preview */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/20 flex-shrink-0 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-10" />
                  <Image
                    src={contest.prizeImage}
                    alt={language === 'fr' ? contest.prizeName : contest.prizeNameEn}
                    fill
                    className="object-contain p-1 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    sizes="80px"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-4xl font-bold ${contest.id === '1' ? 'text-white/30' : 'text-primary/30'}`}
                    style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                  >
                    {contest.number}
                  </span>
                  <div>
                    <h3
                      className={`text-lg font-bold ${contest.id === '1' ? 'text-white' : ''}`}
                      style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                      {language === 'fr' ? contest.prizeName : contest.prizeNameEn}
                    </h3>
                    <p className={`text-sm ${contest.id === '1' ? 'text-white/70' : darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                      {language === 'fr' ? 'Valeur' : 'Value'}: {contest.prizeValue}€
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(contest)}
                  className={`p-2 rounded-lg transition-colors ${
                    contest.isActive
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                  title={contest.isActive ? (language === 'fr' ? 'Actif' : 'Active') : (language === 'fr' ? 'Inactif' : 'Inactive')}
                >
                  {contest.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Contest Form */}
            <div className="p-6">
              {editingId === contest.id ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        {language === 'fr' ? 'Nom du prix (FR)' : 'Prize name (FR)'}
                      </label>
                      <input
                        type="text"
                        value={formData.prizeName || ''}
                        onChange={(e) => setFormData({ ...formData, prizeName: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                          darkMode
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        {language === 'fr' ? 'Nom du prix (EN)' : 'Prize name (EN)'}
                      </label>
                      <input
                        type="text"
                        value={formData.prizeNameEn || ''}
                        onChange={(e) => setFormData({ ...formData, prizeNameEn: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                          darkMode
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        {language === 'fr' ? 'Valeur du prix (€)' : 'Prize value (€)'}
                      </label>
                      <input
                        type="number"
                        value={formData.prizeValue || 0}
                        onChange={(e) => setFormData({ ...formData, prizeValue: Number(e.target.value) })}
                        className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                          darkMode
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        {language === 'fr' ? 'Montant d\'achat requis (€)' : 'Required purchase amount (€)'}
                      </label>
                      <input
                        type="number"
                        value={formData.purchaseAmount || 0}
                        onChange={(e) => setFormData({ ...formData, purchaseAmount: Number(e.target.value) })}
                        className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary ${
                          darkMode
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                      {language === 'fr' ? 'Description (FR)' : 'Description (FR)'}
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary resize-none ${
                        darkMode
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm mb-1 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                      {language === 'fr' ? 'Description (EN)' : 'Description (EN)'}
                    </label>
                    <textarea
                      value={formData.descriptionEn || ''}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      rows={2}
                      className={`w-full px-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary resize-none ${
                        darkMode
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>

                  {/* Prize Image Selection */}
                  <div>
                    <label className={`block text-sm mb-2 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                      <span className="flex items-center gap-2">
                        <ImageIcon size={16} />
                        {language === 'fr' ? 'Image du prix' : 'Prize Image'}
                      </span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {[
                        '/clothes/bonnet-face-noir.png',
                        '/clothes/veste-face-noire.png',
                      ].map((img) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setFormData({ ...formData, prizeImage: img })}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                            formData.prizeImage === img
                              ? 'border-primary ring-2 ring-primary/30 scale-105'
                              : darkMode
                                ? 'border-white/10 hover:border-white/30'
                                : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className={`absolute inset-0 ${formData.prizeImage === img ? 'bg-primary/10' : 'bg-black/10'}`} />
                          <Image
                            src={img}
                            alt={img.split('/').pop() || ''}
                            fill
                            className="object-contain p-1 transition-transform group-hover:scale-110"
                            sizes="80px"
                          />
                          {formData.prizeImage === img && (
                            <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Save size={18} />
                      {language === 'fr' ? 'Enregistrer' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'bg-white/10 hover:bg-white/20'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-6">
                  {/* Large Prize Image Display */}
                  <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-2xl overflow-hidden group">
                    <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-white/5 to-black/20' : 'bg-gradient-to-br from-gray-100 to-gray-200'}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <Image
                      src={contest.prizeImage}
                      alt={language === 'fr' ? contest.prizeName : contest.prizeNameEn}
                      fill
                      className="object-contain p-2 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
                      sizes="160px"
                    />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className={`text-[10px] uppercase tracking-wider text-center py-1 rounded-full ${
                        darkMode ? 'bg-white/10 text-white/70' : 'bg-black/10 text-gray-600'
                      }`}>
                        {language === 'fr' ? 'Aperçu du prix' : 'Prize preview'}
                      </div>
                    </div>
                  </div>

                  {/* Contest Details */}
                  <div className="flex-1 space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                          {language === 'fr' ? 'Prix' : 'Prize'}
                        </p>
                        <p className="font-medium">{language === 'fr' ? contest.prizeName : contest.prizeNameEn}</p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                          {language === 'fr' ? 'Valeur' : 'Value'}
                        </p>
                        <p className="font-medium">{contest.prizeValue}€</p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                          {language === 'fr' ? 'Montant requis' : 'Required amount'}
                        </p>
                        <p className="font-medium">{contest.purchaseAmount}€</p>
                      </div>
                    </div>

                    <div>
                      <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                        Description
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        {language === 'fr' ? contest.description : contest.descriptionEn}
                      </p>
                    </div>

                    <button
                      onClick={() => handleEdit(contest)}
                      className={`mt-2 px-4 py-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'bg-white/10 hover:bg-white/20'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {language === 'fr' ? 'Modifier' : 'Edit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview hint */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
          {language === 'fr'
            ? 'Les modifications sont automatiquement visibles sur la page d\'accueil après enregistrement.'
            : 'Changes are automatically visible on the homepage after saving.'}
        </p>
      </div>
    </div>
  );
}
