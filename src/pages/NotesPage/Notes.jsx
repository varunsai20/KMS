import React, { useState, useEffect } from "react";
//import { ResizableBox } from "react-resizable";
import NotesList from "../../components/Notes/NotesList";
import Createnotes from "../../components/Notes/CreateNotes";
import Editnotes from "../../components/Notes/EditNotes";
//import "react-resizable/css/styles.css"; // Required for ResizableBox styles
import "./Notes.css";

const NotesManager = ({ selectedText, notesHeight }) => {
  const [notes, setNotes] = useState(
    JSON.parse(localStorage.getItem("notes")) || []
  );
  const [currentView, setCurrentView] = useState("list"); // 'list', 'create', 'edit'
  const [selectedNote, setSelectedNote] = useState(null);
  const [textToSave, setTextToSave] = useState([]); // Store the passed selected text

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Automatically switch to the 'create' view and accumulate unique text
  useEffect(() => {
    if (selectedText) {
      if (!textToSave.includes(selectedText.trim())) {
        setTextToSave((prevText) => [...prevText, selectedText.trim()]);
      }
      setCurrentView("create"); // Switch to 'create' view
    }
  }, [selectedText]);

  const handleAddNewNote = () => {
    setCurrentView("create");
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setCurrentView("edit");
  };

  const handleCloseCreate = () => {
    setCurrentView("list");
    setTextToSave(""); // Clear the selected text after creating the note
  };

  const handleCloseEdit = () => {
    setSelectedNote(null);
    setCurrentView("list");
  };

  const handleDeleteAllNotes = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all notes?"
    );
    if (confirmDelete) {
      setNotes([]); // Clear all notes
      setCurrentView("list");
    }
  };

  const handleDeleteNote = (id) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  return (
    // <ResizableBox
    //   width={Infinity}
    //   height={(35 * window.innerHeight) / 100}
    //   minConstraints={[Infinity, (20 * window.innerHeight) / 100]}
    //   maxConstraints={[Infinity, (70 * window.innerHeight) / 100]}
    //   resizeHandles={["n"]} // Ensure this matches correctly
    // >
    <div className="notes-manager-content">
      {/* Ensure there are valid child elements here */}
      {currentView === "list" && (
        <NotesList
          notes={notes}
          onAddNewNote={handleAddNewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          onDeleteAllNotes={handleDeleteAllNotes}
        />
      )}
      {currentView === "create" && (
        <Createnotes
          selectedText={selectedText}
          setNotes={setNotes}
          onClose={handleCloseCreate}
          notesHeight={notesHeight}
        />
      )}
      {currentView === "edit" && selectedNote && (
        <Editnotes
          note={selectedNote}
          setNotes={setNotes}
          onClose={handleCloseEdit}
          notesHeight={notesHeight}
        />
      )}
    </div>
    // </ResizableBox>
  );
};

export default NotesManager;
