import { Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer id="footer" className="bg-black text-white pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <h3 className="font-display font-bold text-xl mb-4">Career Clarity</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Empowering students worldwide to navigate traditional and non-traditional career paths with absolute clarity.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/process" className="hover:text-white transition">Our Process</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link to="/learn-more" className="hover:text-white transition">Learn More</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Socials</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li>
                <a href="#" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white transition">
                  <Instagram className="w-4 h-4" />
                  <span>@get_career_clarity</span>
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white transition">
                  <MessageCircle className="w-4 h-4" />
                  <span>career_clarity</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-white/30">
          <p>© {new Date().getFullYear()} Career Clarity. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>Designed for clarity.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
