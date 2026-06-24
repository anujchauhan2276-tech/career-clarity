export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">1. Information We Collect</h2>
          <p className="text-gray-400 mb-4">We collect information that you provide directly to us when you create an account, update your profile, or interact with our platform.</p>
          <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
            <li>Email address and basic profile information via Google/GitHub authentication</li>
            <li>Usage data, including the roadmaps you view and the steps you mark as complete</li>
            <li>Your selected regional preference</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. How We Use Information</h2>
          <p className="text-gray-400 mb-6">We use the information we collect to provide, maintain, and improve our services, to personalize your experience, and to send you technical notices and support messages. We do not sell your personal data to third parties.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">3. Data Storage and Security</h2>
          <p className="text-gray-400 mb-6">We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. Your data is stored securely using industry-standard cloud infrastructure provided by Google Firebase.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">4. Your Rights</h2>
          <p className="text-gray-400 mb-6">You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting our support team.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">5. Changes to This Policy</h2>
          <p className="text-gray-400 mb-6">We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.</p>
        </div>
      </div>
    </div>
  );
}
