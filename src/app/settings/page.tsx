'use client';

import { useState } from 'react';

interface Settings {
  demoMode: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  triggerThresholds: {
    rain: number;
    heat: number;
    pollution: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    demoMode: true,
    emailAlerts: true,
    smsAlerts: false,
    triggerThresholds: {
      rain: 50,
      heat: 45,
      pollution: 300,
    },
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    localStorage.setItem('gigshield-settings', JSON.stringify(settings));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings({
      demoMode: true,
      emailAlerts: true,
      smsAlerts: false,
      triggerThresholds: {
        rain: 50,
        heat: 45,
        pollution: 300,
      },
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
      <main className="pt-24 pb-12 px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-headline font-black mb-8">Settings</h1>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-secondary/10 border border-secondary/20 rounded-xl flex items-center gap-3 animate-slide-up">
            <span className="material-symbols-outlined text-secondary">check_circle</span>
            <p className="text-sm font-bold text-secondary">Settings saved successfully!</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Platform Settings */}
          <div className="glass-card p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">settings</span>
              </div>
              <h2 className="text-xl font-headline font-black">Platform Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl">
                <div>
                  <p className="font-bold text-on-surface">Demo Mode</p>
                  <p className="text-sm text-on-surface/60">Enable demo features and test data</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, demoMode: !settings.demoMode })}
                  className={`w-14 h-8 rounded-full transition-all relative ${
                    settings.demoMode ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  <span className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-all ${
                    settings.demoMode ? 'left-7' : 'left-1'
                  }`}></span>
                </button>
              </div>
            </div>
          </div>

          {/* Trigger Thresholds */}
          <div className="glass-card p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary">tune</span>
              </div>
              <h2 className="text-xl font-headline font-black">Trigger Thresholds</h2>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface/50 mb-3">
                  Rain Threshold (mm/hr)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.triggerThresholds.rain}
                    onChange={(e) => setSettings({
                      ...settings,
                      triggerThresholds: { ...settings.triggerThresholds, rain: parseInt(e.target.value) }
                    })}
                    className="flex-grow"
                  />
                  <span className="text-xl font-black text-primary w-16 text-right">{settings.triggerThresholds.rain}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface/50 mb-3">
                  Heat Threshold (°C)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="35"
                    max="50"
                    value={settings.triggerThresholds.heat}
                    onChange={(e) => setSettings({
                      ...settings,
                      triggerThresholds: { ...settings.triggerThresholds, heat: parseInt(e.target.value) }
                    })}
                    className="flex-grow"
                  />
                  <span className="text-xl font-black text-primary w-16 text-right">{settings.triggerThresholds.heat}°</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface/50 mb-3">
                  Pollution Threshold (AQI)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="100"
                    max="500"
                    value={settings.triggerThresholds.pollution}
                    onChange={(e) => setSettings({
                      ...settings,
                      triggerThresholds: { ...settings.triggerThresholds, pollution: parseInt(e.target.value) }
                    })}
                    className="flex-grow"
                  />
                  <span className="text-xl font-black text-primary w-16 text-right">{settings.triggerThresholds.pollution}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="glass-card p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-tertiary/10 rounded-lg">
                <span className="material-symbols-outlined text-tertiary">notifications</span>
              </div>
              <h2 className="text-xl font-headline font-black">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl">
                <div>
                  <p className="font-bold text-on-surface">Email Alerts</p>
                  <p className="text-sm text-on-surface/60">Receive email notifications for claims</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, emailAlerts: !settings.emailAlerts })}
                  className={`w-14 h-8 rounded-full transition-all relative ${
                    settings.emailAlerts ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  <span className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-all ${
                    settings.emailAlerts ? 'left-7' : 'left-1'
                  }`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl">
                <div>
                  <p className="font-bold text-on-surface">SMS Alerts</p>
                  <p className="text-sm text-on-surface/60">Receive SMS notifications for urgent events</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, smsAlerts: !settings.smsAlerts })}
                  className={`w-14 h-8 rounded-full transition-all relative ${
                    settings.smsAlerts ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  <span className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-all ${
                    settings.smsAlerts ? 'left-7' : 'left-1'
                  }`}></span>
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="glass-card p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-error/10 rounded-lg">
                <span className="material-symbols-outlined text-error">storage</span>
              </div>
              <h2 className="text-xl font-headline font-black">Data Management</h2>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleReset}
                className="w-full p-4 bg-surface-container-low/50 rounded-2xl text-left hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-on-surface">Reset Settings</p>
                  <p className="text-sm text-on-surface/60">Reset all settings to default values</p>
                </div>
                <span className="material-symbols-outlined text-on-surface/50">refresh</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}