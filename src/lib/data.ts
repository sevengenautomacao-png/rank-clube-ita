import type { Unit, Member } from './types';

const sampleMembers: Member[] = [
    { id: '1', name: 'João Silva', age: 14, role: 'Conselheiro', className: 'Guia', score: 85 },
    { id: '2', name: 'Maria Souza', age: 12, role: 'Membro', className: 'Amigo', score: 92 },
    { id: '3', name: 'Pedro Santos', age: 15, role: 'Capitão', className: 'Excursionista', score: 78 },
];

export const initialUnits: Unit[] = [
  {
    id: 'monte-hope',
    name: 'Monte Hope',
    members: sampleMembers,
    cardImageUrl: 'https://picsum.photos/seed/1/600/400',
    icon: 'Shield',
  },
  {
    id: 'monte-sinai',
    name: 'Monte Sinai',
    members: [],
    cardColor: 'bg-blue-900',
    icon: 'Mountain',
  },
  {
    id: 'rubi',
    name: 'Rubi',
    members: [],
    cardImageUrl: 'https://picsum.photos/seed/2/600/400',
    icon: 'Gem',
  },
  {
    id: 'sinai',
    name: 'Sinai',
    members: [],
    cardColor: 'bg-purple-900',
    icon: 'BookOpen',
  },
];
