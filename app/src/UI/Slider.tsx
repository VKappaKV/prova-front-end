import React, { useState } from "react";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Input from "@mui/material/Input";
import Box from "@mui/material/Box";

interface Props {
  handlerFunction: (value: number) => void;
  minValue: number;
  maxValue: number;
  buttonText: string;
}

const SliderWithButton: React.FC<Props> = ({
  handlerFunction,
  minValue,
  maxValue,
  buttonText,
}) => {
  const [sliderValue, setSliderValue] = useState<number>(minValue);
  const [inputValue, setInputValue] = useState<number>(minValue);

  const handleSliderChange = (event: any, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setSliderValue(newValue);
      setInputValue(newValue);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue === "") {
      setSliderValue(0);
      setInputValue(0);
    } else if (/^\d*$/.test(inputValue)) {
      setSliderValue(parseFloat(inputValue));
      setInputValue(parseFloat(inputValue));
    }
  };

  const handleButtonClick = () => {
    handlerFunction(sliderValue);
  };

  const marks = [
    { value: minValue, label: `${minValue}` },
    { value: maxValue, label: `${maxValue}` },
  ];

  const valueLabelFormat = (value: number) => {
    return marks.findIndex((mark) => mark.value === value) !== -1
      ? marks.find((mark) => mark.value === value)?.label
      : "";
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography align="center" variant="subtitle2" sx={{ mb: 1 }}>
        {`Min: ${minValue} - Max: ${maxValue}`}
      </Typography>
      <Slider
        value={sliderValue}
        min={minValue}
        max={maxValue}
        onChange={handleSliderChange}
        aria-labelledby="continuous-slider"
        marks={marks}
        valueLabelDisplay="on"
        valueLabelFormat={valueLabelFormat}
        sx={{ color: "success.dark", mb: 2 }} // shades of green color and margin bottom of 2 units
      />
      <Input
        value={inputValue}
        onChange={handleInputChange}
        inputProps={{
          min: minValue,
          max: maxValue,
          type: "text",
          "aria-labelledby": "input-slider",
        }}
        sx={{ width: "50px", mb: 2 }}
      />
      <Button variant="contained" onClick={handleButtonClick}>
        {buttonText}
      </Button>
    </Box>
  );
};

export default SliderWithButton;
