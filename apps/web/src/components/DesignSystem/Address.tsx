const addressFormatter = require("@fragaria/address-formatter");
const parser = require("parse-address");

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
        <p key={line}>{line}</p>
      ))}
    </>
  );
};

export default Address;
