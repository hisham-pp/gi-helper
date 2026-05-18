'use client';

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import Icon from '@/core/components/icon';
import {
  ValidationError,
  ValidationSuggestion,
  ValidationWarning,
} from '@/types/master/company-onboarding';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`validation-tabpanel-${index}`}
      aria-labelledby={`validation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export interface ValidationPanelProps {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  errorCount?: number;
  warningCount?: number;
  successCount?: number;
  totalRows?: number;
  onAcceptSuggestion: (suggestionId: string) => void;
  onRejectSuggestion: (suggestionId: string) => void;
  onApplyBulk?: (suggestionIds: string[]) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  errors,
  warnings,
  suggestions,
  errorCount = 0,
  warningCount = 0,
  successCount = 0,
  totalRows = 0,
  onAcceptSuggestion,
  onRejectSuggestion,
  onApplyBulk,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleSuggestionSelection = (suggestionId: string) => {
    const newSet = new Set(selectedSuggestions);
    if (newSet.has(suggestionId)) {
      newSet.delete(suggestionId);
    } else {
      newSet.add(suggestionId);
    }
    setSelectedSuggestions(newSet);
  };

  const handleApplyBulk = () => {
    if (onApplyBulk && selectedSuggestions.size > 0) {
      onApplyBulk(Array.from(selectedSuggestions));
      setSelectedSuggestions(new Set());
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Summary */}
      <Alert
        severity='info'
        sx={{ marginBottom: '16px' }}
        icon={<Icon icon='mdi:information-variant' />}
      >
        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant='caption'>
            Total: <strong>{totalRows}</strong>
          </Typography>
          <Divider orientation='vertical' />
          <Typography variant='caption' sx={{ color: 'success.main' }}>
            ✓ Valid: <strong>{successCount}</strong>
          </Typography>
          <Divider orientation='vertical' />
          <Typography variant='caption' sx={{ color: 'warning.main' }}>
            ⚠ Warnings: <strong>{warningCount}</strong>
          </Typography>
          <Divider orientation='vertical' />
          <Typography variant='caption' sx={{ color: 'error.main' }}>
            ✗ Errors: <strong>{errorCount}</strong>
          </Typography>
        </Box>
      </Alert>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '16px' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab
            label={`All (${errors.length + warnings.length + suggestions.length})`}
            id='validation-tab-0'
          />
          <Tab label={`Errors (${errors.length})`} id='validation-tab-1' />
          <Tab label={`Warnings (${warnings.length})`} id='validation-tab-2' />
          <Tab label={`Suggestions (${suggestions.length})`} id='validation-tab-3' />
        </Tabs>
      </Box>

      {/* All Tab */}
      <TabPanel value={tabValue} index={0}>
        {errors.length === 0 && warnings.length === 0 && suggestions.length === 0 ? (
          <Alert severity='success' icon={<Icon icon='mdi:check-circle' />}>
            All rows are valid! No issues found.
          </Alert>
        ) : (
          <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {/* Errors */}
            {errors.map((error) => (
              <ListItem
                key={error.id}
                sx={{ backgroundColor: 'error.lighter', marginBottom: '8px' }}
              >
                <ListItemIcon>
                  <Box sx={{ color: 'error.main' }}>
                    <Icon icon='mdi:alert-circle' />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={`Row ${error.rowNumber} - ${error.field}`}
                  secondary={`${error.message} (Code: ${error.errorCode})`}
                />
              </ListItem>
            ))}

            {/* Warnings */}
            {warnings.map((warning) => (
              <ListItem
                key={warning.id}
                sx={{ backgroundColor: 'warning.lighter', marginBottom: '8px' }}
              >
                <ListItemIcon>
                  <Box sx={{ color: 'warning.main' }}>
                    <Icon icon='mdi:alert' />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={`Row ${warning.rowNumber} - ${warning.field}`}
                  secondary={warning.message}
                />
              </ListItem>
            ))}

            {/* Suggestions */}
            {suggestions.map((suggestion) => (
              <ListItem
                key={suggestion.id}
                sx={{ backgroundColor: 'info.lighter', marginBottom: '8px' }}
              >
                <ListItemIcon>
                  <Box sx={{ color: 'info.main' }}>
                    <Icon icon='mdi:lightbulb' />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={`Row ${suggestion.rowNumber} - ${suggestion.field}`}
                  secondary={`Did you mean "${suggestion.suggestedValue}"? (${suggestion.similarity}% match)`}
                />
                <Box sx={{ display: 'flex', gap: '4px' }}>
                  <Button
                    size='small'
                    onClick={() => onAcceptSuggestion(suggestion.id)}
                    variant='contained'
                    color='success'
                  >
                    Accept
                  </Button>
                  <Button
                    size='small'
                    onClick={() => onRejectSuggestion(suggestion.id)}
                    variant='outlined'
                  >
                    Reject
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Errors Tab */}
      <TabPanel value={tabValue} index={1}>
        {errors.length === 0 ? (
          <Alert severity='success' icon={<Icon icon='mdi:check-circle' />}>
            No errors found!
          </Alert>
        ) : (
          <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {errors.map((error) => (
              <ListItem
                key={error.id}
                sx={{ backgroundColor: 'error.lighter', marginBottom: '8px' }}
              >
                <ListItemIcon>
                  <Box sx={{ color: 'error.main' }}>
                    <Icon icon='mdi:alert-circle' />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <strong>Row {error.rowNumber}</strong>
                      <Chip
                        label={error.severity}
                        size='small'
                        color={error.severity === 'critical' ? 'error' : 'warning'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant='caption'>
                        <strong>{error.field}:</strong> {error.message}
                      </Typography>
                      <Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
                        Current value: <code>{JSON.stringify(error.value)}</code>
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Warnings Tab */}
      <TabPanel value={tabValue} index={2}>
        {warnings.length === 0 ? (
          <Alert severity='info' icon={<Icon icon='mdi:information-variant' />}>
            No warnings!
          </Alert>
        ) : (
          <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {warnings.map((warning) => (
              <ListItem
                key={warning.id}
                sx={{ backgroundColor: 'warning.lighter', marginBottom: '8px' }}
              >
                <ListItemIcon>
                  <Box sx={{ color: 'warning.main' }}>
                    <Icon icon='mdi:alert' />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <strong>
                      Row {warning.rowNumber} - {warning.field}
                    </strong>
                  }
                  secondary={
                    <Box>
                      <Typography variant='caption'>{warning.message}</Typography>
                      <Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
                        Current value: <code>{JSON.stringify(warning.value)}</code>
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Suggestions Tab */}
      <TabPanel value={tabValue} index={3}>
        {suggestions.length === 0 ? (
          <Alert severity='success' icon={<Icon icon='mdi:check-circle' />}>
            No suggestions!
          </Alert>
        ) : (
          <Box>
            {/* Bulk Actions */}
            {suggestions.length > 1 && selectedSuggestions.size > 0 && (
              <Box sx={{ marginBottom: '16px', padding: '12px', backgroundColor: 'info.lighter' }}>
                <Typography variant='caption' sx={{ mr: 1 }}>
                  {selectedSuggestions.size} suggestion(s) selected
                </Typography>
                <Button
                  size='small'
                  onClick={handleApplyBulk}
                  variant='contained'
                  color='success'
                  sx={{ ml: 1 }}
                >
                  Apply Selected
                </Button>
              </Box>
            )}

            <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {suggestions.map((suggestion) => (
                <ListItem
                  key={suggestion.id}
                  sx={{
                    backgroundColor: selectedSuggestions.has(suggestion.id)
                      ? 'info.lighter'
                      : 'info.lighter',
                    marginBottom: '8px',
                    border: selectedSuggestions.has(suggestion.id)
                      ? `2px solid ${theme.palette.info.main}`
                      : undefined,
                  }}
                >
                  <ListItemIcon>
                    <input
                      type='checkbox'
                      checked={selectedSuggestions.has(suggestion.id)}
                      onChange={() => toggleSuggestionSelection(suggestion.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <strong>
                        Row {suggestion.rowNumber} - {suggestion.field}
                      </strong>
                    }
                    secondary={
                      <Box>
                        <Typography variant='caption' display='block'>
                          Current: <code>{suggestion.currentValue}</code>
                        </Typography>
                        <Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
                          Suggested: <code>{suggestion.suggestedValue}</code> (
                          {suggestion.similarity}% match)
                        </Typography>
                        {suggestion.options.length > 1 && (
                          <Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
                            Other options: {suggestion.options.slice(1).join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <Button
                      size='small'
                      onClick={() => onAcceptSuggestion(suggestion.id)}
                      variant='contained'
                      color='success'
                    >
                      Accept
                    </Button>
                    <Button
                      size='small'
                      onClick={() => onRejectSuggestion(suggestion.id)}
                      variant='outlined'
                    >
                      Reject
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
};

export default ValidationPanel;
