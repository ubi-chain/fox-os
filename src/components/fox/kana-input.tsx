import { forwardRef, type InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onValue: (next: string) => void;
};

export const KanaInput = forwardRef<HTMLInputElement, Props>(function KanaInput(
  { value, onValue, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={(event) => onValue(event.target.value)}
      {...rest}
    />
  );
});
