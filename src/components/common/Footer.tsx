import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

const footerLinks = [
  {
    title: 'Quick Links',
    links: [
      { to: '/', label: 'Home' },
      { to: '/products', label: 'Products' },
      { to: '/products?featured=true', label: 'Deals & Offers' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { to: '/account/orders', label: 'Track Order' },
      { to: '/account/profile', label: 'My Account' },
      { to: '/wishlist', label: 'Wishlist' },
      { to: '#', label: 'Return Policy' },
      { to: '#', label: 'Help Center' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo dark linkTo="/" />
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-sm">
              Your one-stop destination for all your shopping needs. Discover thousands of products from verified sellers across the country.
            </p>
            <div className="flex gap-2 mt-6">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Youtube, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href}
                  className="w-9 h-9 bg-gray-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-500 hover:text-orange-400 transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-500">123 Commerce Street, Market City, MC 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-orange-400 flex-shrink-0" />
                <span className="text-gray-500">+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-orange-400 flex-shrink-0" />
                <span className="text-gray-500">support@markethub.com</span>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">Newsletter</p>
              <div className="flex rounded-xl overflow-hidden border border-gray-700 focus-within:border-orange-500 transition-colors">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1 bg-gray-800 text-sm px-3.5 py-2.5 outline-none text-white placeholder-gray-500"
                />
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 text-sm font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} Markethub. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
