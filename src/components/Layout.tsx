
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, User, LogOut, Settings, Home, Gamepad2, TrendingUp, CreditCard, Wallet, Shield, BellRing, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import NotificationBell from "@/components/NotificationBell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const { profile } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigation = [
    { name: "Home", href: "/", icon: Home, color: "text-blue-400" },
    { name: "Games", href: "/games", icon: Gamepad2, color: "text-purple-400" },
    { name: "Profile", href: "/profile", icon: User, color: "text-green-400" },
    { name: "Wallet", href: "/wallet", icon: Wallet, color: "text-yellow-400" },
    { name: "Deposit", href: "/deposit", icon: CreditCard, color: "text-orange-400" },
    { name: "Earn", href: "/earn", icon: TrendingUp, color: "text-emerald-400" },
    ...(profile?.is_admin ? [{ name: "Admin", href: "/admin", icon: Shield, color: "text-red-400" }] : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (!error) {
        toast({
          title: "✨ Successfully logged out",
          description: "See you next time!",
          className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0",
        });
        navigate('/auth');
      } else {
        toast({
          title: "❌ Logout failed",
          description: "There was an error logging out. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "❌ Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen gradient-bg pb-20 lg:pb-0">
      {/* Enhanced Modern Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-out ${
        scrolled 
          ? 'glass backdrop-blur-xl border-b border-white/10 py-2' 
          : 'bg-transparent py-4'
      }`}>
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 w-full">
            {/* Enhanced Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group hover-lift"
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 itlog-token rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-black font-black text-lg sm:text-xl">₿</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-gradient">
                  LuckyBet2Log
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Crypto Casino
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 flex-1 justify-center max-w-4xl">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center space-x-2 px-3 py-2 xl:px-4 xl:py-3 rounded-xl transition-all duration-300 text-sm xl:text-base ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white shadow-lg"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-4 h-4 xl:w-5 xl:h-5 transition-colors duration-300 ${isActive ? 'text-white' : item.color}`} />
                    <span className="font-medium whitespace-nowrap">{item.name}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Enhanced Right Side */}
            <div className="flex items-center space-x-2 xl:space-x-3">
              {/* Enhanced Balance Display */}
              <div className="hidden md:flex items-center space-x-2 xl:space-x-4">
                <div className="glass rounded-xl px-2 py-1 xl:px-4 xl:py-2 border border-white/10">
                  <div className="flex items-center space-x-2 xl:space-x-4 text-xs xl:text-sm">
                    <div className="flex items-center space-x-1 xl:space-x-2">
                      <div className="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">PHP:</span>
                      <span className="font-bold text-green-400">
                        ₱{profile?.php_balance.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="w-px h-3 xl:h-4 bg-white/20"></div>
                    <div className="flex items-center space-x-1 xl:space-x-2">
                      <div className="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">$ITLOG:</span>
                      <span className="font-bold text-gradient-gold">
                        {profile?.itlog_tokens?.toFixed(4) || "0.0000"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile Balance Indicator */}
              <div className="sm:hidden glass rounded-xl px-3 py-2 border border-white/10">
                <div className="flex flex-col text-xs space-y-1">
                  <span className="text-green-400 font-bold">₱{profile?.php_balance.toFixed(0) || "0"}</span>
                  <span className="text-gradient-gold font-bold">{profile?.itlog_tokens?.toFixed(2) || "0.00"}</span>
                </div>
              </div>

              <NotificationBell />
              
              {/* Enhanced Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="lg:hidden glass rounded-xl p-3 hover:bg-white/10 border border-white/10"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 glass border-l border-white/10 backdrop-blur-2xl">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">Navigate through your casino dashboard</SheetDescription>
                  <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 itlog-token rounded-xl flex items-center justify-center">
                          <span className="text-black font-bold">₿</span>
                        </div>
                        <div>
                          <h2 className="font-bold text-lg text-gradient">Menu</h2>
                          <p className="text-xs text-muted-foreground">Navigate your casino</p>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Button variant="ghost" size="sm" className="rounded-xl">
                          <X className="w-4 h-4" />
                        </Button>
                      </SheetClose>
                    </div>
                    
                    {/* Enhanced Balance Display */}
                    <div className="glass rounded-2xl p-6 mb-6 border border-white/10">
                      <h3 className="font-semibold mb-4 text-gradient">Your Balance</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">₱</span>
                            </div>
                            <span className="text-muted-foreground">PHP Balance</span>
                          </div>
                          <span className="font-bold text-green-400">
                            ₱{profile?.php_balance.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 itlog-token rounded-lg flex items-center justify-center">
                              <span className="text-black font-bold text-sm">₿</span>
                            </div>
                            <span className="text-muted-foreground">$ITLOG Tokens</span>
                          </div>
                          <span className="font-bold text-gradient-gold">
                            {profile?.itlog_tokens?.toFixed(4) || "0.0000"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Navigation Links */}
                    <div className="flex-1 space-y-2">
                      {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`group flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 ${
                              isActive
                                ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white glow-purple"
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <Icon className={`w-6 h-6 transition-colors duration-300 ${
                              isActive ? 'text-white' : item.color
                            }`} />
                            <span className="text-lg font-medium">{item.name}</span>
                            {isActive && (
                              <div className="ml-auto w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                    
                    {/* Enhanced Logout Button */}
                    <Button 
                      onClick={handleLogout} 
                      className="w-full mt-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-xl py-6 font-semibold"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Desktop Logout */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="hidden lg:flex glass rounded-xl hover:bg-red-500/10 hover:text-red-400 border border-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Main Content */}
      <main className="pt-20 lg:pt-24 min-h-screen">
        <div className="page-enter page-enter-active">
          {children}
        </div>
      </main>

      {/* Redesigned Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass backdrop-blur-2xl border-t border-white/10 safe-area-pb">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 min-h-[70px] relative overflow-hidden ${
                  isActive 
                    ? "text-white" 
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl"></div>
                )}
                <Icon className={`w-6 h-6 mb-2 transition-all duration-300 relative z-10 ${
                  isActive ? 'text-white scale-110' : item.color
                }`} />
                <span className={`text-xs font-medium text-center relative z-10 transition-all duration-300 ${
                  isActive ? 'text-white' : ''
                }`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
