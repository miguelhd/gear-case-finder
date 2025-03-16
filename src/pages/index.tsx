import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Gear Case Finder - Find the Perfect Case for Your Audio Gear</title>
        <meta name="description" content="Find the perfect protective case for your audio equipment and musical gear" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">Welcome to Gear Case Finder</h1>
          <p className="text-center text-lg mb-8">The ultimate resource for finding the perfect protective case for your audio equipment</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Link href="/gear" className="block">
              <div className="bg-blue-50 hover:bg-blue-100 transition-colors rounded-lg p-6 text-center h-full flex flex-col items-center justify-center">
                <h2 className="text-2xl font-semibold mb-4 text-blue-700">Browse Audio Gear</h2>
                <p className="text-gray-600 mb-4">Explore our database of audio equipment and find matching cases</p>
                <span className="btn-primary mt-auto">View All Gear</span>
              </div>
            </Link>
            
            <Link href="/cases" className="block">
              <div className="bg-blue-50 hover:bg-blue-100 transition-colors rounded-lg p-6 text-center h-full flex flex-col items-center justify-center">
                <h2 className="text-2xl font-semibold mb-4 text-blue-700">Browse Cases</h2>
                <p className="text-gray-600 mb-4">Discover protective cases for all types of audio equipment</p>
                <span className="btn-primary mt-auto">View All Cases</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Find Your Gear</h3>
              <p className="text-gray-600">Browse or search for your specific audio equipment model</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">View Matching Cases</h3>
              <p className="text-gray-600">See perfectly sized cases specifically for your gear</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Purchase With Confidence</h3>
              <p className="text-gray-600">Buy from trusted retailers with our affiliate links</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
