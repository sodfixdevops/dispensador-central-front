import React, { HtmlHTMLAttributes } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement>{}

function Input(props:Props) {

  return (
    <input
        className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 
        placeholder:text-gray-400 text-black"
        {...props}
    />
  );
}

export default Input;