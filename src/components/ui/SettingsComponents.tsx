import React from "react";

// --- SettingsSection ---
interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const SettingsSection = ({
  title,
  description,
  children,
}: SettingsSectionProps) => (
  <div className="bg-nexus-card border border-nexus-border rounded-2xl p-6">
    <div className="mb-6">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-zinc-500 mt-1">{description}</p>
    </div>
    {children}
  </div>
);

// --- ToggleSwitch ---
interface ToggleSwitchProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (val: boolean) => void;
}

export const ToggleSwitch = ({
  label,
  description,
  enabled,
  onChange,
}: ToggleSwitchProps) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{description}</div>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-nexus-card-hover border border-nexus-border-hover"}`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`}
      />
    </button>
  </div>
);

// --- StyledInput ---
interface StyledInputProps {
  label: string;
  placeholder: string;
  type?: string;
  rightElement?: React.ReactNode;
}

export const StyledInput = ({
  label,
  placeholder,
  type = "text",
  rightElement,
}: StyledInputProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-white">{label}</label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-nexus-card-hover border border-nexus-border-hover rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

// --- ActionBtn ---
interface ActionBtnProps {
  variant: "primary" | "secondary" | "danger";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ActionBtn = ({
  variant,
  children,
  className = "",
  onClick,
}: ActionBtnProps) => {
  const styles = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600",
    secondary:
      "bg-nexus-card-hover text-zinc-300 border border-nexus-border-hover hover:bg-[#2A2B2E]",
    danger:
      "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
  };
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// --- PillSelector ---
interface PillSelectorProps {
  options: string[];
  selected: string;
  onChange: (val: string) => void;
}

export const PillSelector = ({
  options,
  selected,
  onChange,
}: PillSelectorProps) => (
  <div className="flex bg-nexus-card-hover p-1 rounded-lg border border-nexus-border-hover">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          selected === opt
            ? "bg-nexus-card text-white shadow-sm border border-nexus-border-hover"
            : "text-zinc-500 hover:text-white border border-transparent"
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);
