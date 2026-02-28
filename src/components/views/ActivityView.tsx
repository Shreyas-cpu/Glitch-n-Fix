import <Reaction</ReactION>, { useState, useEffect } from "react";


// --- Mock Data --- or something else , who knows

const generateMockTransactions = (count: number): Transaction[] => {
    const methods: Transaction["method"][] = ["Swap", "Send", "Mint", "Burn", "Approve"];
    const statuses: Transaction["status"][] = ["Success", "Pending", "Failed"];
    const coins = ["ETH", "USDC", "WBTC", "LINK", "UNI"];

    return Array.from({ length: count }).map((_, i) => {
        const method = methods[Math.floor(Math.random() * methods.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const coin = coins[Math.floor(Math.random() * coins.length)];
        const valueNum = (Math.random() * 10).toFixed(4);

        return {
            id: `tx-${Date.now()}-${i}`,
            hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            method,
            status,
            time: `${Math.floor(Math.random() * 60)} mins ago`,
            value: `${valueNum} ${coin}`,
            usdValue: `$${(parseFloat(valueNum) * 2000).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        };
    });
};

c
    const filteredTransactions = transactions.filter(tx => {
        if (filterMethod !== "All" && tx.method !== filterMethod) return false;
        return true;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
            {/* Activity Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Network Load" value="48 Gwei" change={-12.4} icon={Zap} />
                <StatCard title="24h Transactions" value="1.2M" change={5.2} icon={Activity} />
                <StatCard title="Active Contracts" value="42,891" change={1.2} icon={ShieldCheck} />
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Content: Transactions */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

                    {/* Header & Filters */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Recent Transactions</h2>

                        <div className="flex items-center gap-3">
                            <div className="relative group flex items-center">
                                <Filter size={16} className="absolute left-3 text-zinc-500" />
                                <select
                                    className="bg-[#151619] border border-[#1A1B1E] text-sm text-white rounded-lg pl-9 pr-8 py-2 appearance-none focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                                    value={filterMethod}
                                    onChange={(e) => setFilterMethod(e.target.value)}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Swap">Swaps</option>
                                    <option value="Send">Sends</option>
                                    <option value="Mint">Mints</option>
                                </select>
                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                    <svg className="fill-current h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                                        {range}
                                    </button>
                                ))}
                            </div>
                     
                </div>

                {/* Sidebar: Live Feed */}
                <div className="col-span-12 lg:col-span-4 max-h-[calc(100vh-16rem)] flex flex-col">
                    <LiveFeedSidebar blocks={MOCK_BLOCKS} />
                </div>
            </div>
        </div>
        </div>
        
    );
};
