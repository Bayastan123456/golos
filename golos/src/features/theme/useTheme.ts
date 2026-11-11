import {ThemeContext} from "./theme-context.ts";
import {useContext} from "react";

export function useTheme() {
   const context = useContext(ThemeContext);
   if (!context) {
       throw new Error(
           "useTheme должен использоваться внутри ThemeProvider"
       )
   }
   return context;
}