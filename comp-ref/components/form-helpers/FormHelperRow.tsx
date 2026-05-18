import { memo } from 'react';
import Grid from '@mui/material/Grid';
import { AppFormRowProps } from './types';

function FormHelperRow({
  fields,
  spacing = 4,
  alignItems = 'stretch',
  justifyContent,
}: AppFormRowProps) {
  const columnWidth = Math.floor(12 / fields?.length);

  return (
    <Grid container spacing={spacing} alignItems={alignItems} justifyContent={justifyContent}>
      {fields.map((field, index) => {
        const { xs = 12, sm, md, lg } = field.size || {};

        return (
          <Grid
            key={field.key ?? index}
            size={{ xs, sm, md: md ?? columnWidth ?? 6, lg }}
            sx={{ display: 'flex', width: '100%', minWidth: 0 }}
          >
            {field.component}
          </Grid>
        );
      })}
    </Grid>
  );
}

export default memo(FormHelperRow);
