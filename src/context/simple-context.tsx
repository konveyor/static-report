import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Menu,
  MenuContent,
  MenuList,
  MenuItem,
  MenuToggle,
  Popper,
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
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const onSelect = (value: Context) => {
    setIsSelectorOpen(false);
    selectContext(value.key);
    onChange(value);
  };

  const onToggle = () => {
    setIsSelectorOpen(!isSelectorOpen);
  };

  const filteredContexts = allContexts.filter(
    (f) => f.label.toLowerCase().indexOf(filterText.toLowerCase()) !== -1
  );

  const toggle = (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggle}
      isExpanded={isSelectorOpen}
      className="firstChildBordered"
    >
      {currentContext?.label || "Select context"}
    </MenuToggle>
  );

  const menu = (
    <Menu ref={menuRef} onSelect={(_ev, itemId) => {
      const selected = allContexts.find(c => c.key === itemId);
      if (selected) onSelect(selected);
    }}>
      <MenuContent>
        <SearchInput
          value={filterText}
          onChange={(_event, value) => setFilterText(value)}
          onClear={() => setFilterText("")}
        />
        <MenuList>
          {filteredContexts.map((item) => (
            <MenuItem key={item.key} itemId={item.key}>
              {item.label}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <Popper
      trigger={toggle}
      popper={menu}
      isVisible={isSelectorOpen}
      onDocumentClick={(event) => {
        if (
          event &&
          toggleRef.current &&
          menuRef.current &&
          !toggleRef.current.contains(event.target as Node) &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setIsSelectorOpen(false);
        }
      }}
    />
  );
};
