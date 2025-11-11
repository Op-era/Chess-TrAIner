console.log('Module loaded: components/Chessboard.tsx');
import React, { useState, useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Pawn, Rook, Knight, Bishop, Queen, King } from './icons/pieces';

// Fix: Using a more specific Square type to align with chess.js's expectations.
// This provides better type safety and fixes errors with chess.js methods.
type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
type Square = `${File}${Rank}`;

interface ChessboardProps {
    game: Chess;
    onMove: (move: { from: Square; to: Square; promotion?: string }) => void;
    orientation?: 'white' | 'black';
    isInteractive: boolean;
    lastMove?: { from: string, to: string } | null;
}

const pieceMap: { [key: string]: React.FC<{ pieceColor: 'white' | 'black' }> } = {
    p: (props) => <Pawn {...props} />,
    r: (props) => <Rook {...props} />,
    n: (props) => <Knight {...props} />,
    b: (props) => <Bishop {...props} />,
    q: (props) => <Queen {...props} />,
    k: (props) => <King {...props} />,
};


const Chessboard: React.FC<ChessboardProps> = ({ game, onMove, orientation = 'white', isInteractive, lastMove }) => {
    const [fromSquare, setFromSquare] = useState<Square | null>(null);
    
    const board = useMemo(() => {
        console.log("Chessboard: Recomputing board from FEN:", game.fen());
        return game.board();
    }, [game.fen()]);

    const validMoves = useMemo(() => {
        if (!fromSquare) return [];
        const moves = game.moves({ square: fromSquare, verbose: true });
        console.log(`Chessboard: Valid moves for ${fromSquare}:`, moves.map(m => m.to));
        return moves.map(move => move.to as Square);
    }, [fromSquare, game.fen()]);

    const handleSquareClick = useCallback((square: Square) => {
        console.log(`Chessboard: Clicked square ${square}. Interactive: ${isInteractive}. From square: ${fromSquare}`);
        if (!isInteractive) return;

        if (fromSquare) {
            const move = {
                from: fromSquare,
                to: square,
                promotion: 'q' // Let parent handle promotion logic
            };
            console.log("Chessboard: Attempting move:", move);
            onMove(move); // Notify parent of the attempted move
            setFromSquare(null); // Deselect after attempting a move
        } else {
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                console.log(`Chessboard: Selected piece ${piece.type} at ${square}`);
                setFromSquare(square);
            } else {
                console.log(`Chessboard: Invalid selection at ${square}. Piece:`, piece, "Turn:", game.turn());
            }
        }
    }, [fromSquare, game, onMove, isInteractive]);
    
    const ranks = orientation === 'white' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];
    const files = orientation === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

    return (
        <div className="w-full aspect-square grid grid-cols-8 grid-rows-8 shadow-2xl relative select-none">
            {ranks.map((rank, rowIndex) =>
                files.map((file, colIndex) => {
                    const square = `${file}${rank}` as Square;
                    const piece = board[rowIndex][colIndex];
                    const isLight = (ranks.indexOf(rank) + files.indexOf(file)) % 2 !== 0;
                    const squareColor = isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';
                    const isSelected = fromSquare === square;
                    const isLastMove = lastMove?.from === square || lastMove?.to === square;
                    const isPossibleMove = validMoves.includes(square);
                    
                    // CRITICAL FIX: The piece type from chess.js can be uppercase (e.g., 'P' for a white pawn).
                    // The pieceMap keys are lowercase. Converting to lowercase prevents a crash when rendering.
                    const PieceComponent = piece ? pieceMap[piece.type.toLowerCase()] : null;

                    return (
                        <div
                            key={square}
                            onClick={() => handleSquareClick(square)}
                            className={`flex items-center justify-center relative ${squareColor} ${isInteractive ? 'cursor-pointer' : ''}`}
                        >
                            {isLastMove && <div className="absolute inset-0 bg-yellow-400/50"></div>}
                            {isSelected && <div className="absolute inset-0 bg-green-500/50"></div>}

                            {piece && PieceComponent && (
                                <div className="w-full h-full p-1 relative z-10">
                                    <PieceComponent pieceColor={piece.color === 'w' ? 'white' : 'black'} />
                                </div>
                            )}

                             {isPossibleMove && (
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <div className="w-1/3 h-1/3 bg-green-500/50 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default Chessboard;