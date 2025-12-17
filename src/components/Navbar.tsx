import { Sparkles } from "lucide-react";

interface NavbarProps {
  // Props removed
}

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">MockPrep</span>
          </div>

          {/* CTA Removed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
