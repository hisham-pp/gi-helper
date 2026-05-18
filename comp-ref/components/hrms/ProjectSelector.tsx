'use client';

import React, { FC, memo, useEffect, useState } from 'react';
import { Autocomplete, Box, Chip, CircularProgress, TextField, Typography } from '@mui/material';
import Icon from '@/core/components/icon';

interface Project {
  id: number;
  name: string;
  code?: string;
  status?: string;
  branchId?: number;
  branchName?: string;
}

interface ProjectSelectorProps {
  value: number | null;
  onChange: (projectId: number | null) => void;
  onProjectSelect?: (project: Project | null) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  branchId?: number; // Filter projects by branch
  size?: 'small' | 'medium';
  fetchProjects: (branchId?: number) => Promise<Project[]>;
}

const ProjectSelector: FC<ProjectSelectorProps> = ({
  value,
  onChange,
  onProjectSelect,
  label = 'Select Project',
  error = false,
  helperText,
  required = false,
  disabled = false,
  branchId,
  size = 'small',
  fetchProjects,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const data = await fetchProjects(branchId);
        setProjects(data);

        // Set selected project if value exists
        if (value) {
          const project = data.find((p) => p.id === value);
          setSelectedProject(project || null);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [branchId, fetchProjects, value]);

  const handleChange = (_: React.SyntheticEvent, newValue: Project | null) => {
    setSelectedProject(newValue);
    onChange(newValue?.id || null);
    onProjectSelect?.(newValue);
  };

  return (
    <Autocomplete
      options={projects}
      value={selectedProject}
      onChange={handleChange}
      getOptionLabel={(option) => (option.code ? `${option.code} - ${option.name}` : option.name)}
      loading={loading}
      disabled={disabled}
      size={size}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color='inherit' size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component='li' {...props}>
          <Icon
            icon='mdi:folder-open'
            fontSize={20}
            style={{ marginRight: 8, color: 'rgba(0, 0, 0, 0.54)' }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={500}>
              {option.code ? `${option.code} - ${option.name}` : option.name}
            </Typography>
            {option.branchName && (
              <Typography variant='caption' color='textSecondary'>
                {option.branchName}
              </Typography>
            )}
          </Box>
          {option.status && (
            <Chip label={option.status} size='small' color='primary' variant='outlined' />
          )}
        </Box>
      )}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      noOptionsText='No projects found'
    />
  );
};

export default memo(ProjectSelector);
