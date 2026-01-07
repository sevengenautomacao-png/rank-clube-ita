import type { Unit, Member, ScoringCriterion } from './types';

export const defaultScoringCriteria: ScoringCriterion[] = [
    { id: 'present', label: 'Presente', points: 5 },
    { id: 'uniform', label: 'Camisa do clube', points: 2 },
    { id: 'bible', label: 'Bíblia', points: 1 },
    { id: 'lesson', label: 'Lição', points: 1 },
    { id: 'lenco', label: 'Lenço', points: 1 },
    { id: 'behavior', label: 'Comportamento', points: -2 },
];
