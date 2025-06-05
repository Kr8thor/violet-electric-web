import React, { forwardRef, useState } from 'react';
import './WordPressEditor.css';

interface ToolbarProps {
  position: { top: number; left: number };
  onStyleChange: (property: string, value: string) => void;
  selectedText: string;
}

const EditorToolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ position, onStyleChange, selectedText }, ref) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);
    const [fontSize, setFontSize] = useState('16px');
    const [fontFamily, setFontFamily] = useState('inherit');

    const fonts = [
      { value: 'inherit', label: 'Default' },
      { value: 'Arial, sans-serif', label: 'Arial' },
      { value: 'Georgia, serif', label: 'Georgia' },
      { value: '"Times New Roman", serif', label: 'Times' },
      { value: '"Courier New", monospace', label: 'Courier' },
      { value: 'Verdana, sans-serif', label: 'Verdana' },
      { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet' },
      { value: '"Comic Sans MS", cursive', label: 'Comic Sans' },
      { value: 'Impact, sans-serif', label: 'Impact' }
    ];

    const colors = [
      '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
      '#FF6600', '#663399', '#336699', '#006600', '#990000', '#000099'
    ];

    return (
      <div
        ref={ref}
        className="violet-editor-toolbar"
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          transform: 'translateX(-50%)',
          zIndex: 999999
        }}
      >
        <div className="toolbar-section">
          <button
            className="toolbar-btn"
            onClick={() => onStyleChange('bold', '')}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => onStyleChange('italic', '')}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => onStyleChange('underline', '')}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => onStyleChange('strikeThrough', '')}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          <select
            className="toolbar-select"
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              onStyleChange('fontFamily', e.target.value);
            }}
            title="Font Family"
          >
            {fonts.map(font => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>

          <input
            type="number"
            className="toolbar-input"
            value={parseInt(fontSize)}
            onChange={(e) => {
              const size = `${e.target.value}px`;
              setFontSize(size);
              onStyleChange('fontSize', size);
            }}
            min="8"
            max="72"
            title="Font Size"
          />
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          <div className="color-picker-wrapper">
            <button
              className="toolbar-btn color-btn"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowBgColorPicker(false);
              }}
              title="Text Color"
            >
              <span style={{ borderBottom: '3px solid #000' }}>A</span>
            </button>
            {showColorPicker && (
              <div className="color-picker-dropdown">
                {colors.map(color => (
                  <button
                    key={color}
                    className="color-swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onStyleChange('color', color);
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="color-picker-wrapper">
            <button
              className="toolbar-btn color-btn"
              onClick={() => {
                setShowBgColorPicker(!showBgColorPicker);
                setShowColorPicker(false);
              }}
              title="Background Color"
            >
              <span style={{ backgroundColor: '#FFFF00', padding: '0 4px' }}>A</span>
            </button>
            {showBgColorPicker && (
              <div className="color-picker-dropdown">
                {colors.map(color => (
                  <button
                    key={color}
                    className="color-swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onStyleChange('backgroundColor', color);
                      setShowBgColorPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          <button
            className="toolbar-btn"
            onClick={() => onStyleChange('justifyLeft', '')}
            title="Align Left"
          >
            ≡
          </button>
          <button
            className="toolbar-btn"
            onClick={() => onStyleChange('justifyCenter', '')}
            title="Align Center"
          >
            ≡
          </button>
          <button
            className="toolbar-btn"
            onClick={() => onStyleChange('justifyRight', '')}
            title="Align Right"
          >
            ≡
          </button>
          <button
            className="toolbar-btn"
            onClick={() => onStyleChange('justifyFull', '')}
            title="Justify"
          >
            ≡
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          <button
            className="toolbar-btn"
            onClick={() => onStyleChange('createLink', '')}
            title="Insert Link"
          >
            🔗
          </button>
          <button
            className="toolbar-btn"
            onClick={() => onStyleChange('insertOrderedList', '')}
            title="Ordered List"
          >
            1.
          </button>
          <button
            className="toolbar-btn"
            onClick={() => onStyleChange('insertUnorderedList', '')}
            title="Unordered List"
          >
            •
          </button>
        </div>
      </div>
    );
  }
);

EditorToolbar.displayName = 'EditorToolbar';

export default EditorToolbar;