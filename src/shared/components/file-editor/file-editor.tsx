import React, { useEffect, useRef, useState, useMemo } from "react";

import {
  CodeEditor,
  CodeEditorProps,
  Language,
} from "@patternfly/react-code-editor";
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelContent,
  Text,
  TextContent,
} from "@patternfly/react-core";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

import { useFileQuery } from "@app/queries/ruleset";
import { ConditionalRender, SimpleMarkdown } from "@app/shared/components";
import { getMarkdown } from "@app/utils/rule-utils";
import { IncidentDto, LinkDto } from "@app/api/ruleset";

interface IFileEditorProps {
  file: string;
  title: string;
  description: string;
  links: LinkDto[];
  incidents: IncidentDto[];
  props?: Partial<
    Omit<CodeEditorProps, "ref" | "code" | "options" | "onEditorDidMount">
  >;
}

export const FileEditor: React.FC<IFileEditorProps> = ({
  file,
  title,
  description,
  links,
  incidents,
  props,
}) => {
  const useFileQueryResult = useFileQuery(file);
  const filteredIncidents = incidents.filter((inc) => inc.lineNumber && inc.lineNumber != 0)

  const fileContent: string = useMemo(() => useFileQueryResult.data, [useFileQueryResult]);

  // Editor
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<typeof monacoEditor>();
  useEffect(() => {
    return () => {
      monacoRef.current?.editor.getModels().forEach((model) => model.dispose());
      editorRef.current?.dispose();
    };
  }, [editorRef, monacoRef]);

  // Disposables
  const [disposables, setDisposables] = useState<monacoEditor.IDisposable[]>(
    []
  );
  useEffect(() => {
    return () => {
      disposables.forEach((disposable) => disposable && disposable.dispose());
    };
  }, [disposables]);

  const drawerRef = React.useRef<any>();
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(
    filteredIncidents ? true : false
  );
  const onDrawerExpand = () => {
    drawerRef.current && drawerRef.current.focus();
  };

  const fileExtension = file?.split('.')?.pop();

  /**
   * Adds the left Windup icon to the editor
   */
  // const addDeltaDecorations = (
  //   editor: monacoEditor.editor.IStandaloneCodeEditor,
  //   monaco: typeof monacoEditor,
  //   hints: HintDto[]
  // ) => {
  //   const decorations = hints.map((hint) => {
  //     const decoration = {
  //       range: new monaco.Range(hint.line, 1, hint.line, 1),
  //       options: {
  //         isWholeLine: true,
  //         glyphMarginClassName: "windupGlyphMargin",
  //       },
  //     };
  //     return decoration;
  //   });

  //   editor.deltaDecorations([], decorations);
  // };

  /**
   * Adds actions on top of the line with a Hint
   */
  // const addCodeLens = (
  //   editor: monacoEditor.editor.IStandaloneCodeEditor,
  //   monaco: typeof monacoEditor,
  //   hints: HintDto[]
  // ) => {
  //   const lenses = hints.map((hint) => {
  //     const lense: monacoEditor.languages.CodeLens = {
  //       range: new monaco.Range(hint.line!, 1, hint.line!, 1),
  //       id: "view-hint",
  //       command: {
  //         title: "View Hint",
  //         id: editor.addCommand(
  //           0,
  //           () => {hintToFocus
  //             setDrawerHint(hint);
  //             setIsDrawerExpanded(true);
  //           },
  //           ""
  //         )!,
  //       },
  //     };
  //     return lense;
  //   });

  //   const codeLens = monaco.languages.registerCodeLensProvider("*", {
  //     provideCodeLenses: (model, token) => {
  //       return {
  //         lenses: lenses,
  //         dispose: () => {
  //           // codeLens.dispose();
  //         },
  //       };
  //     },
  //     resolveCodeLens: (model, codeLens, token) => {
  //       return codeLens;
  //     },
  //   });

  //   return codeLens;
  // };

  /**
   * Adds a hover text to the hint line
   */
  const addHover = (
    monaco: typeof monacoEditor,
    incidents: IncidentDto[]
  ) => {
    return incidents.map((inc) => {
      return monaco.languages.registerHoverProvider("*", {
        provideHover: (model, position) => {
          if (position.lineNumber !== inc.lineNumber) {
            return undefined;
          }

          return {
            range: new monaco.Range(inc.lineNumber!, 1, inc.lineNumber!, 1),
            contents: [
              {
                value: getMarkdown(inc.message, []),
              },
            ],
          };
        },
      });
    });
  };

  /**
   * Underlines the hint line
   */
  const addMarkers = (
    monaco: typeof monacoEditor,
    incidents: IncidentDto[]
  ) => {
    const markers = incidents
      .filter((inc) => inc.lineNumber && inc.lineNumber != 0)
      ?.map((inc) => {
        const marker: monacoEditor.editor.IMarkerData = {
          startLineNumber: inc.lineNumber,
          endLineNumber: inc.lineNumber, 
          startColumn: 0,
          endColumn: 1000,
          message: inc.message,
          severity: monaco.MarkerSeverity.Warning,
        }
        return marker
      })

    const model = monaco.editor.getModels()[0];
    monaco.editor.setModelMarkers(model, "*", markers);
  };

  const onEditorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    editor.layout();
    editor.focus();
    monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });

    let newDisposables: monacoEditor.IDisposable[] = [];

    // Add markers
    addMarkers(monaco, incidents);

    // Add code lenses
    // const codeLens = addCodeLens(editor, monaco, hints);
    // newDisposables.push(codeLens);

    // Add delta decorations
    // addDeltaDecorations(editor, monaco, hints);

    // Add hovers
    const hovers = addHover(monaco, incidents);
    newDisposables = newDisposables.concat(hovers);

    setDisposables(newDisposables);

    // const offset = 5;
    // if (hintToFocus && hintToFocus.line) {
    //   editor.revealLineNearTop(hintToFocus.line + offset);
    // }
    // if (lineToFocus) {
    //   editor.revealLineNearTop(lineToFocus + offset);
    // }

    // Open warning programatically
    // editor.trigger("anystring", `editor.action.marker.next`, "s");

    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  return (
    <Drawer isExpanded={isDrawerExpanded} onExpand={onDrawerExpand} isInline>
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            isResizable
            defaultSize={"800px"}
            minSize={"350px"}
          >
            <DrawerHead>
              <Card isLarge>
                <CardHeader>
                  <CardActions hasNoOffset>
                    <DrawerActions>
                      <DrawerCloseButton
                        onClick={() => setIsDrawerExpanded(false)}
                      />
                    </DrawerActions>
                  </CardActions>
                  <CardTitle>
                    <TextContent>
                      <Text component="h1">{title}</Text>
                    </TextContent>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  {description && (
                    <SimpleMarkdown
                      children={getMarkdown(
                        description,
                        links
                      )}
                    />
                  )}
                </CardBody>
              </Card>
            </DrawerHead>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>
          <ConditionalRender
            when={useFileQueryResult.isLoading}
            then={<span>Loading...</span>}
          >
            <CodeEditor
              isDarkTheme
              isLineNumbersVisible
              isReadOnly
              isMinimapVisible
              isLanguageLabelVisible
              isDownloadEnabled
              code={fileContent}
              language={Object.values(Language).find(
                (l) => l === fileExtension?.toLowerCase()
              )}
              options={{
                glyphMargin: true,
                "semanticHighlighting.enabled": true,
                renderValidationDecorations: "on",
              }}
              onEditorDidMount={(
                editor: monacoEditor.editor.IStandaloneCodeEditor,
                monaco: typeof monacoEditor
              ) => {
                onEditorDidMount(editor, monaco);
              }}
              height={`${window.innerHeight - 300}px`}
              {...props}
            />
          </ConditionalRender>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
