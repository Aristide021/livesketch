import React, { useRef, useEffect, useState, useCallback } from 'react';

interface DrawingCanvasProps {
  isMyTurn: boolean;
  onDrawingChange?: (strokes: any[]) => void;
  externalStrokes?: any[];
  disabled?: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  isMyTurn,
  onDrawingChange,
  externalStrokes,
  disabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<any[]>([]);
  const [currentStroke, setCurrentStroke] = useState<any[]>([]);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isMyTurn || disabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
  }, [isMyTurn, disabled]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isMyTurn || disabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    setCurrentStroke(prev => [...prev, { x, y }]);
  }, [isDrawing, isMyTurn, disabled]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (currentStroke.length > 0) {
      const newStrokes = [...strokes, currentStroke];
      setStrokes(newStrokes);
      setCurrentStroke([]);
      onDrawingChange?.(newStrokes);
    }
  }, [isDrawing, currentStroke, strokes, onDrawingChange]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing style
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw all completed strokes
    const allStrokes = externalStrokes || strokes;
    allStrokes.forEach((stroke, strokeIndex) => {
      if (stroke.length < 2) return;
      
      // Use different colors for different strokes to simulate multiplayer
      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];
      ctx.strokeStyle = colors[strokeIndex % colors.length];
      
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });

    // Draw current stroke
    if (currentStroke.length > 1) {
      ctx.strokeStyle = '#3B82F6';
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
    }
  }, [strokes, currentStroke, externalStrokes]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      draw(e as any);
    };

    const handleMouseUp = () => {
      stopDrawing();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      draw(e as any);
    };

    if (isDrawing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDrawing, draw, stopDrawing]);

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    onDrawingChange?.([]);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className={`w-full h-auto bg-white rounded-lg shadow-lg border-2 ${
          isMyTurn && !disabled ? 'border-blue-500 cursor-crosshair' : 'border-gray-300 cursor-not-allowed'
        }`}
        onMouseDown={startDrawing}
        onTouchStart={startDrawing}
        style={{ touchAction: 'none' }}
      />
      
      {isMyTurn && !disabled && (
        <button
          onClick={clearCanvas}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
        >
          Clear
        </button>
      )}
      
      {!isMyTurn && (
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-gray-700 font-medium">Waiting for your turn...</p>
          </div>
        </div>
      )}
    </div>
  );
};