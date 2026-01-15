import React, { useState } from 'react';

import {
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
} from '@patternfly/react-core';

export interface OptionWithValue<T = string> {
  value: T;
  toString: () => string;
  compareTo?: (other: string | OptionWithValue) => boolean;
  props?: any;
}

type OptionLike = string | OptionWithValue;

export interface ISimpleSelectProps {
  "aria-label": string;
  onChange: (selection: OptionLike) => void;
  options: OptionLike[];
  value?: OptionLike | OptionLike[];
  placeholderText?: string;
  variant?: "single" | "checkbox";
  toggleIcon?: React.ReactNode;
  hasInlineFilter?: boolean;
  onClear?: () => void;
  width?: number;
  maxHeight?: number;
}

export const SimpleSelect: React.FC<ISimpleSelectProps> = ({
  onChange,
  options,
  value,
  placeholderText = "Select...",
  variant = "single",
  toggleIcon,
  hasInlineFilter,
  onClear,
  width,
  maxHeight,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, selection: string | number | undefined) => {
    const selected = options.find(opt =>
      typeof opt === 'string' ? opt === selection : opt.value === selection
    );

    if (selected) {
      onChange(selected);
      if (variant !== "checkbox") {
        setIsOpen(false);
      }
    }
  };

  const filteredOptions = hasInlineFilter
    ? options.filter(option => {
        const optionStr = typeof option === 'string' ? option : option.toString();
        return optionStr.toLowerCase().includes(filterValue.toLowerCase());
      })
    : options;

  const isSelected = (option: OptionLike) => {
    if (Array.isArray(value)) {
      return value.some(v =>
        typeof v === 'string' && typeof option === 'string'
          ? v === option
          : JSON.stringify(v) === JSON.stringify(option)
      );
    }
    return typeof value === 'string' && typeof option === 'string'
      ? value === option
      : JSON.stringify(value) === JSON.stringify(option);
  };

  const getDisplayValue = () => {
    if (!value) return placeholderText;
    if (Array.isArray(value)) {
      return value.length > 0
        ? `${value.length} selected`
        : placeholderText;
    }
    return typeof value === 'string' ? value : value.toString();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      icon={toggleIcon}
      style={width ? { width: `${width}px` } : undefined}
      {...props}
    >
      {getDisplayValue()}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={value}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
    >
      <SelectList style={maxHeight ? { maxHeight: `${maxHeight}px`, overflowY: 'auto' } : undefined}>
        {hasInlineFilter && (
          <div style={{ padding: '8px' }}>
            <SearchInput
              value={filterValue}
              onChange={(_, val) => setFilterValue(val)}
              onClear={() => setFilterValue('')}
            />
          </div>
        )}
        {filteredOptions.map((option, index) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.toString();
          return (
            <SelectOption
              key={`${index}-${optionLabel}`}
              value={optionValue}
              hasCheckbox={variant === "checkbox"}
              isSelected={isSelected(option)}
            >
              {optionLabel}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};
