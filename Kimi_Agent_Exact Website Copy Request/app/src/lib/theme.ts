import type { CSSProperties } from 'react';
import type { BrandTheme } from '@/types/platform';

export function createBrandStyle(theme: BrandTheme): CSSProperties {
  return {
    '--gruns-green': theme.primaryColor,
    '--gruns-light-green': theme.lightColor,
    '--gruns-dark-green': theme.darkColor,
    '--gruns-yellow': theme.accentColor,
    '--gruns-cream': theme.backgroundColor,
  } as CSSProperties;
}
