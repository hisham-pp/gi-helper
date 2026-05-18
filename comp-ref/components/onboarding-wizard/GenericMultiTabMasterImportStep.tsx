'use client';

import React, { useState } from 'react';
import { Alert, Box, Tab, Tabs, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import Icon from '@/core/components/icon';
import { RootState } from '@/libs/store/configure-store';
import { OnboardingSection } from '@/types/master/company-onboarding';
import { MasterConfig, MasterTab } from '@/types/masters-config';
import { GenericMasterImportStep } from './GenericMasterImportStep';

export interface GenericMultiTabMasterImportStepProps {
  config: MasterConfig;
  tabs: MasterTab[];
  onStepComplete?: () => void;
}

/**
 * Generic Multi-Tab Master Import Step Component
 *
 * Handles masters that have multiple sections with different configurations
 * Examples: LeaveConfigStep (leaves + holidays), PayrollConfigStep (if needed in future)
 *
 * Displays tabs for each section and manages tab switching
 */
export const GenericMultiTabMasterImportStep: React.FC<GenericMultiTabMasterImportStepProps> = ({
  config,
  tabs,
  onStepComplete,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const { previews } = useSelector((state: RootState) => state.companyOnboarding);

  const currentTab = tabs[activeTab];

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Convert tab to master config for rendering
  const tabConfig: MasterConfig = {
    section: currentTab.section as OnboardingSection,
    label: currentTab.label,
    description: config.description,
    icon: currentTab.icon,
    columns: currentTab.columns,
    csvColumns: currentTab.csvColumns,
    requiredFields: currentTab.requiredFields,
  };

  return (
    <Box>
      {/* Title */}
      <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
        {config.label}
      </Typography>

      {/* Description Alert */}
      <Alert severity='info' icon={<Icon icon='mdi:information-variant' />} sx={{ mb: 3 }}>
        {config.description}
      </Alert>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          {tabs.map((tab, idx) => {
            const tabIsImported = previews[tab.section as OnboardingSection]?.id !== undefined;
            return (
              <Tab
                key={idx}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.icon && <Icon icon={tab.icon} />}
                    {tab.label}
                    {tabIsImported && (
                      <Box sx={{ color: 'success.main', fontSize: 'small' }}>
                        <Icon icon='mdi:check-circle' />
                      </Box>
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Box>

      {/* Generic Import Step for Current Tab */}
      <GenericMasterImportStep
        config={tabConfig}
        onStepComplete={
          // Only call onStepComplete when all tabs are imported
          tabs.every((tab) => previews[tab.section as OnboardingSection]?.id !== undefined)
            ? onStepComplete
            : undefined
        }
      />
    </Box>
  );
};

export default GenericMultiTabMasterImportStep;
