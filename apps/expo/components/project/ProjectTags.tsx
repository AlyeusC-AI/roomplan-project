import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag } from "@service-geek/api-client";
import { Edit2 } from "lucide-react-native";

interface ProjectTagsProps {
  tags?: Tag[];
  onAddTags: () => void;
}

export default function ProjectTags({ tags, onAddTags }: ProjectTagsProps) {
  const hasTags = !!tags && tags.length > 0;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
        style={{ flexGrow: 0 }}
      >
        {hasTags &&
          tags!.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="px-2 py-1 mr-2"
              style={
                tag.color
                  ? {
                      backgroundColor: tag.color,
                      borderColor: tag.color,
                    }
                  : {}
              }
            >
              <Text
                style={
                  tag.color
                    ? {
                        color: "white",
                        fontSize: 12,
                        fontWeight: "600",
                      }
                    : {
                        fontSize: 12,
                        fontWeight: "600",
                      }
                }
              >
                {tag.name}
              </Text>
            </Badge>
          ))}
      </ScrollView>
      <Button
          variant="outline"
          size="sm"
          onPress={onAddTags}
          className="h-7 px-2 rounded-full"
          style={{ marginLeft: 8 }}
          >
          {!hasTags ? (
          <Text className="text-sm">+ Add Labels</Text>): <Edit2 size={16} color="#000" />}
        </Button>
    </View>
  );
} 