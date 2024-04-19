import { Amplify } from "aws-amplify";
import { Header } from "./Login/Header";
import { Footer } from "./Login/Footer";
import React, { useState, useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import {
  View,
  withAuthenticator,
  Menu,
  MenuItem
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import awsExports from './aws-exports';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from "aws-amplify/auth";
import { Navbar } from "./Navbar/Navbar";
import "./App.css"; 

const client = generateClient();
Amplify.configure(awsExports);

export function App({ signOut, user }) {

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await client.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await getUrl({key: note.id});
          note.image = url;
        } return note;
      })
    );
    setNotes(notesFromAPI);
  }


  async function createNote(event) {
    event.preventDefault();
    const user = await getCurrentUser();
    console.log(user);
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
      price: form.get("price"),
      owner: user.username
      
    };
    const result=await client.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    if (!!data.image) await uploadData({key:result.data.createNote.id, data:image}).result;
    fetchNotes();
    event.target.reset();
  } 

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await remove({key:id});
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }
 
  
  return (
    <View className="App">

      <View className="Menu">
      <Menu>
        <MenuItem onClick={signOut}>Sign Out</MenuItem>
 
      </Menu> 
      </View>

      <Navbar notes={notes}/>

    </View>
  );
};


export default withAuthenticator(App, {
  components: {
    Header,
    Footer
  }

});
