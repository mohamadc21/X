"use client";

import { NextUIProvider } from "@nextui-org/react";
import React from "react";
import StoreProvider from "./StoreProvider";
import NextThemeProvider from "./NextThemeProvider";
import { SWRDevTools } from "swr-devtools";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <SWRDevTools >
        <NextUIProvider>
          <NextThemeProvider>
            {children}
          </NextThemeProvider>
        </NextUIProvider>
      </SWRDevTools>
    </StoreProvider>
  );
};

export default Providers;
