import React, { InputHTMLAttributes, useEffect } from "react";
import { formatMoneyInput } from "../lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

function InputMoney({ className, ...props }: Props) {
  useEffect(() => {
    formatMoneyInput();
  }, []);
  return (
    <input
      className={`money peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 
      placeholder:text-gray-400 text-black ${className || ""}`}
      {...props}
    />
  );
}

export default InputMoney;
