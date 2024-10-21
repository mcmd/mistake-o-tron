import { Chess } from 'chess.js';
import { Puzzle } from './puzzle';

export class Analysis {

  private readonly gameAnalysis

  constructor(gameAnalysis) {
    this.gameAnalysis = gameAnalysis;
  }

  aggregateMistakes(puzzles: Puzzle[]): Puzzle[] {
    const mistakeMap = new Map();

    puzzles.forEach(puzzle => {
      const key = `${puzzle.analysis.fen}-${puzzle.analysis.move.from}-${puzzle.analysis.move.to}`;
      if (!mistakeMap.has(key)) {
        mistakeMap.set(key, { puzzle, occurrences: 0, games: [] });
      }
      const entry = mistakeMap.get(key);
      entry.occurrences += 1;
      entry.games.push(puzzle.analysis.id);
    });

    return Array.from(mistakeMap.values()).map(entry => {
      entry.puzzle.analysis.occurrences = entry.occurrences;
      entry.puzzle.analysis.games = entry.games;
      return entry.puzzle;
    });
  }

  puzzles(player: string): Puzzle[] {
    const chess = new Chess()
    var fens : any[] = []
    this.gameAnalysis.moves.split(' ').forEach(x => {
     fens.push(chess.fen())
     chess.move(x)
    })
    let moves = chess.history({verbose: true})
    moves.forEach((move,i) => {
      if ((this.gameAnalysis.analysis[i]) && (this.gameAnalysis.analysis[i].judgment)) {
       const best = this.gameAnalysis.analysis[i].best;
       this.gameAnalysis.analysis[i].move = move
       this.gameAnalysis.analysis[i].halfMove = i+1
       this.gameAnalysis.analysis[i].fen = fens[i]
       this.gameAnalysis.analysis[i].best = {from:best.substring(0, 2), to:best.substring(2, 4)}
       this.gameAnalysis.analysis[i].speed = this.gameAnalysis.speed
       this.gameAnalysis.analysis[i].id = this.gameAnalysis.id
      }
    })
    var whiteUser = this.gameAnalysis.players.white.user
    var playerColour: string = (whiteUser && (whiteUser.id == player)) ? 'w':'b'
    const puzzles = this.gameAnalysis.analysis = this.gameAnalysis.analysis
      .filter(x => x.judgment)
      .filter(x => x.move.color == playerColour)
      .map(x => new Puzzle(x));

    return this.aggregateMistakes(puzzles);
  }
}
