/* eslint-disable @typescript-eslint/no-var-requires */
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { Tolgee } from '@tolgee/core';
import { TolgeeProvider } from '@tolgee/react';

const fallbackLanguage = 'en';
const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL;
const localData = {
  en: () => import('../i18n/en.json'),
  cs: () => import('../i18n/cs.json'),
  de: () => import('../i18n/de.json'),
  fr: () => import('../i18n/fr.json'),
};

function MyApp({ Component, pageProps, locales }: AppProps & { locales: any }) {
  const router = useRouter();
  return (
    <TolgeeProvider
      ui={apiKey ? require('@tolgee/ui').UI : undefined}
      forceLanguage={router.locale}
      apiKey={apiKey}
      apiUrl={apiUrl}
      wrapperMode="invisible"
      staticData={{
        ...localData,
        ...locales,
      }}
      fallbackLanguage={fallbackLanguage}
      loadingFallback={<div>Loading...</div>}
    >
      <Component {...pageProps} />
    </TolgeeProvider>
  );
}

// this is an easiest way how to get translations in SSR
// if you want to optimize further, you can use per page getStaticProps etc.
// but the principle is the same - we use Tolgee as client to fetch translations
// and let it decide where it fetches it from (local or tolgee platform)
MyApp.getInitialProps = async (context: any) => {
  const locale = context.router.locale;
  const tolgee = Tolgee.init({
    staticData: localData,
    apiKey,
    apiUrl,
  });
  const result = {
    locales: {
      // get translations for current locale
      [locale]: await tolgee.loadTranslations(locale),
      // get translations for fallback locale (optional)
      [fallbackLanguage]: await tolgee.loadTranslations(fallbackLanguage),
    },
  };
  return result;
};

export default MyApp;
