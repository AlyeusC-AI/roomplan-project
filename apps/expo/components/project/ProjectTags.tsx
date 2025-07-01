import React from "react";
import { View, Text } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Tag } from "@service-geek/api-client";

interface ProjectTagsProps {
  tags?: Tag[];
  onAddTags: () => void;
}

export default function ProjectTags({ tags, onAddTags }: ProjectTagsProps) {
  return (
    <View className="flex-row flex-wrap items-center gap-2">
      {tags && tags.length > 0 && (
        <View className="flex-row flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="px-2 py-1"
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
        </View>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onPress={onAddTags}
        className="h-8 px-2"
      >
        <Text className="text-sm">+ Add Tags</Text>
      </Button>
    </View>
  );
} 