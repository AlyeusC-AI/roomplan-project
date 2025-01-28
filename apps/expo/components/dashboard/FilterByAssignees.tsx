import { Box, Center, Select, View } from "native-base";
import React from "react";
import { RouterOutputs } from "@servicegeek/api";
import { Assets, Icon } from "react-native-ui-lib";
import { Filter } from "lucide-react-native";

const FilterByAssignees = ({
  teamMembers,
  updateFilter,
  selectedUser,
}: {
  teamMembers: NonNullable<
    RouterOutputs["mobile"]["getDashboardData"]["teamMembers"]
  >;
  updateFilter: (id: string) => void;
  selectedUser: string;
}) => {
  const getName = (
    member: NonNullable<
      RouterOutputs["mobile"]["getDashboardData"]["teamMembers"]
    >[0]
  ) => {
    const { firstName, lastName, email } = member.user;
    if (firstName) {
      if (lastName) {
        return `${firstName} ${lastName}`;
      }
      return firstName;
    }
    return email;
  };

  const onValueChange = (v: string) => {
    updateFilter(v);
  };

  return (
    <Center>
      <Box maxW="300">
        <Select
          variant="unstyled"
          defaultValue="Anyone"
          selectedValue={selectedUser}
          overflow="visible"
          accessibilityLabel="Assignee"
          _selectedItem={{
            bg: "primary.400",
            endIcon: (
              <Icon size={12} source={Assets.icons.check} tintColor="white" />
            ),
          }}
          dropdownIcon={
            <View bg="white" shadow={5} rounded="full" w={10} h={10} p={2.5}>
              <Filter width="100%" height="100%" stroke="#000" />
            </View>
          }
          mt={1}
          h={10}
          onValueChange={(itemValue) => onValueChange(itemValue)}
        >
          <Select.Item label="Anyone" value="Anyone" />
          {teamMembers.map((member) => (
            <Select.Item
              key={member.user.email}
              label={getName(member)}
              value={member.user.id}
            />
          ))}
        </Select>
      </Box>
    </Center>
  );
};

export default FilterByAssignees;
