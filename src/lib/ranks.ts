export const ranks = [
    { score: 0, name: 'Recruta' },
    { score: 10, name: 'Soldado' },
    { score: 20, name: 'Cabo' },
    { score: 30, name: '3º Sargento' },
    { score: 40, name: '2º Sargento' },
    { score: 50, name: '1º Sargento' },
    { score: 60, name: 'Subtenente' },
    { score: 70, name: 'Aspirante' },
    { score: 80, name: '2º Tenente' },
    { score: 90, name: '1º Tenente' },
    { score: 100, name: 'Capitão' },
];

export function getRankForScore(score: number): string {
    let currentRank = ranks[0].name;
    for (const rank of ranks) {
        if (score >= rank.score) {
            currentRank = rank.name;
        } else {
            break;
        }
    }
    return currentRank;
}
