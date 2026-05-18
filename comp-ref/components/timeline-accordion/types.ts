import { ReactNode } from 'react';
import { StatusEnumeration } from '@/enums/status';
import { DateISOType } from '@/types';
import { Approval } from '@/types/approvals';

export type TimelineEventType = {
  id?: number;
  title?: ReactNode;
  approverLevel?: number;
  isPassed?: boolean;
  status?: StatusEnumeration;
  associateDate?: DateISOType;
  comments?: string | null;
  subtitle?: ReactNode;
};

export type TimelineAccordionProps = {
  status?: StatusEnumeration;
  requestedAt?: DateISOType;
  timelineEvents?: Approval[];
  defaultExpanded?: boolean;
  submittedByOnBehalf?: { name: string; employeeNumber: string } | null;
};

export type TimelineContentProps = {
  events?: TimelineEventType[];
};

export type TimelineEventProps = {
  isLast: boolean;
  event: TimelineEventType;
  selectedCommentId?: null | number;
  setSelectedCommentId?: (id: null | number) => void;
};
