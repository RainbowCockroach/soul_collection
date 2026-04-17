import React, { useRef } from "react";
import {
  SCEditor as RawSCEditor,
  type SCEditorProps,
  type SCEditorInstance,
} from "sceditor-react";

/**
 * Wrapper around sceditor-react's SCEditor that also syncs onChange on
 * `nodechanged` and `blur`. Without this, SCEditor's built-in `valuechanged`
 * event only fires on keyup/blur — so clicking a toolbar button (e.g. Bold)
 * and immediately hitting Save pushes a stale value.
 */
export const SCEditor: React.FC<SCEditorProps> = (props) => {
  const onChangeRef = useRef(props.onChange);
  onChangeRef.current = props.onChange;

  const onReadyProp = props.onReady;

  return (
    <RawSCEditor
      {...props}
      onReady={(instance: SCEditorInstance) => {
        instance.bind("nodechanged blur", () => {
          const v = instance.val();
          if (typeof v === "string") onChangeRef.current?.(v);
        });
        onReadyProp?.(instance);
      }}
    />
  );
};

export type { SCEditorProps, SCEditorInstance };
