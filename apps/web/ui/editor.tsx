"use client";

import { useState } from "react";
import { Editor as NovelEditor } from "novel";
import { cn } from "@/lib/utils";

export default function Editor() {
  const [saveStatus, setSaveStatus] = useState("Saved");

  return (
    <div className="relative w-full max-w-screen-lg">
      <div className="absolute right-5 top-5 z-10 mb-5 rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400">
        {saveStatus}
      </div>
      <NovelEditor
        onUpdate={() => {
          setSaveStatus("Unsaved");
        }}
        extraExtensions={{
          bubbleMenuItems: {
            // exclude: ["link"],
            add: [
              {
                name: "Translate",
                isActive: () => false,

                renderItem: ({ editor, shouldClose, setIsOpen }) => {
                  console.log("shouldClose", shouldClose, "CUST");
                  return (
                    <div className="novel-relative">
                      <button
                        onClick={() => setIsOpen()}
                        type="button"
                        className="novel-flex novel-h-full novel-items-center novel-space-x-2 novel-px-3 novel-py-1.5 novel-text-sm novel-font-medium novel-text-stone-600 hover:novel-bg-stone-100 active:novel-bg-stone-200"
                      >
                        <p className="novel-text-base">↗</p>
                        <p
                          className={cn(
                            "novel-underline novel-decoration-stone-400 novel-underline-offset-4",
                            {
                              "novel-text-blue-500": editor?.isActive("link"),
                            },
                          )}
                        >
                          Link cust
                        </p>
                      </button>
                    </div>
                  );
                },
              },

              {
                name: "AAA",
                isActive: () => false,

                renderItem: ({ editor, shouldClose, setIsOpen }) => {
                  console.log("shouldClose", shouldClose, "AAA");
                  return (
                    <div className="novel-relative">
                      <button
                        onClick={() => setIsOpen()}
                        type="button"
                        className="novel-flex novel-h-full novel-items-center novel-space-x-2 novel-px-3 novel-py-1.5 novel-text-sm novel-font-medium novel-text-stone-600 hover:novel-bg-stone-100 active:novel-bg-stone-200"
                      >
                        <p className="novel-text-base">↗</p>
                        <p
                          className={cn(
                            "novel-underline novel-decoration-stone-400 novel-underline-offset-4",
                            {
                              "novel-text-blue-500": editor?.isActive("link"),
                            },
                          )}
                        >
                          Link AAA
                        </p>
                      </button>
                    </div>
                  );
                },
              },
            ],
          },
          aiCommands: [
            {
              title: "input",
              renderItem: () => (
                <input
                  className="m-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      console.log("pppppp");
                    }
                  }}
                />
              ),
              command: () => {},
            },
            {
              title: "ppp",
              description: "pppp",
              icon: "p",
              command: () => {},
            },
          ],
        }}
        onDebouncedUpdate={() => {
          setSaveStatus("Saving...");
          // Simulate a delay in saving.
          setTimeout(() => {
            setSaveStatus("Saved");
          }, 500);
        }}
      />
    </div>
  );
}
