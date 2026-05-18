'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Icon from '@/core/components/icon';
import candidateService from '@/redux/recruitment/candidates/candidates.service';
import { CandidateJobPostDetails } from '@/types/recruitment/job-post';
import { formatDate } from '@/utils/day-utils';

interface CandidateJobPostDetailsModalProps {
  open: boolean;
  onClose: () => void;
  candidateJobPostId: number | null;
}

const InfoRow: React.FC<{
  label: string;
  value?: React.ReactNode;
  fullWidth?: boolean;
  icon?: string;
}> = ({ label, value, fullWidth = false, icon }) => (
  <Grid item xs={12} sm={fullWidth ? 12 : 6} md={fullWidth ? 12 : 4}>
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
        {icon && <Icon icon={icon} fontSize={14} color='text.secondary' />}
        <Typography
          variant='caption'
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.7rem',
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        variant='body1'
        sx={{
          color: 'text.primary',
          fontWeight: 500,
          fontSize: '0.95rem',
          wordBreak: 'break-word',
        }}
      >
        {value || '-'}
      </Typography>
    </Box>
  </Grid>
);

const SectionTitle: React.FC<{
  icon: string;
  title: string;
  count?: number;
  badge?: React.ReactNode;
}> = ({ icon, title, count, badge }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 3,
      pb: 1.5,
      borderBottom: '2px solid',
      borderColor: 'divider',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '20px',
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon icon={icon} fontSize={20} />
      </Box>
      <Typography variant='h6' sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
        {title}
        {count !== undefined && (
          <Typography component='span' sx={{ ml: 1, color: 'text.secondary', fontSize: '0.9rem' }}>
            ({count})
          </Typography>
        )}
      </Typography>
    </Box>
    {badge}
  </Box>
);

const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}> = ({ icon, label, value, color = 'grey.900' }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: '20px',
      border: '1px solid',
      borderColor: 'grey.200',
      bgcolor: 'grey.50',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      transition: 'all 0.2s',
      '&:hover': {
        borderColor: color,
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      },
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '20px',
        bgcolor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon icon={icon} fontSize={24} color='#fff' />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant='caption'
        sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}
      >
        {label}
      </Typography>
      <Typography variant='h6' sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.3 }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const CandidateJobPostDetailsModal: React.FC<CandidateJobPostDetailsModalProps> = ({
  open,
  onClose,
  candidateJobPostId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<CandidateJobPostDetails | null>(null);

  useEffect(() => {
    if (open && candidateJobPostId) {
      fetchDetails();
    }
    return () => {
      setDetails(null);
      setError(null);
    };
  }, [open, candidateJobPostId]);

  const fetchDetails = async () => {
    if (!candidateJobPostId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await candidateService.fetchCandidateJobPostDetails(candidateJobPostId);
      setDetails(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  const formatExperience = (months?: number) => {
    if (!months) return '-';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years}y ${remainingMonths}m`;
  };

  const formatAddress = (candidate: CandidateJobPostDetails['candidate']) => {
    if (!candidate) return '-';
    const parts = [
      candidate.permanentHouseName,
      candidate.permanentLandMark,
      candidate.permanentAreaName,
      candidate.permanentDistrict?.name,
      candidate.permanentState?.name,
      candidate.permanentPinCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  const getStatusColor = (status?: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('hired') || statusLower.includes('selected')) return 'success';
    if (statusLower.includes('reject')) return 'error';
    if (statusLower.includes('pending') || statusLower.includes('review')) return 'warning';
    return 'default';
  };

  const renderExtraDetails = (extraDetails?: Record<string, any>) => {
    if (!extraDetails || Object.keys(extraDetails).length === 0) return null;

    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <SectionTitle
          icon='mdi:file-document-outline'
          title='Additional Details'
          count={Object.keys(extraDetails).length}
        />
        <Grid container spacing={3}>
          {Object.entries(extraDetails).map(([key, value]) => (
            <InfoRow
              key={key}
              label={key}
              value={typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')}
            />
          ))}
        </Grid>
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '92vh',
          bgcolor: 'background.default',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          pt: 3,
          px: 4,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: 'grey.900',
              fontSize: '1.3rem',
              fontWeight: 700,
            }}
          >
            {getInitials(details?.candidate?.name)}
          </Avatar>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700, mb: 0.3 }}>
              {details?.candidate?.name || 'Candidate Details'}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Icon icon='mdi:briefcase-outline' fontSize={16} />
              {details?.jobPost?.name || 'Complete profile information'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size='large'
          sx={{
            bgcolor: 'grey.100',
            '&:hover': { bgcolor: 'grey.200', transform: 'rotate(90deg)' },
            transition: 'all 0.2s',
          }}
        >
          <Icon icon='mdi:close' fontSize={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          px: 4,
          py: 4,
          bgcolor: 'background.default',
        }}
      >
        {loading ? (
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}
          >
            <CircularProgress size={48} thickness={3.5} />
            <Typography variant='body2' color='text.secondary'>
              Loading candidate details...
            </Typography>
          </Box>
        ) : error ? (
          <Alert
            severity='error'
            sx={{
              my: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.main',
            }}
          >
            {error}
          </Alert>
        ) : details ? (
          <Box>
            {/* Quick Stats */}
            <Grid container spacing={2} sx={{ mb: 3, mt: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon='mdi:calendar-clock'
                  label='Applied On'
                  value={details.appliedDate ? formatDate(details.appliedDate) : '-'}
                  color='grey.900'
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon='mdi:briefcase-clock'
                  label='Experience'
                  value={
                    formatExperience(details.candidate?.totalRelevantExperienceInMonths) || '-'
                  }
                  color='grey.700'
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon='mdi:currency-inr'
                  label='Current Salary'
                  value={
                    details.candidate?.currentSalary
                      ? `₹${(details.candidate.currentSalary / 100000).toFixed(1)}L`
                      : '-'
                  }
                  color='grey.800'
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon='mdi:currency-inr'
                  label='Expected Salary'
                  value={
                    details.candidate?.expectedSalary
                      ? `₹${(details.candidate.expectedSalary / 100000).toFixed(1)}L`
                      : '-'
                  }
                  color='grey.900'
                />
              </Grid>
            </Grid>

            {/* Basic Info Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <SectionTitle
                icon='mdi:account-circle-outline'
                title='Personal Information'
                badge={
                  details.status && (
                    <Chip
                      label={details.status}
                      color={getStatusColor(details.status)}
                      size='small'
                      sx={{
                        fontWeight: 600,
                        height: 28,
                      }}
                    />
                  )
                }
              />
              <Grid container spacing={3}>
                <InfoRow label='Full Name' value={details.candidate?.name} icon='mdi:account' />
                <InfoRow label='Email Address' value={details.candidate?.email} icon='mdi:email' />
                <InfoRow
                  label='Phone Number'
                  icon='mdi:phone'
                  value={
                    details.candidate?.phoneNumber
                      ? `${details.candidate?.countryCode || ''} ${details.candidate?.phoneNumber}`.trim()
                      : undefined
                  }
                />
                <InfoRow
                  label='Gender'
                  value={details.candidate?.gender}
                  icon='mdi:gender-male-female'
                />
                <InfoRow
                  label='Date of Birth'
                  icon='mdi:cake-variant'
                  value={details.candidate?.dob ? formatDate(details.candidate.dob) : undefined}
                />
                <InfoRow
                  label='Board'
                  value={details.board?.name}
                  icon='mdi:view-dashboard-outline'
                />
                <InfoRow
                  label='Address'
                  value={formatAddress(details.candidate)}
                  fullWidth
                  icon='mdi:map-marker'
                />
              </Grid>
            </Paper>

            {/* Skills & Languages */}
            {((details.candidate?.skills && details.candidate.skills.length > 0) ||
              (details.candidate?.candidateLanguages &&
                details.candidate.candidateLanguages.length > 0)) && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                {details.candidate?.skills && details.candidate.skills.length > 0 && (
                  <Box sx={{ mb: details.candidate?.candidateLanguages?.length ? 4 : 0 }}>
                    <SectionTitle
                      icon='mdi:code-tags'
                      title='Technical Skills'
                      count={details.candidate.skills.length}
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {details.candidate.skills.map((skill) => (
                        <Chip
                          key={skill.id}
                          label={skill.name}
                          size='medium'
                          sx={{
                            bgcolor: 'grey.900',
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            height: 34,
                            '&:hover': {
                              bgcolor: 'grey.800',
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {details.candidate?.candidateLanguages &&
                  details.candidate.candidateLanguages.length > 0 && (
                    <Box>
                      <SectionTitle
                        icon='mdi:translate'
                        title='Known Languages'
                        count={details.candidate.candidateLanguages.length}
                      />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {details.candidate.candidateLanguages
                          .filter((l) => l.language)
                          .map((lang) => (
                            <Chip
                              key={lang.id}
                              label={lang.language?.name}
                              size='medium'
                              sx={{
                                bgcolor: 'grey.100',
                                color: 'text.primary',
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                height: 34,
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                  borderColor: 'grey.400',
                                  bgcolor: 'grey.200',
                                },
                                transition: 'all 0.2s',
                              }}
                            />
                          ))}
                      </Box>
                    </Box>
                  )}
              </Paper>
            )}

            {/* Education */}
            {details.candidate?.educationDetails &&
              details.candidate.educationDetails.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <SectionTitle
                    icon='mdi:school-outline'
                    title='Education'
                    count={details.candidate.educationDetails.length}
                  />
                  <Stack spacing={2}>
                    {details.candidate.educationDetails.map((edu, index) => (
                      <Paper
                        key={edu.id}
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: '20px',
                          border: '1px solid',
                          borderColor: 'grey.200',
                          bgcolor: 'grey.50',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'grey.900',
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            bgcolor: 'grey.900',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '20px',
                              bgcolor: 'background.paper',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Icon icon='mdi:book-open-variant' fontSize={22} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant='body1'
                              fontWeight={700}
                              sx={{ mb: 0.5, fontSize: '1rem' }}
                            >
                              {edu.degree || edu.qualification?.name || 'Degree not specified'}
                            </Typography>
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              sx={{ mb: 1, fontWeight: 500 }}
                            >
                              {edu.institution || 'Institution not specified'}
                            </Typography>
                            {edu.startDate && edu.endDate && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Icon
                                  icon='mdi:calendar-range'
                                  fontSize={14}
                                  color='text.secondary'
                                />
                                <Typography variant='caption' color='text.secondary'>
                                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              )}

            {/* Work Experience */}
            {details.candidate?.experienceDetails &&
              details.candidate.experienceDetails.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <SectionTitle
                    icon='mdi:briefcase-variant-outline'
                    title='Work Experience'
                    count={details.candidate.experienceDetails.length}
                  />
                  <Stack spacing={2}>
                    {details.candidate.experienceDetails.map((exp, index) => (
                      <Paper
                        key={exp.id}
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: '20px',
                          border: '1px solid',
                          borderColor: 'grey.200',
                          bgcolor: 'grey.50',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'grey.900',
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            bgcolor: 'grey.900',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '20px',
                              bgcolor: 'background.paper',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Icon icon='mdi:office-building' fontSize={22} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant='body1'
                              fontWeight={700}
                              sx={{ mb: 0.5, fontSize: '1rem' }}
                            >
                              {exp.jobTitle || 'Title not specified'}
                            </Typography>
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              sx={{ mb: 1, fontWeight: 500 }}
                            >
                              {exp.companyName || 'Company not specified'}
                            </Typography>
                            {exp.startDate && exp.endDate && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Icon
                                  icon='mdi:calendar-range'
                                  fontSize={14}
                                  color='text.secondary'
                                />
                                <Typography variant='caption' color='text.secondary'>
                                  {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              )}

            {/* Extra Details from Import */}
            {renderExtraDetails(details.extraDetails)}
          </Box>
        ) : (
          <Box
            sx={{
              py: 8,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon icon='mdi:account-question' fontSize={48} color='text.secondary' />
            </Box>
            <Typography variant='h6' color='text.secondary'>
              No details available
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CandidateJobPostDetailsModal;
