console.log('Module loaded: services/chesscomService.ts');
import { ChesscomGame } from '../types';

const CHESSCOM_API_BASE = 'https://api.chess.com/pub';

/**
 * Extracts headers from a single PGN string.
 * @param pgn The PGN string for a single game.
 * @returns An object containing the game's headers.
 */
function getHeadersFromPgn(pgn: string): { [key: string]: string } {
    const headers: { [key: string]: string } = {};
    const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g;
    let match;
    // We only need to search the top part of the PGN for headers.
    const headerBlock = pgn.split('\n\n')[0];
    
    while ((match = headerRegex.exec(headerBlock)) !== null) {
        headers[match[1]] = match[2];
    }
    return headers;
}

/**
 * Fetches the most recent games for a given Chess.com username using the robust JSON endpoint.
 * @param username The Chess.com username.
 * @returns A promise that resolves to an array of ChesscomGame objects.
 */
export const getPlayerGames = async (username: string): Promise<ChesscomGame[]> => {
    try {
        // 1. Get the list of monthly archives.
        const archivesUrl = `${CHESSCOM_API_BASE}/player/${username}/games/archives`;
        console.log(`DEBUG: Fetching archives from: ${archivesUrl}`);
        const archivesResponse = await fetch(archivesUrl);
        if (!archivesResponse.ok) {
            if (archivesResponse.status === 404) {
                 throw new Error(`Chess.com user '${username}' not found.`);
            }
            throw new Error(`Failed to fetch game archives for ${username}. Status: ${archivesResponse.status}`);
        }
        const archivesData = await archivesResponse.json();
        const archiveUrls: string[] = archivesData.archives;
        console.log(`DEBUG: Found ${archiveUrls.length} monthly archives.`);

        if (!archiveUrls || archiveUrls.length === 0) {
            return []; // No archives found.
        }

        // 2. Get the URL of the most recent month's archive.
        const latestArchiveUrl = archiveUrls[archiveUrls.length - 1];
        console.log(`DEBUG: Fetching games JSON from latest archive: ${latestArchiveUrl}`);

        // 3. Fetch the JSON data for that entire month. This is the robust method.
        const gamesListResponse = await fetch(latestArchiveUrl);
        if (!gamesListResponse.ok) {
            throw new Error(`Failed to fetch game data from ${latestArchiveUrl}. Status: ${gamesListResponse.status}`);
        }
        const gamesListData = await gamesListResponse.json();
        
        // The API returns an object with a "games" key, which is an array.
        const gamesData = gamesListData.games || [];
        console.log(`DEBUG: Found ${gamesData.length} games in the latest monthly archive.`);
        
        // 4. Process the structured data.
        const processedGames: ChesscomGame[] = gamesData.map((game: any) => {
            const pgn = game.pgn;
            // The PGN from the API might not have all headers if the game is ongoing,
            // but the main game object has the player names. We can reconstruct a basic header.
            const headers = getHeadersFromPgn(pgn);
            if (!headers.White) headers.White = game.white.username;
            if (!headers.Black) headers.Black = game.black.username;
            if (!headers.Result) headers.Result = game.white.result === 'win' ? '1-0' : game.black.result === 'win' ? '0-1' : '1/2-1/2';
            
            return { pgn, headers };
        });

        // The games in the archive are typically ordered from oldest to newest. Reverse them.
        return processedGames.reverse();

    } catch (error) {
        console.error('FATAL ERROR in getPlayerGames:', error);
        // Add more specific error messages for common issues.
        if (error instanceof TypeError && error.message.includes('fetch')) {
             throw new Error('A network error occurred. Please check your connection or if a content blocker is interfering.');
        }
        throw error; // Re-throw the error to be handled by the UI.
    }
};
