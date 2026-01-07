import type { Unit, Member } from './types';

const sampleMembers: Member[] = [
    { id: '1', name: 'João Silva', age: 14, role: 'Conselheiro', className: 'Guia' },
    { id: '2', name: 'Maria Souza', age: 12, role: 'Membro', className: 'Amigo' },
    { id: '3', name: 'Pedro Santos', age: 15, role: 'Capitão', className: 'Excursionista' },
];

export const initialUnits: Unit[] = [
  {
    id: 'monte-hope',
    name: 'Monte Hope',
    members: sampleMembers,
  },
  {
    id: 'monte-sinai',
    name: 'Monte Sinai',
    members: [],
  },
  {
    id: 'rubi',
    name: 'Rubi',
    members: [],
  },
  {
    id: 'sinai',
    name: 'Sinai',
    members: [],
  },
];
