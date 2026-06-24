export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">1. Agreement to Terms</h2>
          <p className="text-gray-400 mb-6">By accessing our platform, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. Use License</h2>
          <p className="text-gray-400 mb-4">Permission is granted to temporarily view the materials (information or software) on Career Clarity's website for personal, non-commercial transitory viewing only.</p>
          <p className="text-gray-400 mb-6">This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose;</li>
            <li>attempt to decompile or reverse engineer any software contained on the site;</li>
            <li>remove any copyright or other proprietary notations;</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">3. Disclaimer</h2>
          <p className="text-gray-400 mb-6">The materials on Career Clarity's website are provided on an 'as is' basis. Career Clarity makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">4. Limitations</h2>
          <p className="text-gray-400 mb-6">In no event shall Career Clarity or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the platform.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">5. Governing Law</h2>
          <p className="text-gray-400 mb-6">These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
        </div>
      </div>
    </div>
  );
}
