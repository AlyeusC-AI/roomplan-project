import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  useFont,
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
  ArrowRight,
} from "@/lib/icons/ImageEditorIcons";
import { Slider } from "@/components/ui/slider";
import { runOnJS } from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

type Tool = "select" | "draw" | "text" | "rectangle" | "circle" | "arrow";

interface DrawingElement {
  id: string;
  type: "path" | "text" | "rectangle" | "circle" | "arrow";
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
  const insets = useSafeAreaInsets();
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
  const [previewShape, setPreviewShape] = useState<DrawingElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null
  );

  const canvasRef = useCanvasRef();
  const image = useImage(imageUrl);

  const colors = [
    "#000000", // Black
    "#FFFFFF", // White
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
  ];

  const font = useFont(require("../../assets/Roboto-Medium.ttf"), fontSize);

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

  // Save to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanUndo(true);
    setCanRedo(false);
  }, [history, historyIndex, elements]);

  // Helper: check if point is inside an element
  function isPointInElement(x: number, y: number, element: DrawingElement) {
    switch (element.type) {
      case "text":
        // Assume text is 10px high and width is 8px per char (rough estimate)
        return (
          x >= element.x! &&
          x <= element.x! + (element.text?.length || 1) * element.size * 0.6 &&
          y >= element.y! - element.size &&
          y <= element.y!
        );
      case "rectangle":
        return (
          x >= element.x! &&
          x <= element.x! + element.width! &&
          y >= element.y! &&
          y <= element.y! + element.height!
        );
      case "circle":
        const cx = element.x! + element.width! / 2;
        const cy = element.y! + element.height! / 2;
        const r = Math.max(element.width!, element.height!) / 2;
        return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2;
      case "arrow":
        return (
          x >= element.x! &&
          x <= element.x! + element.width! &&
          y >= element.y! &&
          y <= element.y! + element.height!
        );
      case "path":
        // For simplicity, use bounding box
        if (!element.path) return false;
        const bounds = element.path.getBounds();
        return (
          x >= bounds.x &&
          x <= bounds.x + bounds.width &&
          y >= bounds.y &&
          y <= bounds.y + bounds.height
        );
      default:
        return false;
    }
  }

  // Update handleStartDrawing for select tool
  const handleStartDrawing = useCallback(
    (x: number, y: number) => {
      if (selectedTool === "select") {
        // Find topmost element under the touch
        for (let i = elements.length - 1; i >= 0; i--) {
          const el = elements[i];
          if (isPointInElement(x, y, el)) {
            setSelectedElement(el.id);
            setDragOffset({ x: x - (el.x || 0), y: y - (el.y || 0) });
            return;
          }
        }
        setSelectedElement(null);
        setDragOffset(null);
      } else if (selectedTool === "draw") {
        setIsDrawing(true);
        const path = Skia.Path.Make();
        path.moveTo(x, y);
        setCurrentPath(path);
      } else if (
        selectedTool === "rectangle" ||
        selectedTool === "circle" ||
        selectedTool === "arrow"
      ) {
        setIsDrawing(true);
        setStartPoint({ x, y });
        setPreviewShape({
          id: "preview",
          type: selectedTool,
          x,
          y,
          width: 0,
          height: 0,
          color,
          size: brushSize,
        });
      } else if (selectedTool === "text") {
        setTextInput("");
        setTextPosition({ x, y });
      }
    },
    [selectedTool, color, brushSize, elements]
  );

  // Update handleDrawing for select tool
  const handleDrawing = useCallback(
    (x: number, y: number) => {
      if (selectedTool === "select" && selectedElement && dragOffset) {
        setElements((prev) =>
          prev.map((el) =>
            el.id === selectedElement
              ? { ...el, x: x - dragOffset.x, y: y - dragOffset.y }
              : el
          )
        );
      } else if (isDrawing && selectedTool === "draw" && currentPath) {
        currentPath.lineTo(x, y);
        setCurrentPath(currentPath.copy());
      } else if (
        isDrawing &&
        (selectedTool === "rectangle" ||
          selectedTool === "circle" ||
          selectedTool === "arrow") &&
        startPoint
      ) {
        setPreviewShape({
          id: "preview",
          type: selectedTool,
          x: startPoint.x,
          y: startPoint.y,
          width: x - startPoint.x,
          height: y - startPoint.y,
          color,
          size: brushSize,
        });
      }
    },
    [
      selectedTool,
      selectedElement,
      dragOffset,
      isDrawing,
      currentPath,
      startPoint,
      color,
      brushSize,
    ]
  );

  // Update handleEndDrawing for select tool
  const handleEndDrawing = useCallback(
    (x: number, y: number) => {
      if (selectedTool === "select" && selectedElement) {
        setSelectedElement(null);
        setDragOffset(null);
        saveToHistory();
      } else if (selectedTool === "draw" && currentPath) {
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
      } else if (
        (selectedTool === "rectangle" ||
          selectedTool === "circle" ||
          selectedTool === "arrow") &&
        startPoint
      ) {
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
        setPreviewShape(null);
        setIsDrawing(false);
        saveToHistory();
      } else if (selectedTool === "text" && textPosition && textInput.trim()) {
        try {
          const newElement: DrawingElement = {
            id: Date.now().toString(),
            type: "text",
            x: textPosition.x,
            y: textPosition.y,
            text: textInput.trim(),
            color,
            size: fontSize,
          };
          setElements((prev) => [...prev, newElement]);
          setTextPosition(null);
          setTextInput("");
          saveToHistory();
        } catch (error) {
          console.error("Error adding text:", error);
          toast.error("Failed to add text");
        }
      }
    },
    [
      selectedTool,
      selectedElement,
      currentPath,
      startPoint,
      color,
      brushSize,
      textPosition,
      textInput,
      fontSize,
      saveToHistory,
    ]
  );

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

  const handleSizeChange = useCallback(
    (newValue: number) => {
      if (selectedTool === "text") {
        setFontSize(newValue);
      } else {
        setBrushSize(newValue);
      }
    },
    [selectedTool]
  );

  const onSliderChange = useCallback(
    (value: number[]) => {
      "worklet";
      runOnJS(handleSizeChange)(value[0]);
    },
    [handleSizeChange]
  );

  // Add text input handler
  const handleTextInput = useCallback((text: string) => {
    setTextInput(text);
  }, []);

  const handleTextInputComplete = useCallback(() => {
    if (!textPosition || !textInput.trim()) {
      setTextPosition(null);
      setTextInput("");
      return;
    }

    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: "text",
      x: textPosition.x,
      y: textPosition.y,
      text: textInput.trim(),
      color,
      size: fontSize,
    };

    setElements((prev) => [...prev, newElement]);
    setTextPosition(null);
    setTextInput("");
    saveToHistory();
  }, [textPosition, textInput, color, fontSize, saveToHistory]);

  // Clean up text input state when tool changes
  useEffect(() => {
    if (selectedTool !== "text") {
      setTextPosition(null);
      setTextInput("");
    }
  }, [selectedTool]);

  if (!isOpen || !image) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Image Editor</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.editorContainer}>
            <View style={styles.toolbar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.toolGroup}>
                  <Button
                    variant={selectedTool === "select" ? "secondary" : "ghost"}
                    size="sm"
                    onPress={() => setSelectedTool("select")}
                  >
                    <Move
                      size={20}
                      color={selectedTool === "select" ? "#000000" : "#ffffff"}
                    />
                  </Button>
                  <Button
                    variant={selectedTool === "draw" ? "secondary" : "ghost"}
                    size="sm"
                    onPress={() => setSelectedTool("draw")}
                  >
                    <Pencil
                      size={20}
                      color={selectedTool === "draw" ? "#000000" : "#ffffff"}
                    />
                  </Button>
                  <Button
                    variant={selectedTool === "text" ? "secondary" : "ghost"}
                    size="sm"
                    onPress={() => setSelectedTool("text")}
                  >
                    <Type
                      size={20}
                      color={selectedTool === "text" ? "#000000" : "#ffffff"}
                    />
                  </Button>
                  <Button
                    variant={
                      selectedTool === "rectangle" ? "secondary" : "ghost"
                    }
                    size="sm"
                    onPress={() => setSelectedTool("rectangle")}
                  >
                    <Square
                      size={20}
                      color={
                        selectedTool === "rectangle" ? "#000000" : "#ffffff"
                      }
                    />
                  </Button>
                  <Button
                    variant={selectedTool === "circle" ? "secondary" : "ghost"}
                    size="sm"
                    onPress={() => setSelectedTool("circle")}
                  >
                    <CircleIcon
                      size={20}
                      color={selectedTool === "circle" ? "#000000" : "#ffffff"}
                    />
                  </Button>
                  <Button
                    variant={selectedTool === "arrow" ? "secondary" : "ghost"}
                    size="sm"
                    onPress={() => setSelectedTool("arrow")}
                  >
                    <ArrowRight
                      size={20}
                      color={selectedTool === "arrow" ? "#000000" : "#ffffff"}
                    />
                  </Button>
                </View>
              </ScrollView>

              <View style={styles.toolControls}>
                <TouchableOpacity
                  style={[styles.colorButton, { backgroundColor: color }]}
                  onPress={() => setShowColorPicker(!showColorPicker)}
                />
                <View style={styles.sizeControl}>
                  <Text style={{ color: "#ffffff" }}>Size:</Text>
                  <Slider
                    value={[selectedTool === "text" ? fontSize : brushSize]}
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
                {showColorPicker && (
                  <View style={styles.colorPicker}>
                    {colors.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.colorOption,
                          { backgroundColor: c },
                          color === c && styles.selectedColor,
                        ]}
                        onPress={() => {
                          setColor(c);
                          setShowColorPicker(false);
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.canvasContainer}>
              <Canvas
                ref={canvasRef}
                style={styles.canvas}
                onTouchStart={(e) => {
                  const touch = e.nativeEvent.touches[0];
                  handleStartDrawing(touch.locationX, touch.locationY);
                }}
                onTouchMove={(e) => {
                  const touch = e.nativeEvent.touches[0];
                  handleDrawing(touch.locationX, touch.locationY);
                }}
                onTouchEnd={(e) => {
                  const touch = e.nativeEvent.changedTouches[0];
                  handleEndDrawing(touch.locationX, touch.locationY);
                }}
              >
                <SkiaImage
                  image={image}
                  fit="cover"
                  x={0}
                  y={0}
                  width={SCREEN_WIDTH}
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
                            font={font}
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
                      case "arrow":
                        const arrowPath = Skia.Path.Make();
                        const startX = element.x!;
                        const startY = element.y!;
                        const endX = element.x! + element.width!;
                        const endY = element.y! + element.height!;

                        // Draw the main line
                        arrowPath.moveTo(startX, startY);
                        arrowPath.lineTo(endX, endY);

                        // Calculate arrow head
                        const angle = Math.atan2(endY - startY, endX - startX);
                        const arrowLength = element.size * 4;
                        const arrowAngle = Math.PI / 6; // 30 degrees

                        // Draw arrow head
                        arrowPath.moveTo(endX, endY);
                        arrowPath.lineTo(
                          endX - arrowLength * Math.cos(angle - arrowAngle),
                          endY - arrowLength * Math.sin(angle - arrowAngle)
                        );
                        arrowPath.moveTo(endX, endY);
                        arrowPath.lineTo(
                          endX - arrowLength * Math.cos(angle + arrowAngle),
                          endY - arrowLength * Math.sin(angle + arrowAngle)
                        );

                        return (
                          <Path
                            key={element.id}
                            path={arrowPath}
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
                  {previewShape &&
                    (previewShape.type === "rectangle" ? (
                      <Rect
                        x={previewShape.x!}
                        y={previewShape.y!}
                        width={previewShape.width!}
                        height={previewShape.height!}
                        color={previewShape.color}
                        style="stroke"
                        strokeWidth={previewShape.size}
                      />
                    ) : previewShape.type === "circle" ? (
                      <Circle
                        cx={previewShape.x! + previewShape.width! / 2}
                        cy={previewShape.y! + previewShape.height! / 2}
                        r={
                          Math.max(previewShape.width!, previewShape.height!) /
                          2
                        }
                        color={previewShape.color}
                        style="stroke"
                        strokeWidth={previewShape.size}
                      />
                    ) : previewShape.type === "arrow" ? (
                      (() => {
                        const arrowPath = Skia.Path.Make();
                        const startX = previewShape.x!;
                        const startY = previewShape.y!;
                        const endX = previewShape.x! + previewShape.width!;
                        const endY = previewShape.y! + previewShape.height!;

                        // Draw the main line
                        arrowPath.moveTo(startX, startY);
                        arrowPath.lineTo(endX, endY);

                        // Calculate arrow head
                        const angle = Math.atan2(endY - startY, endX - startX);
                        const arrowLength = previewShape.size * 4;
                        const arrowAngle = Math.PI / 6; // 30 degrees

                        // Draw arrow head
                        arrowPath.moveTo(endX, endY);
                        arrowPath.lineTo(
                          endX - arrowLength * Math.cos(angle - arrowAngle),
                          endY - arrowLength * Math.sin(angle - arrowAngle)
                        );
                        arrowPath.moveTo(endX, endY);
                        arrowPath.lineTo(
                          endX - arrowLength * Math.cos(angle + arrowAngle),
                          endY - arrowLength * Math.sin(angle + arrowAngle)
                        );

                        return (
                          <Path
                            path={arrowPath}
                            color={previewShape.color}
                            style="stroke"
                            strokeWidth={previewShape.size}
                          />
                        );
                      })()
                    ) : null)}
                </Group>
              </Canvas>
            </View>

            {selectedTool === "text" && textPosition && (
              <View
                style={[
                  styles.textInputContainer,
                  {
                    position: "absolute",
                    top: textPosition.y,
                    left: textPosition.x,
                    zIndex: 1000,
                  },
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  value={textInput}
                  onChangeText={handleTextInput}
                  placeholder="Enter text..."
                  placeholderTextColor="#666"
                  autoFocus
                  onSubmitEditing={handleTextInputComplete}
                  onBlur={handleTextInputComplete}
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>
            )}

            <View style={styles.actionBar}>
              <View style={styles.historyButtons}>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleUndo}
                  disabled={!canUndo}
                >
                  <Undo2 size={20} color="#ffffff" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleRedo}
                  disabled={!canRedo}
                >
                  <Redo2 size={20} color="#ffffff" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    setElements([]);
                    saveToHistory();
                  }}
                >
                  <Trash2 size={20} color="#ffffff" />
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#1a1a1a",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    // paddingTop:
    //   Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
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
    borderBottomColor: "#333333",
    backgroundColor: "#242424",
    zIndex: 1,
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
    position: "relative",
    zIndex: 9999,
    flexWrap: "wrap",
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#404040",
  },
  sizeControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 200,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    marginTop: 0,
  },
  canvas: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#333333",
    gap: 16,
    backgroundColor: "#242424",
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
  colorPicker: {
    backgroundColor: "#242424",
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
  },
  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#404040",
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  textInputContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 4,
    padding: 4,
    minWidth: 100,
  },
  textInput: {
    color: "#ffffff",
    fontSize: 16,
    padding: 4,
  },
});
