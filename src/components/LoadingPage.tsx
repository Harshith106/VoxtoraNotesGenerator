/** LoadingPage.tsx */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { api, TranscriptRequest, TranscriptResponse } from '@/lib/api';

interface LoadingPageProps {
  onComplete: (response: TranscriptResponse) => void;
  formData: TranscriptRequest;
  onBack?: () => void;
}

export default function LoadingPage({ onComplete, formData, onBack }: LoadingPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Remove complex step mapping - keep it simple

  const processVideo = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      console.log('Starting video processing...');

      const response = await api.processVideo(formData);

      console.log('Video processing completed:', response);

      // Small delay to show completion state
      setTimeout(() => {
        setIsProcessing(false);
        onComplete(response);
      }, 500);

    } catch (err) {
      console.error('Processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while processing the video';
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    processVideo();
  };

  useEffect(() => {
    processVideo();
  }, [formData, onComplete]);

  // Progress and steps are now handled in processVideo function

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  if (error) {
    return (
      <motion.div
        className="min-h-screen cosmic-bg flex items-center justify-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-2xl w-full text-center">
          <motion.div variants={itemVariants} className="mb-8">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="absolute inset-0 rounded-full border-4 border-red-500/20"></div>
              <div className="absolute inset-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-red-400 mb-4">
              Processing Failed
            </h1>
            <p className="text-aurora-text/80 text-lg mb-8">
              {error}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-4 justify-center">
            <motion.button
              onClick={handleRetry}
              className="px-6 py-3 bg-aurora-primary rounded-lg text-white font-semibold hover-lift flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-5 h-5" />
              Retry {retryCount > 0 && `(${retryCount})`}
            </motion.button>

            {onBack && (
              <motion.button
                onClick={onBack}
                className="px-6 py-3 bg-aurora-text/20 rounded-lg text-aurora-text font-semibold hover-lift"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Go Back
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen cosmic-bg flex items-center justify-center px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-2xl w-full text-center">
        {/* Main Loading Animation */}
        <motion.div variants={itemVariants} className="mb-12">
          <motion.div
            className="w-32 h-32 mx-auto mb-8 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-aurora-text/20"></div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-aurora-accent loading-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            ></motion.div>
            <motion.div
              className="absolute inset-4 rounded-full bg-aurora-primary/20 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                background: [
                  "rgba(102, 126, 234, 0.2)",
                  "rgba(0, 217, 255, 0.2)",
                  "rgba(102, 126, 234, 0.2)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Loader2 className="w-8 h-8 text-aurora-accent" />
            </motion.div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Processing Your Video
          </h1>
          <p className="text-aurora-text/80 text-lg mb-8">
            Please wait while we process your video. This usually depends on the size of your video.
          </p>
        </motion.div>

        {/* Simple Status Message */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-xl p-8 mb-12"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-aurora-accent" />
            </motion.div>
            <div>
              <h3 className="text-aurora-text font-semibold text-xl mb-2">Processing in Progress</h3>
              <p className="text-aurora-text/70">
                We're downloading, transcribing, and generating notes for your video...
              </p>
            </div>
          </div>
        </motion.div>

        {/* Floating Particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-aurora-accent rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
