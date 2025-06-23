const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { optimizeCuts } = require('./optimizer');
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 正在执行 index.js 文件');

const app = express();
const PORT = process.env.PORT || 3001; // 兼容 Render 或 Heroku 环境变量

app.use(cors());
app.use(bodyParser.json());

app.post('/api/optimize', (req, res) => {
  const { boardLength, cuts, mode = 'greedy' } = req.body;

  if (!boardLength || !cuts) {
    return res.status(400).json({ error: '参数不完整' });
  }

  if (mode === 'greedy') {
    const result = optimizeCuts(boardLength, cuts);
    return res.json(result);
  }

  if (mode === 'optimal') {
    const python = spawn('python3', [path.join(__dirname, 'optimizer_optimal.py')]);
    const input = JSON.stringify({ boardLength, cuts });

    let output = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error('🐍 Python 错误：', data.toString());
    });

    python.on('close', () => {
      try {
        const result = JSON.parse(output);
        res.json(result);
      } catch (err) {
        console.error('❌ 解析 Python 输出失败：', err);
        res.status(500).json({ error: 'Python 处理失败' });
      }
    });

    python.stdin.write(input);
    python.stdin.end();
  }
});

// ⬇️ 支持前端打包后部署
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ 后端服务器已启动：http://localhost:${PORT}`);
});
