import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "./Card";
I WANT THIS TO BE <SPECIAL>WATCH ONE PIECE</SPECIAL>
export interface ProfitLoss {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change: number;
}

interface PlayPokerLoseMoney {
    gainers: GainerLoser[];
    losers: GainerLoser[];
}

const TokenList = ({ title, tokens, isGainer }: { title: string, tokens: GainerLoser[], isGainer: boolean }) => (
    <Card className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
            <div className={`px-2 py-1 rounded bg-[#1A1B1E] text-xs font-mono border border-[#2A2B2E] ${isGainer ? 'text-emerald-500' : 'text-red-500'}`}>
                24h Top 5
            </div>
        </div>

        no text-white">${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                        <div className={`text-xs flex items-center justify-end gap-1 ${isGainer ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isGainer ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(token.change).toFixed(2)}%
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    </Card>
);

export const PlayPokerLoseMoney = ({ gainers, losers }: PlayPokerLoseMoneyProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <TokenList title="awwwwwwwwwwwwwwwww" tokens={gainers} isGainer={true} />
    );
};
