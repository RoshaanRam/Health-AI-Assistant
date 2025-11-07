import React from 'react';
import { Icon } from './common/Icon';

const InfoSection: React.FC<{icon: any, title: string, children: React.ReactNode}> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex items-start gap-4">
        <div className="flex-shrink-0 bg-primary-light p-3 rounded-full">
            <Icon name={icon} className="w-6 h-6 text-primary" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
            <div className="text-slate-600 space-y-2">{children}</div>
        </div>
    </div>
);

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">About Health AI Assistant</h2>
        <p className="text-lg text-slate-600">
          Empowering you to take a proactive role in your health journey.
        </p>
      </div>

      <div className="space-y-6">
        <InfoSection icon="logo" title="Our Mission">
          <p>
            Our mission is to make health information more accessible and understandable. We believe that by providing intelligent tools, we can help individuals make more informed decisions about their well-being, in consultation with healthcare professionals.
          </p>
        </InfoSection>

        <InfoSection icon="sparkles" title="How It Works">
           <p>
            This application utilizes Google's advanced Gemini AI models to analyze the information you provide. When you describe your symptoms or log your health data, the AI processes this information to identify potential patterns, suggest possible causes, and offer insights based on vast amounts of medical knowledge.
          </p>
        </InfoSection>

        <InfoSection icon="info" title="Important Disclaimer">
            <p>
                The Health AI Assistant is an informational tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this application.
            </p>
        </InfoSection>
      </div>
    </div>
  );
};

export default AboutPage;