import { ReactNode, useEffect, useMemo } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import type { Direction } from '@mui/material/styles';
import stylisRTLPlugin from 'stylis-plugin-rtl';

type DirectionProps = {
  children: ReactNode;
  direction?: Direction;
};

const Direction = (props: DirectionProps) => {
  const { children, direction = 'ltr' } = props;

  const styleCache = useMemo(
    () =>
      createCache({
        key: 'rtl',
        prepend: true,
        stylisPlugins: [stylisRTLPlugin],
      }),
    [],
  );

  useEffect(() => {
    document.dir = direction;
  }, [direction]);

  if (direction === 'rtl') {
    return <CacheProvider value={styleCache}>{children}</CacheProvider>;
  }

  return <>{children}</>;
};

export default Direction;
