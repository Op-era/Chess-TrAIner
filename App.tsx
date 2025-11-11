console.log('Module loaded: App.tsx');
import React, { useState, useCallback } from 'react';
import { MultiGameAnalysisReport, ChesscomGame } from './types';
import { analyzeMultipleGames } from './services/aiService';
import { getPlayerGames } from './services/chesscomService';
import RecurringThemeCard from './components/RecurringThemeCard';

const KnightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.625 16.5a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75Z" />
        <path fillRule="evenodd" d="M5.625 1.5a1.875 1.875 0 0 0-1.875 1.875v17.25c0 1.036.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a3.75 3.75 0 0 0-3.75-3.75V3.375c0-1.036-.84-1.875-1.875-1.875h-3.375ZM12.75 9a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75h-1.5Z" clipRule="evenodd" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M11.49 3.17a.75.75 0 0 1 1.02.625v1.284a.75.75 0 0 1-.582.723 8.242 8.242 0 0 1-2.316.362 8.242 8.242 0 0 1-2.316-.362A.75.75 0 0 1 6.716 5.08v-1.284a.75.75 0 0 1 1.02-.625A9.745 9.745 0 0 1 10 3c.96 0 1.894.136 2.784.401ZM2.5 7.116A.75.75 0 0 1 3.25 8h13.5a.75.75 0 0 1 0 1.5H3.25a.75.75 0 0 1-.75-.75V7.116ZM11.49 16.83a.75.75 0 0 1-1.02-.625v-1.284a.75.75 0 0 1 .582-.723 8.242 8.242 0 0 1 2.316-.362 8.242 8.242 0 0 1 2.316.362.75.75 0 0 1 .582.723v1.284a.75.75 0 0 1-1.02.625A9.745 9.745 0 0 1 10 17c-.96 0-1.894-.136-2.784-.401Z" clipRule="evenodd" />
    </svg>
);


const App: React.FC = () => {
    const [chesscomUsername, setChesscomUsername] = useState<string>('');
    const [games, setGames] = useState<ChesscomGame[]>([]);
    const [selectedGameIndexes, setSelectedGameIndexes] = useState<number[]>([]);
    
    const [ollamaUrl, setOllamaUrl] = useState<string>('http://localhost:11434');
    const [ollamaModel, setOllamaModel] = useState<string>('llama3');
    const [showSettings, setShowSettings] = useState<boolean>(false);

    const [analysisReport, setAnalysisReport] = useState<MultiGameAnalysisReport | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleFetchGames = useCallback(async () => {
        console.log('Attempting to fetch games for username:', chesscomUsername);
        if (!chesscomUsername.trim()) {
            setError('Please enter a Chess.com username.');
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Fetching recent games...');
        setError(null);
        setGames([]);
        setSelectedGameIndexes([]);
        setAnalysisReport(null);

        try {
            const fetchedGames = await getPlayerGames(chesscomUsername);
            console.log('Successfully fetched games:', fetchedGames);
            setGames(fetchedGames);
            if(fetchedGames.length === 0) {
                setError(`No recent games found for ${chesscomUsername}. Make sure the username is correct and the user has played games recently.`);
            }
        } catch (err) {
            console.error('handleFetchGames caught an error:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching games.');
        } finally {
            setIsLoading(false);
            console.log('Finished fetching games.');
        }
    }, [chesscomUsername]);
    
    const handleAnalyze = useCallback(async () => {
        const pgnsToAnalyze = selectedGameIndexes.map(index => games[index].pgn);
        console.log(`Analyzing ${pgnsToAnalyze.length} selected games.`);
        if (pgnsToAnalyze.length === 0) {
            setError('Please select at least one game to analyze.');
            return;
        }

        setIsLoading(true);
        setLoadingMessage(`AI is analyzing ${pgnsToAnalyze.length} game(s)... this may take a while.`);
        setError(null);
        setAnalysisReport(null);

        try {
            const report = await analyzeMultipleGames(pgnsToAnalyze, chesscomUsername, ollamaUrl, ollamaModel);
            console.log('Successfully received analysis report:', report);
            setAnalysisReport(report);
        } catch (err) {
            console.error('handleAnalyze caught an error:', err);
            setError('Failed to analyze games. Make sure your Ollama server is running and the model is available. Please check the console for more details and try again.');
        } finally {
            setIsLoading(false);
            console.log('Finished analysis process.');
        }
    }, [selectedGameIndexes, games, chesscomUsername, ollamaUrl, ollamaModel]);

    const getGameDisplayName = (game: ChesscomGame): string => {
        const white = game.headers.White || 'N/A';
        const black = game.headers.Black || 'N/A';
        const result = game.headers.Result || '?';
        const date = game.headers.Date || '????.??.??';
        return `${date} - ${white} vs ${black} (${result})`;
    };
    
    const handleGameSelection = (index: number) => {
      setSelectedGameIndexes(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 flex items-center justify-center gap-3">
                        <KnightIcon /> Chess AI Trainer
                    </h1>
                    <p className="mt-2 text-lg text-slate-400">
                        Analyze multiple games to find your recurring mistakes with local AI.
                    </p>
                </header>

                <main>
                    <div className="bg-slate-800/50 rounded-lg shadow-xl p-6 ring-1 ring-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label htmlFor="chesscom-username" className="block text-sm font-medium text-slate-300 mb-1">Chess.com Username</label>
                                <input
                                    type="text"
                                    id="chesscom-username"
                                    value={chesscomUsername}
                                    onChange={(e) => setChesscomUsername(e.target.value)}
                                    placeholder="e.g., hikaru"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm p-3 text-slate-200 focus:ring-sky-500 focus:border-sky-500 transition"
                                    onKeyDown={(e) => e.key === 'Enter' && handleFetchGames()}
                                />
                            </div>
                            <button
                                onClick={handleFetchGames}
                                disabled={isLoading}
                                className="w-full h-12 flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            >
                                Fetch Games
                            </button>
                        </div>

                        {games.length > 0 && (
                             <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Select games to analyze ({selectedGameIndexes.length} selected)</label>
                                <div className="max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-md p-2 space-y-1">
                                    {games.map((game, index) => (
                                        <div key={index} 
                                             onClick={() => handleGameSelection(index)}
                                             className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${selectedGameIndexes.includes(index) ? 'bg-sky-800/50' : 'hover:bg-slate-700/50'}`}>
                                            <input
                                                type="checkbox"
                                                id={`game-${index}`}
                                                readOnly
                                                checked={selectedGameIndexes.includes(index)}
                                                className="pointer-events-none h-4 w-4 rounded border-slate-500 bg-slate-700 text-sky-600 focus:ring-sky-500"
                                            />
                                            <label htmlFor={`game-${index}`} className="ml-3 block text-sm font-medium text-slate-300 truncate cursor-pointer">
                                                {getGameDisplayName(game)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-6 border-t border-slate-700 pt-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isLoading || selectedGameIndexes.length === 0}
                                        className="w-full sm:w-auto flex-grow items-center justify-center gap-2 px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                                    >
                                        Analyze
                                        {selectedGameIndexes.length > 0 && 
                                            ` ${selectedGameIndexes.length} ${selectedGameIndexes.length === 1 ? 'Game' : 'Games'}`
                                        }
                                    </button>
                                     {isLoading && (
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <svg className="animate-spin h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>{loadingMessage}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 rounded-md hover:bg-slate-700 text-slate-400"
                                    aria-label="Toggle Ollama Settings"
                                >
                                    <SettingsIcon />
                                </button>
                            </div>
                        </div>

                        {showSettings && (
                            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-200 mb-3">Ollama Settings</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="ollama-url" className="block text-sm font-medium text-slate-300 mb-1">Server URL</label>
                                        <input
                                            type="text"
                                            id="ollama-url"
                                            value={ollamaUrl}
                                            onChange={(e) => setOllamaUrl(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm p-2 text-slate-200 focus:ring-sky-500 focus:border-sky-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="ollama-model" className="block text-sm font-medium text-slate-300 mb-1">Model Name</label>
                                        <input
                                            type="text"
                                            id="ollama-model"
                                            value={ollamaModel}
                                            onChange={(e) => setOllamaModel(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm p-2 text-slate-200 focus:ring-sky-500 focus:border-sky-500 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {analysisReport && (
                        <div className="mt-8">
                            <div className="bg-slate-800/50 rounded-lg shadow-lg p-6 ring-1 ring-white/10 mb-6">
                                <h2 className="text-2xl font-bold text-sky-400 mb-2">Grandmaster Summary for {analysisReport.playerName}</h2>
                                <p className="text-slate-300 whitespace-pre-wrap">{analysisReport.overallSummary}</p>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-center mb-6 text-slate-100">Recurring Themes Analysis</h2>
                                <div className="space-y-8">
                                    {analysisReport.recurringThemes.map((theme, index) => (
                                       <RecurringThemeCard key={index} theme={theme} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;