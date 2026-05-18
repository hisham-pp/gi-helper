'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '@/core/components/icon';
import { TileCard, TileIconWrapper, TileTitle } from './styled-components';

type NavTileProps = {
  icon?: string;
  title: string;
  onClick?: () => void;
};

const NavTile = ({ icon, title, onClick }: NavTileProps) => {
  const { t } = useTranslation();

  return (
    <TileCard onClick={onClick}>
      <TileIconWrapper>
        <Icon icon={icon || 'material-symbols:folder'} width={28} height={28} />
      </TileIconWrapper>
      <TileTitle>{t(title)}</TileTitle>
    </TileCard>
  );
};

export default memo(NavTile);
