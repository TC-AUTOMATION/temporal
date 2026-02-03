'use client';

import { useEffect } from 'react';
import { useAdminStore } from '@/stores/useAdminStore';
import { useStore } from '@/stores/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, FolderOpen, Clock } from 'lucide-react';

export default function SettingsPage() {
  const { categories, fetchCategories, products, fetchProducts, countdownDate, setCountdownDate } = useAdminStore();
  const { darkMode, language } = useStore();

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
    storeInfo: language === 'fr' ? 'Informations de la boutique' : 'Store Information',
    storeName: language === 'fr' ? 'Nom de la boutique' : 'Store name',
    contactEmail: language === 'fr' ? 'Email de contact' : 'Contact email',
    currency: language === 'fr' ? 'Devise' : 'Currency',
    stockAlerts: language === 'fr' ? 'Alertes de stock' : 'Stock Alerts',
    lowStockThreshold: language === 'fr' ? 'Seuil d\'alerte stock bas' : 'Low stock alert threshold',
    stockAlertDesc: language === 'fr' ? 'Une alerte sera affichée lorsque le stock d\'un produit passe sous ce seuil' : 'An alert will be displayed when product stock falls below this threshold',
    emailNotification: language === 'fr' ? 'Recevoir une notification par email' : 'Receive email notification',
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const getCategoryProductCount = (categorySlug: string) => {
    return products.filter((p) => p.category === categorySlug).length;
  };

  const formatDateForInput = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toISOString().slice(0, 16);
  };

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
              <Input type="number" defaultValue={5.90} step={0.1} className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''} />
            </div>
            <div>
              <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.freeShippingFrom}</label>
              <Input type="number" defaultValue={100} className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''} />
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
          <Button>
            <Save className="h-4 w-4 mr-2" />
            {t.save}
          </Button>
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
            <Input defaultValue="Temporal" className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''} />
          </div>
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.contactEmail}</label>
            <Input type="email" defaultValue="contact@temporal.fr" className={darkMode ? 'bg-white/10 border-white/20 text-white' : ''} />
          </div>
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.currency}</label>
            <select className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
              <option value="EUR" className={darkMode ? 'bg-black' : ''}>Euro (€)</option>
              <option value="USD" className={darkMode ? 'bg-black' : ''}>Dollar ($)</option>
              <option value="GBP" className={darkMode ? 'bg-black' : ''}>Pound (£)</option>
            </select>
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            {t.save}
          </Button>
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
          <Button>
            <Save className="h-4 w-4 mr-2" />
            {t.save}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
