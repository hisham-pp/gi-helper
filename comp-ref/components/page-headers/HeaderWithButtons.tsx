'use client';

import React, { memo } from 'react';
import Grid from '@mui/material/Grid';
import AppButton from '@/core/components/button';
import Translations from '@/core/components/translations';
import ExportMenu from '../export-menu';
import PermissionWrapper from '../PermissionWrapper';
import { HeaderWithButtonsProps } from './types';
import { PageHeader } from '.';

const HeaderWithButtons: React.FC<HeaderWithButtonsProps> = ({
  outlineButtonProps = {},
  containedButtonProps = {},
  extendTitleEnd,
  renderActionsEnd,
  showExportMenu = false,
  exportMenuProps = {},
  ...rest
}) => {
  const {
    label: outlineLabel = 'Cancel',
    isShow: outlineShow = false,
    permissionKeys: outlinePermissionKeys,
    variant: outlineVariant = 'outlined',
    ...outlineRest
  } = outlineButtonProps;

  const {
    label: containedLabel = 'Save',
    isShow: containedShow = true,
    permissionKeys: containedPermissionKeys,
    ...containedProps
  } = containedButtonProps;

  const { inProgress, options, permissionKeys: exportPermissionKeys } = exportMenuProps;

  const renderTitleEnd = () => {
    return (
      <Grid
        container
        alignItems='center'
        gap={1}
        sx={{
          '& button': {
            minWidth: 100,
            minHeight: 32,
          },
        }}
      >
        {extendTitleEnd && extendTitleEnd()}
        {showExportMenu && (
          <PermissionWrapper permissionKeys={exportPermissionKeys || []}>
            <ExportMenu inProgress={inProgress} options={options} />
          </PermissionWrapper>
        )}
        {outlineShow && (
          <AppButton {...outlineRest} fullWidth={false} variant={outlineVariant} id='cancel'>
            {typeof outlineLabel === 'string' ? <Translations text={outlineLabel} /> : outlineLabel}
          </AppButton>
        )}
        {containedShow && (
          <PermissionWrapper permissionKeys={containedPermissionKeys || []}>
            <AppButton type='submit' {...containedProps} fullWidth={false} id='submit'>
              {typeof containedLabel === 'string' ? (
                <Translations text={containedLabel} />
              ) : (
                containedLabel
              )}
            </AppButton>
          </PermissionWrapper>
        )}
        {renderActionsEnd && renderActionsEnd()}
      </Grid>
    );
  };

  return <PageHeader showBackArrow renderTitleEnd={renderTitleEnd()} {...rest} />;
};

export default memo(HeaderWithButtons);
