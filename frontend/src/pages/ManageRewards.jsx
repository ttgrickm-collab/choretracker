import { useState, useEffect, useRef } from 'react';
import { rewardsAPI, iconsAPI } from '../services/api';
import { t, tm, icon } from '../config/theme';
import { ic } from '../utils/iconRenderer';

// ── Tier inline form ──────────────────────────────────────────────────────────

function TierForm({ tier, allItems, onSaved, onDeactivated, onCancel }) {
  const isNew = !tier;
  const [formData, setFormData] = useState({
    title: tier?.title || '',
    description: tier?.description || '',
    cost: tier?.cost || 50,
    display_order: tier?.display_order ?? 0,
    icon_path: tier?.icon_path || '',
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(tier?.icon_path || '');
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIconFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setIconPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { setError('Title required'); return; }
    if (!formData.cost || formData.cost < 1) { setError('Cost must be at least 1'); return; }
    setSaving(true);
    setError('');
    try {
      let iconPath = formData.icon_path;
      if (iconFile) {
        const res = await iconsAPI.uploadIcon(iconFile);
        iconPath = res.data.icon_path;
      }
      const payload = { ...formData, icon_path: iconPath, cost: Number(formData.cost), display_order: Number(formData.display_order) };
      if (isNew) {
        await rewardsAPI.createTier(payload);
      } else {
        await rewardsAPI.updateTier(tier.id, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || tm('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await rewardsAPI.deactivateTier(tier.id);
      onDeactivated();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to deactivate');
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>{icon('basicInfo')}</span> Basic Information
          </h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Moon, Mars, Jupiter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {tm('destinationCostLabel')} ({t('terms.points')}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.cost}
              onChange={e => setFormData({ ...formData, cost: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{tm('displayOrderLabel')}</label>
            <input
              type="number"
              min="0"
              value={formData.display_order}
              onChange={e => setFormData({ ...formData, display_order: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{tm('displayOrderHint')}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description shown to kids"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Planet Icon (optional)</label>
            <div className="flex items-center gap-3">
              {iconPreview && (
                <img src={iconPreview} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                {icon('photo')} {iconPreview ? 'Change Icon' : 'Upload Icon'}
              </button>
              {iconPreview && (
                <button type="button" onClick={() => { setIconPreview(''); setIconFile(null); setFormData({ ...formData, icon_path: '' }); }}
                  className="text-xs text-red-500 hover:text-red-700">{tm('remove')}</button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <div>
          {!isNew && (
            confirmDeactivate ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{tm('deactivateConfirm')}</span>
                <button onClick={handleDeactivate} disabled={deactivating}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50">
                  {deactivating ? tm('deactivating') : tm('confirmYes')}
                </button>
                <button onClick={() => setConfirmDeactivate(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">
                  {tm('cancel')}
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDeactivate(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">
                {icon('deactivate')} {t('terms.deactivate')}
              </button>
            )
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            {tm('cancel')}
          </button>
          <button onClick={handleSave} disabled={saving || !formData.title.trim()}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50 transition">
            {saving ? tm('saving') : tm('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cargo Item inline form ────────────────────────────────────────────────────

function CargoItemForm({ item, tiers, onSaved, onDeactivated, onCancel }) {
  const isNew = !item;
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    tier_id: item?.tier_id || (tiers[0]?.id || ''),
    quantity: item?.quantity ?? '',
    icon_path: item?.icon_path || '',
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(item?.icon_path || '');
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIconFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setIconPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { setError('Title required'); return; }
    if (!formData.tier_id) { setError('Destination required'); return; }
    setSaving(true);
    setError('');
    try {
      let iconPath = formData.icon_path;
      if (iconFile) {
        const res = await iconsAPI.uploadIcon(iconFile);
        iconPath = res.data.icon_path;
      }
      const payload = {
        ...formData,
        icon_path: iconPath,
        tier_id: Number(formData.tier_id),
        quantity: formData.quantity === '' ? null : Number(formData.quantity),
      };
      if (isNew) {
        await rewardsAPI.createItem(payload);
      } else {
        await rewardsAPI.updateItem(item.id, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || tm('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await rewardsAPI.deactivateItem(item.id);
      onDeactivated();
    } catch (err) {
      setError('Failed to deactivate');
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            {ic('cargo', { width: 16, height: 16 })} Cargo Details
          </h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Extra Screen Time, Pizza Night"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{tm('tierLabel')} <span className="text-red-500">*</span></label>
            <select
              value={formData.tier_id}
              onChange={e => setFormData({ ...formData, tier_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {tiers.map(tier => (
                <option key={tier.id} value={tier.id}>{tier.title} ({tier.cost} {t('terms.points')})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{tm('quantityLabel')}</label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Leave empty for unlimited"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{tm('quantityHint')}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="What the kid actually gets"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Cargo Icon (optional)</label>
            <div className="flex items-center gap-3">
              {iconPreview && (
                <img src={iconPreview} alt="" className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200" />
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                {icon('photo')} {iconPreview ? 'Change Icon' : 'Upload Icon'}
              </button>
              {iconPreview && (
                <button type="button" onClick={() => { setIconPreview(''); setIconFile(null); setFormData({ ...formData, icon_path: '' }); }}
                  className="text-xs text-red-500 hover:text-red-700">{tm('remove')}</button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {!isNew && (
            confirmDeactivate ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Deactivate this cargo item?</span>
                <button onClick={handleDeactivate} disabled={deactivating}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50">
                  {deactivating ? tm('deactivating') : tm('confirmYes')}
                </button>
                <button onClick={() => setConfirmDeactivate(false)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">
                  {tm('cancel')}
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDeactivate(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">
                {icon('deactivate')} {t('terms.deactivate')}
              </button>
            )
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            {tm('cancel')}
          </button>
          <button onClick={handleSave} disabled={saving || !formData.title.trim()}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50 transition">
            {saving ? tm('saving') : tm('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Manage Rewards Page ───────────────────────────────────────────────────────

export default function ManageRewards() {
  const [tiers, setTiers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Which tier row is expanded for editing (id, or 'new')
  const [editingTierId, setEditingTierId] = useState(null);
  // Which item row is expanded for editing (id, or 'new')
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [tiersRes, itemsRes] = await Promise.all([
        rewardsAPI.getTiers(),
        rewardsAPI.getItems(),
      ]);
      setTiers(tiersRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      setError('Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const activeTiers = tiers.filter(t => t.active);

  const quantityDisplay = (item) => {
    if (item.quantity === null) return <span className="text-gray-500">{tm('unlimitedLabel')} ∞</span>;
    if (item.quantity === 0) return <span className="text-red-600 font-semibold">{tm('outOfStockLabel')}</span>;
    return <span className="text-gray-700">{tm('remainingLabel', { count: item.quantity })}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <h1 className="text-xl font-bold text-white">{tm('manageRewardsTitle')}</h1>
          <p className="text-blue-100 text-sm mt-1">{tm('manageRewardsSubtitle')}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm">{error}</div>
      )}

      {/* ── Destinations Section ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span>{icon('destination')}</span> {tm('destinationsHeader')}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{tm('destinationsSubtitle')}</p>
          </div>
          <button
            onClick={() => setEditingTierId(editingTierId === 'new' ? null : 'new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <span>+</span> {tm('addDestination')}
          </button>
        </div>

        {/* New tier form */}
        {editingTierId === 'new' && (
          <TierForm
            tier={null}
            allItems={items}
            onSaved={() => { setEditingTierId(null); loadAll(); }}
            onDeactivated={() => { setEditingTierId(null); loadAll(); }}
            onCancel={() => setEditingTierId(null)}
          />
        )}

        {activeTiers.length === 0 && editingTierId !== 'new' ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3 opacity-20">{icon('destination')}</div>
            <p className="text-gray-500 text-sm">{tm('noDestinations')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activeTiers.map((tier) => {
              const isEditing = editingTierId === tier.id;
              return (
                <div key={tier.id} className={`transition-all duration-150 ${isEditing ? 'border-l-4 border-blue-400' : ''}`}>
                  {/* Summary row */}
                  <div className={`p-4 flex items-center gap-4 transition-opacity duration-150 ${isEditing ? 'opacity-40 bg-gray-50' : 'bg-white hover:bg-gray-50/50'}`}>
                    {tier.icon_path && (
                      <img src={tier.icon_path} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{tier.title}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          {ic('fuel')} {tier.cost}
                        </span>
                      </div>
                      {tier.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{tier.description}</p>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span>{tier.rewards?.length || 0} cargo items</span>
                        <span>{tm('redemptionCount', { count: tier.redemption_count || 0 })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingTierId(isEditing ? null : tier.id)}
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-md font-medium transition-colors ${
                        isEditing ? 'border-blue-300 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {icon('edit')} {isEditing ? tm('editing') : t('terms.edit')}
                    </button>
                  </div>

                  {isEditing && (
                    <TierForm
                      tier={tier}
                      allItems={items}
                      onSaved={() => { setEditingTierId(null); loadAll(); }}
                      onDeactivated={() => { setEditingTierId(null); loadAll(); }}
                      onCancel={() => setEditingTierId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cargo Items Section ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              {ic('cargo', { width: 18, height: 18 })} {tm('cargoItemsHeader')}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{tm('cargoItemsSubtitle')}</p>
          </div>
          <button
            onClick={() => setEditingItemId(editingItemId === 'new' ? null : 'new')}
            disabled={activeTiers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>+</span> {tm('addCargoItem')}
          </button>
        </div>

        {activeTiers.length === 0 && (
          <div className="mx-4 my-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
            Create a destination first before adding cargo items.
          </div>
        )}

        {/* New item form */}
        {editingItemId === 'new' && (
          <CargoItemForm
            item={null}
            tiers={activeTiers}
            onSaved={() => { setEditingItemId(null); loadAll(); }}
            onDeactivated={() => { setEditingItemId(null); loadAll(); }}
            onCancel={() => setEditingItemId(null)}
          />
        )}

        {items.filter(i => i.active).length === 0 && editingItemId !== 'new' ? (
          <div className="text-center py-10">
            <div className="mb-3 opacity-20 flex justify-center">{ic('cargo', { width: 48, height: 48 })}</div>
            <p className="text-gray-500 text-sm">{tm('noCargoItems')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.filter(i => i.active).map((item) => {
              const isEditing = editingItemId === item.id;
              return (
                <div key={item.id} className={`transition-all duration-150 ${isEditing ? 'border-l-4 border-purple-400' : ''}`}>
                  <div className={`p-4 flex items-center gap-4 transition-opacity duration-150 ${isEditing ? 'opacity-40 bg-gray-50' : 'bg-white hover:bg-gray-50/50'}`}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {item.icon_path
                        ? <img src={item.icon_path} alt="" className="w-8 h-8 rounded object-cover" />
                        : ic('cargo', { width: 20, height: 20 })
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                          {item.tier_title}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
                      )}
                      <div className="mt-1 text-xs">
                        {quantityDisplay(item)}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingItemId(isEditing ? null : item.id)}
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-md font-medium transition-colors ${
                        isEditing ? 'border-purple-300 text-purple-600 bg-purple-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {icon('edit')} {isEditing ? tm('editing') : t('terms.edit')}
                    </button>
                  </div>

                  {isEditing && (
                    <CargoItemForm
                      item={item}
                      tiers={activeTiers}
                      onSaved={() => { setEditingItemId(null); loadAll(); }}
                      onDeactivated={() => { setEditingItemId(null); loadAll(); }}
                      onCancel={() => setEditingItemId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
