import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  LinearProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FileUploader from '@/core/components/file-uploader';
import Icon from '@/core/components/icon';

export interface ImportSectionCardProps {
  title: string;
  description?: string;
  loading?: boolean;
  error?: string;
  uploadProgress?: number;
  fileName?: string;
  onUpload: (file: File) => void;
  onDownloadTemplate: () => void;
}

export const ImportSectionCard: React.FC<ImportSectionCardProps> = ({
  title,
  description,
  loading = false,
  error,
  uploadProgress,
  fileName,
  onUpload,
  onDownloadTemplate,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFileSelect = (file: File | null | File[]) => {
    if (file && !Array.isArray(file)) {
      // Validate file type - accept CSV files
      if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
        return; // Error will be shown by FileUploader
      }
      onUpload(file);
    }
  };

  return (
    <Card
      sx={{
        marginBottom: '24px',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transition: 'all 0.3s ease',
        },
      }}
      elevation={2}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ marginBottom: '16px' }}>
          <Typography variant='h6' sx={{ fontWeight: 600, marginBottom: '4px' }}>
            {title}
          </Typography>
          {description && (
            <Typography variant='caption' color='textSecondary'>
              {description}
            </Typography>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity='error' sx={{ marginBottom: '16px' }} onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* File Uploader */}
        <Box sx={{ marginBottom: '16px' }}>
          <FileUploader
            accept={{
              'text/csv': ['.csv'],
            }}
            inputProps={{
              id: `upload-${title}`,
              label: 'Upload CSV File',
              error: Boolean(error),
              helperText: error || 'Drag and drop your CSV file here or click to select',
            }}
            onUpload={handleFileSelect}
            isMultiple={false}
            isDisabled={loading}
          />
        </Box>

        {/* Upload Progress */}
        {loading && uploadProgress !== undefined && (
          <Box sx={{ marginBottom: '16px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Typography variant='caption'>Uploading...</Typography>
              <Typography variant='caption'>{Math.round(uploadProgress)}%</Typography>
            </Box>
            <LinearProgress variant='determinate' value={uploadProgress} />
          </Box>
        )}

        {/* File Info */}
        {fileName && !loading && (
          <Alert
            severity='success'
            sx={{ marginBottom: '16px' }}
            icon={<Icon icon='mdi:check-circle' />}
          >
            <Typography variant='caption'>
              File uploaded: <strong>{fileName}</strong>
            </Typography>
          </Alert>
        )}
      </CardContent>

      <Divider />

      <CardActions
        sx={{
          display: 'flex',
          gap: '8px',
          padding: '16px',
          justifyContent: isSmallScreen ? 'flex-start' : 'space-between',
          flexDirection: isSmallScreen ? 'column-reverse' : 'row',
        }}
      >
        <Button
          variant='outlined'
          size='small'
          startIcon={<Icon icon='tabler:template' />}
          onClick={onDownloadTemplate}
          disabled={loading}
          fullWidth={isSmallScreen}
        >
          Download Template
        </Button>

        {/* Info Button */}
        <Button
          variant='text'
          size='small'
          startIcon={<Icon icon='mdi:information' />}
          onClick={() => {
            // Could open a help dialog
          }}
          sx={{ ml: 'auto', display: isSmallScreen ? 'none' : 'flex' }}
        >
          Help
        </Button>
      </CardActions>
    </Card>
  );
};

export default ImportSectionCard;
