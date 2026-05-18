'use client';

import React from 'react';
import { StatusEnumeration } from '@/enums/status';
import { MasterChipProps } from './types';
import { StatusChip } from '.';

const { ACTIVE, INACTIVE } = StatusEnumeration;

const MasterStatusChip: React.FC<MasterChipProps> = ({ isActive }) => {
  const status = isActive ? ACTIVE : INACTIVE;

  return <StatusChip status={status} />;
};

export default MasterStatusChip;
