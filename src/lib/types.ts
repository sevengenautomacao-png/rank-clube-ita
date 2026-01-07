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
};

export type Unit = {
  id:string;
  name: string;
  members: Member[];
  cardImageUrl?: string;
  cardColor?: string;
  icon: string;
  scoringCriteria: ScoringCriterion[];
  scoreHistory?: ScoreInfo[];
};

export type MemberScore = {
  points: number;
  [criterionId: string]: boolean | number;
}

export type ScoreInfo = {
  id: string;
  date: Date;
  memberScores: {
    [memberId: string]: MemberScore;
  }
}
