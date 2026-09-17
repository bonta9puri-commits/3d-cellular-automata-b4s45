# 🌌 3D Cellular Automata: Particle Physics & Experimental Logic Circuits (B4/S45)

[![Rule](https://img.shields.io/badge/Rule-B4%2FS45-blue.svg)](https://github.com/)
[![Neighborhood](https://img.shields.io/badge/Neighborhood-Moore%2026-green.svg)](https://github.com/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen.svg)](https://github.com/)
[![Status](https://img.shields.io/badge/Status-Exploratory%20Research-orange.svg)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **No artificial bounding walls. No cheating coordinate hacks. Pure 3D Cellular Automata simulation.**  
> A collection of experimental observations, collision physics, and 3D interactive simulators exploring glider dynamics and candidate logic circuits in Moore 26-neighborhood B4/S45.

---

## 📖 Overview (概要)

In Conway's 2D Game of Life (`B3/S23`), gliders and logic circuits are well-studied.  
This experimental playground explores **B4/S45 in 3D Moore 26-neighborhood**, documenting interesting physical phenomena observed during computational search:

1. **7-Cell Glider Dynamics**: Autonomous spaceships gliding in vacuum ($v = c/4$, period 4 breathing cycle: $7 \to 8 \to 7 \to 6 \to 7$).
2. **Collision Crystallization (SET)**: Two gliders collide head-on and condense into a static 6-cell cubic crystal (Still Life).
3. **Direct-Hit Annihilation (RESET)**: A bullet hits the crystal, causing a rapid collapse into 0 cells (vacuum) in 8 steps.
4. **Experimental 1+1 Half Adder**: A prototype arithmetic demonstration where destructive collision mimics XOR, and crystallization acts as a Carry latch.
5. **Candidate NOR Logic Gate**: Exploring whether 3-body glider interactions in unified coordinates can approximate universal logic gates.

---

## 🚀 Interactive 3D Web Viewers (ブラウザ体験)

All simulators run in standard web browsers using Vanilla HTML5 + Three.js (**Zero build steps, Zero external npm dependencies**).

| Studio / Viewer | Description | File |
| :--- | :--- | :--- |
| **🌌 3D Spatial Word Search** | Non-Vector Nearest Neighbor: compares words and ranks similarity via 3D annihilation. | `spatial_word_search_3d.html` |
| **🌌 3D Multi-Particle & Crystal Lab** | Photon gliders ($v=c$), breathing gliders, and 8/16/20-cell crystal states. | `multi_particle_lab_3d.html` |
| **🌌 3D Spatial Char Scanner** | Non-Vector Language Matcher: computes Hamming distance via 3D glider annihilation. | `spatial_char_scanner_3d.html` |
| **🎛️ Logic Gates Studio** | Interactive 3D simulator for candidate gates (**NOR**, **NOT**, **AND**, **OR**, **XOR**). | `logic_gates_3d_viewer.html` |
| **🧮 1+1 Half Adder Studio** | Experimental dual-glider $1+1 = 2$ ($10_{(2)}$) collision viewer. | `half_adder_3d_viewer.html` |
| **📂 Universal JSON Viewer** | Drag-and-drop any CA simulation JSON, customize 8 color themes, gradients, and scrub timeline. | `universal_json_viewer.html` |
| **🌌 Particle Physics Museum** | Camera tracking of gliding particles, head-on crystallization, and clean evaporation. | `pure_particle_physics.html` |
| **🧬 Replicator Gallery** | 15-cell organic meta-splitter ($1 \to 2 \to 4 \to 8 \to 16$), chiral twists, and screw replicators. | `t8_organic_viewer.html` |
| **🏛️ Portal Hub** | Central portal linking all tools, research scripts, and experimental logs. | `index.html` |

---

## 🔬 Experimental Observations & Circuit Prototypes

### 1. 🪶 7-Cell Breathing Glider (自走粒子)
A compact 7-cell spaceship gliding diagonally in vacuum.
- **Direction**: $(\Delta X, \Delta Z) = (-1, +1)$
- **Speed**: $v = c/4$ (1 grid per 4 steps)
- **Breathing Sequence**: $7 \to 8 \to 7 \to 6 \to 7$ cells
```json
[[0,0,0], [0,1,0], [0,2,0], [0,1,1], [1,0,1], [1,1,1], [1,2,1]]
```

---

### 2. 💎 Collision Crystallization (結晶化)
Head-on collision of two gliders at offset `[-5, -3, 7]` halts motion and forges a **6-cell cubic still life**:
$$14 \xrightarrow{t=5} 16 \xrightarrow{t=10} 20 \xrightarrow{t=15} \mathbf{6\text{ cells (Stable Crystal)}}$$
The crystal coordinates: `[[-3,-1,3], [-3,0,3], [-2,-1,4], [-2,0,3], [-2,0,4], [-3,-1,4]]`.

---

### 3. 💥 Direct-Hit Annihilation (対消滅 / リセット)
Firing a 7-cell glider into the 6-cell crystal triggers a cascading overpopulation collapse, clearing both objects to **0 cells (pure vacuum)** in 8 steps:
$$13 \xrightarrow{t=2} 7 \xrightarrow{t=4} 14 \xrightarrow{t=6} 9 \xrightarrow{t=7} 2 \xrightarrow{t=8} \mathbf{0\text{ cells (Clean Vacuum)}}$$

---

### 4. 🧮 1+1 Half Adder Simulation (半加算器の実験)
An exploratory setup that matches the Half Adder truth table via particle collisions:
| Input $A$ | Input $B$ | Sum ($A \oplus B$) | Carry ($A \cdot B$) | Binary | Physical Event in Simulation |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **0** | **0** | 0 | 0 | $00_{(2)} = 0$ | Vacuum (no cells) |
| **1** | **0** | **1** | 0 | $01_{(2)} = 1$ | Glider A cruises to Sum zone |
| **0** | **1** | **1** | 0 | $01_{(2)} = 1$ | Glider B cruises to Sum zone |
| **1** | **1** | 0 | **1** | **$10_{(2)} = 2$** | **Collision: Straight wave quenched, Carry crystal forged!** |

---

### 5. 👑 Candidate Universal NOR Gate (NORゲートの実験・検証)
In an experimental fixed coordinate layout, a candidate **NOR gate** configuration was tested:
- Control Glider $C$: Always fired towards the output detector.
- Port $A$: Offset `[-5, -2, 7]`
- Port $B$: Offset `[-2, 2, 2]`
- **Observed Behavior**:
  - $0 \text{ NOR } 0 = \mathbf{1}$ (Glider $C$ reaches detector)
  - $1 \text{ NOR } 0 = \mathbf{0}$ (Glider $A$ annihilates $C$)
  - $0 \text{ NOR } 1 = \mathbf{0}$ (Glider $B$ annihilates $C$)
  - $1 \text{ NOR } 1 = \mathbf{0}$ (3-body interaction yields 0 cells at detector)

*Note: While these 4 states match the NOR truth table in isolation, cascading multiple gates, signal fan-out, and autonomous clocking remain active open research topics.*

---

### 6. 🌌 Non-Vector 3D Spatial Language Matcher ($2^3$ Character Distance Scanner)
A spatial computing paradigm that measures similarity/distance between characters or bytes **without vector dot-products or matrix embeddings**:
- **Representation**: A byte (8 bits, ASCII) is mapped to an orthogonal $2^3$ lattice of 8 glider lanes.
- **Physical Annihilation (XOR)**: Two characters $A$ and $B$ are fired head-on. Identical bits collide and annihilate to pure vacuum (0 cells); mismatched bits pass through unobstructed.
- **Hamming Distance Output**:
  $$\text{Distance}(A, B) = N_{\text{surviving gliders}} = \sum_{i=0}^7 (A_i \oplus B_i)$$
  - Identical characters (e.g. `'A'` vs `'A'`) result in **total vacuum annihilation (Distance = 0)**.
  - 1-bit difference (e.g. `'A'` vs `'C'`, or `'A'` vs `'a'`) results in **exactly 1 surviving glider**.

---

### 7. ⚡ Multi-Particle Physics & Novel Crystal States (多粒子物理と新種結晶)
Computational search across 50,000 randomized configurations revealed rich multi-particle dynamics in B4/S45:
- **8-Cell Photon Glider**: A rigid spaceship travelling at the theoretical speed of light ($v = c = 1.0$), with period 1 and unchanging cell count ($8 \to 8 \to 8$).
  ```json
  [[0,0,0], [0,0,1], [0,3,0], [0,3,1], [2,1,0], [2,1,1], [2,2,0], [2,2,1]]
  ```
- **Collision-Induced Multi-State Crystals**:
  - Head-on collision of photon gliders at offset `[15, -2, -1]` synthesizes an **8-cell still life**.
  - Collision at offset `[15, -3, -3]` synthesizes a **16-cell still life**.
  - Collision at offset `[14, -2, 0]` synthesizes a **20-cell complex still life**.
- **Heterogeneous Annihilation**: Cross-collision between a speed-$c$ photon glider and a speed-$c/4$ breathing glider achieves complete clean annihilation into **0 cells (pure vacuum)** in 18 distinct geometries.

---

### 8. 🔍 Non-Vector Word Nearest-Neighbor Search (単語の最近傍探索 / 空間RAG)
Replaces embedding vector databases and dot-product matrix multiplication with 3D spatial particle annihilation:
- Multiple characters are encoded as parallel spatial packet trains along the $Z$-axis.
- Query word (e.g. `CAT`) collides head-on against candidate words (`BAT`, `CAR`, `DOG`).
- Matching characters/bits annihilate to pure vacuum; the candidate with the **fewest surviving gliders** is physically identified as the **nearest neighbor (Best Match)**:
  $$\text{Nearest Neighbor} = \arg\min_{\text{word}} N_{\text{surviving gliders}}(\text{Query}, \text{word})$$
- Verified ranking: `CAT` matches `BAT` (1 glider) $<$ `CAR` (2 gliders) $<$ `DOG` (9 gliders).

---

## 🛠️ Verification & Toolkit (検証とツール)

### Automated Test Suite (Node.js)
```bash
# Zero external packages. Runs locally in < 1 sec.
node test_suite.js
```

### Start Local Web Server
```bash
node server.js
# Open http://localhost:3000 in your browser
```

### Python 3 Research Toolkit
```bash
python b4s45_researcher_toolkit.py
```
Includes 48-symmetry ($O_h$) canonical normalization, 26-connectivity clustering, and multi-rule switching.

---

## 📂 Repository Structure

```text
├── B4S45_CELLULAR_PHYSICS_SPEC_SHEET.md  # Research spec sheet for LifeWiki / Forum
├── PAPER_DRAFT.md                       # Exploratory research notes & paper draft
├── index.html                           # Portal Hub
├── logic_gates_3d_viewer.html           # 3D Logic Gates Interactive Studio
├── half_adder_3d_viewer.html            # 1+1 Half Adder 3D Simulator
├── universal_json_viewer.html           # Universal JSON Viewer & Color Customizer
├── pure_particle_physics.html           # Particle Physics Museum
├── test_suite.js                        # Master automated verification test suite
├── server.js                            # Zero-dependency local web server
│
├── gate_nor_universal.json              # Candidate universal NOR gate JSON
├── gate_not_inverter.json               # NOT inverter JSON
├── gate_and_crystal.json                # AND crystal JSON
├── pure_half_adder_1plus1.json          # 1+1 half adder JSON
└── pure_logic_gates_data.json           # Logic gates simulation dataset
```

---

## 📜 License
This project is open-source under the **MIT License**. Contributions, feedback, and further explorations are warmly welcome!
