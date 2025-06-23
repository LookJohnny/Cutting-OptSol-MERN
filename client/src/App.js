import React, { useState } from 'react';
import axios from 'axios';

function CuttingBoardSVG({ board, totalLength, height = 40 }) {
  const totalUsed = board.reduce((a, b) => a + b, 0);
  const scale = 600 / totalLength; // 每单位长度对应像素数
  let currentX = 0;

  return (
    <svg width="600" height={height} style={{ border: '1px solid #ccc', marginBottom: '1rem' }}>
      {board.map((cut, i) => {
        const width = cut * scale;
        const rect = (
          <g key={i}>
            <rect x={currentX} y={0} width={width} height={height} fill="#4caf50" />
            <text
              x={currentX + width / 2}
              y={height / 2 + 5}
              fill="white"
              fontSize="14"
              textAnchor="middle"
            >
              {cut}
            </text>
          </g>
        );
        currentX += width;
        return rect;
      })}
      {totalUsed < totalLength && (
        <g>
          <rect
            x={currentX}
            y={0}
            width={(totalLength - totalUsed) * scale}
            height={height}
            fill="#ddd"
          />
          <text
            x={currentX + ((totalLength - totalUsed) * scale) / 2}
            y={height / 2 + 5}
            fill="#333"
            fontSize="14"
            textAnchor="middle"
          >
            {totalLength - totalUsed}
          </text>
        </g>
      )}
    </svg>
  );
}

function App() {
  const [cuts, setCuts] = useState([{ length: '', quantity: '' }]);
  const [boardLength, setBoardLength] = useState(244);
  const [result, setResult] = useState(null);

  const addCut = () => {
    setCuts([...cuts, { length: '', quantity: '' }]);
  };

  const handleChange = (index, field, value) => {
    const newCuts = [...cuts];
    newCuts[index][field] = value;
    setCuts(newCuts);
  };

  const handleSubmit = async () => {
    try {
      const formattedCuts = cuts
        .map(cut => ({
          length: parseInt(cut.length),
          quantity: parseInt(cut.quantity)
        }))
        .filter(cut => !isNaN(cut.length) && !isNaN(cut.quantity));

      const res = await axios.post('http://localhost:3001/api/optimize', {
        boardLength,
        cuts: formattedCuts
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('请求失败，请检查输入或后端状态');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>板材裁剪优化工具</h1>

      <div>
        <label>板材长度（默认244）: </label>
        <input
          type="number"
          value={boardLength}
          onChange={e => setBoardLength(parseInt(e.target.value))}
        />
      </div>

      <h2>裁剪需求</h2>
      {cuts.map((cut, index) => (
        <div key={index} style={{ marginBottom: '1rem' }}>
          <input
            type="number"
            placeholder="长度（cm）"
            value={cut.length}
            onChange={e => handleChange(index, 'length', e.target.value)}
          />
          <input
            type="number"
            placeholder="数量"
            value={cut.quantity}
            onChange={e => handleChange(index, 'quantity', e.target.value)}
            style={{ marginLeft: '1rem' }}
          />
        </div>
      ))}

      <button onClick={addCut}>➕ 添加一行</button>
      <br /><br />
      <button onClick={handleSubmit}>🚀 优化裁剪</button>

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h2>优化结果：共 {result.totalBoards} 张板</h2>
          {result.boards.map((board, i) => (
            <div key={i} style={{ marginBottom: '2rem' }}>
              <strong>第{i + 1}张板：</strong> {board.join(', ')}（剩余 {boardLength - board.reduce((a, b) => a + b, 0)}cm）
              <CuttingBoardSVG board={board} totalLength={boardLength} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
