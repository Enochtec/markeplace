import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Settings } from 'lucide-react';
import { settingsApi } from '../../api/settings';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface Setting { key: string; value: string; group?: string; description?: string; }

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newGroup, setNewGroup] = useState('');

  const fetchSettings = () => {
    setLoading(true);
    settingsApi.get({ all: true })
      .then(({ data }) => setSettings(data.settings || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleUpdate = (index: number, field: 'value' | 'group', val: string) => {
    setSettings((prev) => prev.map((s, i) => i === index ? { ...s, [field]: val } : s));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const settingsMap: Record<string, string> = {};
      settings.forEach(s => { settingsMap[s.key] = s.value; });
      await settingsApi.updateBatch(settingsMap);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!newKey.trim() || !newValue.trim()) return toast.error('Key and value are required');
    try {
      await settingsApi.upsert({ key: newKey.trim(), value: newValue.trim(), group: newGroup.trim() || undefined });
      setNewKey(''); setNewValue(''); setNewGroup('');
      toast.success('Setting added');
      fetchSettings();
    } catch { toast.error('Failed to add setting'); }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete setting "${key}"?`)) return;
    try { await settingsApi.delete(key); toast.success('Setting deleted'); fetchSettings(); }
    catch { toast.error('Failed to delete'); }
  };

  const groups = [...new Set(settings.map(s => s.group || 'General'))];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings size={20} className="text-orange-500" /> Platform Settings
        </h1>
        <button onClick={handleSaveAll} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl text-sm transition-colors">
          <Save size={16} /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {loading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div> : (
        <>
          {/* Settings by group */}
          {groups.map((group) => (
            <div key={group} className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide text-orange-500">{group}</h3>
              <div className="space-y-3">
                {settings.filter(s => (s.group || 'General') === group).map((setting) => {
                  const globalIdx = settings.indexOf(setting);
                  return (
                    <div key={setting.key} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-medium text-gray-500 mb-1">{setting.key}</label>
                        <input
                          value={setting.value}
                          onChange={(e) => handleUpdate(globalIdx, 'value', e.target.value)}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
                        />
                      </div>
                      <button onClick={() => handleDelete(setting.key)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-5 flex-shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Add new setting */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm">
              <Plus size={16} className="text-orange-500" /> Add New Setting
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Key *</label>
                <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="e.g. site_name"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Value *</label>
                <input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Setting value"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Group</label>
                <input value={newGroup} onChange={e => setNewGroup(e.target.value)} placeholder="e.g. General"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
              </div>
            </div>
            <button onClick={handleAdd}
              className="mt-3 flex items-center gap-2 px-4 py-2.5 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl text-sm font-medium transition-colors">
              <Plus size={15} /> Add Setting
            </button>
          </div>
        </>
      )}
    </div>
  );
}
