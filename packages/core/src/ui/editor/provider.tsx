"use client";

import { createContext } from "react";
import { SlashCommandsConfig } from "./extensions/slash-command";
import { BubbleMenuConfig } from "./bubble-menu";

export const NovelContext = createContext<{
  completionApi: string;
  slashCommands?: SlashCommandsConfig;
  bubbleMenuItems?: BubbleMenuConfig;
}>({
  completionApi: "/api/generate",
  slashCommands: {},
  bubbleMenuItems: {},
});
