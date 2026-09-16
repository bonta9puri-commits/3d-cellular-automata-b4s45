/**
 * 3D Wireworld Core Engine
 * 
 * States:
 *  0: Empty (空間)
 *  1: Conductor (導線)
 *  2: Electron Head (電子の頭)
 *  3: Electron Tail (電子の尾)
 */

class Wireworld3D {
  constructor() {
    // Map of "x,y,z" -> state (1, 2, 3)
    this.cells = new Map();
  }

  setCell(x, y, z, state) {
    const key = `${x},${y},${z}`;
    if (state === 0) {
      this.cells.delete(key);
    } else {
      this.cells.set(key, state);
    }
  }

  getCell(x, y, z) {
    const key = `${x},${y},${z}`;
    return this.cells.get(key) || 0;
  }

  step() {
    const nextCells = new Map();

    // Collect all cells that might change
    for (const [key, state] of this.cells.entries()) {
      if (state === 2) {
        // Head -> Tail
        nextCells.set(key, 3);
      } else if (state === 3) {
        // Tail -> Conductor
        nextCells.set(key, 1);
      } else if (state === 1) {
        // Conductor -> check heads in 26-neighborhood
        const [x, y, z] = key.split(',').map(Number);
        let headCount = 0;

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dz = -1; dz <= 1; dz++) {
              if (dx === 0 && dy === 0 && dz === 0) continue;
              if (this.getCell(x + dx, y + dy, z + dz) === 2) {
                headCount++;
                if (headCount > 2) break; // Rule: exactly 1 or 2 heads
              }
            }
            if (headCount > 2) break;
          }
          if (headCount > 2) break;
        }

        if (headCount === 1 || headCount === 2) {
          nextCells.set(key, 2); // Ignite to Electron Head
        } else {
          nextCells.set(key, 1); // Stay Conductor
        }
      }
    }

    this.cells = nextCells;
  }

  // Helper to add a straight wire
  addWire(x1, y1, z1, x2, y2, z2) {
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    const dz = Math.sign(z2 - z1);
    const len = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), Math.abs(z2 - z1));

    let cx = x1, cy = y1, cz = z1;
    for (let i = 0; i <= len; i++) {
      this.setCell(cx, cy, cz, 1);
      cx += dx;
      cy += dy;
      cz += dz;
    }
  }

  // Export current active cells
  exportCells() {
    const result = [];
    for (const [key, state] of this.cells.entries()) {
      const [x, y, z] = key.split(',').map(Number);
      result.push({ pos: [x, y, z], state });
    }
    return result;
  }
}

if (typeof module !== 'undefined') {
  module.exports = Wireworld3D;
}
