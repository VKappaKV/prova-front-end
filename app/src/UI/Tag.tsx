import React from "react";
import { styled } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { red, green } from "@mui/material/colors";

const TagWrapper = styled("div")({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: red[500],
  borderRadius: "9999px",
  color: "#fff",
  padding: "4px 8px",
  fontSize: "0.8rem",
  fontWeight: "bold",
  cursor: "pointer",
  "& > svg": {
    marginRight: "4px",
  },
  "&.success": {
    backgroundColor: green[500],
  },
});

interface TagProps {
  condition: boolean;
  valueToShow: string;
  onClick?: () => void;
  disabled: boolean;
}

function Tag({ condition, valueToShow, onClick, disabled }: TagProps) {
  const icon = condition ? <CheckIcon /> : <ClearIcon />;
  const className = condition ? "success" : "";
  const clickable = !disabled && Boolean(onClick);

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <TagWrapper className={className} onClick={handleClick}>
      {icon}
      {valueToShow}
    </TagWrapper>
  );
}

export default Tag;
