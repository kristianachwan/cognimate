"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "~/lib/utils";
// import { Icons } from "~/components/icons";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { Card } from "~/components/ui/card";
import { ModeToggle } from "./ToggleMode";
import Image from "next/image";

export function NavBar() {
  return (
    <div className="relative h-16 w-screen py-2">
      <Link href="/">
        <div className="absolute left-4 top-[50%] flex -translate-y-[50%] items-center justify-center gap-4">
          <Image width={35} height={35} src={"/favicon.png"} alt="favicon" />
          <h1 className="text-2xl font-bold">Cognimate</h1>
        </div>
      </Link>
      <Card className="absolute left-[50%] top-[50%] z-10 mx-auto my-2 w-fit -translate-x-[50%] -translate-y-[50%]">
        <NavigationMenu className="gap-4">
          <ModeToggle />
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home 🏠
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/course" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Learn 📚
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/chat" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  AI Summarize ✨
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Card>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
