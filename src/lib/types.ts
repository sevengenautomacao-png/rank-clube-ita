
import type { LucideIcon } from 'lucide-react';

export type AppSettings = {
  appIconUrl?: string;
}

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
  avatarUrl?: string;
  patent?: Rank;
  allPatents?: Rank[];
  unitName?: string;
  unitId?: string;
  avatarFallback?: string;
};

export type Unit = {
  id: string;
  name: string;
  password?: string;
  cardImageUrl?: string;
  cardColor?: string;
  icon: string;
  iconUrl?: string;
  scoringCriteria: ScoringCriterion[];
  ranks: RankData[];
  members?: Member[];
  roles?: string[];
  classes?: string[];
  scoreLogs?: any[];
};

export type EventType = 'club' | 'unit' | 'extra';

export type ClubEvent = {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  type: EventType;
  unit_id?: string;
  created_at?: string;
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
