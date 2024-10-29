import React, { useState, useEffect } from "react";
import NotesList from "../../components/Notes/NotesList";
import Createnotes from "../../components/Notes/CreateNotes";
import Editnotes from "../../components/Notes/EditNotes";
import "./Notes.css";
import { useSelector } from "react-redux";
import axios from "axios";
const NotesManager = ({ selectedText, notesHeight }) => {
  const { user } = useSelector((state) => state.auth);

  const user_id=user?.user_id;
  const token=user?.access_token;
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`http://13.127.207.184:80/notes/getnotes/${user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API response:", response);
  
        // Convert response data to an array if it's not already
        const notesArray = Array.isArray(response.data.data) 
          ? response.data.data 
          : Object.values(response.data.data); // Convert object to array
        
        // Set notes and save to localStorage
        setNotes(notesArray);
        localStorage.setItem("notes", JSON.stringify(notesArray));
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
  
    if (user_id && token) {
      fetchNotes();
    }
  }, [user_id, token]);
  
  console.log(notes)
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

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await axios.delete(
        `http://13.127.207.184:80/notes/deletenote/${user_id}/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure token is available in component's state or context
          },
        }
      );
  
      if (response.status === 200) {
        // Update local notes state to reflect deletion
        setNotes((prevNotes) => prevNotes.filter((note) => note.note_id !== noteId));
        console.log("Note deleted successfully");
      } else {
        console.error("Failed to delete note:", response);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };
  

  return (
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
          notes={notes}
          selectedText={selectedText}
          setNotes={setNotes}
          onClose={handleCloseCreate}
          onDelete={handleDeleteNote}
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
  );
};

export default NotesManager;
