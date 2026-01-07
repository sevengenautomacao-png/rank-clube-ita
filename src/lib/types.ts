export type Member = {
  id: string;
  name: string;
  age: number;
  role: string; // 'funcao/cargo'
  className: string; // 'classe'
  score?: number;
};

export type Unit = {
  id: string;
  name: string;
  members: Member[];
  cardImageUrl?: string;
  cardColor?: string;
  icon: string;
};
