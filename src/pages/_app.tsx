import React from 'react';
import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { client } from '../lib/apollo-client';
import '../styles/globals.css';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider attribute="class" defaultTheme="system">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default MyApp;
