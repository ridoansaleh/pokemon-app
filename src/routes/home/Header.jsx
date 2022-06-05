import React, { memo } from "react";
import { Button, Select } from "antd";
const { Option } = Select;

function Header({
  selectedType,
  types,
  setIsCompareActive,
  onHandleTypeChange,
  onHandleResetClick,
}) {
  return (
    <header>
      <Button type="primary" danger onClick={() => setIsCompareActive(true)}>
        Compare
      </Button>
      <div className="filter-group">
        <Select
          value={selectedType}
          placeholder="Filter by type"
          className="header-select"
          onChange={onHandleTypeChange}
        >
          {types.map((type, i) => (
            <Option key={i} value={type}>
              {type}
            </Option>
          ))}
        </Select>
        <Button id="reset-btn" danger onClick={onHandleResetClick}>
          Reset
        </Button>
      </div>
    </header>
  );
}

export default memo(Header);
