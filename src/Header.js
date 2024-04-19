import { Image, useTheme } from "@aws-amplify/ui-react";
import image from "./fit-2.png";

export function Header() {
  const { tokens } = useTheme();

  return (
    <Image
      alt="logo"
      src={image}
      padding={tokens.space.medium}
    />
  );
}
