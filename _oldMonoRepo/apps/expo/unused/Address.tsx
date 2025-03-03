import { Text } from "native-base";
import React from "react";

const addressFormatter = require("@fragaria/address-formatter");
var parser = require("parse-address");

const Address = ({ address }: { address: string }) => {
  const parsedAddress = parser.parseLocation(address);
  if (!parsedAddress) return <>{address}</>;
  const formattedAsLines: string[] = addressFormatter.format(
    {
      houseNumber: parsedAddress.number,
      road:
        parsedAddress.street +
        (parsedAddress.type ? ` ${parsedAddress.type}` : ""),
      city: parsedAddress.city,
      postcode: parsedAddress.zip,
      state: parsedAddress.state,
      countryCode: "US",
    },
    {
      output: "array",
    }
  );

  return (
    <>
      {formattedAsLines.map((line) => (
        <Text key={line} fontSize={16}>
          {line}
        </Text>
      ))}
    </>
  );
};

export default Address;
