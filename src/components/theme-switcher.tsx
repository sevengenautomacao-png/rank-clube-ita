
"use client"

import * as React from "react"
import { Moon, Sun, MonitorSmartphone, Play } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { setTheme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-10 w-36"></div>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Play className="mr-2 h-[1.2rem] w-[1.2rem]" />
          Selecionar modo de jogo
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => setTheme("theme-light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Modern Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Modern Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-retro-light")}>
           <Sun className="mr-2 h-4 w-4" />
           <MonitorSmartphone className="mr-2 h-4 w-4" />
          <span>Retro Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-retro-dark")}>
           <Moon className="mr-2 h-4 w-4" />
           <MonitorSmartphone className="mr-2 h-4 w-4" />
          <span>Retro Dark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
