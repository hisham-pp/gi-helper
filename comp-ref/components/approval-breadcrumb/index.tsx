import React from 'react';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DATE_FORMATS } from '@/constant/date-format';
import Icon from '@/core/components/icon';
import { formatTime, TimeUnit } from '@/utils/day-utils';
import { BreadCrumbContainer } from './styled-components';
import ApprovalBreadcrumbProps from './type';

const { HOUR_MINUTE_WITH_COLAN } = DATE_FORMATS;

const ApprovalBreadcrumb: React.FC<ApprovalBreadcrumbProps> = ({
  breadCrumbList,
  showSlaLabel = true,
  showApproveReject = true,
}) => {
  if (!breadCrumbList?.length) {
    return null;
  }

  return (
    <BreadCrumbContainer container>
      {breadCrumbList?.map((approver, i) => {
        return (
          <Box key={`breadcrumb-${i}`}>
            <Grid container alignItems='center'>
              <Typography className='approver-label'>
                {approver?.approver}
                {showSlaLabel && (
                  <label className='sla-label'>
                    (
                    {formatTime(approver?.slaPeriod ?? 0, {
                      unit: TimeUnit.MINUTES,
                      format: HOUR_MINUTE_WITH_COLAN,
                      hyphenForEmpty: false,
                    })}
                    )
                  </label>
                )}
              </Typography>
              <Icon icon='iconamoon:arrow-right-2' className='arrow-icon' />
            </Grid>
          </Box>
        );
      })}
      {showApproveReject && (
        <Typography>
          <span className='approve'>Approve</span> / <span className='reject'>Reject</span>
        </Typography>
      )}
    </BreadCrumbContainer>
  );
};

export default ApprovalBreadcrumb;
