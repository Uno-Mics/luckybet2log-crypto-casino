
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Gamepad2, 
  User, 
  Wallet, 
  TrendingUp,
  CreditCard,
  LogOut
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Games", href: "/games", icon: Gamepad2 },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Earn", href: "/earn", icon: TrendingUp },
    { name: "Deposit", href: "/deposit", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 itlog-token rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">₿</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
                LuckyBet2Log
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? "bg-primary text-primary-foreground glow-purple" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-semibold text-green-400">₱1,000.00</span>
              </div>
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around p-2">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
