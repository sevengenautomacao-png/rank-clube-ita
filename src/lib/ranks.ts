import { Shield, Radio, Badge, Star, ShieldHalf, ShieldCheck, ShieldAlert, Award, Gem, Crown, type LucideIcon } from 'lucide-react';

export type Rank = {
    score: number;
    name: string;
    Icon: LucideIcon;
};

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
    { score: 100, name: 'Capitão', Icon: Shield }, // Placeholder, can be changed
];

export function getRankForScore(score: number): Rank {
    let currentRank = ranks[0];
    for (const rank of ranks) {
        if (score >= rank.score) {
            currentRank = rank;
        } else {
            break;
        }
    }
    return currentRank;
}
