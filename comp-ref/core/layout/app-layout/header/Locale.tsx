import Image from 'next/image';
import { memo, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ENGLISH_TOGGLE } from '@/configs/image-paths';
import languages from '@/constant/locales';
import { useSettings } from '@/hooks/use-settings';

const Locale = () => {
  const { i18n } = useTranslation();
  const { settings, saveSettings } = useSettings();
  const { language } = settings;

  const toggleLanguage = () => {
    const newLang = languages.find((lang) => lang.langCode !== language.langCode);
    if (newLang) {
      i18n.changeLanguage(newLang.langCode);
      saveSettings({ ...settings, language: newLang });
    }
  };

  useEffect(() => {
    if (language?.langCode && i18n.language !== language.langCode) {
      i18n.changeLanguage(language.langCode);
    }
  }, [language?.langCode, i18n]);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <IconButton onClick={toggleLanguage} sx={{ p: 1, borderRadius: (t) => t.shape.borderRadius }}>
      <Box
        sx={{
          width: 74,
          height: 38,
          borderRadius: (t) => t.shape.borderRadius,
          overflow: 'hidden',
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Image
          src={ENGLISH_TOGGLE}
          alt='toggle'
          width={74}
          height={38}
          style={{ objectFit: 'cover' }}
        />
      </Box>
    </IconButton>
  );
};

export default memo(Locale);
