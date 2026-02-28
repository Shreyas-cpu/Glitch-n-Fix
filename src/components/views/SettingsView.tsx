import React, { useState, useEffect } from "react";
import {
  SettingsSection,
  ToggleSwitch,
  StyledInput,
  ActionBtn,
  PillSelector,
} from "../ui/SettingsComponents";
import {
  Wallet,
  ShieldCheck,
  Zap,
  Palette,
  LogOut,
  ChevronDown,
} from "lucide-react";

export interface SettingsState {
  slippage: string;
  gasPriority: string;
  twoFactor: boolean;
  timeout: string;
  theme: string;
  desktopNotifs: boolean;
}

interface SettingsViewProps {
  settings: SettingsState;
  onUpdateSettings: (s: SettingsState) => void;
  defaultSettings: SettingsState;
  walletAddress?: string;
  onDisconnectWallet: () => void;
}

export const SettingsView = ({
  settings,
  onUpdateSettings,
  defaultSettings,
  walletAddress,
  onDisconnectWallet,
}: SettingsViewProps) => {
  // Local draft state
  const [draft, setDraft] = useState<SettingsState>(settings);
  const [isSaved, setIsSaved] = useState(false);

  // Sync draft if external settings change completely
  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleSave = () => {
    onUpdateSettings(draft);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleRestore = () => {
    setDraft(defaultSettings);
    onUpdateSettings(defaultSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage your terminal preferences and account security</p>
        </div>
        {isSaved && (
          <div className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
            Settings Saved ✅
          </div>
        )}
      </div>

      {/* Wallet Management Section */}
      <SettingsSection title="Wallet & Network" description="Manage your connected wallet and active network.">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Wallet size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-white mb-1">Connected Address</div>
              <div className="text-sm text-zinc-400 font-mono">
                {walletAddress ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)}` : "Not Connected"}
              </div>
            </div>
          </div>
          <button
            onClick={onDisconnectWallet}
            disabled={!walletAddress}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={16} /> Disconnect
          </button>
        </div>
      </SettingsSection>

      {/* Trading Preferences */}
      <SettingsSection title="Trading Preferences" description="Configure default parameters for swaps and trades.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white">Default Slippage Tolerance</label>
            <div className="relative">
              <StyledInput
                type="text"
                value={draft.slippage}
                onChange={(e) => setDraft({ ...draft, slippage: e.target.value })}
                className="pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">%</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white">Gas Priority</label>
            <PillSelector
              options={["Standard", "Fast", "Instant"]}
              selected={draft.gasPriority}
              onChange={(val) => setDraft({ ...draft, gasPriority: val })}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Security */}
      <SettingsSection title="Security" description="Protect your account and assets.">
        <div className="flex flex-col gap-6">
          <ToggleSwitch
            label="Two-Factor Authentication (2FA)"
            description="Require a confirmation code for all withdrawals and large trades."
            enabled={draft.twoFactor}
            onChange={(val) => setDraft({ ...draft, twoFactor: val })}
          />
          <div className="h-px bg-[#1A1B1E] w-full" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white mb-1">Session Timeout</div>
              <div className="text-xs text-zinc-500">Auto-lock your terminal after inactivity.</div>
            </div>
            <div className="relative w-32">
              <select
                className="w-full bg-[#151619] border border-[#1A1B1E] text-white text-sm rounded-lg pl-4 pr-10 py-2.5 appearance-none focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                value={draft.timeout}
                onChange={(e) => setDraft({ ...draft, timeout: e.target.value })}
              >
                <option value="15m">15 Minutes</option>
                <option value="30m">30 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="never">Never</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Appearance & Notifications */}
      <SettingsSection title="Appearance & Notifications" description="Customize the terminal interface.">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Terminal Theme</div>
              <div className="text-xs text-zinc-500 mt-0.5">Nexus currently only supports dark mode</div>
            </div>
            <div className="w-48">
              <PillSelector
                options={["Light", "System", "Dark"]}
                selected={draft.theme}
                onChange={(val) => setDraft({ ...draft, theme: val })}
              />
            </div>
          </div>
          <div className="h-px bg-[#1A1B1E] w-full" />
          <ToggleSwitch
            label="Desktop Notifications"
            description="Receive alerts for executed trades and alerts."
            enabled={draft.desktopNotifs}
            onChange={(val) => setDraft({ ...draft, desktopNotifs: val })}
          />
        </div>
      </SettingsSection>

      {/* Save Actions */}
      <div className="flex justify-end gap-4 mt-2 mb-12">
        <ActionBtn variant="secondary" onClick={handleRestore}>Restore Defaults</ActionBtn>
        <ActionBtn variant="primary" onClick={handleSave}>Save Changes</ActionBtn>
      </div>
    </div>
  );
};
