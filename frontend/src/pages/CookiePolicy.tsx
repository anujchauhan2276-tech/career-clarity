export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">1. What Are Cookies</h2>
          <p className="text-gray-400 mb-6">Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. How We Use Cookies</h2>
          <p className="text-gray-400 mb-4">We use cookies for the following purposes:</p>
          <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
            <li><strong>Essential site functionality:</strong> To authenticate users and prevent fraudulent use of user accounts.</li>
            <li><strong>Preferences:</strong> To remember your regional settings and visual preferences (like dark/light mode if applicable).</li>
            <li><strong>Analytics:</strong> To understand how you use our platform so we can improve the curriculum and user experience.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">3. Third-Party Cookies</h2>
          <p className="text-gray-400 mb-6">In some special cases, we also use cookies provided by trusted third parties. This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your experience.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">4. Managing Cookies</h2>
          <p className="text-gray-400 mb-6">You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site.</p>
        </div>
      </div>
    </div>
  );
}
