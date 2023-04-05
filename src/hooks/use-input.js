import { useState } from "react";

const UseInput = (validate, value = "") => {
  const [enteredValue, setEnteredValue] = useState(value);
  const [isTouched, setIsTouched] = useState(false);
  const isValid = validate(enteredValue);
  const hasError = !isValid && isTouched;

  const changeHandler = (event) => {
    setEnteredValue(event.target.value);
  };

  const blurHandler = () => {
    setIsTouched(true);
  };

  const reset = () => {
    setEnteredValue("");
    setIsTouched(false);
  };

  return {
    value: enteredValue,
    isValid,
    hasError,
    changeHandler,
    blurHandler,
    reset,
  };
};

export default UseInput;
