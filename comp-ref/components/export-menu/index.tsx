import { useTheme } from '@mui/material';
import AppMenu from '@/core/components/app-menu';
import { MenuOptionProps } from '@/core/components/app-menu/type';
import Icon from '@/core/components/icon';
import ExportMenuIcon from './ExportMenuIcon';

type Props = {
  firstLabel?: string;
  secondLabel?: string;
  inProgress?: boolean;
  options?: MenuOptionProps['options'];
  onExcelClick?: () => void;
  onPDFClick?: () => void;
  hidePDFExport?: boolean;
  isShowButton?: boolean;
};

const ExportMenu: React.FC<Props> = ({
  inProgress,
  firstLabel = 'Export as Excel',
  secondLabel = 'Export as PDF',
  options,
  onPDFClick,
  onExcelClick,
  hidePDFExport = false,
  isShowButton = false,
}) => {
  const theme = useTheme();

  const renderIcon = () => (
    <Icon icon='mingcute:download-line' color={theme.palette.primary.main} />
  );

  const menuOptions =
    options ||
    ([
      {
        text: firstLabel,
        icon: renderIcon(),
        menuItemProps: {
          onClick: onExcelClick,
          disabled: inProgress,
        },
      },
      !hidePDFExport && {
        text: secondLabel,
        icon: renderIcon(),
        menuItemProps: {
          onClick: onPDFClick,
          disabled: inProgress,
        },
      },
    ].filter(Boolean) as MenuOptionProps['options']);

  return (
    <AppMenu
      renderMenuIcon={<ExportMenuIcon inProgress={inProgress} />}
      options={menuOptions}
      isShowButton={isShowButton}
      inProgress={inProgress}
    />
  );
};

export default ExportMenu;
