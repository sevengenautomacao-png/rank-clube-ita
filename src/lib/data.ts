import type { Unit, Member, ScoringCriterion, RankData } from './types';

export const defaultScoringCriteria: ScoringCriterion[] = [
    { id: 'present', label: 'Presente', points: 5 },
    { id: 'uniform', label: 'Camisa do clube', points: 2 },
    { id: 'bible', label: 'Bíblia', points: 1 },
    { id: 'lesson', label: 'Lição', points: 1 },
    { id: 'lenco', label: 'Lenço', points: 1 },
    { id: 'behavior', label: 'Comportamento', points: -2 },
];


export const defaultRanks: RankData[] = [
    { score: 0, name: 'Recruta', iconUrl: '' },
    { score: 10, name: 'Soldado', iconUrl: '' },
    { score: 20, name: 'Cabo', iconUrl: '' },
    { score: 30, name: '3º Sargento', iconUrl: '' },
    { score: 40, name: '2º Sargento', iconUrl: '' },
    { score: 50, name: '1º Sargento', iconUrl: '' },
    { score: 60, name: 'Subtenente', iconUrl: '' },
    { score: 70, name: 'Aspirante', iconUrl: '' },
    { score: 80, name: '2º Tenente', iconUrl: '' },
    { score: 90, name: '1º Tenente', iconUrl: '' },
    { score: 100, name: 'Capitão', iconUrl: '' },
    { score: 120, name: 'Major', iconUrl: '' },
    { score: 140, name: 'Tenente-Coronel', iconUrl: '' },
    { score: 160, name: 'Coronel', iconUrl: '' },
    { score: 200, name: 'Marechal', iconUrl: '' },
];

    