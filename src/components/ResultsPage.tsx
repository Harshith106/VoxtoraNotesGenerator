/** ResultsPage.tsx */
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, Globe, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { TranscriptResponse } from '@/lib/api';

// Language mapping for display names
const languageNames: Record<string, string> = {
  'af': 'Afrikaans',
  'am': 'Amharic',
  'ar': 'Arabic',
  'as': 'Assamese',
  'az': 'Azerbaijani',
  'ba': 'Bashkir',
  'be': 'Belarusian',
  'bg': 'Bulgarian',
  'bn': 'Bengali',
  'bo': 'Tibetan',
  'br': 'Breton',
  'bs': 'Bosnian',
  'ca': 'Catalan',
  'cs': 'Czech',
  'cy': 'Welsh',
  'da': 'Danish',
  'de': 'German',
  'el': 'Greek',
  'en': 'English',
  'es': 'Spanish',
  'et': 'Estonian',
  'eu': 'Basque',
  'fa': 'Persian',
  'fi': 'Finnish',
  'fo': 'Faroese',
  'fr': 'French',
  'ga': 'Irish',
  'gl': 'Galician',
  'gu': 'Gujarati',
  'ha': 'Hausa',
  'haw': 'Hawaiian',
  'he': 'Hebrew',
  'hi': 'Hindi',
  'hr': 'Croatian',
  'ht': 'Haitian Creole',
  'hu': 'Hungarian',
  'id': 'Indonesian',
  'is': 'Icelandic',
  'it': 'Italian',
  'ja': 'Japanese',
  'jw': 'Javanese',
  'ka': 'Georgian',
  'kk': 'Kazakh',
  'km': 'Khmer',
  'kn': 'Kannada',
  'ko': 'Korean',
  'la': 'Latin',
  'lb': 'Luxembourgish',
  'ln': 'Lingala',
  'lo': 'Lao',
  'lt': 'Lithuanian',
  'lv': 'Latvian',
  'mg': 'Malagasy',
  'mi': 'Maori',
  'mk': 'Macedonian',
  'ml': 'Malayalam',
  'mn': 'Mongolian',
  'mr': 'Marathi',
  'ms': 'Malay',
  'mt': 'Maltese',
  'my': 'Myanmar',
  'ne': 'Nepali',
  'nl': 'Dutch',
  'nn': 'Nynorsk',
  'no': 'Norwegian',
  'oc': 'Occitan',
  'or': 'Oriya',
  'pa': 'Punjabi',
  'pl': 'Polish',
  'ps': 'Pashto',
  'pt': 'Portuguese',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sa': 'Sanskrit',
  'sd': 'Sindhi',
  'si': 'Sinhala',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'sn': 'Shona',
  'so': 'Somali',
  'sq': 'Albanian',
  'sr': 'Serbian',
  'su': 'Sundanese',
  'sv': 'Swedish',
  'sw': 'Swahili',
  'ta': 'Tamil',
  'te': 'Telugu',
  'tg': 'Tajik',
  'th': 'Thai',
  'ti': 'Tigrinya',
  'tk': 'Turkmen',
  'tl': 'Tagalog',
  'tr': 'Turkish',
  'tt': 'Tatar',
  'uk': 'Ukrainian',
  'ur': 'Urdu',
  'uz': 'Uzbek',
  'vi': 'Vietnamese',
  'yi': 'Yiddish',
  'yo': 'Yoruba',
  'zh': 'Chinese',
  'zu': 'Zulu'
};

const getLanguageName = (code: string): string => {
  return languageNames[code] || code.toUpperCase();
};

interface ResultsPageProps {
  onBack: () => void;
  onNewVideo: () => void;
  response: TranscriptResponse;
}

export default function ResultsPage({ onBack, onNewVideo, response }: ResultsPageProps) {
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

  const handleDownload = async (type: 'transcript' | 'notes' | 'pdf') => {
    try {
      console.log(`Starting download for ${type}...`);

      // Use the download API endpoint
      const downloadUrl = `/api/download/${response.video_id}/${type}`;

      // Create a temporary link and trigger download directly
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank'; // Open in new tab as fallback

      // Set download attribute with proper filename
      const extensions = { transcript: 'txt', notes: 'md', pdf: 'pdf' };
      link.download = `video_${response.video_id}_${type}.${extensions[type]}`;

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Download initiated for ${type}`);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  return (
    <motion.div 
      className="min-h-screen cosmic-bg flex items-center justify-center px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.button
              onClick={onBack}
            className="inline-flex items-center gap-2 text-aurora-text/60 hover:text-aurora-accent transition-colors mb-6"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-4 h-4" />
            Back to Form
            </motion.button>
          
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Processing Complete!
              </h1>
          <p className="text-aurora-text/80 text-lg">
            Your video has been successfully processed. Download your files below.
          </p>
        </motion.div>

        {/* Results Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Transcript Card */}
          <motion.div 
            className="glass rounded-xl p-6 hover-lift cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDownload('transcript')}
          >
            <div className="w-12 h-12 rounded-full bg-aurora-accent/20 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-aurora-accent" />
            </div>
            <h3 className="text-aurora-text font-semibold text-center mb-2">Transcript</h3>
            <p className="text-aurora-text/70 text-sm text-center">
              Full text transcription of the video
            </p>
          </motion.div>

          {/* Notes Card */}
          <motion.div 
            className="glass rounded-xl p-6 hover-lift cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDownload('notes')}
          >
            <div className="w-12 h-12 rounded-full bg-aurora-accent/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-aurora-accent" />
          </div>
            <h3 className="text-aurora-text font-semibold text-center mb-2">AI Notes</h3>
            <p className="text-aurora-text/70 text-sm text-center">
              AI-generated summary and key points
            </p>
          </motion.div>

          {/* PDF Card */}
          <motion.div 
            className="glass rounded-xl p-6 hover-lift cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDownload('pdf')}
          >
            <div className="w-12 h-12 rounded-full bg-aurora-accent/20 flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-aurora-accent" />
            </div>
            <h3 className="text-aurora-text font-semibold text-center mb-2">PDF Document</h3>
            <p className="text-aurora-text/70 text-sm text-center">
              Downloadable PDF with all content
            </p>
          </motion.div>
        </motion.div>

        {/* Language Info */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-aurora-accent" />
            <h3 className="text-aurora-text font-semibold">Language Processing</h3>
          </div>

          {/* Language Flow */}
          <div className="flex items-center justify-between mb-6">
            {/* Detected Language */}
            <div className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-aurora-text/60 text-sm mb-1">Detected</p>
              <p className="text-aurora-text font-semibold text-lg">
                {getLanguageName(response.detected_language)}
              </p>
              <p className="text-aurora-text/40 text-xs">
                ({response.detected_language.toUpperCase()})
              </p>
            </div>

            {/* Arrow or Check */}
            <div className="flex-shrink-0 mx-6">
              {response.translated ? (
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-aurora-accent" />
                  <span className="text-aurora-accent text-sm font-medium">Translated</span>
                  <ArrowRight className="w-5 h-5 text-aurora-accent" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">No translation needed</span>
                </div>
              )}
            </div>

            {/* Target Language */}
            <div className="flex-1 text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                response.translated ? 'bg-aurora-accent/20' : 'bg-green-500/20'
              }`}>
                <FileText className={`w-6 h-6 ${
                  response.translated ? 'text-aurora-accent' : 'text-green-400'
                }`} />
              </div>
              <p className="text-aurora-text/60 text-sm mb-1">Final Content</p>
              <p className="text-aurora-text font-semibold text-lg">
                {getLanguageName(response.target_language)}
              </p>
              <p className="text-aurora-text/40 text-xs">
                ({response.target_language.toUpperCase()})
              </p>
            </div>
          </div>

          {/* Processing Summary */}
          <div className="border-t border-aurora-text/10 pt-4">
            <div className="flex items-center justify-center gap-2 text-aurora-text/70 text-sm">
              {response.translated ? (
                <>
                  <span>Content was automatically translated from</span>
                  <span className="font-medium text-aurora-text">
                    {getLanguageName(response.detected_language)}
                  </span>
                  <span>to</span>
                  <span className="font-medium text-aurora-text">
                    {getLanguageName(response.target_language)}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Content processed in original language:</span>
                  <span className="font-medium text-aurora-text">
                    {getLanguageName(response.detected_language)}
                  </span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* New Video Button */}
        <motion.div variants={itemVariants} className="text-center">
          <motion.button
            onClick={onNewVideo}
            className="px-8 py-3 bg-aurora-primary rounded-lg text-white font-semibold 
                       hover-lift flex items-center justify-center gap-3 group relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center gap-3">
              Process Another Video
              <Zap className="w-5 h-5" />
            </span>
            <motion.div
              className="absolute inset-0 bg-aurora-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
