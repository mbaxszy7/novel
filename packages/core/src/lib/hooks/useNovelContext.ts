import { NovelContext } from "@/ui/editor/provider";
import { useContext } from "react";

const useNovelContext = () => {
  const context = useContext(NovelContext);
  return context;
};

export default useNovelContext;
