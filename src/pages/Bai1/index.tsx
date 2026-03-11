import React from 'react';
import { Card, Button, } from 'antd';

const CHOICE = ['Kéo', 'Búa', 'Bao'];
const RESULT = ['Hòa', 'Thắng', 'Thua'];
const App = () => {
  const [playerChoice, setPlayerChoice] = React.useState(null);
  const [computerChoice, setcomputerChoice] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const play = (playerChoice) => {
    const computerChoice = Math.floor(Math.random() * 3);
    setPlayerChoice(playerChoice);
    setcomputerChoice(computerChoice);
    if (playerChoice === computerChoice) {
      setResult('Hòa');
    } else if (
      (playerChoice === 0 && computerChoice === 2) || // Kéo cắt Bao
      (playerChoice === 1 && computerChoice === 0) || // Búa đập Kéo
      (playerChoice === 2 && computerChoice === 1)    // Bao bọc Búa
    ) {
      setResult('Thắng');
    } else {
      setResult('Thua');
    }
  };
  return (
  <Card title="Oẳn tù tì" variant="borderless" style={{ width: 300, height: 400, margin: '0 auto' }}>
    <Button onClick={() => play(0)}>Kéo</Button>
    <Button onClick={() => play(1)}>Búa</Button>
    <Button onClick={() => play(2)}>Bao</Button>
    <p>Bạn: {playerChoice !== null ? CHOICE[playerChoice] : 'Chưa chọn'}</p>
    <p>Máy: {computerChoice !== null ? CHOICE[computerChoice] : 'Chưa chọn'}</p>
    <p>Kết quả: {result !== null ? result : 'Chưa có kết quả'}</p>
  </Card>
  );
};
export default App;