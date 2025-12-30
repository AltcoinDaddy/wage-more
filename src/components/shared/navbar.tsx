import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { LayoutDashboard, LogOut, MenuIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { navbarLinks } from "~/constants";
import { authClient } from "~/lib/auth-client";
import { getCurrentUser } from "~/server/user";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { ThemeSwitcher } from "./theme-switcher";

const categories = [
  { name: "All", href: "/" },
  { name: "For You", href: "/for-you" },
  { name: "Politics", href: "/politics" },
  { name: "Sports", href: "/sports" },
  { name: "Crypto", href: "/crypto" },
  { name: "Global Elections", href: "/elections" },
  { name: "Mentions", href: "/mentions" },
  { name: "Creators", href: "/creators" },
  { name: "Pop Culture", href: "/pop-culture" },
  { name: "Business", href: "/business" },
  { name: "Science", href: "/science" },
];

export function Navbar() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => getCurrentUser(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const isAuthenticated = !!user;

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["current-user"] });
            router.invalidate();
            toast.success("Signed out successfully");
            navigate({ to: "/" });
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="w-full flex flex-col border-b border-white/5 bg-transparent sticky top-0 z-50 backdrop-blur-md">
      {/* --- TOP ROW --- */}
      <div className="w-full px-4 md:px-[60px] py-4 flex justify-between items-center gap-4 max-w-[1600px] mx-auto">
        {/* Logo Section */}
        <Link className="flex items-center gap-2" to="/">
          <Image
            src="/logo.svg"
            alt="WageMore Logo"
            layout="constrained"
            width={30}
            height={30}
          />
          <h1 className="font-bold text-shadow-white text-base mt-0.5 hidden sm:block">
            WAGEMORE
          </h1>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="relative w-[40%] hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
          <Input
            className="pl-8 py-2 h-10 focus:outline-none shad-no-focus border border-secondary-900 bg-secondary/50 rounded-lg"
            placeholder="Search for Markets"
          />
        </div>

        {/* Desktop Links */}
        <div className="lg:flex items-center gap-6 hidden">
          {navbarLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-normal hover:underline hover:text-gray-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-2">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-muted/20 animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/home"
                    className="flex items-center cursor-pointer"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Get Started</Link>
            </Button>
          )}
          <ThemeSwitcher />
        </div>

        {/* Mobile Menu Trigger & Sheet */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>

            {/* --- MOBILE SHEET CONTENT --- */}
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] flex flex-col h-full px-4"
            >
              <SheetHeader className="mt-6">
                <Link className="flex items-center gap-2" to="/">
                  <Image
                    src="/logo.svg"
                    alt="WageMore Logo"
                    layout="constrained"
                    width={30}
                    height={30}
                  />
                  <h1 className="font-bold text-shadow-white text-base mt">
                    WAGEMORE
                  </h1>
                </Link>
              </SheetHeader>

              <div className="flex flex-col flex-1 mt-6">
                {/* 1. Mobile Search */}
                <div className="relative mb-6">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                  <Input
                    className="pl-8 py-2"
                    placeholder="Search for Markets"
                  />
                </div>

                {/* 2. Categories Links */}
                <div className="flex flex-col space-y-1 mb-8 overflow-y-auto max-h-[40vh]">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
                    Categories
                  </p>
                  {categories.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        to={link.href}
                        className="text-base font-medium p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </SheetClose>
                  ))}
                </div>

                {/* 3. Mobile Auth Logic (Pushed to bottom) */}
                <div className="mt-auto border-t border-border pt-6 pb-6">
                  {isLoading ? (
                    // Loading Skeleton
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2">
                        <div className="w-24 h-4 bg-muted animate-pulse rounded" />
                        <div className="w-32 h-3 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ) : isAuthenticated && user ? (
                    // LOGGED IN STATE
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 px-2">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage
                            src={user.image || ""}
                            alt={user.name || ""}
                          />
                          <AvatarFallback>
                            {user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate w-[200px]">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <SheetClose asChild>
                          <Button
                            asChild
                            variant="secondary"
                            className="w-full justify-start"
                          >
                            <Link to="/dashboard/home">
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              Dashboard
                            </Link>
                          </Button>
                        </SheetClose>

                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleSignOut}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </Button>
                        </SheetClose>
                      </div>
                    </div>
                  ) : (
                    // LOGGED OUT STATE
                    <div className="flex flex-col gap-3">
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="w-full">
                          <Link to="/login">Get Started</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* --- BOTTOM ROW: Tags/Categories --- */}
      {/* --- BOTTOM ROW: Tags/Categories --- */}
      <div className="w-full overflow-x-auto no-scrollbar border-t border-white/5">
        <div className="flex items-center px-4 md:px-[60px] min-w-max max-w-[1600px] mx-auto">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.href}
              activeProps={{
                className: "text-blue-400 border-b-2 border-blue-400",
              }}
              inactiveProps={{
                className:
                  "text-muted-foreground hover:text-foreground border-transparent border-b-2 hover:border-white/20",
              }}
              className="py-3 px-1 mr-6 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
