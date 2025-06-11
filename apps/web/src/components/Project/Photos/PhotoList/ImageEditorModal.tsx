import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Pencil,
  Type,
  Square,
  Circle as CircleIcon,
  Scissors,
  Undo2,
  Redo2,
  Save,
  X,
  Move,
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

type Tool = "select" | "draw" | "text" | "rectangle" | "circle" | "crop";

export default function ImageEditorModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
}: ImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [fontSize, setFontSize] = useState(20);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [baseImage, setBaseImage] = useState<fabric.Image | null>(null);
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<fabric.Rect | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    const initCanvas = async () => {
      const fabricCanvas = new fabric.Canvas(canvasRef.current!, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
      });

      // Load image
      const img = await fabric.FabricImage.fromURL(imageUrl, {
        crossOrigin: "anonymous",
      });

      // Calculate scale to fit image within canvas while maintaining aspect ratio
      const scale = Math.min(800 / (img.width || 1), 600 / (img.height || 1));

      // Set image properties
      img.scale(scale);
      img.set({
        left: (800 - (img.width || 0) * scale) / 2,
        top: (600 - (img.height || 0) * scale) / 2,
        selectable: false,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        evented: false,
      });

      // Store base image for later use
      setBaseImage(img);

      // Clear any existing objects and add the image
      fabricCanvas.clear();
      fabricCanvas.add(img);
      fabricCanvas.renderAll();

      // Initialize drawing brush
      fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
      fabricCanvas.freeDrawingBrush.color = color;
      fabricCanvas.freeDrawingBrush.width = brushSize;

      // Add text editing event handlers
      fabricCanvas.on("mouse:dblclick", (options) => {
        const target = options.target;
        if (target && target.type === "i-text") {
          (target as any).enterEditing();
        }
      });

      // Save initial state (empty state since we only want to track edits)
      setHistory([JSON.stringify({ objects: [] })]);
      setHistoryIndex(0);
      setCanUndo(false);
      setCanRedo(false);

      setCanvas(fabricCanvas);
    };

    initCanvas();

    return () => {
      canvas?.dispose();
    };
  }, [isOpen, imageUrl]);

  // Handle tool changes
  useEffect(() => {
    if (!canvas) return;

    canvas.isDrawingMode = selectedTool === "draw";
    canvas.selection = selectedTool === "select";

    if (selectedTool === "draw" && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = brushSize;
    }

    // Handle crop mode
    if (selectedTool === "crop") {
      setIsCropMode(true);
      // Create crop rectangle if it doesn't exist
      if (!cropRect) {
        const rect = new fabric.Rect({
          left: 100,
          top: 100,
          width: 400,
          height: 300,
          fill: "rgba(0,0,0,0.3)",
          stroke: "#fff",
          strokeWidth: 2,
          selectable: true,
          hasControls: true,
        });
        canvas.add(rect);
        setCropRect(rect);
        canvas.setActiveObject(rect);
      }
    } else {
      setIsCropMode(false);
      if (cropRect) {
        canvas.remove(cropRect);
        setCropRect(null);
      }
    }
  }, [canvas, selectedTool, color, brushSize, cropRect]);

  // Save canvas state after each modification
  useEffect(() => {
    if (!canvas) return;

    const saveState = () => {
      // Get all objects except the base image
      const objects = canvas.getObjects().filter((obj) => obj !== baseImage);
      const newState = { objects: objects.map((obj) => obj.toObject()) };

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.stringify(newState));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCanUndo(newHistory.length > 1);
      setCanRedo(false);
    };

    canvas.on("object:modified", saveState);
    canvas.on("object:added", saveState);
    canvas.on("object:removed", saveState);
    canvas.on("path:created", saveState);

    return () => {
      canvas.off("object:modified", saveState);
      canvas.off("object:added", saveState);
      canvas.off("object:removed", saveState);
      canvas.off("path:created", saveState);
    };
  }, [canvas, history, historyIndex, baseImage]);

  // Handle undo/redo
  const handleUndo = () => {
    if (!canvas || historyIndex <= 0 || !baseImage) return;

    const newIndex = historyIndex - 1;
    const previousState = JSON.parse(history[newIndex]);

    // Remove all objects except the base image
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj !== baseImage) {
        canvas.remove(obj);
      }
    });

    // Add back the objects from the previous state
    previousState.objects.forEach((objData: any) => {
      fabric.util.enlivenObjects(
        [objData],
        (enlivenedObjects: fabric.Object[]) => {
          enlivenedObjects.forEach((obj) => {
            canvas.add(obj);
          });
          canvas.renderAll();
        }
      );
    });

    setHistoryIndex(newIndex);
    setCanUndo(newIndex > 0);
    setCanRedo(true);
  };

  const handleRedo = () => {
    if (!canvas || historyIndex >= history.length - 1 || !baseImage) return;

    const newIndex = historyIndex + 1;
    const nextState = JSON.parse(history[newIndex]);

    // Remove all objects except the base image
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj !== baseImage) {
        canvas.remove(obj);
      }
    });

    // Add back the objects from the next state
    nextState.objects.forEach((objData: any) => {
      fabric.util.enlivenObjects(
        [objData],
        (enlivenedObjects: fabric.Object[]) => {
          enlivenedObjects.forEach((obj) => {
            canvas.add(obj);
          });
          canvas.renderAll();
        }
      );
    });

    setHistoryIndex(newIndex);
    setCanUndo(true);
    setCanRedo(newIndex < history.length - 1);
  };

  // Handle text addition
  const handleAddText = () => {
    if (!canvas) return;
    const text = new fabric.IText("Double click to edit", {
      left: 100,
      top: 100,
      fontFamily: "Arial",
      fontSize: fontSize,
      fill: color,
      hasControls: true,
      selectable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Handle shape addition
  const handleAddShape = (type: "rectangle" | "circle") => {
    if (!canvas) return;
    let shape;
    if (type === "rectangle") {
      shape = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: "transparent",
        stroke: color,
        strokeWidth: 2,
      });
    } else {
      shape = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: "transparent",
        stroke: color,
        strokeWidth: 2,
      });
    }
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  // Handle delete selected object
  const handleDelete = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  // Handle save
  const handleSave = () => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });
    console.log("🚀 ~ handleSave ~ dataUrl:", dataUrl);
    onSave(dataUrl);
    onClose();
  };

  // Handle crop application
  const handleApplyCrop = () => {
    if (!canvas || !cropRect || !baseImage) return;

    // Get crop coordinates relative to the canvas
    const cropLeft = Math.max(0, cropRect.left || 0);
    const cropTop = Math.max(0, cropRect.top || 0);
    const cropWidth = Math.min(canvas.width! - cropLeft, cropRect.width || 0);
    const cropHeight = Math.min(canvas.height! - cropTop, cropRect.height || 0);

    // Create a temporary canvas for the cropped image
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Set dimensions to match crop area
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;

    // Get the current canvas data
    const canvasData = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    // Create an image element to draw the cropped portion
    const img = new Image();
    img.onload = () => {
      // Draw the cropped portion
      tempCtx.drawImage(
        img,
        cropLeft,
        cropTop,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Create a new fabric image from the cropped data
      fabric.Image.fromURL(
        tempCanvas.toDataURL(),
        {
          crossOrigin: "anonymous",
        },
        (fabricImage: fabric.Image) => {
          // Scale to fit canvas while maintaining aspect ratio
          const scale = Math.min(
            800 / fabricImage.width!,
            600 / fabricImage.height!
          );
          fabricImage.scale(scale);
          fabricImage.set({
            left: (800 - fabricImage.width! * scale) / 2,
            top: (600 - fabricImage.height! * scale) / 2,
            selectable: false,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            evented: false,
          });

          // Remove all existing objects
          canvas.getObjects().forEach((obj) => {
            canvas.remove(obj);
          });

          // Add the new cropped image
          canvas.add(fabricImage);
          canvas.setActiveObject(fabricImage);
          canvas.renderAll();

          // Update base image
          setBaseImage(fabricImage);

          // Reset crop mode
          setIsCropMode(false);
          setCropRect(null);
          setSelectedTool("select");
        }
      );
    };
    img.src = canvasData;
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='flex flex-col items-center justify-center overflow-hidden rounded-lg bg-white p-6 shadow-xl'>
        <div className='mb-4 flex w-full items-center justify-between'>
          <h2 className='text-xl font-semibold'>Image Editor</h2>
          <Button variant='ghost' size='icon' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex h-[600px] gap-4'>
          <div className='flex w-48 flex-col gap-4 border-r pr-4'>
            <div className='space-y-2'>
              <Label>Tools</Label>
              <div className='grid grid-cols-2 gap-2'>
                <Button
                  variant={selectedTool === "select" ? "default" : "outline"}
                  size='sm'
                  onClick={() => setSelectedTool("select")}
                  title='Select'
                >
                  <Move className='h-4 w-4' />
                </Button>
                <Button
                  variant={selectedTool === "draw" ? "default" : "outline"}
                  size='sm'
                  onClick={() => setSelectedTool("draw")}
                  title='Draw'
                >
                  <Pencil className='h-4 w-4' />
                </Button>
                <Button
                  variant={selectedTool === "text" ? "default" : "outline"}
                  size='sm'
                  onClick={() => {
                    setSelectedTool("text");
                    handleAddText();
                  }}
                  title='Add Text'
                >
                  <Type className='h-4 w-4' />
                </Button>
                <Button
                  variant={selectedTool === "rectangle" ? "default" : "outline"}
                  size='sm'
                  onClick={() => {
                    setSelectedTool("rectangle");
                    handleAddShape("rectangle");
                  }}
                  title='Add Rectangle'
                >
                  <Square className='h-4 w-4' />
                </Button>
                <Button
                  variant={selectedTool === "circle" ? "default" : "outline"}
                  size='sm'
                  onClick={() => {
                    setSelectedTool("circle");
                    handleAddShape("circle");
                  }}
                  title='Add Circle'
                >
                  <CircleIcon className='h-4 w-4' />
                </Button>
                {/* <Button
                  variant={selectedTool === "crop" ? "default" : "outline"}
                  size='sm'
                  onClick={() => setSelectedTool("crop")}
                  title='Crop'
                >
                  <Scissors className='h-4 w-4' />
                </Button> */}
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Color</Label>
              <div className='flex items-center gap-2'>
                <Input
                  type='color'
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className='h-8 w-8 p-1'
                />
                <Input
                  type='text'
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className='h-8'
                />
              </div>
            </div>

            {selectedTool === "draw" && (
              <div className='space-y-2'>
                <Label>Brush Size</Label>
                <Input
                  type='range'
                  min='1'
                  max='20'
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                />
                <div className='text-center text-sm'>{brushSize}px</div>
              </div>
            )}

            {selectedTool === "text" && (
              <div className='space-y-2'>
                <Label>Font Size</Label>
                <Input
                  type='number'
                  min='8'
                  max='72'
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
              </div>
            )}

            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleUndo}
                disabled={!canUndo}
                title='Undo'
              >
                <Undo2 className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRedo}
                disabled={!canRedo}
                title='Redo'
              >
                <Redo2 className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleDelete}
                title='Delete Selected'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>

            {isCropMode && (
              <Button
                variant='default'
                size='sm'
                onClick={handleApplyCrop}
                className='mt-2'
              >
                <Check className='mr-2 h-4 w-4' />
                Apply Crop
              </Button>
            )}
          </div>

          <div className='flex-1 rounded-lg border bg-gray-50'>
            <canvas ref={canvasRef} />
          </div>
        </div>

        <div className='mt-4 flex justify-end gap-2'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className='mr-2 h-4 w-4' />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
