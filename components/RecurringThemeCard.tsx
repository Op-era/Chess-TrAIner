console.log('Module loaded: components/RecurringThemeCard.tsx');
import React, { useState, useMemo, useEffect } from 'react';
import { RecurringTheme, MistakeExample } from '../types';
import Chessboard from './Chessboard';
import { Chess } from 'chess.js';

// Fix: Using a more specific Square type to align with chess.js's expectations.
// This provides better type safety and is consistent with the Chessboard component.
type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
type Square = `${File}${Rank}`;

interface RecurringThemeCardProps {
    theme: RecurringTheme;
}

const ExampleAnalysis: React.FC<{ example: MistakeExample }> = ({ example }) => {
    const [fen, setFen] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isInteractive, setIsInteractive] = useState(false);
    const [lastMove, setLastMove] = useState<{ from: string, to: string } | null>(null);
    const [status, setStatus] = useState<string>('Board is ready.');

    // This effect syncs the component's state with the example prop and validates the FEN.
    useEffect(() => {
        console.log('ExampleAnalysis: useEffect triggered for game:', example.gameDescription);
        try {
            // Validate the FEN from the AI before using it.
            console.log("ExampleAnalysis: Validating FEN from AI:", example.fenBeforeMove);
            new Chess(example.fenBeforeMove);
            setFen(example.fenBeforeMove);
            setStatus('Board is ready.');
            setError(null);
            console.log("ExampleAnalysis: FEN is valid.");
        } catch (e) {
            console.error("FATAL: Invalid FEN provided by AI:", example.fenBeforeMove, e);
            setFen(null);
            setError("The AI provided an invalid board position (FEN) for this example.");
        }
    }, [example.fenBeforeMove]);

    // useMemo safely creates a chess.js instance from the current FEN state.
    const game = useMemo(() => {
        if (!fen) {
            console.log("ExampleAnalysis: useMemo cannot create game, FEN is null.");
            return null;
        }
        try {
            console.log("ExampleAnalysis: useMemo creating new Chess instance with FEN:", fen);
            return new Chess(fen);
        } catch (e) {
            console.error("ExampleAnalysis: useMemo failed to create Chess instance:", e);
            // This case should be rare since we validate in the effect, but it's a good safeguard.
            return null;
        }
    }, [fen]);
    
    // Render an error message if the FEN was invalid.
    if (error) {
        return (
            <div className="bg-red-900/50 p-4 rounded-lg border border-red-700 text-red-300">
                <h5 className="font-bold">Error Loading Example</h5>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    // Render a loading state while the FEN is being processed.
    if (!game) {
        return (
            <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700 h-48 flex items-center justify-center">
                <p>Loading board...</p>
            </div>
        );
    }
    
    const handleMove = (move: { from: Square, to: Square, promotion?: string }) => {
        console.log("ExampleAnalysis: handleMove called with:", move);
        const tempGame = new Chess(fen!);
        try {
            const result = tempGame.move(move);
            if (result) {
                console.log("ExampleAnalysis: Move was legal. New FEN:", tempGame.fen());
                setFen(tempGame.fen());
                setLastMove({ from: result.from, to: result.to });
                
                let statusText = `You played ${result.san}. `;
                if (tempGame.isCheckmate()) {
                    statusText += 'Checkmate!';
                } else if (tempGame.isCheck()) {
                    statusText += 'Check!';
                } else if (tempGame.isStalemate()) {
                    statusText += 'Stalemate!';
                } else if (tempGame.isDraw()){
                    statusText += 'Draw!';
                }
                setStatus(statusText);
            } else {
                 console.log("ExampleAnalysis: Move was illegal (returned null).");
                 setStatus("That's an illegal move.");
            }
        } catch (e) {
            console.error("ExampleAnalysis: Error during move validation:", e);
            setStatus("That's an illegal move.");
        }
    };

    const showMyMove = () => {
        console.log("ExampleAnalysis: Showing user's move:", example.moveNotation);
        try {
            // Validate the after-move FEN as well before setting state
            console.log("ExampleAnalysis: Validating after-move FEN:", example.fenAfterMove);
            new Chess(example.fenAfterMove);
            setFen(example.fenAfterMove);
            
            // Determine the move from the FENs for highlighting
            const tempGame = new Chess(example.fenBeforeMove);
            const moveResult = tempGame.move(example.moveNotation);
            if (moveResult) {
                setLastMove({ from: moveResult.from, to: moveResult.to });
            }
            setIsInteractive(false);
            setStatus(`This is the move you played: ${example.moveNotation}.`);
        } catch(e) {
             console.error("FATAL: Invalid FEN for after-move state:", example.fenAfterMove, e);
            setStatus("Error: AI provided an invalid FEN for the resulting position.");
        }
    };

    const showBetterMove = () => {
        console.log("ExampleAnalysis: Showing better move:", example.suggestedMove);
        const tempGame = new Chess(example.fenBeforeMove);
        try {
            const moveResult = tempGame.move(example.suggestedMove);
            if (moveResult) {
                setFen(tempGame.fen());
                setLastMove({ from: moveResult.from, to: moveResult.to });
                setIsInteractive(false);
                setStatus(`A better move was ${example.suggestedMove}.`);
            } else {
                console.error("FATAL: AI suggested an illegal move:", example.suggestedMove, "from FEN:", example.fenBeforeMove);
                setStatus(`Error: AI suggested an illegal move: ${example.suggestedMove}`);
            }
        } catch(e) {
            console.error("FATAL: AI suggested an illegal move:", example.suggestedMove, "from FEN:", example.fenBeforeMove, e);
            setStatus(`Error: AI suggested an illegal move: ${example.suggestedMove}`);
        }
    };

    const resetBoard = () => {
        console.log("ExampleAnalysis: Resetting board.");
        setFen(example.fenBeforeMove);
        setIsInteractive(false);
        setLastMove(null);
        setStatus('Board has been reset.');
    };
    
    const playFromHere = () => {
        console.log("ExampleAnalysis: Unlocking board for interactive play.");
        setIsInteractive(true);
        setStatus('Board is unlocked. Play out the position!');
    }

    const orientation = example.playerColor === 'b' ? 'black' : 'white';

    return (
        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
            <p className="text-sm font-semibold text-slate-400 mb-2">{example.gameDescription}</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                    <p className="text-sm text-slate-400 mb-2 h-5">{status}</p>
                    <div className="w-full max-w-[280px] md:max-w-none aspect-square shadow-lg rounded-md overflow-hidden">
                        <Chessboard
                            game={game}
                            onMove={handleMove}
                            isInteractive={isInteractive}
                            lastMove={lastMove}
                            orientation={orientation}
                        />
                    </div>
                </div>
                <div className="space-y-4 flex flex-col justify-center">
                     <div>
                        <h5 className="font-semibold text-amber-400">Analysis of this position</h5>
                        <p className="text-slate-300 mb-4">{example.explanation}</p>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-sm">
                        <button onClick={showMyMove} className="p-2 rounded bg-red-800/50 hover:bg-red-700/50 transition">Show My Mistake: <span className="font-mono">{example.moveNotation}</span></button>
                        <button onClick={showBetterMove} className="p-2 rounded bg-green-800/50 hover:bg-green-700/50 transition">Show Better Move: <span className="font-mono">{example.suggestedMove}</span></button>
                        <button onClick={resetBoard} className="p-2 rounded bg-slate-600 hover:bg-slate-500 transition">Reset Board</button>
                        <button onClick={playFromHere} className="p-2 rounded bg-sky-600 hover:bg-sky-500 transition">Play From Here</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const RecurringThemeCard: React.FC<RecurringThemeCardProps> = ({ theme }) => {
    return (
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden ring-1 ring-white/10">
            <div className="p-4 sm:p-6 bg-slate-900/50">
                <h3 className="text-2xl font-bold text-sky-400">
                    Theme: {theme.title}
                </h3>
                <p className="mt-2 text-slate-300">{theme.description}</p>
            </div>
            
            <div className="p-4 sm:p-6">
                <h4 className="text-lg font-semibold text-slate-200 mb-4">Examples from your games:</h4>
                <div className="space-y-6">
                    {theme.examples.map((example, index) => (
                        <ExampleAnalysis key={index} example={example} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecurringThemeCard;