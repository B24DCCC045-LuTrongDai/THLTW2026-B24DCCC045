import React, { useState, useEffect } from 'react';
import { Card, InputNumber, Button, Alert } from 'antd';

const Bai1 = () => {
  const [randomNumber, setRandomNumber] = useState(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const MAX_ATTEMPTS = 10;

  useEffect(() => {
    const newRandomNumber = Math.floor(Math.random() * 100) + 1;
    setRandomNumber(newRandomNumber);
  }, []);

  const handleGuess = () => {
    if (!guess) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guess === randomNumber) {
      setMessage('Chúc mừng! Bạn đã đoán đúng!');
      setGameOver(true);
    } else if (newAttempts >= MAX_ATTEMPTS) {
      setMessage(`Bạn đã hết lượt! Số đúng là ${randomNumber}`);
      setGameOver(true);
    } else if (guess < randomNumber) {
      setMessage('Bạn đoán quá thấp!');
    } else {
      setMessage('Bạn đoán quá cao!');
    }

    setGuess('');
  };

  const handlePlayAgain = () => {
    const newRandomNumber = Math.floor(Math.random() * 100) + 1;
    setRandomNumber(newRandomNumber);
    setGuess('');
    setMessage('');
    setAttempts(0);
    setGameOver(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card style={{ width: 400, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <div>Lượt đoán: {attempts}/{MAX_ATTEMPTS}</div>
        </div>

        {message && (
          <Alert
            message={message}
            type={message.includes('Chúc mừng') ? 'success' : 'info'}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <InputNumber
          style={{ width: '100%', marginBottom: 16 }}
          min={1}
          max={100}
          value={guess}
          onChange={setGuess}
          placeholder="Nhập số từ 1-100"
          disabled={gameOver}
        />

        <Button
          type="primary"
          onClick={handleGuess}
          disabled={gameOver || !guess}
          style={{ width: '100%', marginBottom: 8 }}
        >
          Đoán
        </Button>

        {gameOver && (
          <Button onClick={handlePlayAgain} style={{ width: '100%' }}>
            Chơi lại
          </Button>
        )}
      </Card>
    </div>
  );
};

export default Bai1;