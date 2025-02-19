import FilterLabel from "./FilterLabel";
import { Button } from "@components/ui/button";
import { Calendar, Home } from "lucide-react";
import { userInfoStore } from "@atoms/user-info";

export default function GroupByPicker() {
  const user = userInfoStore();

  const onClick = () => {
    const newView =
      user.user?.groupView == "dateView" ? "roomView" : "dateView";
    user.updateUser({
      groupView: newView,
    });
    fetch("/api/v1/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupView: newView,
      }),
    });
  };

  return (
    <div className='flex flex-col'>
      <FilterLabel>Group By</FilterLabel>
      <Button variant='outline' onClick={onClick}>
        {user.user?.groupView == "dateView" ? (
          <>
            <Calendar className='mr-2 size-5' />
            Date
          </>
        ) : (
          <>
            <Home className='mr-2 size-5' />
            Room
          </>
        )}
      </Button>
    </div>
  );
}
