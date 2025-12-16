import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onStartClick: () => void;
}

const Navbar = ({ onStartClick }: NavbarProps) => {
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

          {/* CTA */}
          <Button variant="glow" size="sm" onClick={onStartClick}>
            Start Interview
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
