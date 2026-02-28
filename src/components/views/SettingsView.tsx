import React, { useState } from "react";
import {
  SettingsSection,
  ToggleSwitch,
  StyledInput,
  ActionBtn,
  PillSelector,
} from "../ui/SettingsComponents";
import { Wallet, Zap, LogOut, ChevronDown } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export const SettingsView = () => {
  const [slippage, setSlippage] = useState("0.5%");
  const [gasPriority, setGasPriority] = useState("Fast");
  const [twoFactor, setTwoFactor] = useState(false);
  const [timeout, setTimeoutVal] = useState("1h");
  const { theme, setTheme } = useTheme();
  const [desktopNotifs, setDesktopNotifs] = useState(true);

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-sm text-zinc-500 mt-1">Manage your terminal preferences and account security</p>
      </div>

      <SettingsSection title="Wallet & Network" description="Manage your connected wallet and active network.">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Wallet size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-white mb-1">Connected Address</div>
              <div className="text-xs font-mono text-zinc-400 bg-[#1A1B1E] px-3 py-1.5 rounded-md border border-[#2A2B2E] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                0x71...3F4B
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button className="flex items-center justify-between gap-3 px-4 py-2 bg-[#1A1B1E] border border-[#2A2B2E] rounded-lg text-sm text-white hover:bg-[#2A2B2E] transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Mainnet</span>
              </div>
              <ChevronDown size={14} className="text-zinc-500" />
            </button>
            <ActionBtn variant="danger" className="flex items-center gap-2 justify-center">
              <LogOut size={16} /> Disconnect
            </ActionBtn>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Trading Preferences" description="Configure slippage, gas fees, and network RPC.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-white">Slippage Tolerance</label>
            <PillSelector options={["0.1%", "0.5%", "1.0%", "Custom"]} selected={slippage} onChange={setSlippage} />
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-white">Gas Priority</label>
            <PillSelector options={["Standard", "Fast", "Instant"]} selected={gasPriority} onChange={setGasPriority} />
          </div>
          <div className="md:col-span-2">
            <StyledInput label="Custom RPC URL" placeholder="https://mainnet.infura.io/v3/..." type="url" rightElement={<Zap size={16} className="text-emerald-500 opacity-50" />} />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Security" description="Protect your account with additional security measures.">
        <div className="flex flex-col gap-6">
          <ToggleSwitch label="Two-Factor Authentication (2FA)" description="Require an authenticator app code for sensitive actions." enabled={twoFactor} onChange={setTwoFactor} />
          <div className="h-px bg-[#1A1B1E] w-full" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Auto-Lock Timeout</div>
              <div className="text-xs text-zinc-500 mt-0.5">Session locks after inactivity</div>
            </div>
            <div className="w-48">
              <PillSelector options={["15m", "1h", "Never"]} selected={timeout} onChange={setTimeoutVal} />
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Appearance & Notifications" description="Customize the terminal interface.">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Terminal Theme</div>
              <div className="text-xs text-zinc-500 mt-0.5">Switch between light and dark appearance</div>
            </div>
            <div className="w-48">
              <PillSelector options={["Light", "System", "Dark"]} selected={theme} onChange={(val) => setTheme(val as "Light" | "System" | "Dark")} />
            </div>
          </div>
          <div className="h-px bg-[#1A1B1E] w-full" />
          <ToggleSwitch label="Desktop Notifications" description="Receive alerts for executed trades and alerts." enabled={desktopNotifs} onChange={setDesktopNotifs} />
        </div>
      </SettingsSection>

      <div className="flex justify-end gap-4 mt-2 mb-12">
        <ActionBtn variant="secondary">Restore Defaults</ActionBtn>
        <ActionBtn variant="primary">Save Changes</ActionBtn>
      </div>
    </div>
  );
};