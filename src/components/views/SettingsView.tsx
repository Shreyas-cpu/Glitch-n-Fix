import React, { useState } from "react";
importd, Zap, Palette, LogOut, ChevronDown } from "lucide-react";

e
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

            {/* Trading Preferences Section */}
            <SettingsSection
                title="Trading Preferences"
                description="Configure slippage, gas fees, and network RPC."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-white">Slippage Tolerance</label>
                        <PillSelector
                            options={["0.1%", "0.5%", "1.0%", "Custom"]}
                            selected={slippage}
                            onChange={setSlippage}
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-white">Gas Priority</label>
                        <PillSelector
                            options={["Standard", "Fast", "Instant"]}
                            selected={gasPriority}
                            onChange={setGasPriority}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <StyledInput
                            label="Custom RPC URL"
                            placeholder="https://mainnet.infura.io/v3/..."
                            type="url"
                            rightElement={<Zap size={16} className="text-emerald-500 opacity-50" />}
                        />
                    </div>
                </div>
            </SettingsSection>

            {/* Security Section */}
            <SettingsSection
                title="Security"
                description="Protect your account with additional security measures."
            >
                <div className="flex flex-col gap-6">
                    <ToggleSwitch
                        label="Two-Factor Authentication (2FA)"
                        description="Require an authenticator app code for sensitive actions."
                        enabled={twoFactor}
                        onChange={setTwoFactor}
                    />
                    <div className="h-px bg-[#1A1B1E] w-full" />
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-white">Auto-Lock Timeout</div>
                            <div className="text-xs text-zinc-500 mt-0.5">Session locks after inactivity</div>
                        </div>
                        <div className="w-48">
                            <PillSelector
                                options={["15m", "1h", "Never"]}
                                selected={timeout}
                                onChange={setTimeoutVal}
                            />
                        </div>
                    </div>
                </div>
            </SettingsSection>

import { SectorHeatmap, Sector } from "../ui/SectorHeatmap";
import { TrendingTable, TrendingToken } from "../ui/TrendingTable";
import { Card } from "../ui/Card";
import { Filter } from "lucide-react";
            <SettingsSection
                title="Appearance & Notifications"
                description="Customize the terminal interface."
            >
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-white">Terminal Theme</div>
                            <div className="text-xs text-zinc-500 mt-0.5">Nexus currently only supports dark mode</div>
                        </div>
                        <div className="w-48">
                            <PillSelector
                                options={["Light", "System", "Dark"]}
                                selected={theme}
                                onChange={setTheme}
                            />
                        </div>
                    </div>
                    <div className="h-px bg-[#1A1B1E] w-full" />
                    <ToggleSwitch
                        label="Desktop Notifications"
                        description="Receive alerts for executed trades and alerts."
                        enabled={desktopNotifs}
                        onChange={setDesktopNotifs}
                    />
                </div>
            </SettingsSection>

            {/* Save Actions */}
            <div className="flex justify-end gap-4 mt-2 mb-12">
                <ActionBtn variant="secondary">Restore Defaults</ActionBtn>
                <ActionBtn variant="primary">Save Changes</ActionBtn>
            </div>
        </div>
    );
};
     {/* Right: Sector Heatmap */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white tracking-tight">Sector Heatmap</h2>
                    </div>
                    <div className="flex-1">
                        <SectorHeatmap sectors={MOCK_SECTORS} />
                    </div>
                </div>
            </div>

            {/* Bottom Section: Trending Table */}
            <div className="flex flex-col gap-4 mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Trending Assets</h2>
                        <p className="text-sm text-zinc-500 mt-1">Based on volume momentum and social sentiment</p>
                    </div>

                    <div className="flex bg-[#151619] p-1 rounded-lg border border-[#1A1B1E]">
                        <button
                            onClick={() => setSortField("volChange")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${sortField === "volChange"
                                    ? "bg-[#1A1B1E] text-white shadow-sm border border-[#2A2B2E]"
                                    : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            <Filter size={14} /> By Volume
                        </button>
                        <button
                            onClick={() => setSortField("sentiment")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${sortField === "sentiment"
                                    ? "bg-[#1A1B1E] text-white shadow-sm border border-[#2A2B2E]"
                                    : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            <Filter size={14} /> By Sentiment
                        </button>
                    </div>