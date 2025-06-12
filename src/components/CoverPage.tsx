/** CoverPage.tsx */
import { motion } from 'framer-motion';
import { Play, Zap, BookOpen, Download } from 'lucide-react';

interface CoverPageProps {
  onGetStarted: () => void;
}

export default function CoverPage({ onGetStarted }: CoverPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const features = [
    {
      icon: Play,
      title: "YouTube Integration",
      description: "Paste any YouTube video URL and we'll extract the audio automatically"
    },
    {
      icon: Zap,
      title: "AI-Powered Notes",
      description: "Advanced AI creates structured, comprehensive notes in seconds"
    },
    {
      icon: BookOpen,
      title: "Multiple Languages",
      description: "Support for 8 languages with accurate transcription and translation"
    },
    {
      icon: Download,
      title: "Export Ready",
      description: "Download your notes as PDF or get the full transcript instantly"
    }
  ];

  return (
    <div className="min-h-screen cosmic-bg flex flex-col relative">
      {/* Hero Section */}
      <motion.div 
        className="flex-1 flex items-center justify-center px-4 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Title */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-aurora-primary via-aurora-secondary to-aurora-accent bg-clip-text text-transparent animate-aurora">
                VOXTORA
              </span>
            </h1>
            <motion.div 
              className="text-2xl md:text-3xl font-light text-aurora-accent mb-4"
              animate={{ 
                textShadow: [
                  "0 0 20px #00D9FF",
                  "0 0 40px #667eea", 
                  "0 0 20px #00D9FF"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              From Audio to Insights - In Flash
            </motion.div>
            <p className="text-xl md:text-2xl text-aurora-text/80 max-w-3xl mx-auto leading-relaxed">
              Focus on your lectures while we create comprehensive notes for you. 
              Transform any YouTube video into structured, downloadable notes instantly.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div variants={itemVariants} className="mb-16">
            <motion.button
              onClick={onGetStarted}
              className="relative px-12 py-4 text-xl font-semibold bg-aurora-primary rounded-full text-white hover-lift group overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Get Started
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Zap className="w-6 h-6" />
                </motion.div>
              </span>
              <motion.div
                className="absolute inset-0 bg-aurora-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass rounded-xl p-6 hover-lift"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ 
                  background: "rgba(102, 126, 234, 0.1)",
                  borderColor: "#00D9FF"
                }}
              >
                <feature.icon className="w-8 h-8 text-aurora-accent mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2 text-aurora-text">
                  {feature.title}
                </h3>
                <p className="text-aurora-text/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {[
              { number: "50K+", label: "Videos Processed" },
              { number: "8", label: "Languages Supported" },
              { number: "99%", label: "Accuracy Rate" },
              { number: "<30s", label: "Processing Time" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-aurora-accent mb-1">
                  {stat.number}
                </div>
                <div className="text-aurora-text/60 text-sm uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        variants={itemVariants}
        className="glass border-t border-aurora-text/10 py-6"
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-aurora-text/60 text-sm">
            © 2024 Voxtora. Transforming audio into insights with cutting-edge AI technology.
          </p>
        </div>
      </motion.footer>

      {/* Floating elements for extra visual appeal */}
      <motion.div
        className="absolute top-20 left-10 w-2 h-2 bg-aurora-accent rounded-full"
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 1, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-40 right-20 w-1 h-1 bg-aurora-secondary rounded-full"
        animate={{
          y: [0, -15, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-aurora-primary rounded-full"
        animate={{
          y: [0, -25, 0],
          opacity: [0.4, 1, 0.4]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </div>
  );
}
