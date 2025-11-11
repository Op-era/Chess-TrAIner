console.log('Module loaded: components/icons/pieces.tsx');
import React from 'react';

interface PieceProps {
  pieceColor: 'white' | 'black';
}

const pieceStyles = {
  white: {
    fill: '#f2f2f2',
    stroke: '#333333',
  },
  black: {
    fill: '#4a3a2a',
    stroke: '#1a1a1a',
  },
};

export const Pawn: React.FC<PieceProps> = ({ pieceColor }) => (
  <svg viewBox="0 0 45 45"><g {...pieceStyles[pieceColor]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.5 11.63V6M22.5 25s4.5-7.5 3-10.5c0 0-1.5-3-3-3s-3 3-3 3c-1.5 3 3 10.5 3 10.5" strokeLinecap="butt" /><path d="M22.5 25v13.5M12 38.5h21" strokeLinecap="butt" strokeMiterlimit="1.5" /></g></svg>
);

export const Rook: React.FC<PieceProps> = ({ pieceColor }) => (
  <svg viewBox="0 0 45 45"><g {...pieceStyles[pieceColor]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt" /><path d="M34 14l-3 3H14l-3-3" /><path d="M31 17v12.5H14V17" strokeLinecap="butt" strokeMiterlimit="1.5" /><path d="M31 29.5l1.5 2.5h-20l1.5-2.5" /><path d="M14 17h17" fill="none" strokeMiterlimit="1.5" /></g></svg>
);

export const Knight: React.FC<PieceProps> = ({ pieceColor }) => (
  <svg viewBox="0 0 45 45"><g {...pieceStyles[pieceColor]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c-2 0-9-1.5-9-11 0-5 4-11 8-11 3 0 5 3 5 3s2.5-3 7-3c3 0 5 3 5 3" /><path d="M24 18c.5-2.5 2.5-5 2.5-5-1-2-2-3-2-3s-1.5-1-3.5-1c-2 0-5.5 1.5-5.5 4.5 0 2 1.5 3.5 1.5 3.5-1.5 1-1.5 2.5-1.5 2.5-2.5 2.5-3 4.5-3 4.5s-2 2-2.5 3c-.5 1 0 3 0 3" strokeLinecap="butt" /></g></svg>
);

export const Bishop: React.FC<PieceProps> = ({ pieceColor }) => (
  <svg viewBox="0 0 45 45"><g {...pieceStyles[pieceColor]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 36h27v3H9v-3zM12 33h21v3H12v-3zM15 30h15v3H15v-3zM22.5 8.5l-4 4" strokeLinecap="butt" /><path d="M22.5 25c-3 0-6-2-6-5.5s3-5.5 6-5.5 6 2 6 5.5-3 5.5-6 5.5zM19.5 14.5l-3 3" strokeLinecap="butt" /><path d="M22.5 8.5c2.5-1.5 5.5-1.5 8 0" /><path d="M16.5 14.5c-2.5-1.5-5.5-1.5-8 0" /><path d="M16.5 14.5l6-6 6 6" /><path d="M16.5 14.5s-3 3-3 10c0 0 2 1.5 3 1.5M22.5 25s1.5-1.5 1.5-10c0-7-1.5-10-1.5-10M22.5 25s3 1.5 3-1.5c0-1-1.5-10-1.5-10" /><path d="M28.5 14.5s3 3 3 10c0 0-2 1.5-3 1.5" /></g></svg>
);

export const Queen: React.FC<PieceProps> = ({ pieceColor }) => (
  <svg viewBox="0 0 45 45"><g {...pieceStyles[pieceColor]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM12 25h21v-7H12v7zM12 18l5-6 5 6-5-5-5 5" /><path d="M22.5 13l5-6m-10 0l5 6" /><path d="M33 18l-5-6-5 6 5-5 5 5" /><path d="M12 39h21v-3H12v3zM15 36v-6h15v6H15z" /></g></svg>
);

export const King: React.FC<PieceProps> = ({ pieceColor }) => (
  <svg viewBox="0 0 45 45"><g {...pieceStyles[pieceColor]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.5 11.63V6M20 8h5" /><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1.5-3-3-3s-3 3-3 3c-1.5 3 3 10.5 3 10.5" strokeLinecap="butt" /><path d="M12 38.5h21M12 38.5C12 35 12 32 12 32c0-3 6-4.5 10.5-4.5s10.5 1.5 10.5 4.5c0 0 0 3 0 6.5" /><path d="M22.5 27.5l-5.5-3-1 15.5h13l-1-15.5-5.5 3" strokeLinecap="butt" strokeMiterlimit="1.5" /></g></svg>
);