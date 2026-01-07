import type { Rank } from './ranks';

export type ScoringCriterion = {
  id: string;
  label: string;
  points: number;
};

export type Member = {
  id: string;
  name: string;
  age: number;
  role: string; // 'funcao/cargo'
  className: string; // 'classe'
  score: number;
  ranking: number;
  patent?: Rank;
  unitName?: string;
  unitId?: string;
  avatarFallback?: string;
};

export type Unit = {
  id:string;
  name: string;
  password?: string;
  members: Member[];
  cardImageUrl?: string;
  cardColor?: string;
  icon: string;
  scoringCriteria: ScoringCriterion[];
  scoreHistory?: ScoreInfo[];
  ranks?: Rank[];
};

export type MemberScore = {
  points: number;
  observation?: string;
  [criterionId: string]: boolean | number | string;
}

export type ScoreInfo = {
  id: string;
  date: Date;
  memberScores: {
    [memberId:string]: MemberScore;
  }
}
