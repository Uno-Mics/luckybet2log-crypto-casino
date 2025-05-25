
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Games from "./pages/Games";
import Mines from "./pages/games/Mines";
import WheelOfFortune from "./pages/games/WheelOfFortune";
import FortuneReels from "./pages/games/FortuneReels";
import Blackjack from "./pages/games/Blackjack";
import DiceRoll from "./pages/games/DiceRoll";
import UserProfile from "./pages/UserProfile";
import Wallet from "./pages/Wallet";
import Earn from "./pages/Earn";
import Deposit from "./pages/Deposit";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/mines" element={<Mines />} />
            <Route path="/games/wheel" element={<WheelOfFortune />} />
            <Route path="/games/slots" element={<FortuneReels />} />
            <Route path="/games/blackjack" element={<Blackjack />} />
            <Route path="/games/dice" element={<DiceRoll />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/earn" element={<Earn />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
