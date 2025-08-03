import React, { useEffect, useRef, useState } from "react";
import { ColorSwatch, Group } from "@mantine/core";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { SWATCHES } from "./constants";
import LatexRenderer from "@/components/LatexRenderer";
import { PlusIcon } from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const LOCAL_STORAGE_KEY = "key";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http:localhost:8900"

interface SavedState {
  pages: Page[];
  currentPageId: string;
}

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

interface Line {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

interface Action {
  lines: Line[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Page {
  id: string;
  drawingActions: Action[];
  actionIndex: number;
  answers: { x: number; y: number; text: string }[];
  dictOfVars: Record<string, string>;
  title: string;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [color, setColor] = useState("rgb(255, 255, 255)");
  const [pages, setPages] = useState<Page[]>([
    {
      id: 'page-1',
      drawingActions: [],
      actionIndex: -1,
      answers: [],
      dictOfVars: {},
      title: 'Page 1'
    }
  ]);



  const [currentPageId, setCurrentPageId] = useState<string>('');
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);

  // const currentPage = pages.find(page => page.id === currentPageId) || pages[0];
  const currentPage = pages.find(page => page.id === currentPageId) || pages[0] || null;

useEffect(() => {
  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedState) {
    try {
      const parsedState: SavedState = JSON.parse(savedState);
      
      if (parsedState.pages && parsedState.pages.length > 0) {
        setPages(parsedState.pages);
        setCurrentPageId(parsedState.currentPageId || parsedState.pages[0].id);
      } else {
        initializeDefaultPage();
      }
    } catch (error) {
      console.error("Failed to parse saved state", error);
      initializeDefaultPage();
    }
  } else {
    initializeDefaultPage();
  }
}, []);

  const initializeDefaultPage = () => {
  const defaultPage = {
    id: 'page-1',
    drawingActions: [],
    actionIndex: -1,
    answers: [],
    dictOfVars: {},
    title: 'Page 1'
  };
  setPages([defaultPage]);
  setCurrentPageId(defaultPage.id);
};


  useEffect(() => {
  // Only save if we have pages and a currentPageId
  if (pages.length > 0 && currentPageId) {
    const stateToSave: SavedState = {
      pages,
      currentPageId
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }
}, [pages, currentPageId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.lineCap = "round";
          ctx.lineWidth = 8;
          ctx.fillStyle = "rgb(248, 250, 252)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        redrawCanvas();
      };
      resize();
      window.addEventListener("resize", resize);

      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "z") {
          e.preventDefault();
          undo();
        } else if (e.key === "Enter") {
          e.preventDefault();
          runRoute();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [currentPageId, pages]);

  useEffect(() => {
    redrawCanvas();
  }, [currentPageId, pages]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "rgb(248, 250, 252)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= currentPage.actionIndex; i++) {
      const action = currentPage.drawingActions[i];
      if (action) {
        action.lines.forEach((line: Line) => {
          ctx.strokeStyle = line.color;
          ctx.beginPath();
          ctx.moveTo(line.startX, line.startY);
          ctx.lineTo(line.endX, line.endY);
          ctx.stroke();
        });
      }
    }

    currentPage.answers.forEach((answer) => {
      ctx.font = 'bold 40px "Inter", -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = "#3b82f6";
      ctx.fillText(answer.text, answer.x, answer.y);
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) canvas.style.background = "white";
    
    setIsDrawing(true);
    setLastPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === currentPageId
          ? {
              ...page,
              drawingActions: page.drawingActions.slice(0, page.actionIndex + 1),
              actionIndex: page.actionIndex + 1,
            }
          : page
      )
    );
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const newLine: Line = {
      startX: lastPos.x,
      startY: lastPos.y,
      endX: x,
      endY: y,
      color: isEraser ? "rgb(248, 250, 252)" : color,
    };

    setPages(prevPages => 
      prevPages.map(page => 
        page.id === currentPageId
          ? {
              ...page,
              drawingActions: [
                ...page.drawingActions.slice(0, page.actionIndex),
                {
                  lines: [
                    ...(page.drawingActions[page.actionIndex]?.lines || []),
                    newLine
                  ]
                }
              ]
            }
          : page
      )
    );
    setLastPos({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  const undo = () => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === currentPageId && page.actionIndex >= 0
          ? { ...page, actionIndex: page.actionIndex - 1 }
          : page
      )
    );
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgb(248, 250, 252)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === currentPageId
          ? {
              ...page,
              drawingActions: [],
              actionIndex: -1,
              dictOfVars: {},
              answers: []
            }
          : page
      )
    );
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setIsDrawing(true);
    setLastPos({ x, y });
    
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === currentPageId
          ? {
              ...page,
              drawingActions: page.drawingActions.slice(0, page.actionIndex + 1),
              actionIndex: page.actionIndex + 1,
            }
          : page
      )
    );
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos) return;

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const newLine: Line = {
      startX: lastPos.x,
      startY: lastPos.y,
      endX: x,
      endY: y,
      color: isEraser ? "rgb(248, 250, 252)" : color,
    };

    setPages(prevPages => 
      prevPages.map(page => 
        page.id === currentPageId
          ? {
              ...page,
              drawingActions: [
                ...page.drawingActions.slice(0, page.actionIndex),
                {
                  lines: [
                    ...(page.drawingActions[page.actionIndex]?.lines || []),
                    newLine
                  ]
                }
              ]
            }
          : page
      )
    );
    setLastPos({ x, y });
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
    setLastPos(null);
  };

  const addNewPage = () => {
    const newPageId = `page-${Date.now()}`;
    setPages(prev => [
      ...prev,
      {
        id: newPageId,
        drawingActions: [],
        actionIndex: -1,
        answers: [],
        dictOfVars: {},
        title: `Page ${prev.length + 1}`
      }
    ]);
    setCurrentPageId(newPageId);
  };

  const switchPage = (pageId: string) => {
    setCurrentPageId(pageId);
    redrawCanvas();
  };

  const deletePage = (pageId: string) => {
    if (pages.length <= 1) return;
    
    setPages(prev => {
      const newPages = prev.filter(page => page.id !== pageId);
      if (pageId === currentPageId) {
        const currentIndex = prev.findIndex(p => p.id === pageId);
        const newCurrentId = currentIndex > 0 
          ? prev[currentIndex - 1].id 
          : newPages[0]?.id;
        setCurrentPageId(newCurrentId);
      }
      return newPages;
    });
  };

  const runRoute = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsLoading(true);

    try {
      const response = await axios({
        method: "post",
        url: `${VITE_API_URL}/calculate`,
        data: {
          image: canvas.toDataURL("image/png"),
          dict_of_vars: currentPage.dictOfVars,
        },
      });

      const res = await response.data;
      console.log("Response", res);

      const newVars: Record<string, string> = {};
      res.data.forEach((data: Response) => {
        if (data.assign) {
          newVars[data.expr] = data.result;
        }
      });

      setPages(prevPages => 
        prevPages.map(page => 
          page.id === currentPageId
            ? {
                ...page,
                dictOfVars: { ...page.dictOfVars, ...newVars }
              }
            : page
        )
      );

      if (currentPage.drawingActions.length > 0 && currentPage.actionIndex >= 0) {
        const lastAction = currentPage.drawingActions[currentPage.actionIndex];
        if (lastAction && lastAction.lines.length > 0) {
          let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

          lastAction.lines.forEach((line) => {
            minX = Math.min(minX, line.startX, line.endX);
            minY = Math.min(minY, line.startY, line.endY);
            maxX = Math.max(maxX, line.startX, line.endX);
            maxY = Math.max(maxY, line.startY, line.endY);
          });

          const answerX = maxX + 50;
          const answerY = (minY + maxY) / 2;

          setPages(prevPages => 
            prevPages.map(page => 
              page.id === currentPageId
                ? {
                    ...page,
                    answers: [
                      ...page.answers,
                      ...res.data.map((data: Response) => ({
                        x: answerX,
                        y: answerY,
                        text: data.result,
                      }))
                    ]
                  }
                : page
            )
          );
        }
      }
    } catch (error) {
      console.error("Error calculating:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getExplanation = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isLoading) return;

    setIsExplaining(true);
    setSidebarOpen(true);

    try {
      const response = await axios({
        method: "post",
        url: `${VITE_API_URL}/calculate/explain`,
        data: {
          image: canvas.toDataURL("image/png"),
          question: "Explain the solution to this problem",
          history: chatMessages,
        },
      });

      const newMessage: ChatMessage = {
        role: "assistant",
        content: response.data.data,
      };

      setChatMessages((prev) => [...prev, newMessage]);
      setExplanation(response.data.data);
    } catch (error) {
      console.error("Error getting explanation:", error);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userQuestion.trim()) return;

    const newUserMessage: ChatMessage = {
      role: "user",
      content: userQuestion,
    };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setUserQuestion("");

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExplaining(true);
    setSidebarOpen(true);
    try {
      const response = await axios({
        method: "post",
        url: `${VITE_API_URL}/calculate/explain`,
        data: {
          image: canvas.toDataURL("image/png"),
          question: userQuestion,
          history: [...chatMessages, newUserMessage],
        },
      });

      const newAssistantMessage: ChatMessage = {
        role: "assistant",
        content: response.data.data,
      };
      setChatMessages((prev) => [...prev, newAssistantMessage]);
      setExplanation(response.data.data);
    } catch (error) {
      console.error("Error in chat:", error);
    } finally {
      setIsExplaining(false);
    }
  };

  const exportToPDF = async () => {
    setIsLoading(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 10; // mm margin
      const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        setCurrentPageId(page.id);
        
        // Wait for the canvas to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = canvasRef.current;
        if (!canvas) continue;
        
        // Create a temporary container to render the canvas with proper dimensions
        const tempContainer = document.createElement('div');
        tempContainer.style.width = `${pageWidth}mm`;
        tempContainer.style.height = 'auto';
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = "rgb(248, 250, 252)";
          ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Redraw the current page on the temp canvas
          for (let j = 0; j <= page.actionIndex; j++) {
            const action = page.drawingActions[j];
            if (action) {
              action.lines.forEach((line: Line) => {
                ctx.strokeStyle = line.color;
                ctx.beginPath();
                ctx.moveTo(line.startX, line.startY);
                ctx.lineTo(line.endX, line.endY);
                ctx.stroke();
              });
            }
          }
          
          // Draw answers
          page.answers.forEach((answer) => {
            ctx.font = 'bold 40px "Inter", -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = "#3b82f6";
            ctx.fillText(answer.text, answer.x, answer.y);
          });
        }
        
        tempContainer.appendChild(tempCanvas);
        
        // Convert to image
        const canvasData = await html2canvas(tempCanvas, {
          scale: 2,
          logging: false,
          useCORS: true,
        });
        
        document.body.removeChild(tempContainer);
        
        const imgData = canvasData.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.text(`Page ${i + 1}: ${page.title}`, margin, margin);
        pdf.addImage(imgData, 'PNG', margin, margin + 5, pageWidth, pdfHeight);
      }
    
      pdf.save('math-notebook.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-700 font-medium">Calculating...</p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-0 flex h-[calc(100vh-4rem)]">
        {/* Pages sidebar */}
        <div className="w-16 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => switchPage(page.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-medium
                ${currentPageId === page.id 
                  ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {pages.findIndex(p => p.id === page.id) + 1}
            </button>
          ))}
          
          <button
            onClick={addNewPage}
            className="w-12 h-12 rounded-lg flex items-center justify-center 
                      bg-white text-gray-500 hover:bg-gray-50 border border-gray-200 
                      hover:text-blue-500 mt-4"
          >
            <PlusIcon className="w-5 h-5" />
          </button>

          {pages.length > 1 && (
            <button
              onClick={() => deletePage(currentPageId)}
              className="w-12 h-12 rounded-lg flex items-center justify-center 
                        bg-white text-red-500 hover:bg-gray-50 border border-gray-200 
                        hover:text-red-600 mt-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={clear}
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-sm"
                disabled={isLoading}
                variant="outline"
              >
                <span className="font-medium">Clear Canvas</span>
              </Button>
              <Button
                onClick={undo}
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-sm"
                variant="outline"
                disabled={isLoading}
              >
                <span className="font-medium">Undo</span>
                <span className="ml-2 text-xs text-gray-500">(Ctrl+Z)</span>
              </Button>
              <Button
                onClick={() => setIsEraser(!isEraser)}
                className={`${isEraser ? 'bg-gray-200' : 'bg-white'} text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-sm`}
                variant="outline"
                disabled={isLoading}
              >
                <span className="font-medium">Eraser</span>
              </Button>
              <Button
                onClick={exportToPDF}
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-sm"
                variant="outline"
                disabled={isLoading}
              >
                <span className="font-medium">Export PDF</span>
              </Button>
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-sm"
                variant="outline"
                disabled={isLoading}
              >
                <span className="font-medium">
                  {sidebarOpen ? "Hide" : "Show"} Explanation
                </span>
              </Button>
            </div>

            <Group>
              {SWATCHES.map((swatch) => (
                <ColorSwatch
                  key={swatch}
                  color={swatch}
                  onClick={() => setColor(swatch)}
                  className="cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-gray-400 transition-all"
                  size={28}
                />
              ))}
            </Group>

            <div className="flex items-center gap-2">
              <Button
                onClick={getExplanation}
                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                disabled={isLoading || isExplaining}
              >
                <span className="font-medium">
                  {isExplaining ? "Generating..." : "Explain"}
                </span>
              </Button>
              <Button
                onClick={runRoute}
                onTouchEnd={runRoute}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                disabled={isLoading}
              >
                <span className="font-medium">
                  {isLoading ? "Calculating..." : "Calculate"}
                </span>
                <span className="ml-2 text-xs text-blue-100">(Enter)</span>
              </Button>
            </div>
          </div>

          <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1">
            <canvas
              ref={canvasRef}
              id="canvas"
              className="w-full h-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div
            className="w-96 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col"
            style={{ height: "100vh" }}
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">Explanation</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {explanation ? (
                <div className="prose max-w-none">
                  <LatexRenderer content={explanation} />
                </div>
              ) : (
                <p className="text-gray-500">
                  Click "Explain" to get an explanation of the solution
                </p>
              )}
            </div>

            {/* Chat interface */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="Ask about the solution..."
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  disabled={isExplaining}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}