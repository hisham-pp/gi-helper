'use client';

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import Icon from '@/core/components/icon';
import { ValidationSuggestion } from '@/types/master/company-onboarding';

export interface SmartSuggestionDialogProps {
  open: boolean;
  suggestion: ValidationSuggestion | null;
  onResolve: (action: 'accept' | 'create_new' | 'skip', value?: string) => void;
  onApplyBulk?: (action: 'accept' | 'skip', applyToAll: boolean) => void;
  onClose: () => void;
}

export const SmartSuggestionDialog: React.FC<SmartSuggestionDialogProps> = ({
  open,
  suggestion,
  onResolve,
  onApplyBulk,
  onClose,
}) => {
  const theme = useTheme();
  const [selectedAction, setSelectedAction] = useState<'accept' | 'create_new' | 'skip'>('accept');
  const [customValue, setCustomValue] = useState('');
  const [applyToAll, setApplyToAll] = useState(false);

  if (!suggestion) {
    return null;
  }

  const handleResolve = () => {
    if (selectedAction === 'create_new') {
      onResolve('create_new', customValue || suggestion.currentValue);
    } else {
      onResolve(selectedAction);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedAction('accept');
    setCustomValue('');
    setApplyToAll(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Box sx={{ color: 'warning.main' }}>
            <Icon icon='mdi:lightbulb' />
          </Box>
          Smart Suggestion
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Row Info */}
        <Alert severity='info' icon={<Icon icon='mdi:information-variant' />} sx={{ mb: 2 }}>
          <Typography variant='caption'>
            Row <strong>{suggestion.rowNumber}</strong>, Field: <strong>{suggestion.field}</strong>
          </Typography>
        </Alert>

        {/* Current vs Suggested */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
            Current Value
          </Typography>
          <Box
            sx={{
              padding: '12px',
              backgroundColor: theme.palette.error.light || '#ffebee',
              borderRadius: '4px',
              mb: 2,
            }}
          >
            <code>{suggestion.currentValue}</code>
          </Box>

          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
            Suggested Value
          </Typography>
          <Box
            sx={{
              padding: '12px',
              backgroundColor: theme.palette.success.light || '#e8f5e9',
              borderRadius: '4px',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <code>{suggestion.suggestedValue}</code>
              <Chip
                label={`${suggestion.similarity}% match`}
                size='small'
                color='success'
                variant='outlined'
              />
            </Box>
          </Box>
        </Box>

        {/* Alternative Options */}
        {suggestion.options.length > 1 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
              Other Options
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {suggestion.options.slice(1).map((option, idx) => (
                <Chip key={idx} label={option} variant='outlined' size='small' />
              ))}
            </Box>
          </Box>
        )}

        {/* Resolution Options */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
            What would you like to do?
          </Typography>

          <RadioGroup
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value as 'accept' | 'create_new' | 'skip')}
          >
            {/* Accept Suggestion */}
            <FormControlLabel
              value='accept'
              control={<Radio />}
              label={
                <Box>
                  <Typography variant='subtitle2'>Use the suggested value</Typography>
                  <Typography variant='caption' color='textSecondary'>
                    Replace &quot;{suggestion.currentValue}&quot; with &quot;
                    {suggestion.suggestedValue}&quot;
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            {/* Skip Row */}
            <FormControlLabel
              value='skip'
              control={<Radio />}
              label={
                <Box>
                  <Typography variant='subtitle2'>Skip this row</Typography>
                  <Typography variant='caption' color='textSecondary'>
                    Keep the original value and skip import for this row
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            {/* Create New */}
            <FormControlLabel
              value='create_new'
              control={<Radio />}
              label={
                <Box>
                  <Typography variant='subtitle2'>Create new entry</Typography>
                  <Typography variant='caption' color='textSecondary'>
                    Create a new {suggestion.field} with a custom value
                  </Typography>
                </Box>
              }
              sx={{ mb: 1 }}
            />

            {/* Custom Value Input */}
            {selectedAction === 'create_new' && (
              <TextField
                size='small'
                placeholder='Enter new value'
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                fullWidth
                sx={{ ml: 4, mb: 2 }}
                defaultValue={suggestion.currentValue}
              />
            )}
          </RadioGroup>
        </Box>

        {/* Bulk Apply */}
        {onApplyBulk && (
          <FormControlLabel
            control={
              <input
                type='checkbox'
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
              />
            }
            label='Apply this decision to all similar cases'
            sx={{ display: 'block' }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ gap: '8px', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={handleClose} variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={handleResolve}
          variant='contained'
          color='primary'
          startIcon={<Icon icon='mdi:check' />}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SmartSuggestionDialog;
