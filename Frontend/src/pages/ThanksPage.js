// fileName: ThanksPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Clock } from 'lucide-react';

const ThanksPage = () => {
  const [content, setContent] = useState({
    thanksTitle: 'Application Successful!',
    thanksMessage: 'Your application has been received and is now under review by our recruitment team. We will contact you shortly if your profile matches our requirements.',
    nextStepsMessage: 'Our team will review your submission and contact you directly via the email or phone number provided.',
    thanksFooter: 'Thank you for choosing to grow with us.'
  });

  // ✅ FETCH: Get public settings using the path-based tenant route
  const fetchPublicContent = useCallback(async () => {
    const companyId = localStorage.getItem('companyId');
    if (!companyId) return;

    try {
      // ✅ UPDATED ROUTE: /api/companies/{companyId}/Thanks/public
      const response = await fetch(`/api/companies/${encodeURIComponent(companyId)}/Thanks/public`);
      
      if (response.ok) {
        const data = await response.json();
        setContent(prev => ({
            thanksTitle: data.thanksTitle || prev.thanksTitle,
            thanksMessage: data.thanksMessage || prev.thanksMessage,
            nextStepsMessage: data.nextStepsMessage || prev.nextStepsMessage,
            thanksFooter: data.thanksFooter || prev.thanksFooter
        }));
      }
    } catch (error) {
      console.log("Using default fallback content.", error);
    }
  }, []);

  useEffect(() => {
    fetchPublicContent();
  }, [fetchPublicContent]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8 font-inter">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-xl p-8 sm:p-12 text-center animate-fadeIn">
        
        <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-indigo-50 flex items-center justify-center shadow-lg">
          <CheckCircle className="w-8 h-8 text-indigo-600" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          {content.thanksTitle}
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          {content.thanksMessage}
        </p>

        <div className="border border-gray-200 bg-white rounded-lg p-5 text-left shadow-md transition duration-300 hover:shadow-lg">
          <div className="flex items-start space-x-4">
            <Clock className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Your Next Steps
              </h2>
              <p className="text-base text-gray-600">
                {content.nextStepsMessage}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-10">
          {content.thanksFooter}
        </p>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
};

export default ThanksPage;