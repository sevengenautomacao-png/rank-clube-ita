import { Shield, Radio, Badge, Star, ShieldHalf, ShieldCheck, ShieldAlert, Award, Gem, Crown, Diamond, Rocket, Swords, type LucideIcon } from 'lucide-react';
import type { Rank, RankData } from './types';


export const ranks: Rank[] = [
    { score: 0, name: 'Recruta', Icon: Shield },
    { score: 10, name: 'Soldado', Icon: Radio },
    { score: 20, name: 'Cabo', Icon: Badge },
    { score: 30, name: '3º Sargento', Icon: Star },
    { score: 40, name: '2º Sargento', Icon: ShieldHalf },
    { score: 50, name: '1º Sargento', Icon: ShieldCheck },
    { score: 60, name: 'Subtenente', Icon: ShieldAlert },
    { score: 70, name: 'Aspirante', Icon: Award },
    { score: 80, name: '2º Tenente', Icon: Gem },
    { score: 90, name: '1º Tenente', Icon: Crown },
    { score: 100, name: 'Capitão', Icon: Shield },
    { score: 120, name: 'Major', Icon: Diamond },
    { score: 140, name: 'Tenente-Coronel', Icon: Rocket },
    { score: 160, name: 'Coronel', Icon: Swords },
    { score: 200, name: 'Marechal', Icon: Star },
];

function combineRanks(customRanks: RankData[]): Rank[] {
    return ranks.map(defaultRank => {
        const customRank = customRanks.find(cr => cr.name === defaultRank.name);
        return {
            ...defaultRank,
            ...customRank,
        };
    });
}

export function getRanks(customRanks?: RankData[]): Rank[] {
    if (customRanks && customRanks.length > 0) {
        return combineRanks(customRanks);
    }
    return ranks;
}


export function getRankForScore(score: number, customRanks?: RankData[]): Rank {
    const rankList = getRanks(customRanks);
    let currentRank = rankList[0];
    for (const rank of rankList) {
        if (score >= rank.score) {
            currentRank = rank;
        } else {
            break;
        }
    }
    return currentRank;
}
