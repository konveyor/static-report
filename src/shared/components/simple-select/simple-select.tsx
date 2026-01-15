import React, { useState } from 'react';

import {
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';

export interface OptionWithValue<T = string> {
  value: T;
  toString: () => string;
  compareTo?: (other: string | OptionWithValue) => boolean;
  props?: Record<string, any>; // Extra props for <SelectOption>, e.g. children, className
}

type OptionLike = string | OptionWithValue;

export interface ISimpleSelectProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  onChange: (selection: OptionLike) => void;
  options: OptionLike[];
  value?: OptionLike | OptionLike[];
  placeholderText?: string;
  variant?: "single" | "checkbox";
  width?: number;
  maxHeight?: number | string;
  toggleIcon?: React.ReactElement;
  hasInlineFilter?: boolean;
  onClear?: () => void;
}

export const SimpleSelect: React.FC<ISimpleSelectProps> = ({
  onChange,
  options,
  value,
  placeholderText = "Select...",
  variant = "single",
  width,
  maxHeight,
  toggleIcon,
  hasInlineFilter,
  onClear,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, itemId: string | number | undefined) => {
    const selection = options.find(opt => opt.toString() === itemId);
    if (selection) {
      onChange(selection);
      if (variant !== "checkbox") {
        setIsOpen(false);
      }
    }
  };

  const selectedValue = value ? (Array.isArray(value) ? value.map(v => v.toString()) : value.toString()) : undefined;

  const selectStyles = {
    ...(width && { width: `${width}px` }),
  };

  return (
    <div style={selectStyles}>
      <Select
        isOpen={isOpen}
        selected={selectedValue}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={onToggleClick}
            isExpanded={isOpen}
            icon={toggleIcon}
            {...props}
          >
            {value ? (Array.isArray(value) ? value.map(v => v.toString()).join(", ") : value.toString()) : placeholderText}
          </MenuToggle>
        )}
      >
        <SelectList style={maxHeight ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight, overflowY: 'auto' } : undefined}>
          {options.map((option, index) => (
            <SelectOption
              key={`${index}-${option.toString()}`}
              value={option.toString()}
              {...(typeof option === "object" && (option as OptionWithValue).props)}
            >
              {option.toString()}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </div>
  );
};
