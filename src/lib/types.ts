import type { LucideIcon } from 'lucide-react';

export type RankData = {
  score: number;
  name: string;
  iconUrl?: string;
}

export type Rank = RankData & {
  Icon: LucideIcon;
};

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
  allPatents?: Rank[];
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
  iconUrl?: string;
  scoringCriteria: ScoringCriterion[];
  scoreHistory?: ScoreInfo[];
  ranks?: RankData[];
};

export type MemberScore = {
  points: number;
  observation?: string;
  [criterionId: string]: boolean | number | string | undefined;
}

export type ScoreInfo = {
  id: string;
  date: Date;
  memberScores: {
    [memberId:string]: MemberScore;
  }
}
