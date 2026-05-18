import { useTranslation } from 'react-i18next';

type Props = {
  text?: string;
};

const Translations = ({ text }: Props) => {
  const { t } = useTranslation();

  if (!text) return '';

  return <>{`${t(text)}`}</>;
};

export default Translations;
