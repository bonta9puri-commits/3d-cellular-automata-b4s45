"""
🌌 3D Cellular Automata Multi-Rule Researcher's Search Toolkit (Python 3)
=========================================================================
外部依存関係ゼロ (Standard library only, no pip install required) で動作する探索エンジン。
コピペして `python b4s45_researcher_toolkit.py` とするだけで即実行可能！

【収録機能】
1. 任意ルール対応 3D Moore 26近傍スパースCAシミュレータ (B.../S...)
2. 立方体対称群 Oh (48対称性) の正規化ハッシュ・合同判定
3. 26連結成分分解 (BFS クラスタリング)
4. 歴代の有望ルール＆代表構造体カタログ (Historic Promising Rules & Seeds):
   - B4/S45: 7セル呼吸グライダー & 6セル立方体結晶
   - Life 5766 (B6/S567): 10セル 2層直積グライダー (厚み2宇宙船)
   - B5/S4567: 15セル深層有機的自己複製子 (T=8,16,24,32 指数増殖)
   - B3/S145: 6セル 90°ツイスト直交偏光自己複製子
   - B35/S4: 9セル 3軸C3対角スクリュー自己複製子
   - B3/S136: 4セル Diamond Pulsar
   - B35/S567: 5セル Z-Surge パルサー
5. 未解決探究課題の探索テンプレート (偏光板、非破壊読出、自立銃)
"""

from collections import defaultdict, deque
import itertools
import random
import re
import sys

# Ensure UTF-8 output on all platforms (e.g. Windows cp932)
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# ==========================================
# 1. ルール物理エンジン (任意 B.../S... 対応)
# ==========================================
def parse_rule(rule_str):
    m = re.match(r"^B([0-9]+)/S([0-9]+)$", rule_str.strip().upper())
    if not m:
        raise ValueError(f"Invalid rule format: {rule_str}. Expected e.g. 'B4/S45'")
    b = {int(x) for x in m.group(1)}
    s = {int(x) for x in m.group(2)}
    return b, s

NEIGHBORS_26 = [
    (dx, dy, dz)
    for dx in (-1, 0, 1) for dy in (-1, 0, 1) for dz in (-1, 0, 1)
    if not (dx == 0 and dy == 0 and dz == 0)
]

def simulate_step(cell_set, b_rule, s_rule):
    counts = defaultdict(int)
    for x, y, z in cell_set:
        for dx, dy, dz in NEIGHBORS_26:
            counts[(x + dx, y + dy, z + dz)] += 1
    next_set = set()
    for pt, c in counts.items():
        if (pt in cell_set and c in s_rule) or (pt not in cell_set and c in b_rule):
            next_set.add(pt)
    return frozenset(next_set)

# ==========================================
# 2. 48対称性 (Oh) 正規化ハッシュ・合同判定
# ==========================================
PERMUTATIONS = list(itertools.permutations([0, 1, 2]))
SIGNS = list(itertools.product([1, -1], repeat=3))

def get_canonical_form(cell_set):
    """立方体対称群 Oh (48対称性) の正規化タプル表現を生成"""
    if not cell_set:
        return ()
    coords = list(cell_set)
    best_repr = None
    for p in PERMUTATIONS:
        for s in SIGNS:
            transformed = [(c[p[0]] * s[0], c[p[1]] * s[1], c[p[2]] * s[2]) for c in coords]
            min_x = min(c[0] for c in transformed)
            min_y = min(c[1] for c in transformed)
            min_z = min(c[2] for c in transformed)
            norm = tuple(sorted((c[0] - min_x, c[1] - min_y, c[2] - min_z) for c in transformed))
            if best_repr is None or norm < best_repr:
                best_repr = norm
    return best_repr

def get_connected_components(cell_set):
    """26近傍連結クラスタ分解 (BFS)"""
    visited = set()
    components = []
    for cell in cell_set:
        if cell in visited:
            continue
        comp = []
        q = deque([cell])
        visited.add(cell)
        while q:
            curr = q.popleft()
            comp.append(curr)
            for dx, dy, dz in NEIGHBORS_26:
                neighbor = (curr[0] + dx, curr[1] + dy, curr[2] + dz)
                if neighbor in cell_set and neighbor not in visited:
                    visited.add(neighbor)
                    q.append(neighbor)
        components.append(frozenset(comp))
    return components

# ==========================================
# 3. 歴代の有望ルール＆代表構造体カタログ
# ==========================================
HISTORIC_PRESETS = {
    # ① B4/S45: 純粋素粒子物理の王国
    "GLIDER_7_B4S45": {
        "name": "7-Cell Breathing Glider",
        "rule": "B4/S45",
        "coords": frozenset({(0,0,0),(0,1,0),(0,2,0),(0,1,1),(1,0,1),(1,1,1),(1,2,1)})
    },
    "CRYSTAL_6_B4S45": {
        "name": "6-Cell Cube Crystal",
        "rule": "B4/S45",
        "coords": frozenset({(-2,-1,3),(-2,0,2),(-1,-1,3),(-1,0,2),(-1,0,3),(-2,-1,2)})
    },

    # ② Life 5766 (B6/S567): 2D直積グライダー・銃の体系
    "GLIDER_10_B6S567": {
        "name": "10-Cell Flat Glider (Life 5766)",
        "rule": "B6/S567",
        "coords": frozenset({
            (0,1,0),(0,1,1),(1,2,0),(1,2,1),(2,0,0),
            (2,0,1),(2,1,0),(2,1,1),(2,2,0),(2,2,1)
        })
    },

    # ③ B5/S4567: 深層有機的自己複製子の楽園
    "REPLICATOR_15_B5S4567": {
        "name": "15-Cell Organic Meta-Splitter",
        "rule": "B5/S4567",
        "coords": frozenset({
            (0,0,1),(2,2,1),(0,1,1),(2,1,1),(0,1,2),
            (2,1,2),(0,2,1),(2,0,1),(1,0,1),(1,2,1),
            (1,0,2),(1,2,2),(1,1,0),(1,2,0),(1,0,0)
        })
    },

    # ④ B3/S145: 90°ツイスト直交偏光波自己複製子
    "TWIST_6_B3S145": {
        "name": "6-Cell Chiral Twisted Cross",
        "rule": "B3/S145",
        "coords": frozenset({
            (0,1,1),(2,1,1),(1,1,1),
            (1,1,2),(1,2,2),(1,0,2)
        })
    },

    # ⑤ B35/S4: 3軸C3対角スクリュー自己複製子
    "C3_SCREW_9_B35S4": {
        "name": "9-Cell 3-Axis C3 Diagonal Replicator",
        "rule": "B35/S4",
        "coords": frozenset({
            (1,1,0),(1,0,1),(0,1,1),
            (1,1,2),(1,2,1),(2,1,1),
            (2,0,1),(0,1,2),(1,2,0)
        })
    },

    # ⑥ B3/S136: Diamond Pulsar
    "DIAMOND_4_B3S136": {
        "name": "4-Cell Diamond Pulsar",
        "rule": "B3/S136",
        "coords": frozenset({(0,0,1),(2,0,1),(1,0,0),(1,0,2)})
    },

    # ⑦ B35/S567: Z-Surge パルサー
    "Z_SURGE_5_B35S567": {
        "name": "5-Cell Z-Surge Pulsar",
        "rule": "B35/S567",
        "coords": frozenset({(0,0,0),(2,2,0),(1,0,0),(1,2,0),(1,1,0)})
    }
}

# ==========================================
# 4. 探索ルーチン
# ==========================================
def search_glider_gun(samples=100, rule_str="B4/S45", bullet_key="GLIDER_7_B4S45"):
    b_rule, s_rule = parse_rule(rule_str)
    bullet = HISTORIC_PRESETS[bullet_key]["coords"]
    target_canon = get_canonical_form(bullet)
    print(f"\n--- 自立銃探索 [ルール: {rule_str}, 弾丸: {bullet_key}] (サンプル数: {samples}) ---")
    found = 0

    for s_idx in range(samples):
        # 原点中心の対称ランダムシード生成
        seed = set()
        for _ in range(random.randint(6, 12)):
            x, y, z = random.randint(-2, 2), random.randint(-2, 2), random.randint(-2, 2)
            seed.add((x, y, z))
            seed.add((-x, -y, -z))
        
        u = frozenset(seed)
        for t in range(1, 40):
            u = simulate_step(u, b_rule, s_rule)
            if not u or len(u) > 200:
                break
            if t >= 12 and len(u) >= len(seed) + len(bullet):
                comps = get_connected_components(u)
                for comp in comps:
                    if len(comp) == len(bullet) and get_canonical_form(comp) == target_canon:
                        print(f"🎉 グライダー射出候補発見！ (t={t}, 全セル数={len(u)})")
                        found += 1
                        break
    print(f"探索完了: 候補数 = {found} 件")

# ==========================================
# メイン実行部
# ==========================================
if __name__ == "__main__":
    print("=" * 65)
    print("🌌 3D Cellular Automata Multi-Rule Researcher Toolkit (Python 3)")
    print("=" * 65)

    # 1. コア体系 (B4/S45)
    print("\n【1. コア体系 (B4/S45) 基本物理動作検証】")
    b45, s45 = parse_rule("B4/S45")
    g7 = HISTORIC_PRESETS["GLIDER_7_B4S45"]["coords"]

    # 衝突結晶化
    u_set = set(g7)
    for x, y, z in g7:
        u_set.add((-x - 3, y - 3, 5 - z))
    u = frozenset(u_set)
    for _ in range(10):
        u = simulate_step(u, b45, s45)
    print(f"1. 衝突結晶化 (SET):   t=10 セル数 = {len(u)} (期待値: 6)")

    # 完全対消滅
    u_reset = set(u)
    for x, y, z in g7:
        u_reset.add((x - 3, y - 3, 5 - z))
    u = frozenset(u_reset)
    for _ in range(8):
        u = simulate_step(u, b45, s45)
    print(f"2. 完全対消滅 (RESET):  t=8  セル数 = {len(u)} (期待値: 0 完全真空)")

    # 2. 歴代の有望ルール＆構造体の実証
    print("\n【2. 歴代の有望ルール＆代表構造体 (Historic Rules) 検証】")
    
    # Life 5766 (B6/S567) 10セルグライダー
    b6, s567 = parse_rule("B6/S567")
    u10 = HISTORIC_PRESETS["GLIDER_10_B6S567"]["coords"]
    for _ in range(4):
        u10 = simulate_step(u10, b6, s567)
    print(f"・Life 5766 (B6/S567): 10セルグライダー 1周期(t=4)滑空後セル数 = {len(u10)} (期待値: 10)")

    # B5/S4567 15セル自己複製子
    b5, s4567 = parse_rule("B5/S4567")
    u15 = HISTORIC_PRESETS["REPLICATOR_15_B5S4567"]["coords"]
    for _ in range(8):
        u15 = simulate_step(u15, b5, s4567)
    print(f"・B5/S4567: 15セル自己複製子 t=8 分裂後セル数 = {len(u15)} (期待値: 30 = 2体)")

    # B3/S145 6セルツイスト自己複製子
    b3, s145 = parse_rule("B3/S145")
    u6 = HISTORIC_PRESETS["TWIST_6_B3S145"]["coords"]
    for _ in range(2):
        u6 = simulate_step(u6, b3, s145)
    print(f"・B3/S145: 6セルツイスト t=2 分裂後セル数 = {len(u6)} (期待値: 12 = 2体)")

    # B35/S4 9セルC3対角自己複製子
    b35, s4 = parse_rule("B35/S4")
    u9 = HISTORIC_PRESETS["C3_SCREW_9_B35S4"]["coords"]
    for _ in range(2):
        u9 = simulate_step(u9, b35, s4)
    print(f"・B35/S4: 9セルC3対角スクリュー t=2 分裂後セル数 = {len(u9)} (期待値: 18 = 2体)")

    # 3. 探索デモ
    search_glider_gun(50, "B4/S45", "GLIDER_7_B4S45")
    search_glider_gun(50, "B6/S567", "GLIDER_10_B6S567")

    print("\n" + "=" * 65)
    print("✅ 全検証・スクリーニング完了！")
    print("parse_rule('ルール') や HISTORIC_PRESETS を活用して、")
    print("独自の体系や新種グライダー・銃の探索を自由にお試しください！")
    print("=" * 65)
