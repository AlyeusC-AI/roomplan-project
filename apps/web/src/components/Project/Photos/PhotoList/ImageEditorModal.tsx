import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
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
  ArrowRight,
  ChevronDown,
  Palette,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

type Tool =
  | "select"
  | "draw"
  | "text"
  | "rectangle"
  | "circle"
  | "arrow"
  | "crop";

export default function ImageEditorModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
}: ImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [color, setColor] = useState("#0000FF");
  const [brushSize, setBrushSize] = useState(5);
  const [fontSize, setFontSize] = useState(20);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [baseImage, setBaseImage] = useState<fabric.Image | null>(null);
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<fabric.Rect | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  const colors = [
    "#000000", // Black
    "#FFFFFF", // White
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#FFA500", // Orange
    "#800080", // Purple
    "#00FFFF", // Cyan
  ];

  // Function to create arrow path
  const createArrowPath = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    strokeWidth: number
  ) => {
    console.log(
      "Creating arrow path from",
      startX,
      startY,
      "to",
      endX,
      endY,
      "with stroke width",
      strokeWidth
    );

    // Calculate arrow properties
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowLength = strokeWidth * 4;
    const arrowAngle = Math.PI / 6; // 30 degrees

    // Calculate arrowhead points
    const arrowhead1X = endX - arrowLength * Math.cos(angle - arrowAngle);
    const arrowhead1Y = endY - arrowLength * Math.sin(angle - arrowAngle);
    const arrowhead2X = endX - arrowLength * Math.cos(angle + arrowAngle);
    const arrowhead2Y = endY - arrowLength * Math.sin(angle + arrowAngle);

    // Create the complete arrow path including main line and arrowhead
    const pathString = `M ${startX} ${startY} L ${endX} ${endY} M ${endX} ${endY} L ${arrowhead1X} ${arrowhead1Y} M ${endX} ${endY} L ${arrowhead2X} ${arrowhead2Y}`;

    console.log("Path string:", pathString);

    const arrowPath = new fabric.Path(pathString, {
      stroke: color,
      strokeWidth: strokeWidth,
      fill: "transparent",
      selectable: true,
      hasControls: true,
    });

    console.log("Arrow path created:", arrowPath);
    return arrowPath;
  };

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    // Dispose previous Fabric instance if it exists
    if (canvasRef.current && (canvasRef.current as any).fabric) {
      (canvasRef.current as any).fabric.dispose();
      delete (canvasRef.current as any).fabric;
    }
    // Remove Fabric's marker attribute if present
    if (canvasRef.current) canvasRef.current.removeAttribute("data-fabric");

    const initCanvas = async () => {
      const fabricCanvas = new fabric.Canvas(canvasRef.current!, {
        width: 800,
        height: 600,
        backgroundColor: "#000000",
      });
      // Attach to DOM node for future disposal
      (canvasRef.current as any).fabric = fabricCanvas;

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

      setBaseImage(img);
      fabricCanvas.clear();
      fabricCanvas.add(img);
      fabricCanvas.renderAll();

      fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
      fabricCanvas.freeDrawingBrush.color = color;
      fabricCanvas.freeDrawingBrush.width = brushSize;

      fabricCanvas.on("mouse:dblclick", (options) => {
        const target = options.target;
        if (target && target.type === "i-text") {
          (target as any).enterEditing();
        }
      });

      setHistory([JSON.stringify({ objects: [] })]);
      setHistoryIndex(0);
      setCanUndo(false);
      setCanRedo(false);

      setCanvas(fabricCanvas);
    };

    initCanvas();

    return () => {
      if (canvasRef.current && (canvasRef.current as any).fabric) {
        (canvasRef.current as any).fabric.dispose();
        delete (canvasRef.current as any).fabric;
        canvasRef.current.removeAttribute("data-fabric");
      }
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

    setIsDrawing(false);
    setStartPoint(null);
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

  // Handle mouse events for interactive arrow creation
  useEffect(() => {
    if (!canvas) return;

    let currentPreviewArrow: fabric.Object | null = null;

    const handleMouseDown = (options: any) => {
      console.log(
        "Mouse down - selectedTool:",
        selectedTool,
        "isDrawing:",
        isDrawing
      );
      if (selectedTool === "arrow" && !isDrawing) {
        const pointer = canvas.getPointer(options.e);
        console.log("Starting arrow creation at:", pointer);
        setIsDrawing(true);
        setStartPoint({ x: pointer.x, y: pointer.y });
      }
    };

    const handleMouseMove = (options: any) => {
      if (selectedTool === "arrow" && isDrawing && startPoint) {
        const pointer = canvas.getPointer(options.e);
        console.log("Mouse move - updating arrow to:", pointer);

        // Remove previous preview arrow
        if (currentPreviewArrow) {
          canvas.remove(currentPreviewArrow);
        }

        // Create new preview arrow
        const arrowPath = createArrowPath(
          startPoint.x,
          startPoint.y,
          pointer.x,
          pointer.y,
          brushSize
        );
        canvas.add(arrowPath);
        currentPreviewArrow = arrowPath;
        canvas.renderAll();
      }
    };

    const handleMouseUp = (options: any) => {
      console.log(
        "Mouse up - selectedTool:",
        selectedTool,
        "isDrawing:",
        isDrawing
      );
      if (selectedTool === "arrow" && isDrawing && startPoint) {
        const pointer = canvas.getPointer(options.e);
        console.log("Finishing arrow creation at:", pointer);

        // Remove preview arrow
        if (currentPreviewArrow) {
          canvas.remove(currentPreviewArrow);
          currentPreviewArrow = null;
        }

        // Create final arrow
        const arrowPath = createArrowPath(
          startPoint.x,
          startPoint.y,
          pointer.x,
          pointer.y,
          brushSize
        );
        canvas.add(arrowPath);
        canvas.setActiveObject(arrowPath);
        canvas.renderAll();

        // Reset drawing state
        setIsDrawing(false);
        setStartPoint(null);
      }
    };

    // Add event listeners
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    // Cleanup function
    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      // Clean up any remaining preview arrow
      if (currentPreviewArrow) {
        canvas.remove(currentPreviewArrow);
        canvas.renderAll();
      }
    };
  }, [canvas, selectedTool, isDrawing, startPoint, brushSize, color]);

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
      // Create objects directly based on type
      let obj: fabric.Object | null = null;
      if (objData.type === "path") obj = new fabric.Path(objData.path, objData);
      else if (objData.type === "i-text")
        obj = new fabric.IText(objData.text, objData);
      else if (objData.type === "rect") obj = new fabric.Rect(objData);
      else if (objData.type === "circle") obj = new fabric.Circle(objData);
      if (obj) canvas.add(obj);
    });

    canvas.renderAll();

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
      // Create objects directly based on type
      let obj: fabric.Object | null = null;
      if (objData.type === "path") obj = new fabric.Path(objData.path, objData);
      else if (objData.type === "i-text")
        obj = new fabric.IText(objData.text, objData);
      else if (objData.type === "rect") obj = new fabric.Rect(objData);
      else if (objData.type === "circle") obj = new fabric.Circle(objData);
      if (obj) canvas.add(obj);
    });

    canvas.renderAll();

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
    let shape: fabric.Object;
    if (type === "rectangle") {
      shape = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: "transparent",
        stroke: color,
        strokeWidth: brushSize,
      });
    } else if (type === "circle") {
      shape = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: "transparent",
        stroke: color,
        strokeWidth: brushSize,
      });
    } else {
      // Default to rectangle if type is not recognized
      shape = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: "transparent",
        stroke: color,
        strokeWidth: brushSize,
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

    // Get the original image dimensions to calculate the appropriate multiplier
    const originalWidth = baseImage?.width || 800;
    const originalHeight = baseImage?.height || 600;

    // Calculate a multiplier to get close to original resolution
    // The canvas is 800x600, so we need to scale up to match original dimensions
    const multiplier = Math.max(originalWidth / 800, originalHeight / 600, 1);

    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: multiplier,
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
    const canvasData = canvas.toDataURL();

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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm'>
      <div className='flex h-screen w-screen flex-col bg-gray-950 text-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-800 bg-gray-900/80 p-3 backdrop-blur-sm'>
          <div className='flex items-center gap-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-md bg-blue-600'>
              <Scissors className='h-3.5 w-3.5 text-white' />
            </div>
            <h2 className='text-lg font-semibold text-white'>Image Editor</h2>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='h-8 px-3 text-gray-300 hover:bg-gray-800 hover:text-white'
            >
              Cancel
            </Button>
            <Button
              size='sm'
              onClick={handleSave}
              className='h-8 bg-blue-600 px-3 text-white hover:bg-blue-700'
            >
              <Save className='mr-1.5 h-3.5 w-3.5' />
              Save
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex flex-1 overflow-hidden'>
          <TooltipProvider>
            <div className='w-16 border-r border-gray-800 bg-gray-900/60 p-2 backdrop-blur-sm'>
              <div className='flex flex-col items-center gap-3'>
                {/* Tools Section */}
                <div className='flex flex-col items-center justify-center gap-1.5'>
                  <div className='mb-1 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Tools
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          selectedTool === "select" ? "default" : "ghost"
                        }
                        size='icon'
                        onClick={() => setSelectedTool("select")}
                        title='Select'
                        className={cn(
                          "h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105",
                          selectedTool === "select"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-800/70 text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                      >
                        <Move className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      className='border-gray-600 bg-gray-800 text-white'
                    >
                      <p>Select and move objects</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedTool === "draw" ? "default" : "ghost"}
                        size='icon'
                        onClick={() => setSelectedTool("draw")}
                        title='Draw'
                        className={cn(
                          "h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105",
                          selectedTool === "draw"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-800/70 text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                      >
                        <Pencil className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      className='border-gray-600 bg-gray-800 text-white'
                    >
                      <p>Freehand drawing</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedTool === "text" ? "default" : "ghost"}
                        size='icon'
                        onClick={() => {
                          setSelectedTool("text");
                          handleAddText();
                        }}
                        title='Add Text'
                        className={cn(
                          "h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105",
                          selectedTool === "text"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-800/70 text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                      >
                        <Type className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      className='border-gray-600 bg-gray-800 text-white'
                    >
                      <p>Add text (double-click to edit)</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          selectedTool === "rectangle" ? "default" : "ghost"
                        }
                        size='icon'
                        onClick={() => {
                          setSelectedTool("rectangle");
                          handleAddShape("rectangle");
                        }}
                        title='Add Rectangle'
                        className={cn(
                          "h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105",
                          selectedTool === "rectangle"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-800/70 text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                      >
                        <Square className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      className='border-gray-600 bg-gray-800 text-white'
                    >
                      <p>Add rectangle shape</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          selectedTool === "circle" ? "default" : "ghost"
                        }
                        size='icon'
                        onClick={() => {
                          setSelectedTool("circle");
                          handleAddShape("circle");
                        }}
                        title='Add Circle'
                        className={cn(
                          "h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105",
                          selectedTool === "circle"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-800/70 text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                      >
                        <CircleIcon className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      className='border-gray-600 bg-gray-800 text-white'
                    >
                      <p>Add circle shape</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedTool === "arrow" ? "default" : "ghost"}
                        size='icon'
                        onClick={() => {
                          console.log(
                            "Arrow button clicked, setting tool to arrow"
                          );
                          setSelectedTool("arrow");
                        }}
                        title='Add Arrow (Click and drag)'
                        className={cn(
                          "h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105",
                          selectedTool === "arrow"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-800/70 text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                      >
                        <ArrowRight className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      className='border-gray-600 bg-gray-800 text-white'
                    >
                      <p>Add arrow (click and drag)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className='h-px w-full bg-gray-700' />

                {/* Actions Section */}
                <div className='flex flex-col items-center justify-center gap-1.5'>
                  <div className='mb-1 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Actions
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={handleUndo}
                        disabled={!canUndo}
                        title='Undo'
                        className={cn(
                          "h-8 w-8 rounded-lg transition-all duration-200 hover:scale-105",
                          "bg-gray-800/70 text-gray-300 hover:bg-gray-700 hover:text-white",
                          !canUndo &&
                            "cursor-not-allowed opacity-50 hover:scale-100"
                        )}
                      >
                        <Undo2 className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      className='border-gray-600 bg-gray-800 text-white'
                    >
                      <p>Undo last action</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={handleDelete}
                        title='Delete Selected'
                        className='h-8 w-8 rounded-lg bg-gray-800/70 text-gray-300 transition-all duration-200 hover:scale-105 hover:bg-red-600 hover:text-white'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side='right'
                      className='border-gray-600 bg-gray-800 text-white'
                    >
                      <p>Delete selected object</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className='h-px w-full bg-gray-700' />

                {/* Settings Section */}
                <div className='flex flex-col items-center gap-2'>
                  <div className='mb-1 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Settings
                  </div>

                  {/* Color Palette */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-10 w-10 rounded-lg border border-gray-600 bg-gray-800/70 p-0 transition-all duration-200 hover:scale-105 hover:bg-gray-700'
                      >
                        <div className='flex h-full w-full items-center justify-center'>
                          <div
                            className='h-5 w-5 rounded border border-gray-500 shadow-sm'
                            style={{ backgroundColor: color }}
                          />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      side='right'
                      className='w-48 border-gray-600 bg-gray-800 p-3'
                    >
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2 text-sm font-medium text-white'>
                          <Palette className='h-3.5 w-3.5' />
                          Color
                        </div>
                        <div className='grid grid-cols-5 gap-1.5'>
                          {colors.map((colorValue) => (
                            <button
                              key={colorValue}
                              onClick={() => setColor(colorValue)}
                              className={cn(
                                "h-6 w-6 rounded border-2 transition-all duration-200 hover:scale-110",
                                color === colorValue
                                  ? "border-white ring-2 ring-blue-500"
                                  : "border-gray-600 hover:border-gray-400"
                              )}
                              style={{ backgroundColor: colorValue }}
                              title={colorValue}
                            />
                          ))}
                        </div>
                        <div className='border-t border-gray-600 pt-2'>
                          <div className='text-xs text-gray-400'>{color}</div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Size Controls */}
                  {selectedTool === "draw" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='flex flex-col items-center gap-1.5 rounded-lg bg-gray-800/70 p-2 backdrop-blur-sm'>
                          <Input
                            type='range'
                            min='1'
                            max='20'
                            value={brushSize}
                            onChange={(e) =>
                              setBrushSize(Number(e.target.value))
                            }
                            className='h-1.5 w-12 accent-blue-500'
                            title='Brush Size'
                          />
                          <span className='text-xs font-medium text-gray-300'>
                            {brushSize}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side='right'
                        className='border-gray-600 bg-gray-800 text-white'
                      >
                        <p>Brush size</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {(selectedTool === "arrow" ||
                    selectedTool === "rectangle" ||
                    selectedTool === "circle") && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='flex flex-col items-center gap-1.5 rounded-lg bg-gray-800/70 p-2 backdrop-blur-sm'>
                          <Input
                            type='range'
                            min='1'
                            max='10'
                            value={brushSize}
                            onChange={(e) =>
                              setBrushSize(Number(e.target.value))
                            }
                            className='h-1.5 w-12 accent-blue-500'
                            title='Stroke Width'
                          />
                          <span className='text-xs font-medium text-gray-300'>
                            {brushSize}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side='right'
                        className='border-gray-600 bg-gray-800 text-white'
                      >
                        <p>Stroke width</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {selectedTool === "text" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='rounded-lg bg-gray-800/70 p-2 backdrop-blur-sm'>
                          <Input
                            type='number'
                            min='8'
                            max='72'
                            value={fontSize}
                            onChange={(e) =>
                              setFontSize(Number(e.target.value))
                            }
                            className='h-6 w-12 border-gray-600 bg-gray-700 text-center text-xs text-white'
                            title='Font Size'
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side='right'
                        className='border-gray-600 bg-gray-800 text-white'
                      >
                        <p>Font size</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </TooltipProvider>

          {/* Canvas Area */}
          <div className='w-full flex-1 overflow-auto bg-gray-900 p-4'>
            <div className='mx-auto max-w-[1200px]'>
              <div className='flex items-center justify-center rounded-lg bg-gray-900 p-3 shadow-inner'>
                <div className='bg-black'>
                  <canvas
                    ref={canvasRef}
                    className='rounded border border-gray-600 shadow-lg'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
