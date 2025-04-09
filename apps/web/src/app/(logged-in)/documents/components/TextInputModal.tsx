import { Button } from '@components/ui/button';
import { X, Type, Palette } from 'lucide-react';
import { SketchPicker, ColorResult } from 'react-color';
import { useState, useRef, useEffect } from 'react';

interface TextInputModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  textSize: number;
  setTextSize: (size: number) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  editingAnnotation: number | null;
  handleAddText: () => void;
  handleUpdateText: () => void;
}

export default function TextInputModal({
  show,
  setShow,
  textInput,
  setTextInput,
  textSize,
  setTextSize,
  textColor,
  setTextColor,
  showColorPicker,
  setShowColorPicker,
  editingAnnotation,
  handleAddText,
  handleUpdateText
}: TextInputModalProps) {
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker, setShowColorPicker]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              {editingAnnotation !== null ? 'Edit Text' : 'Add Text'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShow(false);
              setTextInput('');
              setTextSize(14);
              setTextColor('#000000');
              setShowColorPicker(false);
            }}
            className="hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Text
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 min-h-[100px]"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Size
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="8"
                  max="72"
                  value={textSize}
                  onChange={(e) => setTextSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-500 w-8">{textSize}px</span>
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-2"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: textColor }}
                />
                <Palette className="w-4 h-4" />
              </Button>
              {showColorPicker && (
                <div className="absolute right-0 mt-2 z-10" ref={colorPickerRef}>
                  <div className="relative">
                    <SketchPicker
                      color={textColor}
                      onChange={(color: ColorResult) => setTextColor(color.hex)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p
              className="text-center"
              style={{
                fontSize: `${textSize}px`,
                color: textColor
              }}
            >
              {textInput || 'Preview text will appear here'}
            </p>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShow(false);
              setTextInput('');
              setTextSize(14);
              setTextColor('#000000');
              setShowColorPicker(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editingAnnotation !== null ? handleUpdateText : handleAddText}
            disabled={!textInput.trim()}
            className="bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
          >
            {editingAnnotation !== null ? 'Update Text' : 'Add Text'}
          </Button>
        </div>
      </div>
    </div>
  );
} 