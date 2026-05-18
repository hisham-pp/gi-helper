const typography = {
  fontFamily: ['Inter', 'sans-serif'].join(','),
  h1: {
    fontSize: '1.75rem', // 28px - page titles
    fontWeight: 500,
  },
  h2: {
    fontSize: '1.5rem', // 24px - section headers
    fontWeight: 500,
  },
  h3: {
    fontSize: '1.25rem', // 20px - card headers
    fontWeight: 500,
  },
  h4: {
    fontSize: '1.125rem', // 18px - subsection headers
    fontWeight: 500,
  },
  h5: {
    fontSize: '1rem', // 16px - emphasis text
    fontWeight: 500,
  },
  h6: {
    fontSize: '0.875rem', // 14px - small headers
    fontWeight: 500,
  },
  body1: {
    fontSize: '0.875rem', // 14px - main body text
  },
  body2: {
    fontSize: '0.8125rem', // 13px - secondary text
  },
  caption: {
    fontSize: '0.75rem', // 12px - smallest readable
  },
  button: {
    fontSize: '0.875rem', // 14px - button text
    textTransform: 'none' as const,
  },
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  fontWeightExtraBold: 700,
};

export default typography;
