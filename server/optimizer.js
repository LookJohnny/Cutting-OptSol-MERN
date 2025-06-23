function optimizeCuts(boardLength, cuts) {
  const allPieces = [];
  cuts.forEach(({ length, quantity }) => {
    for (let i = 0; i < quantity; i++) {
      allPieces.push(length);
    }
  });

  allPieces.sort((a, b) => b - a);

  const boards = [];

  for (const piece of allPieces) {
    let placed = false;
    for (const board of boards) {
      const used = board.reduce((a, b) => a + b, 0);
      if (used + piece <= boardLength) {
        board.push(piece);
        placed = true;
        break;
      }
    }
    if (!placed) {
      boards.push([piece]);
    }
  }

  return {
    totalBoards: boards.length,
    boards: boards
  };
}

module.exports = { optimizeCuts };
