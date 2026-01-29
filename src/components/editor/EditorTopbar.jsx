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
    MdSettings
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
                <button className="icon-btn" onClick={onBack}>
                    ← Back
                </button>
                <input
                    className="project-title"
                    defaultValue="Untitled Video Project"
                />
                <button
                    className="icon-btn"
                    title="Undo"
                    onClick={() => {
                        console.log('Undo clicked')
                        // TODO: Implement undo functionality
                    }}
                >
                    <MdUndo />
                </button>
                <button
                    className="icon-btn"
                    title="Redo"
                    onClick={() => {
                        console.log('Redo clicked')
                        // TODO: Implement redo functionality
                    }}
                >
                    <MdRedo />
                </button>
                <button
                    className="icon-btn"
                    title="Save"
                    onClick={() => {
                        alert('Project saved!')
                        // TODO: Implement save functionality
                    }}
                >
                    <MdSave />
                </button>
            </div>

            <div className="top-center">
                <button
                    className={`icon-btn ${selectedTool === 'avatar' ? 'active' : ''}`}
                    title="Avatar"
                    onClick={() => setSelectedTool('avatar')}
                >
                    <MdPerson />
                </button>
                <button
                    className={`icon-btn ${selectedTool === 'text' ? 'active' : ''}`}
                    title="Text"
                    onClick={() => setSelectedTool('text')}
                >
                    <MdTextFields />
                </button>
                <button
                    className={`icon-btn ${selectedTool === 'media' ? 'active' : ''}`}
                    title="Media"
                    onClick={() => setSelectedTool('media')}
                >
                    <MdPhotoLibrary />
                </button>
                <button
                    className={`icon-btn ${selectedTool === 'layers' ? 'active' : ''}`}
                    title="Layers"
                    onClick={() => setSelectedTool('layers')}
                >
                    <MdLayers />
                </button>
                <button
                    className={`icon-btn ${selectedTool === 'effects' ? 'active' : ''}`}
                    title="Effects"
                    onClick={() => setSelectedTool('effects')}
                >
                    <MdPalette />
                </button>
            </div>

            <div className="top-right">
                <button
                    className="icon-btn"
                    title="Preview"
                    onClick={handlePreview}
                >
                    <MdPlayCircleOutline /> Preview
                </button>
                <button
                    className="icon-btn"
                    title="Settings"
                    onClick={() => {
                        alert('Settings panel coming soon!')
                        // TODO: Implement settings panel
                    }}
                >
                    <MdSettings />
                </button>
                <button className="primary-btn" onClick={exportVideo}>
                    Export Video
                </button>
            </div>
        </div>
    )
}

export default EditorTopbar
