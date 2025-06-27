export function Footer() {
  const links = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Documentation", href: "#docs" },
      { name: "API Reference", href: "#api" },
    ],
    Company: [
      { name: "About", href: "#about" },
      { name: "Blog", href: "#blog" },
      { name: "Careers", href: "#careers" },
      { name: "Contact", href: "#contact" },
    ],
    Resources: [
      { name: "Help Center", href: "#help" },
      { name: "Community", href: "#community" },
      { name: "Status", href: "#status" },
      { name: "Changelog", href: "#changelog" },
    ],
    Legal: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      { name: "Cookie Preferences", href: "/cookie-preferences" },
      { name: "Security", href: "/security" },
      { name: "Compliance", href: "/compliance" },
    ],
  }

  return (
    <footer className="bg-[#18181B] border-t border-[#0EA5E9]/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold">Kilometers</span>
            </div>
            <p className="text-[#FAFAFA]/70 text-sm mb-4">
              See where your AI goes. Monitor every request, prevent costly surprises.
            </p>
            <p className="text-[#FAFAFA]/50 text-xs">© 2024 Kilometers. All rights reserved.</p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-[#FAFAFA]/70 hover:text-[#0EA5E9] transition-colors text-sm">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#0EA5E9]/20 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-[#FAFAFA]/50 text-sm">Built with ❤️ for AI developers everywhere</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <a href="#twitter" className="text-[#FAFAFA]/50 hover:text-[#0EA5E9] transition-colors">
              Twitter
            </a>
            <a href="#github" className="text-[#FAFAFA]/50 hover:text-[#0EA5E9] transition-colors">
              GitHub
            </a>
            <a href="#discord" className="text-[#FAFAFA]/50 hover:text-[#0EA5E9] transition-colors">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
