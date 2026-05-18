'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useGameSocket } from '@/hooks/useGameSocket';
import { RootState } from '@/libs/store/configure-store';

interface GameQuestionProps {
  onAnswerSubmit?: (questionId: number, answer: string) => void;
}

const GameQuestion: React.FC<GameQuestionProps> = ({ onAnswerSubmit }) => {
  const { submitAnswer } = useGameSocket();
  const { currentQuestion, gameStatus } = useSelector((state: RootState) => state.gameNotification);

  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (currentQuestion?.timeLimit) {
      setTimeLeft(currentQuestion.timeLimit);
      setIsSubmitted(false);
      setSelectedAnswer('');

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  const handleAutoSubmit = () => {
    if (!isSubmitted && currentQuestion) {
      handleSubmitAnswer();
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || isSubmitted) return;

    const answer = selectedAnswer || ''; // Submit empty if no selection
    submitAnswer(currentQuestion.id, answer);
    setIsSubmitted(true);

    if (onAnswerSubmit) {
      onAnswerSubmit(currentQuestion.id, answer);
    }
  };

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSubmitted) {
      setSelectedAnswer(event.target.value);
    }
  };

  if (gameStatus !== 'started' || !currentQuestion) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        {gameStatus === 'waiting' && <Alert severity='info'>Waiting for game to start...</Alert>}
        {gameStatus === 'ended' && (
          <Alert severity='success'>Game has ended! Check your results.</Alert>
        )}
        {gameStatus === 'disconnected' && (
          <Alert severity='warning'>Disconnected from game. Please reconnect.</Alert>
        )}
      </Box>
    );
  }

  const progressValue = currentQuestion.timeLimit
    ? ((currentQuestion.timeLimit - timeLeft) / currentQuestion.timeLimit) * 100
    : 0;

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <CardContent>
        {currentQuestion.timeLimit && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Typography variant='body2' color='text.secondary'>
                Time Remaining
              </Typography>
              <Typography variant='body2' color={timeLeft <= 10 ? 'error.main' : 'text.secondary'}>
                {timeLeft}s
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={progressValue}
              color={timeLeft <= 10 ? 'error' : 'primary'}
            />
          </Box>
        )}

        <Typography variant='h6' gutterBottom>
          Question {currentQuestion.id}
        </Typography>

        <Typography variant='body1' paragraph>
          {currentQuestion.question}
        </Typography>

        <FormControl component='fieldset' disabled={isSubmitted} sx={{ width: '100%' }}>
          <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
            {currentQuestion.options?.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={option}
                sx={{
                  opacity: isSubmitted ? 0.6 : 1,
                  mb: 1,
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            {isSubmitted ? 'Answer submitted!' : 'Select your answer and submit'}
          </Typography>

          <Button
            variant='contained'
            onClick={handleSubmitAnswer}
            disabled={isSubmitted || !selectedAnswer}
            color={timeLeft <= 10 ? 'error' : 'primary'}
          >
            {isSubmitted ? 'Submitted' : 'Submit Answer'}
          </Button>
        </Box>

        {isSubmitted && (
          <Alert severity='success' sx={{ mt: 2 }}>
            Your answer has been submitted successfully!
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default GameQuestion;
