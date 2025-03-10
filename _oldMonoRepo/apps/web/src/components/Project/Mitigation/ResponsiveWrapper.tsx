import { useMediaQuery } from "react-responsive";

import MitigationTable from "./MitigationTable";
import MitigationToolbar from "./MitigationToolbar";
import Mobile from "./Mobile";
import { useEffect } from "react";
import { roomStore } from "@atoms/room";
import { useParams } from "next/navigation";

const ResponsiveWrapper = () => {
  const isMobile = useMediaQuery({ maxWidth: 600 });
  const rooms = roomStore();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    fetch(`/api/v1/projects/${id}/room`)
      .then((res) => res.json())
      .then((data) => {
        rooms.setRooms(data.rooms);
      });
  }, []);

  return (
    <>
      {isMobile ? (
        <Mobile />
      ) : (
        <>
          <MitigationToolbar />
          <MitigationTable />
        </>
      )}
    </>
  );
};

export default ResponsiveWrapper;
