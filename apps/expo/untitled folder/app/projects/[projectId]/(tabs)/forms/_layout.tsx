import { Stack, useLocalSearchParams, useRouter } from "expo-router";

export default function FormsLayout() {
    const router = useRouter();
    const { projectId } = useLocalSearchParams();

    router.setParams({
        projectId: projectId,
    });

        return <Stack 
         screenOptions={{
            headerShown: false,
         }}
        />;
}