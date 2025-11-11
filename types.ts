export interface MistakeExample {
    gameDescription: string;
    moveNumber: number;
    moveNotation: string;
    fenBeforeMove: string;
    fenAfterMove: string;
    suggestedMove: string;
    explanation: string;
    playerColor: 'w' | 'b';
}

export interface RecurringTheme {
    title: string;
    description: string;
    examples: MistakeExample[];
}

export interface MultiGameAnalysisReport {
    playerName: string;
    overallSummary: string;
    recurringThemes: RecurringTheme[];
}

export interface ChesscomGame {
    pgn: string;
    headers: { [key: string]: string };
}