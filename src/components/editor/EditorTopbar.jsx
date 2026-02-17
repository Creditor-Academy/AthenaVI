import {
    MdUndo,
    MdRedo,
    MdSave,
    MdPerson,
    MdTextFields,
    MdPhotoLibrary,
    MdLayers,
    MdPalette,
    MdPlayCircleOutline,
    MdSettings,
    MdZoomIn,
    MdZoomOut,
    MdFitScreen,
    MdSelectAll,
    MdShare,
    MdAccountCircle
} from 'react-icons/md'

const EditorTopbar = ({
    onBack,
    selectedTool,
    setSelectedTool,
    handlePreview,
    exportVideo
}) => {
    return (
        <div className="editor-topbar">
            <div className="top-left">
                <button className="icon-btn" onClick={onBack} title="Back">
                    ←
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '8px' }}>
                    <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white', 
                        fontWeight: '600',
                        fontSize: '16px'
                    }}>
                        A
                    </div>
                    <input
                        className="project-title"
                        defaultValue="Untitled Video Project"
                    />
                </div>
                <div style={{ width: '1px', height: '24px', background: '#e8eaed', margin: '0 4px' }} />
                <button
                    className="icon-btn"
                    title="Undo"
                    onClick={() => {
                        console.log('Undo clicked')
                        // TODO: Implement undo functionality
                    }}
                >
                    <MdUndo size={20} />
                </button>
                <button
                    className="icon-btn"
                    title="Redo"
                    onClick={() => {
                        console.log('Redo clicked')
                        // TODO: Implement redo functionality
                    }}
                >
                    <MdRedo size={20} />
                </button>
            </div>

            <div className="top-center">
                <button
                    className="icon-btn"
                    title="Select"
                >
                    <MdSelectAll size={20} />
                </button>
                <button
                    className="icon-btn"
                    title="Zoom In"
                >
                    <MdZoomIn size={20} />
                </button>
                <button
                    className="icon-btn"
                    title="Zoom Out"
                >
                    <MdZoomOut size={20} />
                </button>
                <button
                    className="icon-btn"
                    title="Fit to Screen"
                >
                    <MdFitScreen size={20} />
                </button>
            </div>

            <div className="top-right">
                <button
                    className="icon-btn"
                    title="Preview"
                    onClick={handlePreview}
                >
                    <MdPlayCircleOutline size={20} />
                </button>
                <button
                    className="icon-btn"
                    title="Share"
                >
                    <MdShare size={20} />
                </button>
                <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: '#f1f3f4', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#5f6368',
                    cursor: 'pointer',
                    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e8eaed'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f1f3f4'
                }}
                >
                    <MdAccountCircle size={24} />
                </div>
            </div>
        </div>
    )
}

export default EditorTopbar
