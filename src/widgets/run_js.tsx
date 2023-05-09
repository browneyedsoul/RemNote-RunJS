import { useState, useEffect } from "react";
import {
  AppEvents,
  renderWidget,
  useAPIEventListener,
  usePlugin,
  useRunAsync,
  WidgetLocation,
} from "@remnote/plugin-sdk";
import { PlayButton } from "./play";
import { ClearConsole } from "./clear";

export function RunJS() {
  let evaluate: any;

  const [text, setText] = useState<string>();
  const plugin = usePlugin();
  const widgetContext = useRunAsync(
    () => plugin.widget.getWidgetContext<WidgetLocation.UnderRemEditor>(),
    [],
  );

  const getRemText = async (remId: string) => {
    const rem = await plugin.rem.findOne(remId);
    const text = await plugin.richText.toString(rem?.text || []);
    return text?.toString();
  };

  const renderText = async () => {
    const remId = widgetContext?.remId;
    const text = remId && (await getRemText(remId));
    await setText(text);
  };

  const Play = async () => {
    try {
      evaluate = await eval(text || "");
    } catch (error) {
      console.error(error);
    }
  }
  const Refresh = async () => {
    useAPIEventListener(AppEvents.RemChanged, widgetContext?.remId, () => renderText());
  }
  const Clear = async () => {
    await console.clear();
  }

  useEffect(() => {
    renderText();
  }, [widgetContext?.remId]);
  
  Play();

  Refresh();
  
  return evaluate && "" + evaluate != text?.trim() ? (
    <div className="flex ml-6 p-2 text-lg gap-2">
      <button onClick={Play}>
        <PlayButton />
      </button>
      <button onClick={Clear}>
        <ClearConsole />
      </button>
      <div className="ml-6 p-2">{evaluate}</div>
    </div>
  ) : (
    <div className="flex ml-6 p-2 text-lg gap-2">
      <button onClick={Play}>
        <PlayButton />
      </button>
      <button onClick={Clear}>
        <ClearConsole />
      </button>
      <div className="ml-6 p-2 w-full"></div>
    </div>
  );
}

renderWidget(RunJS);
