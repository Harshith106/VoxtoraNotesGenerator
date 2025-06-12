import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import CoverPage from '@/components/CoverPage';
import FormPage from '@/components/FormPage';
import LoadingPage from '@/components/LoadingPage';
import ResultsPage from '@/components/ResultsPage';
import { TranscriptRequest, TranscriptResponse } from '@/lib/api';

type Page = 'cover' | 'form' | 'loading' | 'results';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('cover');
  const [formData, setFormData] = useState<TranscriptRequest | null>(null);
  const [apiResponse, setApiResponse] = useState<TranscriptResponse | null>(null);

  const handleGetStarted = () => {
    setCurrentPage('form');
  };

  const handleFormSubmit = (data: TranscriptRequest) => {
    setFormData(data);
    setCurrentPage('loading');
  };

  const handleLoadingComplete = (response: TranscriptResponse) => {
    setApiResponse(response);
    setCurrentPage('results');
  };

  const handleBackToCover = () => {
    setCurrentPage('cover');
  };

  const handleBackToForm = () => {
    setCurrentPage('form');
  };

  const handleNewVideo = () => {
    setFormData(null);
    setApiResponse(null);
    setCurrentPage('form');
  };

  return (
    <div className="min-h-screen bg-aurora-dark">
      <AnimatePresence mode="wait">
        {currentPage === 'cover' && (
          <CoverPage 
            key="cover"
            onGetStarted={handleGetStarted} 
          />
        )}
        
        {currentPage === 'form' && (
          <FormPage 
            key="form"
            onSubmit={handleFormSubmit}
            onBack={handleBackToCover}
          />
        )}
        
        {currentPage === 'loading' && formData && (
          <LoadingPage
            key="loading"
            onComplete={handleLoadingComplete}
            formData={formData}
            onBack={handleBackToForm}
          />
        )}
        
        {currentPage === 'results' && apiResponse && (
          <ResultsPage 
            key="results"
            onBack={handleBackToForm}
            onNewVideo={handleNewVideo}
            response={apiResponse}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
