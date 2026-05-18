export type ApprovalBreadcrumb = {
  approver?: string;
  slaPeriod?: number;
};

type ApprovalBreadcrumbProps = {
  breadCrumbList: ApprovalBreadcrumb[];
  showSlaLabel?: boolean;
  showApproveReject?: boolean;
};

export default ApprovalBreadcrumbProps;
