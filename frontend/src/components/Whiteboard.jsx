import { Eraser, Minus, Pen, Redo, RedoDot, Undo } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:4000';

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const socketRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState('pen');
  const [startPoint, setStartPoint] = useState(null);
  const historyRef = useRef([]);
  const [roomId, setRoomId] = useState('default');

  function getCanvasCoords(nativeEvent) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // how many real pixels wide/tall per CSS‑pixel
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // mouse position relative to top‑left of the canvas element
    const x = (nativeEvent.clientX - rect.left) * scaleX;
    const y = (nativeEvent.clientY - rect.top) * scaleY;

    return { x, y };
  }

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit('join-room', roomId);

    socketRef.current.on('drawing', ({ x0, y0, x1, y1, color, size }) => {
      drawLine(x0, y0, x1, y1, color, size, false);
    });

    socketRef.current.on('clear-canvas', () => clearCanvas(false));

    return () => socketRef.current.disconnect();
  }, [roomId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 60;
    saveHistory();
  }, []);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > 20) historyRef.current.shift();
  };

  const undo = () => {
    const canvas = canvasRef.current;
    socketRef.current.emit('undo', roomId);
    const ctx = canvas.getContext('2d');
    if (historyRef.current.length > 1) {
      historyRef.current.pop();
      ctx.putImageData(historyRef.current[historyRef.current.length - 1], 0, 0);
    }
  };

  const clearCanvas = (emit = true) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveHistory();
    if (emit) socketRef.current.emit('clear-canvas', roomId);
  };

  const handleMouseDown = ({ nativeEvent }) => {
    saveHistory();
    // const { offsetX, offsetY } = nativeEvent;
    const { x: offsetX, y: offsetY } = getCanvasCoords(nativeEvent);
    setDrawing(true);
    if (tool === 'line') {
      setStartPoint({ x: offsetX, y: offsetY });
    } else {
      canvasRef.current.previousPos = { x: offsetX, y: offsetY };
    }
  };

  const handleMouseMove = ({ nativeEvent }) => {
    if (!drawing || tool === 'line') return;
    // const { offsetX, offsetY } = nativeEvent;
    const { x: offsetX, y: offsetY } = getCanvasCoords(nativeEvent);
    const { x: x0, y: y0 } = canvasRef.current.previousPos;
    const x1 = offsetX;
    const y1 = offsetY;
    const drawColor = tool === 'eraser' ? '#2b3245' : color;

    drawLine(x0, y0, x1, y1, drawColor, brushSize, true);

    canvasRef.current.previousPos = { x: x1, y: y1 };
  };

  const handleMouseUp = ({ nativeEvent }) => {
    setDrawing(false);
    if (tool === 'line' && startPoint) {
      // const { offsetX, offsetY } = nativeEvent;
      const { x: offsetX, y: offsetY } = getCanvasCoords(nativeEvent);
      const x0 = startPoint.x;
      const y0 = startPoint.y;
      const x1 = offsetX;
      const y1 = offsetY;
      drawLine(x0, y0, x1, y1, color, brushSize, true);
      setStartPoint(null);
    }
  };

  const drawLine = (x0, y0, x1, y1, strokeColor, size, emit) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();

    if (!emit) return;
    socketRef.current.emit('drawing', { roomId, x0, y0, x1, y1, color: strokeColor, size });
  };

  return (
    <div className='relative'>
      <div style={{
        padding: 10, display: 'flex', gap: 10, alignItems: 'center', left: '50%',
        transform: 'translateX(-50%)'
      }} className='text-white absolute  z-20 justify-between '>

        <div className='flex gap-2 items-center justify-center'>
          {/* <span className=''></span> */}
          <div className={`flex items-center justify-center hover:bg-dark-1 px-2 py-1 cursor-pointer rounded-md ${tool =="pen"?"bg-blue-1":""}`} onClick={() => setTool('pen')}>
            <Pen size={18} />
          </div>
          <div className={`flex items-center justify-center hover:bg-dark-1 px-2 py-1 cursor-pointer rounded-md ${tool =="line"?"bg-blue-1":""}`} onClick={() => setTool('line')}>
            <Minus size={18} />
          </div>
          <div className={`flex items-center justify-center hover:bg-dark-1 px-2 py-1 cursor-pointer rounded-md ${tool =="eraser"?"bg-blue-1":""}`} onClick={() => setTool('eraser')}>
            <Eraser size={18} />
          </div>
        </div>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} disabled={tool === 'eraser'} />
          <input
            type="range" min={1} max={26}
            value={brushSize} onChange={e => setBrushSize(e.target.value)}
          />
        {/* <button onClick={undo} className='cursor-pointer hover:bg-dark-1 px-2 py-1 rounded-md'><Undo /></button>
        <button onClick={undo} className='cursor-pointer hover:bg-dark-1 px-2 py-1 rounded-md'><Redo /></button> */}
        <button onClick={() => clearCanvas(true)} className='cursor-pointer hover:bg-dark-1 px-2 py-1 rounded-md'>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid #000', cursor: 'crosshair' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={() => setDrawing(false)}
        className='bg-dark-2 w-full h-full '
      />
    </div>
  );
}