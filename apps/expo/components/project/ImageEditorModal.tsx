import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import {
  Canvas,
  Path,
  SkPath,
  Skia,
  SkImage,
  useImage,
  Group,
  Text as SkiaText,
  Rect,
  Circle,
  useCanvasRef,
  Image as SkiaImage,
} from "@shopify/react-native-skia";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { toast } from "sonner-native";
import {
  X,
  Move,
  Pencil,
  Type,
  Square,
  CircleIcon,
  Scissors,
  Undo2,
  Redo2,
  Save,
  Trash2,
} from "@/lib/icons/ImageEditorIcons";
import { Slider } from "@/components/ui/slider";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

type Tool = "select" | "draw" | "text" | "rectangle" | "circle" | "crop";

interface DrawingElement {
  id: string;
  type: "path" | "text" | "rectangle" | "circle";
  path?: SkPath;
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  size: number;
}

export default function ImageEditorModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
}: ImageEditorModalProps) {
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [fontSize, setFontSize] = useState(20);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<SkPath | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const canvasRef = useCanvasRef();
  const image = useImage(imageUrl);

  // Initialize history
  useEffect(() => {
    if (isOpen) {
      setElements([]);
      setHistory([[]]);
      setHistoryIndex(0);
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [isOpen]);

  // Handle drawing
  const handleStartDrawing = useCallback(
    (x: number, y: number) => {
      if (selectedTool === "draw") {
        setIsDrawing(true);
        const path = Skia.Path.Make();
        path.moveTo(x, y);
        setCurrentPath(path);
      } else if (selectedTool === "rectangle" || selectedTool === "circle") {
        setStartPoint({ x, y });
      }
    },
    [selectedTool]
  );

  const handleDrawing = useCallback(
    (x: number, y: number) => {
      if (isDrawing && selectedTool === "draw" && currentPath) {
        currentPath.lineTo(x, y);
        setCurrentPath(currentPath.copy());
      }
    },
    [isDrawing, selectedTool, currentPath]
  );

  const handleEndDrawing = useCallback(
    (x: number, y: number) => {
      if (selectedTool === "draw" && currentPath) {
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: "path",
          path: currentPath,
          color,
          size: brushSize,
        };
        setElements((prev) => [...prev, newElement]);
        setCurrentPath(null);
        setIsDrawing(false);
        saveToHistory();
      } else if (selectedTool === "rectangle" || selectedTool === "circle") {
        if (startPoint) {
          const newElement: DrawingElement = {
            id: Date.now().toString(),
            type: selectedTool,
            x: startPoint.x,
            y: startPoint.y,
            width: x - startPoint.x,
            height: y - startPoint.y,
            color,
            size: brushSize,
          };
          setElements((prev) => [...prev, newElement]);
          setStartPoint(null);
          saveToHistory();
        }
      }
    },
    [selectedTool, currentPath, startPoint, color, brushSize]
  );

  // Save to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanUndo(true);
    setCanRedo(false);
  }, [history, historyIndex, elements]);

  // Handle undo
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setElements(history[newIndex]);
    setCanUndo(newIndex > 0);
    setCanRedo(true);
  }, [history, historyIndex]);

  // Handle redo
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setElements(history[newIndex]);
    setCanUndo(true);
    setCanRedo(newIndex < history.length - 1);
  }, [history, historyIndex]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      const snapshot = await canvasRef.current.makeImageSnapshot();
      const data = snapshot.encodeToBase64();
      const uri = `data:image/png;base64,${data}`;
      onSave(uri);
      onClose();
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Failed to save image");
    }
  }, [canvasRef, onSave, onClose]);

  if (!isOpen || !image) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Image Editor</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.editorContainer}>
            <View style={styles.toolbar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.toolGroup}>
                  <Button
                    variant={selectedTool === "select" ? "default" : "outline"}
                    size="sm"
                    onPress={() => setSelectedTool("select")}
                  >
                    <Move size={20} color="#000" />
                  </Button>
                  <Button
                    variant={selectedTool === "draw" ? "default" : "outline"}
                    size="sm"
                    onPress={() => setSelectedTool("draw")}
                  >
                    <Pencil size={20} color="#000" />
                  </Button>
                  <Button
                    variant={selectedTool === "text" ? "default" : "outline"}
                    size="sm"
                    onPress={() => setSelectedTool("text")}
                  >
                    <Type size={20} color="#000" />
                  </Button>
                  <Button
                    variant={
                      selectedTool === "rectangle" ? "default" : "outline"
                    }
                    size="sm"
                    onPress={() => setSelectedTool("rectangle")}
                  >
                    <Square size={20} color="#000" />
                  </Button>
                  <Button
                    variant={selectedTool === "circle" ? "default" : "outline"}
                    size="sm"
                    onPress={() => setSelectedTool("circle")}
                  >
                    <CircleIcon size={20} color="#000" />
                  </Button>
                  <Button
                    variant={selectedTool === "crop" ? "default" : "outline"}
                    size="sm"
                    onPress={() => setSelectedTool("crop")}
                  >
                    <Scissors size={20} color="#000" />
                  </Button>
                </View>
              </ScrollView>

              <View style={styles.toolControls}>
                <TouchableOpacity
                  style={[styles.colorButton, { backgroundColor: color }]}
                  onPress={() => setShowColorPicker(!showColorPicker)}
                />
                {/* {renderColorPicker()} */}
                <View style={styles.sizeControl}>
                  <Text>Size:</Text>
                  <Slider
                    defaultValue={[
                      selectedTool === "text" ? fontSize : brushSize,
                    ]}
                    onValueChange={(value) => {
                      const newValue = value[0];
                      if (selectedTool === "text") {
                        setFontSize(newValue);
                      } else {
                        setBrushSize(newValue);
                      }
                    }}
                    min={1}
                    max={selectedTool === "text" ? 72 : 20}
                    step={1}
                  />
                </View>
              </View>
            </View>

            <View style={styles.canvasContainer}>
              <Canvas
                ref={canvasRef}
                style={styles.canvas}
                onTouchStart={(e) =>
                  handleStartDrawing(e.nativeEvent.x, e.nativeEvent.y)
                }
                onTouchMove={(e) =>
                  handleDrawing(e.nativeEvent.x, e.nativeEvent.y)
                }
                onTouchEnd={(e) =>
                  handleEndDrawing(e.nativeEvent.x, e.nativeEvent.y)
                }
              >
                <SkiaImage
                  image={image}
                  fit="contain"
                  x={0}
                  y={0}
                  width={SCREEN_WIDTH * 0.9}
                  height={SCREEN_HEIGHT * 0.6}
                />
                <Group>
                  {elements.map((element) => {
                    switch (element.type) {
                      case "path":
                        return (
                          <Path
                            key={element.id}
                            path={element.path!}
                            color={element.color}
                            style="stroke"
                            strokeWidth={element.size}
                          />
                        );
                      case "text":
                        return (
                          <SkiaText
                            key={element.id}
                            x={element.x!}
                            y={element.y!}
                            text={element.text!}
                            color={element.color}
                            size={element.size}
                          />
                        );
                      case "rectangle":
                        return (
                          <Rect
                            key={element.id}
                            x={element.x!}
                            y={element.y!}
                            width={element.width!}
                            height={element.height!}
                            color={element.color}
                            style="stroke"
                            strokeWidth={element.size}
                          />
                        );
                      case "circle":
                        return (
                          <Circle
                            key={element.id}
                            cx={element.x! + element.width! / 2}
                            cy={element.y! + element.height! / 2}
                            r={Math.max(element.width!, element.height!) / 2}
                            color={element.color}
                            style="stroke"
                            strokeWidth={element.size}
                          />
                        );
                    }
                  })}
                  {currentPath && (
                    <Path
                      path={currentPath}
                      color={color}
                      style="stroke"
                      strokeWidth={brushSize}
                    />
                  )}
                </Group>
              </Canvas>
            </View>

            <View style={styles.actionBar}>
              <View style={styles.historyButtons}>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleUndo}
                  disabled={!canUndo}
                >
                  <Undo2 size={20} color="#000" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleRedo}
                  disabled={!canRedo}
                >
                  <Redo2 size={20} color="#000" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setElements([]);
                    saveToHistory();
                  }}
                >
                  <Trash2 size={20} color="#000" />
                </Button>
              </View>

              <View style={styles.saveButtons}>
                <Button variant="outline" onPress={onClose}>
                  <Text>Cancel</Text>
                </Button>
                <Button onPress={handleSave}>
                  <Text>Save Changes</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.9,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  editorContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  toolbar: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  toolGroup: {
    flexDirection: "row",
    gap: 8,
  },
  toolControls: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 16,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  colorPicker: {
    position: "absolute",
    top: 48,
    left: 8,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: "#000",
  },
  sizeControl: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  canvas: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.6,
  },
  actionBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 16,
  },
  historyButtons: {
    flexDirection: "row",
    gap: 8,
  },
  saveButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});
