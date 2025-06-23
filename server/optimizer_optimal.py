import sys
import json
from pulp import LpProblem, LpVariable, lpSum, LpMinimize, LpInteger, LpStatusOptimal

def generate_patterns(board_length, lengths):
    from itertools import product
    patterns = []

    def helper(current, remaining):
        if sum(current[i] * lengths[i] for i in range(len(lengths))) <= board_length:
            patterns.append(current[:])
        for i in range(len(lengths)):
            if sum(current[i] * lengths[i] for i in range(len(lengths))) + lengths[i] <= board_length:
                current[i] += 1
                helper(current, remaining)
                current[i] -= 1

    helper([0]*len(lengths), lengths)
    return [p for p in patterns if any(p)]

def solve_cutting_stock(board_length, cuts):
    lengths = [item['length'] for item in cuts]
    demands = [item['quantity'] for item in cuts]

    patterns = generate_patterns(board_length, lengths)

    prob = LpProblem("CuttingStock", LpMinimize)
    x = [LpVariable(f"x{i}", lowBound=0, cat=LpInteger) for i in range(len(patterns))]

    # 目标：最小化使用板数
    prob += lpSum(x)

    # 约束：满足所有尺寸需求
    for j in range(len(lengths)):
        prob += lpSum(patterns[i][j] * x[i] for i in range(len(patterns))) >= demands[j]

    status = prob.solve()

    if status != LpStatusOptimal:
        return {"error": "No optimal solution found."}

    result = []
    for i, var in enumerate(x):
        count = int(var.varValue)
        for _ in range(count):
            pattern = []
            for j in range(len(lengths)):
                pattern.extend([lengths[j]] * patterns[i][j])
            result.append(pattern)

    return {
        "totalBoards": len(result),
        "boards": result
    }

# Main entry
if __name__ == '__main__':
    input_data = json.loads(sys.stdin.read())
    board_length = input_data['boardLength']
    cuts = input_data['cuts']
    result = solve_cutting_stock(board_length, cuts)
    print(json.dumps(result))
