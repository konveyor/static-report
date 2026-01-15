import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

import {
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  SearchInput,
} from "@patternfly/react-core";

import "./simple-context.css";

export interface Context {
  key: string;
  label: string;
}

interface ISimpleContext {
  allContexts: Context[];
  currentContext?: Context;
  selectContext: (key: string) => void;
}

const SimpleContext = createContext<ISimpleContext>({
  allContexts: [],
  currentContext: undefined,
  selectContext: () => undefined,
});

interface ISimpleContextProviderProps {
  allContexts: Context[];
  children: React.ReactNode;
}

export const SimpleContextProvider: React.FunctionComponent<
  ISimpleContextProviderProps
> = ({ allContexts, children }: ISimpleContextProviderProps) => {
  const [selectedContextKey, setSelectedContextKey] = useState<string>();

  return (
    <SimpleContext.Provider
      value={{
        allContexts,
        currentContext: allContexts.find((f) => f.key === selectedContextKey),
        selectContext: (key: string) => setSelectedContextKey(key),
      }}
    >
      {children}
    </SimpleContext.Provider>
  );
};

export const useSimpleContext = (): ISimpleContext => useContext(SimpleContext);

// Helpers components

export interface ISimpleContextSelectorProps {
  contextKeyFromURL?: string;
  onChange: (context: Context) => void;
}

export const SimpleContextSelector: React.FC<ISimpleContextSelectorProps> = ({
  contextKeyFromURL,
  onChange,
}) => {
  const { allContexts, currentContext, selectContext } = useSimpleContext();

  useEffect(() => {
    const currentContextKey = contextKeyFromURL ?? currentContext?.key;

    if (typeof currentContextKey === "string") {
      selectContext(currentContextKey);
    }
  }, [contextKeyFromURL, currentContext, selectContext]);

  const [filterText, setFilterText] = useState("");
  const [isSelectorOpen, toggleSelector] = useReducer(
    (isVisible) => !isVisible,
    false
  );

  const onSelect = (value: Context) => {
    toggleSelector();
    selectContext(value.key);
    onChange(value);
  };

  const filteredContexts = allContexts.filter(
    (f) => f.label.toLowerCase().indexOf(filterText.toLowerCase()) !== -1
  );

  return (
    <Dropdown
      isOpen={isSelectorOpen}
      onOpenChange={(isOpen) => !isOpen && toggleSelector()}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={toggleSelector}
          isExpanded={isSelectorOpen}
          className="firstChildBordered"
        >
          {currentContext?.label || "Select context"}
        </MenuToggle>
      )}
    >
      <DropdownList>
        <div style={{ padding: "8px" }}>
          <SearchInput
            value={filterText}
            onChange={(_, value) => setFilterText(value)}
            onClear={() => setFilterText("")}
          />
        </div>
        {filteredContexts.map((item, index) => (
          <DropdownItem key={index} onClick={() => onSelect(item)}>
            {item.label}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};
