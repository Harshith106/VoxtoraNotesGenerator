/** FormPage.tsx */
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Youtube, Globe, Cpu, ArrowLeft, Zap } from 'lucide-react';
import { TranscriptRequest } from '@/lib/api';

interface FormPageProps {
  onSubmit: (formData: TranscriptRequest) => void;
  onBack: () => void;
}

export default function FormPage({ onSubmit, onBack }: FormPageProps) {
  const [formData, setFormData] = useState<TranscriptRequest>({
    youtube_url: '',
    model_size: 'base',
    target_language: 'en'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const modelSizes = [
    { value: 'small', label: 'Small', description: 'Fast processing, good accuracy' },
    { value: 'base', label: 'Base', description: 'Balanced speed and accuracy' },
    { value: 'medium', label: 'Medium', description: 'Better accuracy, slower processing' },
    { value: 'large', label: 'Large', description: 'Best accuracy, slowest processing' }
  ];

  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'es', label: 'Spanish', flag: '🇪🇸' },
    { value: 'fr', label: 'French', flag: '🇫🇷' },
    { value: 'de', label: 'German', flag: '🇩🇪' },
    { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
    { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { value: 'ru', label: 'Russian', flag: '🇷🇺' },
    { value: 'ar', label: 'Arabic', flag: '🇦🇪' }
  ];

  const validateYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};

    if (!formData.youtube_url) {
      newErrors.youtube_url = 'YouTube URL is required';
    } else if (!validateYouTubeUrl(formData.youtube_url)) {
      newErrors.youtube_url = 'Please enter a valid YouTube URL';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.4 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen cosmic-bg flex items-center justify-center px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="max-w-2xl w-full">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-aurora-text/60 hover:text-aurora-accent transition-colors mb-6"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>
          
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Transform Your Video
          </h1>
          <p className="text-aurora-text/80 text-lg">
            Configure your video processing preferences and let AI do the magic
          </p>
        </motion.div>

        {/* Form */}
        <motion.form 
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-8 space-y-6"
          variants={itemVariants}
        >
          {/* YouTube URL Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-aurora-text font-medium">
              <Youtube className="w-5 h-5 text-red-500" />
              YouTube Video URL
            </label>
            <motion.input
              type="text"
              value={formData.youtube_url}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-aurora-dark/50 border border-aurora-text/20 rounded-lg 
                         text-aurora-text placeholder-aurora-text/50 focus:border-aurora-accent 
                         focus:outline-none focus:ring-2 focus:ring-aurora-accent/20 transition-all"
              whileFocus={{ scale: 1.02 }}
            />
            {errors.youtube_url && (
              <motion.p 
                className="text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.youtube_url}
              </motion.p>
            )}
          </div>

          {/* Model Size Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-aurora-text font-medium">
              <Cpu className="w-5 h-5 text-aurora-accent" />
              Model Size
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {modelSizes.map((model) => (
                <motion.label
                  key={model.value}
                  className={`relative cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    formData.model_size === model.value
                      ? 'border-aurora-accent bg-aurora-accent/10'
                      : 'border-aurora-text/20 bg-aurora-dark/30 hover:border-aurora-accent/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name="model_size"
                    value={model.value}
                    checked={formData.model_size === model.value}
                    onChange={(e) => setFormData({ ...formData, model_size: e.target.value })}
                    className="sr-only"
                  />
                  <div className="text-aurora-text font-medium mb-1">{model.label}</div>
                  <div className="text-aurora-text/60 text-sm">{model.description}</div>
                </motion.label>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-aurora-text font-medium">
              <Globe className="w-5 h-5 text-aurora-accent" />
              Target Language
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {languages.map((lang) => (
                <motion.label
                  key={lang.value}
                  className={`relative cursor-pointer p-3 rounded-lg border-2 transition-all text-center ${
                    formData.target_language === lang.value
                      ? 'border-aurora-accent bg-aurora-accent/10'
                      : 'border-aurora-text/20 bg-aurora-dark/30 hover:border-aurora-accent/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <input
                    type="radio"
                    name="target_language"
                    value={lang.value}
                    checked={formData.target_language === lang.value}
                    onChange={(e) => setFormData({ ...formData, target_language: e.target.value })}
                    className="sr-only"
                  />
                  <div className="text-2xl mb-1">{lang.flag}</div>
                  <div className="text-aurora-text text-sm font-medium">{lang.label}</div>
                </motion.label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full py-4 bg-aurora-primary rounded-lg text-white font-semibold 
                       hover-lift flex items-center justify-center gap-3 group relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center gap-3">
              Start Processing
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-5 h-5" />
              </motion.div>
            </span>
            <motion.div
              className="absolute inset-0 bg-aurora-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            />
          </motion.button>
        </motion.form>

        {/* Info Cards */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: "⚡", title: "Fast Processing", desc: "Get results in under 30 seconds" },
            { icon: "🎯", title: "High Accuracy", desc: "99% transcription accuracy rate" },
            { icon: "📱", title: "Mobile Friendly", desc: "Works perfectly on all devices" }
          ].map((info, index) => (
            <motion.div
              key={info.title}
              className="glass rounded-lg p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <div className="text-2xl mb-2">{info.icon}</div>
              <div className="text-aurora-text font-medium text-sm mb-1">{info.title}</div>
              <div className="text-aurora-text/60 text-xs">{info.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        variants={itemVariants}
        className="absolute bottom-0 left-0 right-0 glass border-t border-aurora-text/10 py-4"
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-aurora-text/60 text-sm">
            Processing powered by advanced AI models • Secure & Private
          </p>
        </div>
      </motion.footer>
    </motion.div>
  );
}
