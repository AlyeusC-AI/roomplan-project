// import { useState, useEffect, Dispatch, SetStateAction } from "react";
// import React from "react";
// import FilterByAssignees from "./FilterByAssignees";
// import { Assets, Icon } from "react-native-ui-lib";
// import { useDebounce } from "../../utils/debounce";

// export default function DashboardHeader({
//   teamMembers,
//   refetch,
//   isFetchingProjects,
//   selectedUser,
//   setSelectedUser,
// }: {
//   teamMembers: NonNullable<
//     RouterOutputs["mobile"]["getDashboardData"]["teamMembers"]
//   >;
//   refetch: (s: string) => void;
//   isFetchingProjects: boolean;
//   selectedUser: string;
//   setSelectedUser: Dispatch<SetStateAction<string>>;
// }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const debouncedSearchTerm = useDebounce(searchTerm, 1000);

//   useEffect(() => {
//     refetch(debouncedSearchTerm);
//   }, [debouncedSearchTerm]);

//   const updateFilter = (userId: string) => {
//     const u = userId === "Anyone" || !userId ? "" : userId;
//     if (u !== selectedUser) {
//       setSelectedUser(u);
//     }
//   };

//   return (
//     <VStack w="full" py={2}>
//       <HStack
//         w="full"
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//       >
//         <Heading>Project Dashboard</Heading>
//         <FilterByAssignees
//           teamMembers={teamMembers}
//           updateFilter={updateFilter}
//           selectedUser={selectedUser}
//         />
//       </HStack>
//       <VStack
//         w="full"
//         h={10}
//         display="flex"
//         alignSelf="center"
//         shadow="1"
//         mt="4"
//         mb="2"
//       >
//         <Input
//           placeholder="Search for anything"
//           placeholderTextColor="black"
//           variant="filled"
//           width="100%"
//           rounded="md"
//           py="2"
//           px="4"
//           size="lg"
//           bg="white"
//           value={searchTerm}
//           onChangeText={(text) => setSearchTerm(text)}
//           InputRightElement={
//             <View mr={2} display="flex" flexDirection="row">
//               {isLoading ? <Spinner mr={2} /> : undefined}
//               <Icon size={20} source={Assets.icons.search} tintColor="gray" />
//             </View>
//           }
//         />
//       </VStack>
//       <HStack w="full" display="flex" alignItems="flex-end" mt={1}>
//         <Text color="gray.500" mr={2}>
//           Assigned To:
//         </Text>
//         <Text>
//           {teamMembers.find((t) => t.user.id === selectedUser)?.user.email ||
//             "Anyone"}
//         </Text>
//         {isFetchingProjects && <Spinner ml={2} />}
//       </HStack>
//     </VStack>
//   );
// }

import { useDebounce } from "@/utils/debounce";
import { Filter, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, Modal, SafeAreaView, Text } from "react-native";
import { router } from "expo-router";
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import MemberSelector from '@/components/calendar/member-selector';

const FilterIcon = Filter as any;

export default function Header({
  refetch,
  selectedUser,
  setSelectedUser,
  filterObj,
  setFilterObj,
  filterDialogState,
  setFilterDialogState,
}: {
  refetch: (s: string) => void;
  selectedUser: string;
  setSelectedUser: (s: string) => void;
  filterObj: any;
  setFilterObj: (f: any) => void;
  filterDialogState: any;
  setFilterDialogState: (f: any) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [visible, setVisible] = useState(false);
  const [startDate, setStartDate] = useState<DateType | null>(null);
  const [endDate, setEndDate] = useState<DateType | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const defaultStyles = useDefaultStyles();
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    refetch(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const updateFilter = (userId: string) => {
    const u = userId === "Anyone" || !userId ? "" : userId;
    if (u !== selectedUser) {
      setSelectedUser(u);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerSearch}>
        <View style={styles.headerSearchIcon}>
          <Search color="#778599" size={19} />
        </View>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="name"
          clearButtonMode="while-editing"
          onChangeText={setSearchTerm}
          placeholder="Search..."
          placeholderTextColor="#778599"
          returnKeyType="done"
          style={styles.headerSearchInput}
          value={searchTerm}
        />
      </View>
      <TouchableOpacity
      onPress={() => setVisible(true)}
      className="bg-white p-2 "
      >
        <FilterIcon size={21} />
        </TouchableOpacity>

        <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setVisible(false)}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Filters</Text>
            {/* Start Date Picker */}
            <Text style={{ fontSize: 16, marginBottom: 4 }}>Start Date</Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'white',
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                marginBottom: 12,
              }}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={{ fontSize: 16, color: '#1d1d1d' }}>
                {startDate ? dayjs(startDate).format('MMM D, YYYY') : 'Select start date'}
              </Text>
              <FilterIcon size={20} />
            </TouchableOpacity>
            {/* End Date Picker */}
            <Text style={{ fontSize: 16, marginBottom: 4 }}>End Date</Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'white',
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                marginBottom: 12,
              }}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={{ fontSize: 16, color: '#1d1d1d' }}>
                {endDate ? dayjs(endDate).format('MMM D, YYYY') : 'Select end date'}
              </Text>
              <FilterIcon size={20} />
            </TouchableOpacity>
            {/* User Selector */}
            <Text style={{ fontSize: 16, marginBottom: 4 }}>Assignees</Text>
            <MemberSelector selectedUserIds={selectedUserIds} onChange={setSelectedUserIds} />
          </View>
          {/* DateTimePickers (hidden, show on demand) */}
          {showStartPicker && (
            <DateTimePicker
              mode="single"
              date={startDate || new Date()}
              onChange={({ date }) => {
                setStartDate(date);
                setShowStartPicker(false);
              }}
              styles={defaultStyles}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              mode="single"
              date={endDate || new Date()}
              onChange={({ date }) => {
                setEndDate(date);
                setShowEndPicker(false);
              }}
              styles={defaultStyles}
            />
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 12, padding: 20 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#e5e7eb', padding: 16, borderRadius: 8, alignItems: 'center' }}
            onPress={() => {
              setVisible(false);
              setStartDate(filterObj.startDate || null);
              setEndDate(filterObj.endDate || null);
              setSelectedUserIds(filterObj.assigneeIds || []);
            }}
          >
            <Text style={{ color: '#182e43', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#182e43', padding: 16, borderRadius: 8, alignItems: 'center' }}
            onPress={() => {
              setVisible(false);
              setFilterObj({
                ...filterObj,
                startDate,
                endDate,
                assigneeIds: selectedUserIds,
              });
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>

      {/* <View style={styles.headerAction}>
        <TouchableOpacity
          onPress={() => router.push("/select-assignee")}
        >
          <Filter size={21} />
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  /** Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 10,
  },
  headerSearch: {
    position: "relative",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  headerSearchIcon: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  headerSearchInput: {
    backgroundColor: "#fff",
    width: "100%",
    height: 40,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "500",
    paddingLeft: 40,
    shadowColor: "#90a0ca",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  headerAction: {
    marginLeft: 12,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 9999,
    shadowColor: "#90a0ca",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  /** Placeholder */
  placeholder: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    height: 400,
    marginTop: 0,
    padding: 0,
    backgroundColor: "transparent",
  },
  placeholderInset: {
    borderWidth: 4,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    borderRadius: 9,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
});
