import React, { useEffect, useRef, useState, useMemo } from "react";

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

import {
  CodeEditor,
  CodeEditorProps,
  Language,
} from "@patternfly/react-code-editor";

import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

import { IncidentDto, LinkDto } from "@app/api/report";
import { useFileQuery } from "@app/queries/report";
import { ConditionalRender, SimpleMarkdown } from "@app/shared/components";
import { getMarkdown } from "@app/utils/utils";
import { ViolationProcessed, FileProcessed } from "@app/models/api-enriched";

const codeLineRegex = /^\s*([0-9]+)( {2})?(.*)$/;

interface IFileEditorProps {
  file: FileProcessed;
  issue: ViolationProcessed;
  props?: Partial<
    Omit<CodeEditorProps, "ref" | "code" | "options" | "onEditorDidMount">
  >;
}

export const FileEditor: React.FC<IFileEditorProps> = ({
  file,
  issue,
  props,
}) => {
  const useFileQueryResult = useFileQuery(file.name, issue.appID, file.isLocal);
  let fileContent = file.codeSnip || "";
  let isLoading = false;
  let absoluteToRelativeLineNum = (lineNum: number) => lineNum;
  let relativeToAbsoluteLineNum = (lineNum: number) => lineNum;
  if (file.isLocal) {
    fileContent = useFileQueryResult.data || "";
    isLoading = useFileQueryResult.isLoading;
  } else {
    const codeSnipNumberedLines = fileContent.split("\n");
    const codeSnipTrimmedLines: string[] = [];
    let codeSnipStartLine = 1;
    codeSnipNumberedLines.forEach((numberedLine, index) => {
      const match = numberedLine.match(codeLineRegex);
      if (match && !isNaN(Number(match[1]))) {
        const lineNum = Number(match[1]);
        if (index === 0) codeSnipStartLine = lineNum;
        const lineCode = match[3] || "";
        codeSnipTrimmedLines.push(lineCode);
      }
    });
    fileContent = codeSnipTrimmedLines.join("\n");
    absoluteToRelativeLineNum = (lineNum: number) => lineNum - (codeSnipStartLine - 1);
    relativeToAbsoluteLineNum = (lineNum: number) => lineNum + (codeSnipStartLine - 1);
  }

  
  const filteredIncidents = useMemo(() => {
    return file.incidents.filter((i) => i.lineNumber && i.lineNumber !== 0)
  }, [file.incidents])

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

  const fileExtension = file?.name?.split('.')?.pop();

  /**
   * Adds a hover text to the hint line
   */
  const addHover = (
    monaco: typeof monacoEditor,
    incidents: IncidentDto[],
    links: LinkDto[]
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
                value: getMarkdown(inc.message, links),
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
      .filter((inc) => inc.lineNumber && inc.lineNumber !== 0)
      ?.map((inc) => {
        const marker: monacoEditor.editor.IMarkerData = {
          startLineNumber: absoluteToRelativeLineNum(inc.lineNumber),
          endLineNumber: absoluteToRelativeLineNum(inc.lineNumber), 
          startColumn: 0,
          endColumn: 1000,
          message: issue.description,
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
    addMarkers(monaco, file.incidents);

    // Add hovers
    const hovers = addHover(monaco, file.incidents, issue.links);
    newDisposables = newDisposables.concat(hovers);

    setDisposables(newDisposables);

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
                      <Text component="h1">{issue.name}</Text>
                    </TextContent>
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  {issue.description && (
                    <SimpleMarkdown
                      children={getMarkdown(
                        issue.description,
                        issue.links,
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
            when={isLoading}
            then={<span>Loading...</span>}
          >
            <CodeEditor
              isDarkTheme
              isLineNumbersVisible
              isReadOnly
              isMinimapVisible
              isLanguageLabelVisible
              isDownloadEnabled={false}
              code={fileContent ? fileContent: ""}
              language={Object.values(Language).find(
                (l) => l === fileExtension?.toLowerCase()
              )}
              options={{
                glyphMargin: true,
                "semanticHighlighting.enabled": true,
                renderValidationDecorations: "on",
                lineNumbers: (lineNum: number) => 
                  String(relativeToAbsoluteLineNum(lineNum))
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
