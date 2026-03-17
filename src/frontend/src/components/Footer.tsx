import { Heart, Store } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl">ShopMart</span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              India's favourite reselling platform. Shop millions of products at
              the best prices.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>Fashion</li>
              <li>Electronics</li>
              <li>Home & Kitchen</li>
              <li>Beauty</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Help</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>Customer Support</li>
              <li>Return Policy</li>
              <li>Track Order</li>
              <li>FAQs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">About</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li>About Us</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm opacity-70">
          <p>© {year} ShopMart. All rights reserved.</p>
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:opacity-100 transition-opacity"
          >
            Built with{" "}
            <Heart className="w-3.5 h-3.5 fill-primary text-primary" /> using
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
