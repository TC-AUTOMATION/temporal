'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminStore } from '@/stores/useAdminStore';
import { useStore } from '@/stores/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, FolderOpen, Clock, Loader2, Check } from 'lucide-react';

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  shippingCostFrance: number;
  shippingCostEurope: number;
  shippingCostWorld: number;
  freeShippingThreshold: number;
  currency: string;
  taxRate: number;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  maintenanceMode: boolean;
  enableNewsletter: boolean;
  termsUrl: string;
  privacyUrl: string;
  returnPolicyUrl: string;
}

type SectionKey = 'shipping' | 'store' | 'stock';

export default function SettingsPage() {
  const { categories, fetchCategories, products, fetchProducts, countdownDate, setCountdownDate } = useAdminStore();
  const { darkMode, language } = useStore();

  // Settings state loaded from API
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Per-section saving/success state
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null);
  const [savedSection, setSavedSection] = useState<SectionKey | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Local form state for editable fields
  const [shippingCostFrance, setShippingCostFrance] = useState(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [storeName, setStoreName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [taxRate, setTaxRate] = useState(0);

  // Translations
  const t = {
    countdownTitle: language === 'fr' ? 'Compte à rebours landing page' : 'Landing Page Countdown',
    dropDate: language === 'fr' ? 'Date du drop' : 'Drop date',
    countdownDesc: language === 'fr' ? 'Le compte à rebours sur la page d\'accueil affichera le temps restant jusqu\'à cette date' : 'The countdown on the landing page will show the time remaining until this date',
    categories: language === 'fr' ? 'Catégories' : 'Categories',
    categoriesDesc: language === 'fr' ? 'Les catégories sont gérées via la base de données. Contactez l\'administrateur pour ajouter ou supprimer.' : 'Categories are managed through the database. Contact the administrator to add or remove.',
    noCategories: language === 'fr' ? 'Aucune catégorie trouvée' : 'No categories found',
    product: language === 'fr' ? 'produit' : 'product',
    products: language === 'fr' ? 'produits' : 'products',
    shippingSettings: language === 'fr' ? 'Paramètres de livraison' : 'Shipping Settings',
    standardShipping: language === 'fr' ? 'Frais de livraison standard' : 'Standard shipping cost',
    freeShippingFrom: language === 'fr' ? 'Livraison gratuite à partir de' : 'Free shipping from',
    deliveryTime: language === 'fr' ? 'Délai de livraison (jours)' : 'Delivery time (days)',
    deliveryCountries: language === 'fr' ? 'Pays de livraison' : 'Delivery countries',
    save: language === 'fr' ? 'Enregistrer' : 'Save',
    saving: language === 'fr' ? 'Enregistrement...' : 'Saving...',
    saved: language === 'fr' ? 'Enregistré' : 'Saved',
    storeInfo: language === 'fr' ? 'Informations de la boutique' : 'Store Information',
    storeName: language === 'fr' ? 'Nom de la boutique' : 'Store name',
    contactEmail: language === 'fr' ? 'Email de contact' : 'Contact email',
    currency: language === 'fr' ? 'Devise' : 'Currency',
    stockAlerts: language === 'fr' ? 'Alertes de stock' : 'Stock Alerts',
    lowStockThreshold: language === 'fr' ? 'Seuil d\'alerte stock bas' : 'Low stock alert threshold',
    stockAlertDesc: language === 'fr' ? 'Une alerte sera affichée lorsque le stock d\'un produit passe sous ce seuil' : 'An alert will be displayed when product stock falls below this threshold',
    emailNotification: language === 'fr' ? 'Recevoir une notification par email' : 'Receive email notification',
    loadingSettings: language === 'fr' ? 'Chargement des paramètres...' : 'Loading settings...',
    errorLoading: language === 'fr' ? 'Erreur lors du chargement des paramètres' : 'Error loading settings',
    errorSaving: language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving settings',
    taxRate: language === 'fr' ? 'Taux de TVA (%)' : 'Tax rate (%)',
  };

  // Fetch settings from API on mount
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data as StoreSettings;
        setSettings(data);
        setShippingCostFrance(data.shippingCostFrance);
        setFreeShippingThreshold(data.freeShippingThreshold);
        setStoreName(data.storeName);
        setContactEmail(data.contactEmail);
        setCurrency(data.currency);
        setTaxRate(data.taxRate);
      } else {
        setFetchError(json.error || t.errorLoading);
      }
    } catch {
      setFetchError(t.errorLoading);
    } finally {
      setLoading(false);
    }
  }, [t.errorLoading]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchSettings();
  }, [fetchCategories, fetchProducts, fetchSettings]);

  // Save a subset of settings to the API
  const saveSettings = async (section: SectionKey, data: Partial<StoreSettings>) => {
    setSavingSection(section);
    setSavedSection(null);
    setSaveError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const updated = json.data as StoreSettings;
        setSettings(updated);
        // Sync local form state with response
        setShippingCostFrance(updated.shippingCostFrance);
        setFreeShippingThreshold(updated.freeShippingThreshold);
        setStoreName(updated.storeName);
        setContactEmail(updated.contactEmail);
        setCurrency(updated.currency);
        setTaxRate(updated.taxRate);
        setSavedSection(section);
        setTimeout(() => setSavedSection(null), 2000);
      } else {
        setSaveError(json.error || t.errorSaving);
      }
    } catch {
      setSaveError(t.errorSaving);
    } finally {
      setSavingSection(null);
    }
  };

  const getCategoryProductCount = (categorySlug: string) => {
    return products.filter((p) => p.category === categorySlug).length;
  };

  const formatDateForInput = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toISOString().slice(0, 16);
  };

  const renderSaveButton = (section: SectionKey) => {
    const isSaving = savingSection === section;
    const isSaved = savedSection === section;

    return (
      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            if (section === 'shipping') {
              saveSettings(section, {
                shippingCostFrance,
                freeShippingThreshold,
              });
            } else if (section === 'store') {
              saveSettings(section, {
                storeName,
                contactEmail,
                currency,
                taxRate,
              });
            } else if (section === 'stock') {
              saveSettings(section, {
                taxRate,
              });
            }
          }}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isSaved ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? t.saving : isSaved ? t.saved : t.save}
        </Button>
        {saveError && savingSection === null && savedSection === null && (
          <span className="text-sm text-red-500">{saveError}</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className={`h-8 w-8 animate-spin ${darkMode ? 'text-white' : 'text-gray-900'}`} />
        <span className={`ml-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.loadingSettings}</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-500">{fetchError}</p>
        <Button onClick={fetchSettings}>
          {language === 'fr' ? 'Réessayer' : 'Retry'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Countdown Settings */}
      <Card className={darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Clock className="h-5 w-5" />
            {t.countdownTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.dropDate}</label>
            <Input
              type="datetime-local"
              value={formatDateForInput(countdownDate)}
              onChange={(e) => setCountdownDate(new Date(e.target.value).toISOString())}
              className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''}
            />
            <p className={`text-sm mt-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
              {t.countdownDesc}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Categories Management */}
      <Card className={darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <FolderOpen className="h-5 w-5" />
            {t.categories}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
            {t.categoriesDesc}
          </p>

          {/* Categories list */}
          <div className="space-y-2">
            {categories.map((category) => {
              const productCount = getCategoryProductCount(category.slug);
              return (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{category.name}</span>
                    <Badge variant="outline">{productCount} {productCount > 1 ? t.products : t.product}</Badge>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{category.slug}</span>
                </div>
              );
            })}
            {categories.length === 0 && (
              <p className={`text-sm text-center py-4 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                {t.noCategories}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Settings */}
      <Card className={darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>{t.shippingSettings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.standardShipping}</label>
              <Input
                type="number"
                value={shippingCostFrance}
                onChange={(e) => setShippingCostFrance(parseFloat(e.target.value) || 0)}
                step={0.1}
                className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''}
              />
            </div>
            <div>
              <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.freeShippingFrom}</label>
              <Input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value) || 0)}
                className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.deliveryTime}</label>
              <Input type="text" defaultValue="2-4" className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''} />
            </div>
            <div>
              <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.deliveryCountries}</label>
              <Input type="text" defaultValue="France, Belgique, Suisse" className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''} />
            </div>
          </div>
          {renderSaveButton('shipping')}
        </CardContent>
      </Card>

      {/* Store Info */}
      <Card className={darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>{t.storeInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.storeName}</label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''}
            />
          </div>
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.contactEmail}</label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''}
            />
          </div>
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.currency}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="EUR" className={darkMode ? 'bg-black' : ''}>Euro (&euro;)</option>
              <option value="USD" className={darkMode ? 'bg-black' : ''}>Dollar ($)</option>
              <option value="GBP" className={darkMode ? 'bg-black' : ''}>Pound (&pound;)</option>
            </select>
          </div>
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.taxRate}</label>
            <Input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              step={0.1}
              min={0}
              max={100}
              className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''}
            />
          </div>
          {renderSaveButton('store')}
        </CardContent>
      </Card>

      {/* Stock Alerts */}
      <Card className={darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}>
        <CardHeader>
          <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>{t.stockAlerts}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.lowStockThreshold}</label>
            <Input type="number" defaultValue={10} className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''} />
            <p className={`text-sm mt-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
              {t.stockAlertDesc}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="emailAlert" defaultChecked />
            <label htmlFor="emailAlert" className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.emailNotification}
            </label>
          </div>
          {renderSaveButton('stock')}
        </CardContent>
      </Card>
    </div>
  );
}
