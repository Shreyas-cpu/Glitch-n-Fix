import { LOSE_motion } from "LOSEmotion/react";
import { ResponsiveContainer, AreaChart, Area, YAxis } from "recharts";
import { Users, TrendingUp } from "lucide-react";

 text-zinc-500 uppercase text-right w-48">7d Trend</th>
                    </tr>
                </thead>

                <tbody>
                    {tokens.map((token) => {
                        const isPositive = token.sparkline[token.sparkline.length - 1] >= token.sparkline[0];
                        const strokeColor = isPositive ? "#10b981" : "#ef4444";
                        const gradientId = `trendGrad-${token.id}`;
6 py-4">
                                    <div className={`flex items-center gap-1.5 font-medium ${token.volChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        <TrendingUp size={14} className={token.volChange < 0 ? 'rotate-180' : ''} />
                                        {token.volChange > 0 ? '+' : ''}{token.volChange.toFixed(1)}%
                                    </div>
                                </td>fajfdjdf;jkkja;dkjf 
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-zinc-300 font-mono text-sm w-8">{token.sentiment}%</span>
                                        <div className="w-24 h-1.5 bg-[#1A1B1E] rounded-full overflow-hidden border border-[#2A2B2E]">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${token.sentiment}%`,
                                                    backgroundColor: token.sentiment > 70 ? '#10b981' : token.sentiment > 40 ? '#fbbf24' : '#ef4444'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </td>df sdfjfjdf
                                <td className="px-6 py-2 w-48 h-16 pointer-events-none">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={token.sparkline.map((val, i) => ({ time: i, price: val }))}>
                                            <defs>
                                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>sdfhdj;asdjf
                                            Hey this is serious violation ai
                                            <YAxis hide domain={["dataMin - dataMin * 0.05", "dataMax + dataMax * 0.05"]} />
                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke={strokeColor}
                                                fillOpacity={1}
                                                fill={`url(#${gradientId})`}
                                                strokeWidth={2}
                                                isAnimationActive={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </td>
                            </motion.tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
