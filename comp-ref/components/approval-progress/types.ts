import { StatusEnumeration } from '@/enums/status';
import { DateISOType } from '@/types';
import { Approval } from '@/types/approvals';
import { TimelineEventType } from '../timeline-accordion/types';

type Size = 'small' | 'medium' | 'large';

export type ApprovalProgressProps = {
  timelineEvents?: Approval[];
  requestedAt?: DateISOType | string;
  size?: Size;
  status: StatusEnumeration;
};

export type ApprovalDotProps = {
  event: TimelineEventType;
  isFirst: boolean;
  size?: Size;
};

export type TooltipContentProps = {
  event: TimelineEventType;
  isApproved: boolean;
  isRejected: boolean;
};
