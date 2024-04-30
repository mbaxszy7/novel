import {
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
  useLayoutEffect,
  useMemo,
} from "react";
import { Editor, Range, Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";

import tippy from "tippy.js";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  TextQuote,
  Image as ImageIcon,
  Code,
  CheckSquare,
} from "lucide-react";

import va from "@vercel/analytics";

import { startImageUpload } from "@/ui/editor/plugins/upload-images";

import useNovelContext from "@/lib/hooks/useNovelContext";

export interface CommandItemProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  searchTerms?: string[];
  /**
   * use [key] to sort command item
   */
  key?: number;
  // eslint-disable-next-line no-unused-vars
  command: ({ editor, range }: CommandProps) => void;
  // eslint-disable-next-line no-unused-vars
  renderItem?: ({ editor, range }: CommandProps) => ReactNode;
}

type DefaultSlashCommand =
  | "Text"
  | "To-do List"
  | "Heading 1"
  | "Heading 2"
  | "Heading 3"
  | "Bullet List"
  | "Numbered List"
  | "Quote"
  | "Code"
  | "Image";

export interface SlashCommandsConfig {
  /**
   * excludes default slash commands
   */
  exclude?: DefaultSlashCommand[];
  /**
   * new slash commands to be added
   */
  add?: CommandItemProps[];
}

export interface CommandProps {
  editor: Editor;
  range: Range;
  selectedItem?: CommandItemProps;
}

const Command = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: any;
        }) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

const getSuggestionItems = ({ query }: { query: string }) => {
  return (
    [
      {
        title: "Text",
        description: "Just start typing with plain text.",
        searchTerms: ["p", "paragraph"],
        icon: <Text size={18} />,
        command: ({ editor, range }: CommandProps) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .toggleNode("paragraph", "paragraph")
            .run();
        },
        key: 91,
      },
      {
        title: "To-do List",
        description: "Track tasks with a to-do list.",
        searchTerms: ["todo", "task", "list", "check", "checkbox"],
        icon: <CheckSquare size={18} />,
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
        key: 92,
      },
      {
        title: "Heading 1",
        description: "Big section heading.",
        searchTerms: ["title", "big", "large"],
        icon: <Heading1 size={18} />,
        command: ({ editor, range }: CommandProps) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 1 })
            .run();
        },
        key: 93,
      },
      {
        title: "Heading 2",
        description: "Medium section heading.",
        searchTerms: ["subtitle", "medium"],
        icon: <Heading2 size={18} />,
        command: ({ editor, range }: CommandProps) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 2 })
            .run();
        },
        key: 94,
      },
      {
        title: "Heading 3",
        description: "Small section heading.",
        searchTerms: ["subtitle", "small"],
        icon: <Heading3 size={18} />,
        command: ({ editor, range }: CommandProps) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode("heading", { level: 3 })
            .run();
        },
        key: 95,
      },
      {
        title: "Bullet List",
        description: "Create a simple bullet list.",
        searchTerms: ["unordered", "point"],
        icon: <List size={18} />,
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
        key: 96,
      },
      {
        title: "Numbered List",
        description: "Create a list with numbering.",
        searchTerms: ["ordered"],
        icon: <ListOrdered size={18} />,
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
        key: 97,
      },
      {
        title: "Quote",
        description: "Capture a quote.",
        searchTerms: ["blockquote"],
        icon: <TextQuote size={18} />,
        command: ({ editor, range }: CommandProps) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .toggleNode("paragraph", "paragraph")
            .toggleBlockquote()
            .run(),
        key: 98,
      },
      {
        title: "Code",
        description: "Capture a code snippet.",
        searchTerms: ["codeblock"],
        icon: <Code size={18} />,
        command: ({ editor, range }: CommandProps) =>
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
        key: 99,
      },
      {
        title: "Image",
        description: "Upload an image from your computer.",
        searchTerms: ["photo", "picture", "media"],
        icon: <ImageIcon size={18} />,
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).run();
          // upload image
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = async () => {
            if (input.files?.length) {
              const file = input.files[0];
              const pos = editor.view.state.selection.from;
              startImageUpload(file, editor.view, pos);
            }
          };
          input.click();
        },
        key: 100,
      },
    ] as ({
      title: DefaultSlashCommand;
      command?: CommandItemProps["command"];
    } & Omit<CommandItemProps, "title" | "command">)[]
  ).filter((item) => {
    if (typeof query === "string" && query.length > 0) {
      const search = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        (item.searchTerms &&
          item.searchTerms.some((term: string) => term.includes(search)))
      );
    }
    return true;
  });
};

export const updateScrollView = (container: HTMLElement, item: HTMLElement) => {
  const containerHeight = container.offsetHeight;
  const itemHeight = item ? item.offsetHeight : 0;

  const top = item.offsetTop;
  const bottom = top + itemHeight;

  if (top < container.scrollTop) {
    container.scrollTop -= container.scrollTop - top + 5;
  } else if (bottom > containerHeight + container.scrollTop) {
    container.scrollTop += bottom - containerHeight - container.scrollTop + 5;
  }
};

const CommandList = ({
  items,
  command,
}: {
  items: CommandItemProps[];
  command: any;
  editor: any;
  range: any;
}) => {
  const { slashCommands } = useNovelContext();
  const extendedItems = useMemo(() => {
    const _items = [
      ...items.filter(
        (item) => !slashCommands?.exclude?.includes(item.title as any)
      ),
      ...(slashCommands?.add ?? []),
    ];
    _items.sort((a, b) => {
      return (a.key ?? 0) - (b.key ?? 0);
    });
    return _items;
  }, [items, slashCommands]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    (index: number) => {
      const item = extendedItems[index];
      va.track("Slash Command Used", {
        command: item.title,
      });
      if (item) {
        command(item);
      }
    },
    [command, extendedItems]
  );

  useEffect(() => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowUp") {
          setSelectedIndex(
            (selectedIndex + extendedItems.length - 1) % extendedItems.length
          );
          return true;
        }
        if (e.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % extendedItems.length);
          return true;
        }
        if (e.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [extendedItems, selectedIndex, setSelectedIndex, selectItem]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [extendedItems]);

  const commandListContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = commandListContainer?.current;

    const item = container?.children[selectedIndex] as HTMLElement;

    if (item && container) updateScrollView(container, item);
  }, [selectedIndex]);

  return extendedItems.length > 0 ? (
    <div
      id="slash-command"
      ref={commandListContainer}
      className="novel-z-50 novel-h-auto novel-max-h-[330px] novel-w-72 novel-overflow-y-auto novel-rounded-md novel-border novel-border-stone-200 novel-bg-white novel-px-1 novel-py-2 novel-shadow-md novel-transition-all"
    >
      {extendedItems.map((item: CommandItemProps, index: number) => {
        return (
          <button
            className={`novel-flex novel-w-full novel-items-center novel-space-x-2 novel-rounded-md novel-px-2 novel-py-1 novel-text-left novel-text-sm novel-text-stone-900 hover:novel-bg-stone-100 ${
              index === selectedIndex
                ? "novel-bg-stone-100 novel-text-stone-900"
                : ""
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <div className="novel-flex novel-h-10 novel-w-10 novel-items-center novel-justify-center novel-rounded-md novel-border novel-border-stone-200 novel-bg-white">
              {item.icon}
            </div>
            <div>
              <p className="novel-font-medium">{item.title}</p>
              <p className="novel-text-xs novel-text-stone-500">
                {item.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  ) : null;
};

const renderItems = () => {
  let component: ReactRenderer | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      // @ts-ignore
      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },
    onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
      component?.updateProps(props);

      popup &&
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
    },
    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === "Escape") {
        popup?.[0].hide();

        return true;
      }

      // @ts-ignore
      return component?.ref?.onKeyDown(props);
    },
    onExit: () => {
      popup?.[0].destroy();
      component?.destroy();
    },
  };
};

const SlashCommand = Command.configure({
  suggestion: {
    items: getSuggestionItems,
    render: renderItems,
  },
});

export default SlashCommand;
